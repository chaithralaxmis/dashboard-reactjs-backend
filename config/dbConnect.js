const mongoose = require("mongoose");

const dbConnect = () => {
  try {
    const conn = mongoose.connect("mongodb://localhost:27017/e-commerce");
    console.log("Database connection success");
  } catch (error) {
    console.log("Database connection lost");
  }
};

module.exports = dbConnect;
