const express = require("express");
const {
  createUser,
  loginUser,
  getAllUser,
  getAUser,
  deleteAUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  loginAdmin,
  getWishlist,
  updateUser,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddlewear");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/login-admin", loginAdmin);
router.get("/logout", logout);
router.get("/all-users", getAllUser);
router.get("/user/:email", authMiddleware, isAdmin, getAUser);
router.delete("/user/:email", deleteAUser);
router.put("/update-user/:id", authMiddleware, updateUser);
router.put("/save-address/:id", authMiddleware, saveAddress);
router.put("/block-user/:email", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:email", authMiddleware, isAdmin, unblockUser);
router.get("/refresh", handleRefreshToken);
router.put("/update-password", authMiddleware, updatePassword);
router.post("/forgot-password", forgotPasswordToken);
router.get("/get-wishlist", authMiddleware, getWishlist);
router.post("/usercart/add", authMiddleware, userCart);
router.get("/usercart", authMiddleware, getUserCart);
router.delete("/usercart/empty", authMiddleware, emptyCart);
router.post("/usercart/apply-coupon", authMiddleware, applyCoupon);
router.post("/usercart/create-cash-order", authMiddleware, createOrder);
router.get("/usercart/user-orders", authMiddleware, getOrders);
router.put(
  "/usercart/update-order-status/:id",
  authMiddleware,
  isAdmin,
  updateOrderStatus
);

module.exports = router;
