const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ProductTransfer = require("../models/ProductTransfer");
const PurchaseProduct = require("../models/PurchaseProduct");
const Product = require("../models/Product");
const Employee = require("../models/Employee");
const { default: mongoose } = require("mongoose");




exports.createPoductTransfer = asyncHandler(async (req, res, next) => {


  const body = req.body;
  body.uuid = uuid4();
  const ItemId = body.ItemId;


  // // Getting all the unique ids
  const allUniqueIds = await ProductTransfer.aggregate([{ $match: { ItemId: mongoose.Types.ObjectId(ItemId) } }, { $group: { _id: "$uuid" } }])



  // finding the quantity of lastly added record for each group id and getting sum
  var totalQuantity = 0;
  await Promise.all(allUniqueIds.map(async (ids) => {
    var uuid = ids._id
    var quantityFound = await ProductTransfer.find({ ItemId: ItemId, uuid: uuid })
    if (quantityFound.length > 0) {
      var [{ quantity }] = quantityFound;
      totalQuantity = totalQuantity + parseInt(quantity);
    }
  }))

  //FIND THE QUANTITY IN STOCK
  const stockQuantityfound = await PurchaseProduct.findOne({ _id: ItemId }, { _id: 0, quantity: 1 });
  var stockQuantity = 0;
  var sumQuantity = 0;
  if (stockQuantityfound) {
    stockQuantity = stockQuantityfound.quantity;
    console.log("The quantity already assigned to users", totalQuantity);
    console.log("The Total Quantity that was in stock intially", stockQuantity);
    sumQuantity = totalQuantity + parseInt(req.body.quantity);
    console.log("The Sum of the quantity previously assigned and currently ordered", sumQuantity);
    console.log("The Stock Quantity has", stockQuantity);


  }

  const availableStock = stockQuantity - totalQuantity;


  // CHECKING IF THE ACTUAL QUANTITY EQUALS OR GREATER THEN SUM OF ALL QUANTITIES IS LESS THAN QUNATITY
  if (stockQuantity >= sumQuantity) {

    const productTransfer = await ProductTransfer.create(body);
    res.status(201).json({
      success: true,
      data: productTransfer,
      message: "Product Transfered Successfully"
    });


  }
  else {

    res.status(404).json({
      success: false,
      stock: availableStock,
      message: "The quantity exceeds the stock limit"
    });



  }



});


