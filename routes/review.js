const express = require("express");
const router = express.Router({ mergeParams: true }); // ✅ important
const wrapAsync = require("../utils/wAsync.js");
const ExpressError = require("../utils/ExpressError");
const Review = require("../models/review.js");
const {validateReview,isLoggedIN,isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

// CREATE review
router.post(
  "/",isLoggedIN,
  validateReview,
  wrapAsync(reviewController.createReview)
);

// DELETE review
router.delete(
  "/:reviewId",isLoggedIN,
    isReviewAuthor,      // 👈 yahi sabse important line hai
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
