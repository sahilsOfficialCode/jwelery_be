const Product = require("../model/product.model");
require("../model/image.model");

exports.findProducts = async (filters, options) => {
  return await Product.find(filters)
    .skip(options.skip)
    .limit(options.limit)
    .sort(options.sort)
    .populate("images","public_id secure_url _id");
};
