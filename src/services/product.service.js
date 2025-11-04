const Category = require("../model/category.model");
const Product = require("../model/product.model");
const mongoose = require("mongoose");
// queries
const productQuery = require("../queries/productQuery");
const categoryService = require("../services/category.service");

exports.createProduct = async (data) => {
  return await Product.create(data);
};

// get all products
// exports.getAllProducts = async (query) => {
//   const filters = { is_deleted: false, isActive: true };

//   // Category filter
//   if (query.category) {
//     const categoryDoc = await Category.findOne({
//       name: { $regex: new RegExp(`^${query.category}$`, "i") },
//       is_deleted: false,
//       isActive: true,
//     }).lean();

//     if (categoryDoc) {
//       filters.category = categoryDoc._id;
//     } else {
//       return {
//         products: [],
//         count: 0,
//         totalPages: 0,
//         currentPage: 1,
//       };
//     }
//   }

//   // Price filters
//   if (query.minPrice && query.maxPrice) {
//     filters.price = { $gte: query.minPrice, $lte: query.maxPrice };
//   } else if (query.minPrice) {
//     filters.price = { $gte: query.minPrice };
//   } else if (query.maxPrice) {
//     filters.price = { $lte: query.maxPrice };
//   }

//   // Search filter
//   if (query.search) {
//     const regex = new RegExp(query.search, "i");
//     filters.$or = [
//       { name: regex },
//       { description: regex },
//       { material: regex },
//     ];
//   }

//   // Pagination setup
//   const page = Math.max(parseInt(query.page) || 1, 1); // default 1
//   const limit = Math.max(parseInt(query.limit) || 10, 1); // default 10
//   const skip = (page - 1) * limit;

//   // Execute queries in parallel
//   const [products, count] = await Promise.all([
//     productQuery.findProducts(filters, {
//       skip,
//       limit,
//       sort: { createdAt: -1 },
//     }),
//     Product.countDocuments(filters),
//   ]);

//   const totalPages = Math.ceil(count / limit);

//   return {
//     products,
//     count,
//     totalPages,
//     currentPage: page,
//     limit,
//   };
// };
exports.getAllProducts = async (query) => {
  const filters = { is_deleted: false, isActive: true };

  // Handle single OR multiple categories
  if (query.category) {
    // Split by comma and trim
    const categoryNames = query.category.split(",").map((c) => c.trim());

    const categoryDocs = await Category.find({
      name: { $in: categoryNames.map((name) => new RegExp(`^${name}$`, "i")) },
      is_deleted: false,
      isActive: true,
    }).lean();

    if (categoryDocs.length > 0) {
      filters.category = { $in: categoryDocs.map((c) => c._id) };
    } else {
      return {
        products: [],
        count: 0,
        totalPages: 0,
        currentPage: 1,
        limit: parseInt(query.limit) || 10,
      };
    }
  }

  // Price filters
  if (query.minPrice && query.maxPrice) {
    filters.price = {
      $gte: Number(query.minPrice),
      $lte: Number(query.maxPrice),
    };
  } else if (query.minPrice) {
    filters.price = { $gte: Number(query.minPrice) };
  } else if (query.maxPrice) {
    filters.price = { $lte: Number(query.maxPrice) };
  }

  // Search filter
  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filters.$or = [
      { name: regex },
      { description: regex },
      { material: regex },
    ];
  }

  // Pagination setup
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.max(parseInt(query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  // Execute queries in parallel
  const [products, count] = await Promise.all([
    productQuery.findProducts(filters, {
      skip,
      limit,
      sort: { createdAt: -1 },
    }),
    Product.countDocuments(filters),
  ]);

  const totalPages = Math.ceil(count / limit);

  return {
    products,
    count,
    totalPages,
    currentPage: page,
    limit,
  };
};

exports.getProductById = async (id, page, limit) => {
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const result = await Product.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id), isActive: true } },

    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "images",
        let: { imgIds: "$images" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$imgIds"] } } },
          {
            $project: {
              public_id: 1,
              secure_url: 1,
              format: 1,
              resource_type: 1,
              size: 1,
            },
          },
        ],
        as: "images",
      },
    },

    {
      $lookup: {
        from: "reviews",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$product", "$$productId"] },
              status: { $ne: "rejected" },
            },
          },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "userInfo",
            },
          },
          { $unwind: "$userInfo" },
          {
            $project: {
              rating: 1,
              comment: 1,
              title: 1,
              createdAt: 1,
              "user.name": "$userInfo.name",
              "user.email": "$userInfo.email",
            },
          },
        ],
        as: "reviews",
      },
    },

    {
      $lookup: {
        from: "reviews",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$product", "$$productId"] },
              status: { $ne: "rejected" },
            },
          },
          { $project: { rating: 1 } },
        ],
        as: "allReviews",
      },
    },

    {
      $addFields: {
        averageRating: { $avg: "$allReviews.rating" },
        reviewCount: { $size: "$allReviews" },
        positiveReviewCount: {
          $size: {
            $filter: {
              input: "$allReviews",
              cond: { $gte: ["$$this.rating", 4] },
            },
          },
        },
        negativeReviewCount: {
          $size: {
            $filter: {
              input: "$allReviews",
              cond: { $lte: ["$$this.rating", 2] },
            },
          },
        },
        fiveStarCount: {
          $size: {
            $filter: {
              input: "$allReviews",
              cond: { $eq: ["$$this.rating", 5] },
            },
          },
        },
      },
    },

    { $project: { allReviews: 0 } },
  ]);

  return {
    status: true,
    data: result[0],
    message: "product with reviews fetch successfully",
  };
};

exports.getProductToDeleteById = async (id) => {
  const result = await Product.findById(id)
  return result
};

exports.updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate({ _id: id, is_deleted: false }, data, {
    new: true,
  });
};

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

  const filter = { is_deleted: false, isActive: true };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    const categoryDoc = await categoryService.getCategoriesForSearchName(query);
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
      .populate("images", "public_id secure_url _id")
      .populate("category"),
    Product.countDocuments(filter),
  ]);

  return { products, total };
};

exports.softDeleteProduct = async (id) => {
  return await Product.findByIdAndUpdate(id, { is_deleted: true });
};
