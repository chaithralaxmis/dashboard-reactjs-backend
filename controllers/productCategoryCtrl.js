const Category = require("../models/productcategory.model");
const asyncHandler = require("express-async-handler");

const createCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    return res.json({
      status: "ok",
      data: newCategory,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.json({
      status: "ok",
      data: updatedCategory,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getACategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    return res.json({
      status: "ok",
      data: category,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await Category.find();
    return res.json({
      status: "ok",
      data: categories,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);
    return res.json({
      status: "ok",
      data: deletedCategory,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createCategory,
  updateCategory,
  getACategory,
  deleteCategory,
  getAllCategory,
};
