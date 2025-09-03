const Category = require("../model/category.model");

exports.createCategory = async (data) => {
  return await Category.create(data);
};
