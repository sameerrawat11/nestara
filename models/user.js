// models/user.js

const mongoose = require("mongoose");

// Yaha se plugin import kar rahe hain
// Kuch setups me require se object aata hai jiska .default function hota hai,
// isliye hum dono cases handle karenge.
let plm = require("passport-local-mongoose");

// Agar plm function hai -> direct use
// Agar plm object hai -> plm.default use
const passportLocalMongoose = typeof plm === "function" ? plm : plm.default;

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// 👇 IMPORTANT: yahan sirf FUNCTION dena hai, object nahi
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;
