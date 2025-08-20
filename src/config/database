const mongoose = require('mongoose')

const dbConnect = () =>{
    mongoose.connect(process.env.DB_URL,{useNewUrlParser:true,useUnifiedTopology:true}).then((data)=>{
        console.log("db connected", data.connection.host)
    })
}

module.exports = dbConnect