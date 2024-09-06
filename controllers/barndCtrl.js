const Brand = require("../models/brand.model");
const asyncHandler = require("express-async-handler");

const createBrand = asyncHandler(async (req, res) => {
  try {
    const newBrand = await Brand.create(req.body);
    return res.json({
      status: "ok",
      data: newBrand,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateBrand = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.json({
      status: "ok",
      data: updatedBrand,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getABrand = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);
    return res.json({
      status: "ok",
      data: brand,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllBrand = asyncHandler(async (req, res) => {
  try {
    const brands = await Brand.find();
    return res.json({
      status: "ok",
      data: brands,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteBrand = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBrand = await Brand.findByIdAndDelete(id);
    return res.json({
      status: "ok",
      data: deletedBrand,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createBrand,
  updateBrand,
  getABrand,
  deleteBrand,
  getAllBrand,
};
