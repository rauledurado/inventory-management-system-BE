const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Brand = require("../models/Brand");

exports.getBrands = asyncHandler(async (req, res, next) => {
  const brand = await Brand.find();
  res.status(200).json({
    success: true,
    count: brand.length,
    data: brand,
  });
});

exports.createBrand = asyncHandler(async (req, res, next) => {
  // getting last entered category
  const getLatestbrand = await Brand.find({}).sort({ _id: -1 }).limit(1);

  if (!getLatestbrand.length) {
    req.body.brandId = 1;
  } else {
    const newBrandId = parseInt(getLatestbrand[0].brandId) + 1;
    req.body.brandId = newBrandId;
  }

  const brand = await Brand.create(req.body);
  res.status(200).json({
    success: true,
    data: brand,
  });
});

exports.getBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(
      new ErrorResponse(`Brand not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: brand,
  });
});

exports.updateBrand = asyncHandler(async (req, res, next) => {
  const data = req.body;
  data.modifiedAt = Date.now();

  const brand = await Brand.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!brand) {
    return next(
      new ErrorResponse(`Brand not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: brand,
  });
});

exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) {
    return next(
      new ErrorResponse(`Brand not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(201).json({
    success: true,
    msg: `Brand deleted with id: ${req.params.id}`,
  });
});
