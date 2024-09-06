const express = require("express");
const {
  createCategory,
  updateCategory,
  getACategory,
  deleteCategory,
  getAllCategory,
} = require("../controllers/blogCategoryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddlewear");
const router = express.Router();

router.post("/add", authMiddleware, isAdmin, createCategory);
router.put("/update/:id", authMiddleware, isAdmin, updateCategory);
router.get("/:id", authMiddleware, isAdmin, getACategory);
router.get("/", authMiddleware, isAdmin, getAllCategory);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteCategory);

module.exports = router;
