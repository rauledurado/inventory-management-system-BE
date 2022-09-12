const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid4 = require("uuid4");
const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Please add user name"],
    maxlength: [50, "Name can not be more than 50 characters"],
  },
  email: {
    type: String,
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please add a valid email address",
    ],
  },
  password: {
    type: String,
    minlength: [6, "Password length should be minimum 6 character"],
    select: false,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPassowrdExpire: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
  },
  modifiedAt: {
    type: Date,
  },
  modifiedBy: {
    type: String,
  },
  role: {
    type: String,
    enum: ["User", "Admin", "SA", "Manager", "HR"],
    default: "User",
  },
  employeeId: {
    type: Number,
  },
});

// Encrypting user password
UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match User password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
