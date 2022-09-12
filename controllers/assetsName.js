
const asyncHandler = require("../middleware/async");
const AssetsName = require("../models/assetsName");
const Product = require("../models/Product")
//to get all
exports.getAllAssetsName = asyncHandler(async (req, res, next) => {
    const assetsName = await AssetsName.find();
    res.status(200).json({
      success: true,
      count: assetsName.length,
      data: assetsName,
    });
  });
//create 
  exports.createAssetsName = asyncHandler(async (req, res, next) => {
   
   
    // if (!getLastProduct.length) {
    //   req.body.productId = 1;
    // } else {
    //   const newProduct = parseInt(getLastProduct[0].productId) + 1;
    //   req.body.productId = newProduct;
    // }
    const assetsName = await AssetsName.create(req.body);
    Product.findByIdAndUpdate(req.body.productId, { "$push": { "assetId": assetsName._id } },
    { "new": true, "upsert": true },
                            function (err, docs) {
    if (err){
      console.log(err)
      res.status(404).json({
        success: false,
        data: err,
       
      });
    }
    else{
      res.status(200).json({
        success: true,
        data: assetsName,
       
      });
    }
});

  });
//update 
  exports.updateAssetsName = asyncHandler(async (req, res, next) => {
    const data = req.body;
    data.modifiedAt = Date.now();
  
    const assetsName = await AssetsName.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!assetsName) {
      return next(
        new ErrorResponse(`assetsName not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      success: true,
      data: assetsName,
    });
  });


  //to delete 


  exports.deleteAssetsName = asyncHandler(async (req, res, next) => {
    const assetsName = await AssetsName.findByIdAndDelete(req.params.id);
    if (!assetsName) {
      return next(
        new ErrorResponse(`assetsName not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(201).json({
      success: true,
      msg: `assetsName deleted with id: ${req.params.id}`,
    });
  });
  