const Product = require("../model/product.model");
// queries
const productQuery = require("../queries/productQuery");

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
    filters.category = { $regex: new RegExp(`^${query.category}$`, "i") };
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

// get single product using id
exports.getProductById = async (id) => {
  return await Product.findOne({_id:id,isActive:true}).populate("category").populate("images");
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

  if (category) filter.category = category;
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
