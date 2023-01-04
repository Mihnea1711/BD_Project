const express = require("express");
const multer = require("multer");

const wrapAsync = require("../utils/wrapAsync");
const { storage } = require("../cloudinary");
const { isLoggedIn, userExist } = require("../middleware");
const othersController = require("../controllers/other");

const router = express.Router();
const upload = multer({ storage });

// --------------------------------------------------------DISCOVER--------------------------------------------------------------

router
  .route("/discover")
  .get(isLoggedIn, wrapAsync(othersController.renderDiscoverPage));

// ---------------------------------------------------------UPLOAD---------------------------------------------------------

router
  .route("/upload")
  .get(isLoggedIn, othersController.renderUploadPage)
  .post(
    isLoggedIn,
    upload.single("songImage"),
    wrapAsync(othersController.uploadSong)
  );

module.exports = router;
