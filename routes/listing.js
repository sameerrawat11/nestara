const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wAsync.js");
const { isLoggedIN, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/").get(wrapAsync(listingController.index)).post(
  isLoggedIN,
  // validateListing,
  upload.single("listing[image]"),
  wrapAsync(listingController.createListing)
);


// ------------------ NEW (form) ------------------
router.get("/new", isLoggedIN, listingController.renderNewForm);

router.get("/chatbot", (req, res) => {
  res.render("chatbot");
});

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIN,
    isOwner,
    upload.single("listing[image]"),

    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIN, isOwner, wrapAsync(listingController.destroyListing));

// ------------------ EDIT (form) ------------------
router.get(
  "/:id/edit",
  isLoggedIN,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);


module.exports = router;
