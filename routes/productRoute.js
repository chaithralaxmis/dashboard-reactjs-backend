const express = require("express");
const {
  createProduct,
  getAProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadImages,
  deleteImages,
} = require("../controllers/productCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddlewear");
const {
  uploadPhoto,
  productImgResize,
} = require("../middlewares/uploadImages");

const router = express.Router();
router.get("/", getAllProduct);
router.get("/:id", getAProduct);
router.post("/add", authMiddleware, isAdmin, createProduct);
router.put("/update/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);
router.delete("/delete-image/:id", authMiddleware, isAdmin, deleteImages);

router.put(
  "/upload",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);

module.exports = router;
