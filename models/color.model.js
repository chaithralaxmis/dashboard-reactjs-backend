const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Brand = mongoose.model("color", colorSchema);
module.exports = Brand;
