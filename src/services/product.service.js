const Category = require("../model/category.model");
const Product = require("../model/product.model");
// queries
const productQuery = require("../queries/productQuery");
const categoryService = require("../services/category.service")
const mongoose = require('mongoose')

exports.createProduct = async (data) => {
  return await Product.create(data);
};

// get all products
exports.getAllProducts = async (query) => {
  const filters = {};
  filters.is_deleted = false
  filters.isActive = true

  // filter based on category
  if (query.category) {
    const categoryDoc = await Category.findOne({
      name: { $regex: new RegExp(`^${query.category}$`, "i") },
      is_deleted: false,
      isActive: true,
    }).lean();

    if (categoryDoc) {
      filters.category = categoryDoc._id;
    } else {
      return [];
    }
  }

  // filter based on price
  if (query.minPrice && query.maxPrice) {
    filters.price = { $gte: query.minPrice, $lte: query.maxPrice };
  } else if (query.minPrice) {
    filters.price = { $gte: query.minPrice };
  } else if (query.maxPrice) {
    filters.price = { $lte: query.maxPrice };
  }

  // filter based on search
  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filters.$or = [
      { name: regex },
      { description: regex },
      { category: regex },
      { material: regex },
    ];
  }

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const options = {
    skip: (page - 1) * limit,
    limit,
    sort: { createdAt: -1 },
  };

  return await productQuery.findProducts(filters, options);
};

exports.getProductById = async (id,page,limit) => {
  page = parseInt(page)
  limit = parseInt(limit)
  const skip = (page - 1) * limit;

  const result = await Product.aggregate([
  { $match: { _id: new mongoose.Types.ObjectId(id), isActive: true } },

  // 🔹 Populate category
  {
    $lookup: {
      from: "categories", // collection name for categories
      localField: "category",
      foreignField: "_id",
      as: "category"
    }
  },
  { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

  // 🔹 Populate images
  {
    $lookup: {
      from: "images",
      let: { imgIds: "$images" },
      pipeline: [
        { $match: { $expr: { $in: ["$_id", "$$imgIds"] } } },
        { $project: { public_id: 1, secure_url: 1, format: 1, resource_type: 1, size: 1 } }
      ],
      as: "images"
    }
  },

  // 🔹 Reviews with pagination & user info
  {
    $lookup: {
      from: "reviews",
      let: { productId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$product", "$$productId"] }, status: { $ne: "rejected" } } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userInfo"
          }
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            rating: 1,
            comment: 1,
            title: 1,
            createdAt: 1,
            "user.name": "$userInfo.name",
            "user.email": "$userInfo.email"
          }
        }
      ],
      as: "reviews"
    }
  },

  // 🔹 All reviews for statistics
  {
    $lookup: {
      from: "reviews",
      let: { productId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$product", "$$productId"] }, status: { $ne: "rejected" } } },
        { $project: { rating: 1 } }
      ],
      as: "allReviews"
    }
  },

  // 🔹 Add statistics
  {
    $addFields: {
      averageRating: { $avg: "$allReviews.rating" },
      reviewCount: { $size: "$allReviews" },
      positiveReviewCount: { $size: { $filter: { input: "$allReviews", cond: { $gte: ["$$this.rating", 4] } } } },
      negativeReviewCount: { $size: { $filter: { input: "$allReviews", cond: { $lte: ["$$this.rating", 2] } } } },
      fiveStarCount: { $size: { $filter: { input: "$allReviews", cond: { $eq: ["$$this.rating", 5] } } } }
    }
  },

  // Remove allReviews to reduce payload
  { $project: { allReviews: 0 } }
]);


  return {status:true,data:result[0],message:"product with reviews fetch successfully"}
};

// update product using id
exports.updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate({ _id: id, is_deleted: false }, data, { new: true });
};

// delete product using id
exports.deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};



exports.userGetAllTrendingProducts = async (query) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
    search,
    category,
    minPrice,
    maxPrice,
    trending,
    isFeatured,
  } = query;
  
  const filter = { is_deleted: false,isActive:true };
  if (search) {
    filter.$or = [
      { name:       { $regex: search, $options: "i" } },
      { description:{ $regex: search, $options: "i" } },
      { tags:       { $regex: search, $options: "i" } },
      { slug:       { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    const categoryDoc = await categoryService.getCategoriesForSearchName(query)
    if (categoryDoc) {
      filter.category = categoryDoc._id;
    } else {
      // No category match => return empty
      return [];
    }
  }
   if (isFeatured !== undefined) filter.isFeatured = isFeatured;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let sortQuery = {};
  if (trending) {
    sortQuery = { "ratings.average": -1, createdAt: -1 };
  } else {
    sortQuery[sortBy] = order === "asc" ? 1 : -1;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit))
      .populate("images","public_id secure_url _id")
      .populate("category"),
    Product.countDocuments(filter),
  ]);

  return {products,total}
}

exports.softDeleteProduct = async (id) => {
  return await Product.findByIdAndUpdate(id, { is_deleted: true });
};
