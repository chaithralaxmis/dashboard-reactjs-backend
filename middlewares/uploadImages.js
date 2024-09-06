const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");

// Configure Multer storage
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.originalUrl.includes("/blog/upload")) {
      cb(null, path.join(__dirname, "../public/images/blogs"));
    } else {
      cb(null, path.join(__dirname, "../public/images/products"));
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
  },
});

// File filter to allow only images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format"), false);
  }
};

// Multer configuration
const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 20000000, // Corrected from fieldSize to fileSize
  },
});

// Resize image function
const resizeImage = async (file, targetPath) => {
  const tempPath = path.join(
    os.tmpdir(),
    crypto.randomBytes(16).toString("hex") + ".jpeg"
  );

  try {
    // Resize and save the image to the temporary path
    await sharp(file.path)
      .resize(300, 300)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(tempPath);

    // Move the file from the temp path to the target path
    fs.renameSync(tempPath, targetPath);
  } catch (error) {
    console.error(`Error processing file ${file.path}:`, error);

    // Clean up temporary files on error
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  } finally {
    // Ensure temporary file is removed if it was created
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
};

// Middleware for resizing product images
const productImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      const targetPath = path.join(
        __dirname,
        "../public/images/products",
        file.filename
      );
      await resizeImage(file, targetPath);
    })
  );
  next();
};

// Middleware for resizing blog images
const blogImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      const targetPath = path.join(
        __dirname,
        "../public/images/blogs",
        file.filename
      );
      await resizeImage(file, targetPath);
    })
  );
  next();
};

module.exports = { uploadPhoto, productImgResize, blogImgResize };
