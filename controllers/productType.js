const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ProductType = require("../models/ProductType");

exports.getProductTypes = asyncHandler(async (req, res, next) => {
  const productType = await ProductType.find();

  res.status(200).json({
    success: true,
    count: productType.length,
    data: productType,
  });
});

exports.createProductType = asyncHandler(async (req, res, next) => {
  const getLastProductType = await ProductType.find({})
    .sort({ _id: -1 })
    .limit(1);

  if (!getLastProductType.length) {
    req.body.productTypeId = 1;
  } else {
    const newProductType = parseInt(getLastProductType[0].productTypeId) + 1;
    req.body.productTypeId = newProductType;
  }
  const productType = await ProductType.create(req.body);
  res.status(201).json({
    success: true,
    data: productType,
  });
});

exports.getProductType = asyncHandler(async (req, res, next) => {
  const productType = await ProductType.findById(req.params.id);
  if (!productType) {
    return next(
      new ErrorResponse(
        `Product type not found with id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({
    success: true,
    data: productType,
  });
});

exports.updateProductType = asyncHandler(async (req, res, next) => {
  const data = req.body;
  data.modifiedAt = Date.now();
  const productType = await ProductType.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!productType) {
    return next(
      new ErrorResponse(
        `Product type not found with id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({
    success: true,
    data: productType,
  });
});

exports.deleteProductType = asyncHandler(async (req, res, next) => {
  const productType = await ProductType.findByIdAndDelete(req.params.id);
  if (!productType) {
    return next(
      new ErrorResponse(
        `Product type not found with id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(201).json({
    success: true,
    msg: `Product type deleted with id: ${req.params.id}`,
  });
});
