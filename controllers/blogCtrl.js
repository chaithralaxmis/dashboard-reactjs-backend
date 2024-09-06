const Blog = require("../models/blog.model");
// const User = require("../models/user.model");
const asyncHandler = require("express-async-handler");
const cloudinaryUploadImg = require("../utils/cloudinary.js");
const fs = require("fs");

const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    return res.json({
      status: "ok",
      data: newBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.json({
      status: "ok",
      data: updatedBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getABlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate("likes").populate("dislikes");
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { numOfViews: 1 } },
      { new: true }
    );
    return res.json({
      status: "ok",
      data: updatedBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find();
    return res.json({
      status: "ok",
      data: blogs,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(id);
    return res.json({
      status: "ok",
      data: deletedBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  const blog = await Blog.findById({ _id: blogId });
  const loginUserId = req?.user?._id;
  const isLiked = blog?.isLiked;
  const alreadyDisliked = blog?.dislikes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  var updatedBlog;
  if (alreadyDisliked) {
    updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
  }
  if (isLiked) {
    updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
  } else {
    updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      { new: true }
    );
  }
  return res.json({
    status: "ok",
    data: updatedBlog,
  });
});
const dislikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  const blog = await Blog.findById({ _id: blogId });
  const loginUserId = req?.user?._id;
  const isDisliked = blog?.isDisliked;
  const alreadyliked = blog?.likes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  var updatedBlog;
  if (alreadyliked) {
    updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
  }
  if (isDisliked) {
    updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisLiked: false,
      },
      { new: true }
    );
  } else {
    updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: loginUserId },
        isDisLiked: true,
      },
      { new: true }
    );
  }
  return res.json({
    status: "ok",
    data: updatedBlog,
  });
});
const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
    }
    const findBlog = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      { new: true }
    );
    return res.json({
      status: "ok",
      data: findBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createBlog,
  updateBlog,
  getABlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  uploadImages,
};
