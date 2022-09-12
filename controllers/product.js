const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Product = require("../models/Product");
const { default: mongoose, Mongoose } = require("mongoose");

exports.getProducts = asyncHandler(async (req, res, next) => {

  
   // NEW API
   const products = await Product.aggregate([

    {
      $lookup: {
        from: "brands",
        localField: "brandId",
        foreignField: "_id",
        as: "brand"
      }
    }, {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category"
      }
    }
    , {
      $lookup: {
        from: "producttypes",
        localField: "productTypeId",
        foreignField: "_id",
        as: "productType"
      },
      // $lookup: {
      //   from: "assetsnames",
      //   localField: "assetsNameId",
      //   foreignField: "_id",
      //   as: "assetsName"
      // }
    }
  ])


  //OLD
  // const product = await Product.find();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });


});

exports.createProduct = asyncHandler(async (req, res, next) => {
  const getLastProduct = await Product.find({}).sort({ _id: -1 }).limit(1);

  if (!getLastProduct.length) {
    req.body.productId = 1;
  } else {
    const newProduct = parseInt(getLastProduct[0].productId) + 1;
    req.body.productId = newProduct;
  }

  // for file uploading
  if (!req.files) {
    req.body.photo = "no-image";
    // return next(new ErrorResponse("Please upload a file", 404));
  } else {
    const file = req.files.file;
    console.log("that is in ide photo", file);
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

  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    data: product,
  });
});

exports.getProduct = asyncHandler(async (req, res, next) => {

 
   // NEW API
   const product = await Product.aggregate([
    {
      $match:{
        _id: mongoose.Types.ObjectId(req.params.id)
      }
    },
    {
      $lookup: {
        from: "brands",
        localField: "brandId",
        foreignField: "_id",
        as: "brand"
      }
    }, {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category"
      }
    }
    , {
      $lookup: {
        from: "producttypes",
        localField: "productTypeId",
        foreignField: "_id",
        as: "productType"
      },
      // $lookup: {
      //   from: "assetsnames",
      //   localField: "assetsNameId",
      //   foreignField: "_id",
      //   as: "assetsName"
      // }
    }
  ])

  // OLD
  // const product = await Product.findById(req.params.id);
  if (!product) {
    return next(
      new ErrorResponse(
        `Product not found with id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({
    success: true,
    data: product,
  });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const data = req.body;
  data.modifiedAt = Date.now();

  if (req.files) {
    // for file uploading
    const file = req.files.photo;
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

  const product = await Product.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return next(
      new ErrorResponse(
        `Product type not found with id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({
    success: true,
    data: product,
  });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(
      new ErrorResponse(
        `Product type not found with id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(201).json({
    success: true,
    msg: `Product Type deleted with id: ${req.params.id}`,
  });
});

exports.getCreatedBySuggestion = asyncHandler(async (req, res, next) => {

  const result = await Product.aggregate([ {$group:{_id:"$createdBy"}}])
  console.log("Get purchase products all createdBy result",result);
  if (!result.length) {
    return next(
      new ErrorResponse(
        `No Results found`,
        404
      )
    );
  }
  else{

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });

  }

});

exports.searchProducts = asyncHandler(async (req, res, next) => {

  console.log("Serach products api resposne");

  // MAKING VARIABLES NEEDED

  const productId = req.body.productId;
  const productTypeId = req.body.productTypeId;
  const categoryId = req.body.categoryId;
  const brandId = req.body.brandId;
  const createdBy = req.body.createdBy;


  const query = {};

  // MAKING A QUERY
  if (productId !== "") {
    query._id =  mongoose.Types.ObjectId(productId)
  }
  if (productTypeId !== "") {
    query.productTypeId =  mongoose.Types.ObjectId(productTypeId)
  }
  if (categoryId !== "") {
    query.categoryId =  mongoose.Types.ObjectId(categoryId)
  }
  if (brandId !== "") {
    query.brandId =  mongoose.Types.ObjectId(brandId)
  }
  if (createdBy !== "") {
    query.createdBy = createdBy;
  }
  


  console.log("The query has", query);

  // FINDING THE RESULTS AGAINTS QUERY
    const result = await Product.aggregate([
      {
        $match:query
      },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brand"
        }
      }, {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category"
        }
      }
      , {
        $lookup: {
          from: "producttypes",
          localField: "productTypeId",
          foreignField: "_id",
          as: "productType"
        }
      }
    ])
  

  //OLD
  // const result = await Product.find(query)

  
  if (!result.length) {
    return next(
      new ErrorResponse(
        `No Results found`,
        404
      )
    );
  }
  res.status(201).json({
    success: true,
    count: result.length,
    data: result,
  });



});


















// if (!req.files) {
//   return next(new ErrorResponse("Please upload a file", 404));
// }
