const express = require("express");
const {
  createEnquiry,
  updateEnquiry,
  getAEnquiry,
  getAllEnquiry,
} = require("../controllers/enqCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddlewear");
const router = express.Router();

router.post("/add", authMiddleware, isAdmin, createEnquiry);
router.put("/update/:id", authMiddleware, isAdmin, updateEnquiry);
router.get("/:id", authMiddleware, isAdmin, getAEnquiry);
router.get("/", authMiddleware, isAdmin, getAllEnquiry);

module.exports = router;
