const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Category = require("../models/Category");

exports.getCategories = asyncHandler(async (req, res, next) => {
  const category = await Category.find();
  res.status(200).json({
    success: true,
    count: category.length,
    data: category,
  });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  // getting last entered category
  const getLatestCategory = await Category.find({}).sort({ _id: -1 }).limit(1);

  if (!getLatestCategory.length) {
    req.body.categoryId = 1;
  } else {
    const newCategoryId = parseInt(getLatestCategory[0].categoryId) + 1;
    req.body.categoryId = newCategoryId;
  }

  // for file uploading
  if (!req.files) {
    req.body.photo = "no-image";
    // return next(new ErrorResponse("Please upload a file", 404));
  } else {
    const file = req.files.file;
    if (!file.mimetype.startsWith("image")) {
      return next(new ErrorResponse("Please upload an image file", 404));
    }
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Please upload an image less then ${process.env.MAX_FILE_UPLOAD} file`,
          404
        )
      );
    }
    file.name = `photo_${uuid4()}${path.parse(file.name).ext}`;

    file.mv(
      `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
      asyncHandler(async (err) => {
        if (err) {
          console.error(err);
          return next(new ErrorResponse(`problem with file upload `, 500));
        }
      })
    );
    req.body.photo = file.name;
  }

  const category = await Category.create(req.body);
  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const data = req.body;
  data.modifiedAt = Date.now();
  if (req.files) {
    // Updatting image
    const file = req.files.file;
    if (!file.mimetype.startsWith("image")) {
      return next(new ErrorResponse("Please upload an image file", 404));
    }
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Please upload an image less then ${process.env.MAX_FILE_UPLOAD} file`,
          404
        )
      );
    }
    file.name = `photo_${uuid4()}${path.parse(file.name).ext}`;

    file.mv(
      `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
      asyncHandler(async (err) => {
        if (err) {
          console.error(err);
          return next(new ErrorResponse(`problem with file upload `, 500));
        }
      })
    );
    req.body.photo = file.name;
  }
  const category = await Category.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(201).json({
    success: true,
    msg: `Category deleted with id: ${req.params.id}`,
  });
});

// exports.uploadImage = asyncHandler(async (req, res, next) => {
//   const category = await Category.findById(req.params.id);
//   if (!category) {
//     return next(
//       new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
//     );
//   }
//   if (!req.files) {
//     return next(new ErrorResponse("Please upload a file", 404));
//   }
//   // console.log(req.files);
//   const file = req.files.file;

//   if (!file.mimetype.startsWith("image")) {
//     return next(new ErrorResponse("Please upload an image file", 404));
//   }
//   if (file.size > process.env.MAX_FILE_UPLOAD) {
//     return next(
//       new ErrorResponse(
//         `Please upload an image less then ${process.env.MAX_FILE_UPLOAD} file`,
//         404
//       )
//     );
//   }
//   file.name = `photo_${category._id}${path.parse(file.name).ext}`;

//   file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
//     if (err) {
//       console.error(err);
//       return next(new ErrorResponse(`problem with file upload `, 500));
//     }
//     await Category.findByIdAndUpdate(req.params.id, { photo: file.name });
//     res.status(200).json({
//       success: true,
//       data: file.name,
//     });
//   });
// });

// exports.getCategorys = async (req, res, next) => {
//     try {
//       const Category = await Category.find();

//       res.status(200).json({
//         success: true,
//         count: Category.length,
//         data: Category,
//       });
//     } catch (err) {
//        res.status(400).json({
//       success: false,
//        data: "Not found",
//       });
//       next(err);
//     }
//   };
