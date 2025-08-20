const Product = require("../model/product.model")

exports.createProduct =async(data)=>{
    return await Product.create(data)
}