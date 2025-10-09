const Category = require("../model/category.model");
const Product = require("../model/product.model");

exports.getAllCategory = async () => {
  return await Category.find();
};

exports.createCategory = async (data) => {
  return await Category.create(data);
};

exports.countCategories = async (filter) => {
  return await Category.countDocuments(filter);
};

// exports.getCategories = async ({ filter = {}, skip = 0, limit = 10, sort = {} }) => {
//   return await Category.find(filter).skip(skip).limit(limit).sort(sort).populate("image");
// };
exports.getCategories = async ({
  filter = {},
  skip = 0,
  limit = 10,
  sort = {},
}) => {
  // Fetch categories
  const categories = await Category.find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .populate("image")
    .lean();

  // Get product counts for these categories
  const categoryIds = categories.map((c) => c._id);

  const counts = await Product.aggregate([
    {
      $match: {
        category: { $in: categoryIds },
        is_deleted: false,
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const countsMap = counts.reduce((acc, c) => {
    acc[c._id.toString()] = c.count;
    return acc;
  }, {});

  return categories.map((c) => ({
    ...c,
    productCount: countsMap[c._id.toString()] || 0,
  }));
};

exports.getCategoryById = async (id) => {
  return await Category.findById(id).populate("image");
};

exports.updateCategory = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};

exports.softDeleteCategory = async (id) => {
  return await Category.findByIdAndUpdate(id, { is_deleted: true });
};

exports.getCategoriesForSearchName = async (query) => {
  return await Category.findOne({
    name: { $regex: new RegExp(`^${query.category}$`, "i") },
    is_deleted: false,
    isActive: true,
  }).lean();
};
