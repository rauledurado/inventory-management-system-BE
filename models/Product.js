const mongoose = require("mongoose");
// const Category = require("./Category");
// const Category = require("./Category");
// const slugify = require("slugify");
// const geocoder = require("../utils/geocoder");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: [true, "Please add product name"],
    // unique: true,
    trim: true,
    // maxlength: [50, "Name can not be more than 50 characters"],
  },
  productId: {
    type: Number,
  },
  photo: {
    type: String,
    default: "no-photo.jpg",
  },
  quantity: {
    type: Number,
  },
  createdBy: {
    type: String,
  },
  modifiedBy: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: {
    type: Date,
  },
  detail: {
    type: String,
    required: true,
  },
  averagePrice: {
    type: Number,
  },
  categoryName: {
    type: String
  },
  BrandName: {
    type: String
  },

  brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  productTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductType" },
  assetId:[ {type: mongoose.Schema.Types.ObjectId, ref: "AssetsName"}]
});

module.exports = mongoose.model("Product", ProductSchema);
