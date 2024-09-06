const express = require("express");
const {
  createBlog,
  updateBlog,
  getABlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  uploadImages,
} = require("../controllers/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddlewear");
const { blogImgResize, uploadPhoto } = require("../middlewares/uploadImages");
const router = express.Router();

router.post("/add", authMiddleware, isAdmin, createBlog);
router.put("/update/:id", authMiddleware, isAdmin, updateBlog);
router.get("/:id", getABlog);
router.get("/", getAllBlogs);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteBlog);
router.put("/like", authMiddleware, likeBlog);
router.put("/dislike", authMiddleware, dislikeBlog);
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  blogImgResize,
  uploadImages
);

module.exports = router;
