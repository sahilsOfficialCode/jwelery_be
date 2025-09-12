const Category = require("../model/category.model");

exports.getAllCategory = async () => {
  return await Category.find();
};

exports.createCategory = async (data) => {
  return await Category.create(data);
};

exports.countCategories = async (filter) => {
  return await Category.countDocuments(filter);
};

exports.getCategories = async ({ filter = {}, skip = 0, limit = 10, sort = {} }) => {
  return await Category.find(filter).skip(skip).limit(limit).sort(sort).populate("image");
};

exports.getCategoryById = async (id) => {
  return await Category.findById(id).populate("image");
};

exports.updateCategory = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id)
};

exports.softDeleteCategory = async (id) => {
  return await Category.findByIdAndUpdate(id, { is_deleted: true })
};