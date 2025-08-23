const Product = require("../model/product.model");

exports.findProducts = async (filters, options) => {
  return await Product.find(filters)
    .skip(options.skip)
    .limit(options.limit)
    .sort(options.sort);

  // const result = await Product.find(filters)
  //   .skip(options.skip)
  //   .limit(options.limit)
  //   .sort(options.sort);
  // console.log("result", result);
};
