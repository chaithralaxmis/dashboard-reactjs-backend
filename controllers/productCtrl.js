const Product = require("../models/product.model.js");
const User = require("../models/user.model.js");

const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary.js");
const fs = require("fs");
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    return res.json({
      status: "ok",
      message: "Product created",
      product: newProduct,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const findProduct = await Product.findById(id);
    return res.json({
      staus: "ok",
      data: findProduct,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    // const products = await Product.find(req.query); // basic level filtering

    // const products = await Product.find({
    //   brand: req.query.brand,
    //   category: req.query.category,
    // }); // advance level filtering
    // const products = await Product.where("category").equals(queryObj.category);
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt"); // Default sorting by creation date
    }

    // Field Selection
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v"); // Exclude `__v` field by default
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    const total = await Product.countDocuments();
    // Execute the query
    const products = await query;

    return res.json({
      status: "ok",
      data: products,
      page: page,
      limit: limit,
      total: total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Assuming 'id' is the unique identifier for the product
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id }, // Use _id if that's the field for the unique identifier
      req.body,
      { new: true } // Returns the updated document
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }

    return res.json({ status: "ok", data: updatedProduct });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ status: "error", message: "Server error" });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findOneAndDelete({ _id: id });

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }

    return res.json({ status: "ok", data: deletedProduct });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ status: "error", message: "Server error" });
  }
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodID } = req.body;
  try {
    const user = await User.findById(_id);
    console.log(user);

    const alreadyAdded = user.wishlist.some((id) => id.toString() === prodID);
    var wishlisteduser;
    if (alreadyAdded) {
      wishlisteduser = await User.findByIdAndUpdate(
        _id,
        {
          $pull: {
            wishlist: prodID,
          },
        },
        {
          new: true,
        }
      );
    } else {
      wishlisteduser = await User.findByIdAndUpdate(
        _id,
        {
          $push: {
            wishlist: prodID,
          },
        },
        {
          new: true,
        }
      );
    }
    return res.json({
      status: "ok",
      data: wishlisteduser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodID, comment } = req.body;
  try {
    const product = await Product.findById(prodID);
    let alreadyRated = product.ratings.find(
      (userID) => userID.postedBy.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: {
            $elemMatch: alreadyRated,
          },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodID,
        {
          $push: {
            ratings: {
              star: star.$pull,
              comment: comment,
              postedBy: _id,
            },
          },
        },
        { new: true }
      );
    }
    const getAllRatings = await Product.findById(prodID);
    let totalratings = getAllRatings.ratings.length;
    let sumOfAllRating = getAllRatings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(sumOfAllRating / totalratings);
    let finalProduct = await Product.findByIdAndUpdate(
      prodID,
      { totalratings: actualRating },
      { new: true }
    );

    return res.json({ status: "ok", data: finalProduct });
  } catch (error) {
    throw new Error(error);
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "No files uploaded" });
    }

    const urls = [];

    for (const file of files) {
      console.log("File path:", file.path); // Debugging line
      try {
        const uploadedImage = await cloudinaryUploadImg(file.path);
        urls.push(uploadedImage);
      } catch (uploadError) {
        console.error(`Failed to upload image ${file.path}:`, uploadError);
      }
    }

    return res.json({
      status: "ok",
      data: urls,
    });
  } catch (error) {
    console.error("Failed to upload images:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to upload images" });
  }
});

const deleteImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedImg = cloudinaryDeleteImg(id, "images");

    return res.json({
      status: "ok",
      data: deletedImg,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getAProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadImages,
  deleteImages,
};
