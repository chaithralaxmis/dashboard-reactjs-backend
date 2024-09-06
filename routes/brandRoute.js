const express = require("express");
const {
  createBrand,
  updateBrand,
  getABrand,
  deleteBrand,
  getAllBrand,
} = require("../controllers/barndCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddlewear");
const router = express.Router();

router.post("/add", authMiddleware, isAdmin, createBrand);
router.put("/update/:id", authMiddleware, isAdmin, updateBrand);
router.get("/:id", authMiddleware, isAdmin, getABrand);
router.get("/", authMiddleware, isAdmin, getAllBrand);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteBrand);

module.exports = router;
