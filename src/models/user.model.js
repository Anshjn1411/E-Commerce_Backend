const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    // sparse: true, 
    default:""
    // required: true,
  },
  role: {
    type: String,
    required: true,
    default: "CUSTOMER"
  },
  refreshToken: {
    type: String,
    default: null
  },
  dob: {
    type: Date,
  },
  mobile: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  addresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "addresses",
    },
  ],
  paymentInformation: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment_information",
    },
  ],
  ratings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ratings",
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "reviews",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