exports.getProductsTransferDetails = asyncHandler(async (req, res, next) => {


  const id = req.params.id;

  const productTransfer = await ProductTransfer.aggregate([
    {
      $match:
      {
        ItemId: mongoose.Types.ObjectId(id)
      }
    },
    {
      $project: {
        employId: "$employId",
        productId: "$productId",
        ItemId: "$ItemId",
         quantity: "$quantity",
        transferedFrom:"$transferedFrom",
        uuid:"$uuid",
        createdAt:"$createdAt"

      
       
      }
    }, {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "products"
      }
    }, {
      $lookup: {
        from: "employees",
        localField: "employId",
        foreignField: "_id",
        as: "employees"
      }
    }, {
      $lookup: {
        from: "purchaseproducts",
        localField: "ItemId",
        foreignField: "_id",
        as: "PurchaseProduct"
      }
    }
    , {
      $lookup: {
        from: "employees",
        localField: "transferedFrom",
        foreignField: "_id",
        as: "transferedFromEmploy"
      }
    }
    
  ])


  if (!productTransfer) {
    return next(
      new ErrorResponse(
        ` Product Transfer not found with id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({
    success: true,
    data: productTransfer,
  });



});



exports.updateProductTransfer = asyncHandler(async (req, res, next) => {


  console.log("The Incoming update transfer Req has",req.body)

  const body = req.body;
  const ItemId = body.ItemId;
  const UUID = body.uuid;

  // Getting all the unique ids
  // const allUniqueIds = await ProductTransfer.aggregate([{ $group: { _id: "$uuid" } }])
  const allUniqueIds = await ProductTransfer.aggregate([{ $match: { ItemId: mongoose.Types.ObjectId(ItemId) } }, { $group: { _id: "$uuid" } }])


  // finding the quantity of lastly added record for each group id and getting sum
  var totalQuantity = 0;
  allUniqueIds.map(async (ids) => {
    var uuid = ids._id
    var quantityFound = await ProductTransfer.find({ ItemId: ItemId, uuid: uuid })
    if (quantityFound.length > 0)
      var [{ quantity }] = quantityFound;
    // Don't count the quantity of the record which is being updated
    if (UUID !== uuid) {
      totalQuantity = totalQuantity + parseInt(quantity);
    }

  })


  //FIND THE QUANTITY IN STOCK
  const stockQuantityfound = await PurchaseProduct.findOne({ _id: ItemId }, { _id: 0, quantity: 1 });
  var stockQuantity = 0;
  var sumQuantity = 0;
  if (stockQuantityfound) {
    stockQuantity = stockQuantityfound.quantity;
    console.log("The quantity already assigned to users", totalQuantity);
    console.log("The Total Quantity that was in stock intially", stockQuantity);
    sumQuantity = totalQuantity + parseInt(req.body.quantity);
    console.log("The Sum of the quantity previously assigned and currently ordered", sumQuantity);
  }


  // CHECKING IF THE ACTUAL QUANTITY EQUALS OR GREATER THEN SUM OF ALL QUANTITIES IS LESS THAN QUNATITY
  if (stockQuantity >= sumQuantity) {
    const productTransfer = await ProductTransfer.updateOne({ _id: req.body._id }, body);
    res.status(201).json({
      success: true,
      data: productTransfer,
      message: "Product Transfered Details updated Successfully"
    });


  }
  else {

    return next(
      new ErrorResponse(
        `The quantity exceeds the item quantity available in store`,
        404
      )
    );


  }


});



exports.ProductTransfer = asyncHandler(async (req, res, next) => {


  console.log("incoming transfer req has",req.body)
  
  let _id = req.body._id;


  //finding the previous quantity and employ id 
  let preQuantity = await ProductTransfer.findById(_id);

  // console.log("The incoming object has", req.body);
  // console.log("The found object has", preQuantity);
  if (preQuantity) {
    // console.log("Pass 1");
    //comparing quantities  if the both are equal and the employ ids are different updating the previous record 
    if (preQuantity.quantity == req.body.quantity && preQuantity.employId != req.body.employId) {

      // console.log("Pass 2");
      let newTransferData = {};
      newTransferData = req.body
      newTransferData.transferedFrom = mongoose.Types.ObjectId(preQuantity.employId);

      let reposne = await ProductTransfer.findByIdAndUpdate(_id, newTransferData, {
        new: true,
        runValidators: true,
      });

      res.status(201).json({
        success: true,
        data: reposne,
        message: "Product Transfered Successfully"
      });


    }



    // if the previous quantity is greater than req quantity and both employ ids are different
    if (parseInt(preQuantity.quantity) > parseInt(req.body.quantity) && preQuantity.employId != req.body.employId) {

      console.log("Pass 3");

      // calculating the quantity difference
      let qd = parseInt(preQuantity.quantity) - parseInt(req.body.quantity);

      //Updating the previous employ record with the quantity difference calculated
      let newTransferData = {};
      newTransferData = preQuantity;
      newTransferData.quantity = qd;
      let reposneUpdate = await ProductTransfer.findByIdAndUpdate(_id, newTransferData, {
        new: true,
        runValidators: true,
      });


      //  Creating a new product Transfer for new employ  
      let newOne = {};
      newOne = req.body;
      // setting null to avoid dublicate value error
      newOne._id = null;
      newOne.uuid = uuid4();
      newOne.transferedFrom = mongoose.Types.ObjectId(preQuantity.employId);
      newOne.transferedTo = "";

      const newRecord = await ProductTransfer.create(newOne);

      res.status(201).json({
        success: true,
        data: newRecord,
        message: "Product Transfered Successfully"
      });


    }

    if(parseInt(preQuantity.quantity) < parseInt(req.body.quantity)){
      return next(
        new ErrorResponse(
          `The quantity exceeds the limit that employ currently have`,
          404
        )
        )

    }

  }
  else{

    return next(
      new ErrorResponse(
        `No Transfer request found with id ${ _id}`,
        404
      )
      )

  }


});


exports.deleteProductTransfer = asyncHandler(async (req, res, next) => {

  const productTransfer = await ProductTransfer.findByIdAndDelete(req.params.id);
  if (!productTransfer) {
    return next(
      new ErrorResponse(
        `Product transfer not found with id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(201).json({
    success: true,
    msg: `Product transfer deleted with id: ${req.params.id}`,
  });
});













///////////// API'S NOT IN USE ////////////////////

exports.createPoductTransfer2 = asyncHandler(async (req, res, next) => {

  const body = req.body;
  body.uuid = uuid4();
  const ItemId = body.ItemId;
  const employId = body.employId;

  const employeeDetails = await Employee.findOne({ _id: employId });

  if (employeeDetails) {
    body.employName = employeeDetails.name;
    body.employID = employeeDetails.employeeId;
  }

  // // Getting all the unique ids
  const allUniqueIds = await ProductTransfer.aggregate([{ $match: { ItemId: mongoose.Types.ObjectId(ItemId) } }, { $group: { _id: "$uuid" } }])



  // finding the quantity of lastly added record for each group id and getting sum
  var totalQuantity = 0;
  allUniqueIds.map(async (ids) => {
    var uuid = ids._id
    var quantityFound = await ProductTransfer.find({ ItemId: ItemId, uuid: uuid })
    if (quantityFound.length > 0) {
      var [{ quantity }] = quantityFound;
      totalQuantity = totalQuantity + parseInt(quantity);
    }
  })

  //FIND THE QUANTITY IN STOCK
  const stockQuantityfound = await PurchaseProduct.findOne({ _id: ItemId }, { _id: 0, quantity: 1 });
  var stockQuantity = 0;
  var sumQuantity = 0;
  if (stockQuantityfound) {
    stockQuantity = stockQuantityfound.quantity;
    console.log("The quantity already assigned to users", totalQuantity);
    console.log("The Total Quantity that was in stock intially", stockQuantity);
    sumQuantity = totalQuantity + parseInt(req.body.quantity);
    console.log("The Sum of the quantity previously assigned and currently ordered", sumQuantity);
  }


  // CHECKING IF THE ACTUAL QUANTITY EQUALS OR GREATER THEN SUM OF ALL QUANTITIES IS LESS THAN QUNATITY
  if (stockQuantity >= sumQuantity) {

    const productTransfer = await ProductTransfer.create(body);
    res.status(201).json({
      success: true,
      data: productTransfer,
      message: "Product Transfered Successfully"
    });


  }
  else {

    return next(
      new ErrorResponse(
        `The quantity exceeds the item quantity available in store`,
        404
      )
    );


  }



});

exports.getProductsTransferDetail2 = asyncHandler(async (req, res, next) => {

  const ItemId = req.params.id;
  var dataArray = [];
  var data = {};

  // Getting all differenr unique ids for the a specific item
  const allUniqueIds = await ProductTransfer.aggregate([{ $match: { ItemId: mongoose.Types.ObjectId(ItemId) } }, { $group: { _id: "$uuid" } }])


  // console.log("All unique ids",allUniqueIds);

  if (allUniqueIds.length > 0) {

    // Getting the last id of the group
    const lastUUID = allUniqueIds[allUniqueIds.length - 1]._id



    // finding the quantity of lastly added record for each group id and getting sum
    var totalQuantity = 0;
    await Promise.all(allUniqueIds.map(async (ids) => {
      var uuid = ids._id
      var quantityFound = await ProductTransfer.find({ ItemId: ItemId, uuid: uuid }).sort({ createdAt: -1 }).limit(1);


      if (quantityFound.length > 0) {

        var employId = quantityFound[0].employId;
        var productId = quantityFound[0].productId;
        var itemEntryId = quantityFound[0].ItemId;
        // console.log("The employ id has", employId);
        // console.log("The Product id has", productId);
        // console.log("The itemId id has", itemEntryId);
        var employDetails = await Employee.findOne({ _id: employId });
        var itemDetails = await PurchaseProduct.findOne({ _id: itemEntryId });
        var productDetails = await Product.findOne({ _id: productId });



        if (employDetails) {
          data.employName = employDetails.name;
          data.employEmail = employDetails.emailAddress;
          data.EmployId = employDetails.employeeId;
        }
        if (productDetails) {
          data.ProductName = productDetails.name;
          data.ProductBrandName = productDetails.BrandName;
          data.ProductCategoryName = productDetails.categoryName;
          data.ProductModel = productDetails.model;
        }
        if (itemDetails) {
          data.price = itemDetails.price;
          data.srNo = itemDetails.srNo;
          data.tagNo = itemDetails.tagNo;
          data.QRCodeImage = itemDetails.QRCodeImage;
        }

        /// calculating the total quantity previously dispatched
        var [{ quantity }] = quantityFound;
        totalQuantity = totalQuantity + parseInt(quantity);
        // console.log("Quantity found has  ", quantityFound);
        // console.log("Data object has  ", data);



        // Merging the Record 

        data.quantity = quantityFound[0].quantity;
        data.EmployMId = quantityFound[0].employId;
        data.ProductMId = quantityFound[0].productId;
        data.ItemMID = quantityFound[0].ItemId;
        data.createdAt = quantityFound[0].createdAt;
        data.createdBy = quantityFound[0].createdBy;
        data.transferedTo = quantityFound[0].transferedTo;
        data.transferedFrom = quantityFound[0].transferedFrom;


        dataArray.push(data);


      }

      console.log("The data array has", dataArray);

      // if (lastUUID === uuid) {




      // }



      // else {

      //   return next(
      //     new ErrorResponse(
      //       `No Data found in the record`,
      //       404
      //     )
      //   );
      // }


    }))


    console.log("The final data array has", dataArray);
    //FIND THE QUANTITY IN STOCK
    const stockQuantityfound = await PurchaseProduct.findOne({ _id: ItemId }, { _id: 0, quantity: 1 });
    var stockQuantity = 0;
    var sumQuantity = 0;
    if (stockQuantityfound) {
      stockQuantity = stockQuantityfound.quantity;
      console.log("The quantity already assigned to users", totalQuantity);
      console.log("The Total Quantity that was in stock intially", stockQuantity);
    }

    const inStockQauntity = stockQuantity - totalQuantity;

    // sending response       
    res.status(201).json({
      success: true,
      inStockQauntity: inStockQauntity,
      data: dataArray,
      message: "Products fetched successfully"
    });


  }
  else {

    return next(
      new ErrorResponse(
        `No Data found in the record`,
        404
      )
    );

  }



});

exports.updateProductTransfer2 = asyncHandler(async (req, res, next) => {

  const _id = req.body._id;
  const body = req.body;
  console.log("The incoming body has", req.body);

  // const reposne = await ProductTransfer.findOneAndUpdate(_id,body);
  const reposne = await ProductTransfer.findByIdAndUpdate(_id, body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    success: true,
    data: reposne,
    message: "Product Transfered Updated Successfully"
  });




});


exports.getAllProductsTransfer = asyncHandler(async (req, res, next) => {
  const productTransfer = await ProductTransfer.find();
  res.status(200).json({
    success: true,
    count: productTransfer.length,
    data: productTransfer,
  });
});


exports.modified = asyncHandler(async (req, res, next) => {

  const ItemId = req.params.id;
  const dataArray = [];
  const allUniqueIds = await ProductTransfer.aggregate([{ $match: { ItemId: mongoose.Types.ObjectId(ItemId) } }, { $group: { _id: "$uuid" } }])
  var totalQuantity = 0;
  await Promise.all(allUniqueIds.map(async (ids) => {
    var uuid = ids._id
    var quantityFound = await ProductTransfer.find({ ItemId: ItemId, uuid: uuid }).sort({ createdAt: -1 }).limit(1);
    /// calculating the total quantity previously dispatched
    var [{ quantity }] = quantityFound;
    totalQuantity = totalQuantity + parseInt(quantity);
    const [objectData] = quantityFound;
    dataArray.push(objectData);

  }))

  //FIND THE QUANTITY IN STOCK
  const stockQuantityfound = await PurchaseProduct.findOne({ _id: ItemId }, { _id: 0, quantity: 1 });
  var stockQuantity = 0;
  var sumQuantity = 0;
  if (stockQuantityfound) {
    stockQuantity = stockQuantityfound.quantity;
    console.log("The quantity already assigned to users", totalQuantity);
    console.log("The Total Quantity that was in stock intially", stockQuantity);
  }

  const inStockQauntity = stockQuantity - totalQuantity;

  console.log("The data array has", dataArray);
  // sending response       
  res.status(201).json({
    inStockQauntity: inStockQauntity,
    success: true,
    data: dataArray,
    message: "Products fetched successfully"
  });

});





