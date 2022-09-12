const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema({
  brandId: {
    type: Number,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  createdBy: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedBy: {
    type: String,
  },
  modifiedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Brand", BrandSchema);
