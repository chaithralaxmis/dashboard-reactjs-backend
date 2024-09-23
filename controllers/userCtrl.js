const User = require("../models/user.model.js");
const Product = require("../models/product.model.js");
const Cart = require("../models/cart.model.js");
const Coupon = require("../models/coupon.model.js");
const Order = require("../models/order.model.js");
const uniqid = require("uniqid");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { tokenGenerator } = require("../config/tokenGenerator.js");
const { generateRefreshToken } = require("../config/refreshToken.js");
const { sendEmail } = require("./emailCtrl.js");

const createUser = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      const newPassword = await bcrypt.hash(req.body.password, 10);
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: newPassword,
      });
      res.json({
        status: "ok",
        user: user,
      });
    } else {
      res.json({
        status: "error",
        error: "User already exists",
      });
    }
  } catch (error) {
    res.json({ status: "error", error: error });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return res.status(404).json({ status: "error", error: "User Not Found" });
  }
  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (isPasswordValid) {
    const refreshToken = await generateRefreshToken({
      name: user.name,
      email: user.email,
    });
    const updateUser = await User.findOneAndUpdate(
      {
        email: user.email,
      },
      { refreshToken: refreshToken },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    const token = tokenGenerator({
      name: user.name,
      email: user.email,
    });
    return res.json({
      status: "ok",
      user: true,
      data: {
        name: user?.name,
        email: user?.email,
        address: user?.address,
        token: token,
      },
    });
  } else {
    return res
      .status(500)
      .json({ status: "error", error: "Internal server error" });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        name: req?.body?.name,
        email: req?.body?.email,
      },
      {
        new: true,
      }
    );
    return res.json({
      status: "ok",
      data: updatedUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const updatedAddress = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    return res.json({
      status: "ok",
      data: updatedAddress,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// get all users

const getAllUser = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
});

const getAUser = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email: email });
  if (user) {
    res.status(200).json({
      user: user,
    });
  } else {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

const deleteAUser = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const user = await User.findByIdAndDelete(email);
  if (user) {
    res.status(200).json({
      user: user,
      message: "User deleted successfully",
    });
  } else {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { email } = req.params;
  console.log(email);

  try {
    const block = await User.findOneAndUpdate(
      { email: email },
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    console.log(block);

    res.json({
      status: "ok",
      message: "user blocked",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: error });
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { email } = req.params;
  try {
    const unblock = await User.findOneAndUpdate(
      { email: email },
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      status: "ok",
      message: "user unblocked",
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    return json.res({ status: "error", error: "No refresh token in cookies" });
  }

  const refreshToken = cookie.refreshToken;
  console.log(cookie.refreshToken);

  const user = await User.findOne({ refreshToken: refreshToken });

  if (!user) {
    return res.json({ status: "error", error: "Refresh token does not match" });
  }
  jwt.verify(refreshToken, process.env.SECRATE_KEY, (err, decoded) => {
    if (err || user.email !== decoded.email) {
      return res.json({ status: "error", error: "Something went wrong" });
    }
    const accessToken = tokenGenerator({
      name: user.name,
      email: user.email,
    });
    return res.json({ status: "ok", token: accessToken });
  });
});

const logout = asyncHandler(async (req, res) => {
  // const cookie = req.cookies;
  // if (!cookie?.refreshToken) {
  //   return res.json({ status: "error", error: "No refresh token in cookies" });
  // }
  // const refreshToken = cookie.refreshToken;
  // const user = await User.findOne({ refreshToken: refreshToken });
  const { email } = req.params;
  const user = await User.findOne({ email: email });

  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }
  await User.findOneAndUpdate(
    { email: email },
    {
      refreshToken: "",
    }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.sendStatus(204);
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  const user = await User.findById(_id);
  if (password) {
    user.password = await bcrypt.hash(password, 10);
    const updatedPassword = await user.save();
    return res.json(updatedPassword);
  } else {
    return res.json(user);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new Error("User not found with this email");
  }
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset your password. This link is valid till 10 mins from now.  <a href="http://localhost:5000/api/user/reset-password/${token}">Click here</a>`;

    const data = {
      to: email,
      text: "Hey user",
      subject: "forgot passowrd link",
      html: resetURL,
    };
    sendEmail(data);
    return res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const loginAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findOne({
    email: req.body.email,
  });
  if (!admin || admin.role !== "admin") {
    return res
      .status(404)
      .json({ status: "error", error: "Unauthorized access" });
  }
  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    admin.password
  );
  if (isPasswordValid) {
    const refreshToken = await generateRefreshToken({
      name: admin.name,
      email: admin.email,
    });
    const updateadmin = await User.findOneAndUpdate(
      {
        email: admin.email,
      },
      { refreshToken: refreshToken },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    const token = tokenGenerator({
      name: admin.name,
      email: admin.email,
    });
    return res.json({ status: "ok", admin: true, token: token });
  } else {
    return res
      .status(500)
      .json({ status: "error", error: "Internal server error" });
  }
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    return res.json({
      status: "ok",
      data: findUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  try {
    let products = [];
    const user = await User.findById(_id);
    // check if user already have cart
    const alreadyExistCart = await Cart.findOne({ orderBy: user._id });
    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }
    console.log(products);

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }
    let newCart = await new Cart({
      products,
      cartTotal,
      orderBy: user?._id,
    }).save();
    return res.json({
      status: "ok",
      data: newCart,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const cart = await Cart.findOne({
      orderBy: _id,
    }).populate("products.product", "_id title price totalAfterDiscount");
    return res.json({
      status: "ok",
      data: cart,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.deleteOne({ orderBy: user._id });
    return res.json({
      status: "ok",
      data: cart,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error("Invalid Coupon");
  }
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({
    orderBy: user._id,
  }).populate("products.product");
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderBy: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  return res.json({
    status: "ok",
    data: totalAfterDiscount,
  });
});

const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  try {
    if (!COD) {
      throw new Error("Create cash order failed");
    }
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderBy: user._id });
    let finalAmount = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount * 100;
    } else {
      finalAmount = userCart.cartTotal * 100;
    }
    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmount,
        status: "Cash On Delivery",
        createdAt: Date.now(),
        currency: "usd",
      },
      orderBy: user._id,
      orderStatus: "Cash On Delivery",
    }).save();
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quatity: -item.count, sold: +item.count } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});
    return res.json({
      status: "ok",
      data: updated,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const userOrders = await Order.findOne({ orderBy: _id })
      .populate("products.product")
      .exec();
    return res.json({ status: "ok", data: userOrders });
  } catch (error) {
    throw new Error(error);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      {
        new: true,
      }
    );
    return res.json({
      status: "ok",
      data: updateOrderStatus,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  updateUser,
  saveAddress,
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
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
};
