const express = require("express");
const {
  createColor,
  updateColor,
  getAColor,
  deleteColor,
  getAllColor,
} = require("../controllers/colorCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddlewear");
const router = express.Router();

router.post("/add", authMiddleware, isAdmin, createColor);
router.put("/update/:id", authMiddleware, isAdmin, updateColor);
router.get("/:id", authMiddleware, isAdmin, getAColor);
router.get("/", authMiddleware, isAdmin, getAllColor);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteColor);

module.exports = router;
