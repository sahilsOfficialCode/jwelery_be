const Image = require("../model/image.model");

exports.createImage = async (data) => {
    return await Image.create(data);
}

exports.deleteImage = async (publicId) => {
    return await Image.deleteOne({ _id: publicId });
}

exports.findImageById = async(id)=>{
    return await Image.findById(id)
}