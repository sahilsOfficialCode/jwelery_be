
const User = require("../model/user.model");

exports.createUser = async (data) => {
    return await User.create(data)
}

exports.getUserByEmail = async (email) => {
    return await User.findOne({email})
}

exports.getAllUser = async () => {
    return await User.find()
}

exports.getUserById = async (id) => {
    return await User.findById(id)
}

exports.deleteUser = async (id) => {
    return await User.findByIdAndDelete(id)
}

exports.getUsers = async ({ filter = {}, skip = 0, limit = 10, sort = {} }) => {
    return await User.find(filter).skip(skip).limit(limit).sort(sort).select("-password");
  };
  

  exports.countUsers = async (filter = {}) => {
    return await User.countDocuments(filter);
  };