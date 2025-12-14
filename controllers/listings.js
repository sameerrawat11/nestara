// controllers/listings.js
const Listing = require("../models/listing.js");

// Initialize geocoding client ONLY if token looks valid (starts with "pk.")
let geocodingClient = null;
const mapToken = process.env.MAP_TOKEN || "";
if (mapToken && mapToken.startsWith("pk.")) {
  try {
    const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
    geocodingClient = mbxGeocoding({ accessToken: mapToken });
    console.log("Mapbox geocoder initialized.");
  } catch (e) {
    console.warn("Failed to initialize Mapbox geocoder:", e.message);
    geocodingClient = null;
  }
} else {
  console.warn("MAP_TOKEN missing or not a public token (pk.*). Geocoding disabled.");
}

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  // show.ejs ke liye simple boolean, taa ki edit/delete buttons conditionally dikhein
  let isOwner = false;
  if (req.user && listing.owner) {
    isOwner = listing.owner.equals(req.user._id);
  }

  res.render("listings/show", { listing, isOwner });
};

// controllers/listings.js -> replace createListing with this
module.exports.createListing = async (req, res, next) => {
  try {
    const newListing = new Listing(req.body.listing || {});
    newListing.owner = req.user ? req.user._id : undefined;

    // ensure location present in model too
    newListing.location = (req.body.listing && req.body.listing.location) ? req.body.listing.location : newListing.location;

    // image handling
    if (req.file) {
      newListing.image = { url: req.file.path, filename: req.file.filename };
    }

    // attempt geocoding only if client available and location provided
    if (typeof geocodingClient !== 'undefined' && geocodingClient && newListing.location && newListing.location.trim()) {
      try {
        const response = await geocodingClient.forwardGeocode({
          query: newListing.location,
          limit: 1
        }).send();
        if (response && response.body && Array.isArray(response.body.features) && response.body.features.length) {
          newListing.geometry = response.body.features[0].geometry;
        }
      } catch (e) {
        console.warn('Geocoding failed, will use fallback geometry:', e.message);
      }
    }

    // <-- IMPORTANT: final fallback BEFORE save to avoid schema validation error
    if (!newListing.geometry || !newListing.geometry.type || !Array.isArray(newListing.geometry.coordinates) || newListing.geometry.coordinates.length !== 2) {
      newListing.geometry = { type: 'Point', coordinates: [77.2090, 28.6139] }; // fallback (lng, lat)
    }

    // debug log (temporary)
    console.log('DEBUG: geometry before save ->', newListing.geometry);

    await newListing.save();
    req.flash('success', 'New Listing Created!');
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    next(err);
  }
};



module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for Updation does not exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image && listing.image.url ? listing.image.url : "";
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    if (typeof req.file !== "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
    }

    // If a new location was provided and geocoder is available, try to update geometry
    if (geocodingClient && req.body.listing && req.body.listing.location) {
      try {
        const geoResp = await geocodingClient
          .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
          })
          .send();

        if (geoResp && geoResp.body && Array.isArray(geoResp.body.features) && geoResp.body.features.length) {
          listing.geometry = geoResp.body.features[0].geometry;
        }
        // else keep existing geometry (don't overwrite with undefined)
      } catch (e) {
        console.warn("Geocoding failed while updating (keeping existing geometry):", e.message);
      }
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
