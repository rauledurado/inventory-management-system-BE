const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const InStock = require("../models/InStock");

exports.getAllInStock = asyncHandler(async (req, res, next) => {
  const inStock = await InStock.find();

  res.status(200).json({
    success: true,
    count: inStock.length,
    data: inStock,
  });
});

exports.createInStock = asyncHandler(async (req, res, next) => {
  const getLastInStock = await InStock.find({}).sort({ _id: -1 }).limit(1);

  if (!getLastInStock.length) {
    req.body.inStockId = 1;
  } else {
    const newInStock = getLastInStock[0].inStockId + 1;
    req.body.inStockId = newInStock;
  }

  //   if (!req.files) {
  //     return next(new ErrorResponse("Please upload a file", 404));
  //   }

  // for Image uploading
  const image = req.files.QRCodeImage;
  if (!image.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload an image file", 404));
  }
  if (image.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less then ${process.env.MAX_FILE_UPLOAD} file`,
        404
      )
    );
  }
  image.name = `QR_${uuid4()}${path.parse(image.name).ext}`;

  image.mv(
    `${process.env.FILE_UPLOAD_PATH}/${image.name}`,
    asyncHandler(async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`problem with file upload `, 500));
      }
    })
  );

  // for Files uploading
  const file = req.files.purchaseOrder;
  //    if (!file.mimetype.startsWith("image")) {
  //      return next(new ErrorResponse("Please upload an image file", 404));
  //    }
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an file less then ${process.env.MAX_FILE_UPLOAD} file`,
        404
      )
    );
  }
  file.name = `file_${uuid4()}${path.parse(file.name).ext}`;

  file.mv(
    `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
    asyncHandler(async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`problem with file upload `, 500));
      }
    })
  );

  req.body.QRCodeImage = image.name;
  req.body.purchaseOrder = file.name;
  const inStock = await InStock.create(req.body);
  res.status(201).json({
    success: true,
    data: inStock,
  });
});

exports.getInStock = asyncHandler(async (req, res, next) => {
  const inStock = await InStock.findById(req.params.id);
  if (!inStock) {
    return next(
      new ErrorResponse(`InStock not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: inStock,
  });
});

exports.updateInStock = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const inStock = await InStock.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!inStock) {
    return next(
      new ErrorResponse(`InStock not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: inStock,
  });
});

exports.deleteInStock = asyncHandler(async (req, res, next) => {
  const inStock = await InStock.findByIdAndDelete(req.params.id);
  if (!inStock) {
    return next(
      new ErrorResponse(`InStock not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(201).json({
    success: true,
    msg: `InStock deleted with id: ${req.params.id}`,
  });
});
