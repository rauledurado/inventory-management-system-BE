const mongoose = require("mongoose");
// const Category = require("./Category");
// const slugify = require("slugify");
// const geocoder = require("../utils/geocoder");

const ProductTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add product name"],
    unique: true,
    trim: true,
    maxlength: [50, "Name can not be more than 50 characters"],
  },
  productTypeId: {
    type: Number,
  },
  demo: {
    type: Boolean,
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

module.exports = mongoose.model("ProductType", ProductTypeSchema);
