const express = require("express");
const {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddlewear");

const router = express.Router();

router.post("/add", authMiddleware, isAdmin, createCoupon);
router.get("/", authMiddleware, isAdmin, getAllCoupons);
router.put("/update/:id", authMiddleware, isAdmin, updateCoupon);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteCoupon);

module.exports = router;
