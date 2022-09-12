const mongoose = require("mongoose");

const OfficeSchema = new mongoose.Schema({
  officeId: {
    type: Number,
  },
  name: {
    type: String,
    // required: [true, "Please add office name"],
    // unique: true,
    // maxlength: [50, "Name can not be more than 50 characters"],
  },
  address: {
    type: String,
    // required: [true, "Please add office address"],
  },
  city: {
    type: String,
    // required: [true, "Please add city name"],
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  photo: {
    type: String,
    default: "demo.png",
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
});

module.exports = mongoose.model("Office", OfficeSchema);
