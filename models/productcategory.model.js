const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productCategory",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("productCategory", categorySchema);
module.exports = Category;
