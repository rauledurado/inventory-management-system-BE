const mongoose = require("mongoose");
const slugify = require("slugify");
// const geocoder = require("../utils/geocoder");

const CategorySchema = new mongoose.Schema({
  categoryId: Number,
  photo: {
    type: String,
  },
  name: {
    type: String,
    required: [true, "Please add Category name"],
    unique: true,
    trim: true,
    maxlength: [50, "Name can not be more than 50 characters"],
  },
  createdBy: {
    type: String,
  },
  modifiedBy: {
    type: String,
  },

  craetedAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Category", CategorySchema);
