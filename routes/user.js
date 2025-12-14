const express = require("express");
const router = express.Router(); 
const wrapAsync = require("../utils/wAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js")

router
.route("/signup")
.get(userController.renderSignupForm)
.post(
  wrapAsync(userController.signup)
);

router
.route("/accessacc")
.get(userController.renderAccountAccessForm)
.post(saveRedirectUrl, userController.accountAccess);


router.get("/logout", userController.logout)


module.exports = router;