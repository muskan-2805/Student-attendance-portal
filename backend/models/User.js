const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["admin", "staff", "user"], // future-proof
      default: "user",
    },

    userId: {
      type: String,
      unique: true,
      sparse: true, // important: allows null values
    },

    dob: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },

    contact: {
      type: String,
      trim: true,
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

module.exports = mongoose.model("User", UserSchema);
