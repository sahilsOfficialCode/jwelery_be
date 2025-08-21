const mongoose = require("mongoose");

const dbConnect = () => {
  mongoose.connect(process.env.DB_URL).then((data) => {
    console.log("db connected", data.connection.host);
  });
};

module.exports = dbConnect;
