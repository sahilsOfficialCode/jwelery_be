const Product = require("../model/product.model");

// queries
const productQuery = require("../queries/productQuery");

exports.createProduct = async (data) => {
  return await Product.create(data);
};

// get all products
exports.getAllProducts = async (query) => {
  const filters = {};

  // filter based on category
  if (query.category) {
    filters.category = { $regex: new RegExp(`^${query.category}$`, "i") }; // case-insensitive
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
