const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
    required: true,
  },
  location: String,
  country: String,

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
 /*  category : {
    type : String,
    enum : 
  } */
 
});

// ⭐ IMPORTANT: Default geometry fix (pre-validate hook)
/* listingSchema.pre("validate", function (next) {
    console.log('MODEL HOOK: listingSchema.pre validate called for', this._id || '(new)');
  if (
    /!this.geometry ||
   / !this.geometry.type ||
   / !Array.isArray(this.geometry.coordinates) ||
    this.geometry.coordinates.length !== 2
  ) {
    this.geometry = {
      type: "Point",
      coordinates: [77.2090, 28.6139], // Fallback: New Delhi [lng, lat]
    };
  }
  next();
}); */

listingSchema.pre("validate", async function () {
  try {
    if (
      !this.geometry ||
      !this.geometry.type ||
      !Array.isArray(this.geometry.coordinates) ||
      this.geometry.coordinates.length !== 2
    ) {
      this.geometry = {
        type: "Point",
        coordinates: [77.2090, 28.6139], // fallback [lng, lat]
      };
    }
  } catch (err) {
    // If something unexpected happens, log it but don't throw a weird next-not-function
    console.error('Error in listingSchema.pre validate hook:', err);
    // Throw so Mongoose validation fails with a proper error (optional)
    throw err;
  }
});

// Prevent OverwriteModelError
module.exports = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
