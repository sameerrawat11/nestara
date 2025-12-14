const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


module.exports.createReview = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
        req.flash("success","New Review Created!")
    res.redirect(`/listings/${listing._id}`);
  }

 module.exports. destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // Listing me se review id hatao
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // Review document delete karo
    await Review.findByIdAndDelete(reviewId);
        req.flash("success","Review Deleted!")
    res.redirect(`/listings/${id}`);
  }