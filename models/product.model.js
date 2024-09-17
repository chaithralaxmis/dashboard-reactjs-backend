const mongoose = require("mongoose");

var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
    },
    sold: {
      type: Number,
      default: 0,
      // select: false, // hide source from user
    },
    images: {
      type: Array,
    },
    color: [],
    tags: [],
    ratings: [
      {
        star: {
          type: Number,
          min: 1,
          max: 5, // Assuming star ratings are between 1 and 5
        },
        comment: {
          type: String,
        },
        postedBy: {
          type: mongoose.Types.ObjectId,
          ref: "user",
        },
      },
    ],
    totalratings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
const Prodcut = mongoose.model("product", productSchema);
module.exports = Prodcut;
