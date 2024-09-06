const Color = require("../models/color.model");
const asyncHandler = require("express-async-handler");

const createColor = asyncHandler(async (req, res) => {
  try {
    const newColor = await Color.create(req.body);
    return res.json({
      status: "ok",
      data: newColor,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateColor = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedColor = await Color.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.json({
      status: "ok",
      data: updatedColor,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAColor = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const Color = await Color.findById(id);
    return res.json({
      status: "ok",
      data: Color,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllColor = asyncHandler(async (req, res) => {
  try {
    const Colors = await Color.find();
    return res.json({
      status: "ok",
      data: Colors,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteColor = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deletedColor = await Color.findByIdAndDelete(id);
    return res.json({
      status: "ok",
      data: deletedColor,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createColor,
  updateColor,
  getAColor,
  deleteColor,
  getAllColor,
};
