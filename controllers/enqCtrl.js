const Enquiry = require("../models/enq.model");
const asyncHandler = require("express-async-handler");

const createEnquiry = asyncHandler(async (req, res) => {
  try {
    const newEnquiry = await Enquiry.create(req.body);
    return res.json({
      status: "ok",
      data: newEnquiry,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateEnquiry = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.json({
      status: "ok",
      data: updatedEnquiry,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAEnquiry = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findById(id);
    return res.json({
      status: "ok",
      data: enquiry,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllEnquiry = asyncHandler(async (req, res) => {
  try {
    const Enquirys = await Enquiry.find();
    return res.json({
      status: "ok",
      data: Enquirys,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createEnquiry,
  updateEnquiry,
  getAEnquiry,
  getAllEnquiry,
};
