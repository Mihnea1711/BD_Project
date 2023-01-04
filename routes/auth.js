const express = require("express");

const wrapAsync = require("../utils/wrapAsync");
const authController = require("../controllers/auth");

const router = express.Router();

//-----------------------------------------LOGIN/LOGOUT/REGISTER-------------------------------------------------------------------
//aici punem fiecare ruta legata de authentication (login logout register)

router
  .route("/register")
  .get(authController.renderRegisterPage)
  .post(wrapAsync(authController.registerUser));

router
  .route("/login")
  .get(authController.renderLoginPage)
  .post(wrapAsync(authController.loginUser));

router.route("/logout").get(authController.logoutUser);

module.exports = router;
