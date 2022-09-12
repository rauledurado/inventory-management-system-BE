const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Office = require("../models/Office");
const PurchaseProduct = require("../models/PurchaseProduct");

exports.getOffices = asyncHandler(async (req, res, next) => {
  const office = await Office.find();

  res.status(200).json({
    success: true,
    count: office.length,
    data: office,
  });
});

exports.createOffice = asyncHandler(async (req, res, next) => {
  const getLastOffice = await Office.find({}).sort({ _id: -1 }).limit(1);

  if (!getLastOffice.length) {
    req.body.officeId = 1;
  } else {
    const newOffice = parseInt(getLastOffice[0].officetId) + 1;
    req.body.officetId = newOffice;
  }

  // for file uploading
  if (!req.files) {
    req.body.photo = "no-image";
    // return next(new ErrorResponse("Please upload a file", 404));
  } else {
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

  const office = await Office.create(req.body);
  res.status(201).json({
    success: true,
    data: office,
  });
});

exports.getOffice = asyncHandler(async (req, res, next) => {
  const office = await Office.findById(req.params.id);
  if (!office) {
    return next(
      new ErrorResponse(`Office not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: office,
  });
});

exports.getOfficesByCities = asyncHandler(async (req, res, next) => {
  console.log("Inside")
  const officeByCity = await Office.aggregate([
    { $sortByCount: "$city" }
]);

  res.json(officeByCity)
});

exports.updateOffice = asyncHandler(async (req, res, next) => {
  const data = req.body;
  data.modifiedAt = Date.now();

  // for file uploading
  if (req.files) {
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

  const office = await Office.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!office) {
    return next(
      new ErrorResponse(`Office not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: office,
  });
});

exports.deleteOffice = asyncHandler(async (req, res, next) => {
  const office = await Office.findByIdAndDelete(req.params.id);
  if (!office) {
    return next(
      new ErrorResponse(`Office not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(201).json({
    success: true,
    msg: `Office deleted with id: ${req.params.id}`,
  });
});

exports.searchOffice = asyncHandler(async (req, res, next) => {


  // MAKING VARIABLES NEEDED

  const name = req.body.name;
  const city = req.body.city;
  const email = req.body.email;
  const phone = req.body.phone;


  const query = {};

  // MAKING A QUERY
  if (name !== "") {
    query.name = name;
  }
  if (city !== "") {
    query.city = city;
  }
  if (email !== "") {
    query.email = email;
  }
  if (phone !== "") {
    query.phone = phone;
  }
  


  console.log("The query has", query);

  // FINDING THE RESULTS AGAINTS QUERY
  const result = await Office.find(query)

  
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

exports.MultiSuggestion = asyncHandler(async (req, res, next) => {

  const city = await Office.aggregate([

    {
      $group:{_id:"$city"}
    }
  

  ])
  const name = await Office.aggregate([

    {
      $group:{_id:"$name"}
    }
  

  ])
  const phone = await Office.aggregate([

    {
      $group:{_id:"$phone"}
    }
  

  ])
  const email = await Office.aggregate([

    {
      $group:{_id:"$email"}
    }
  

  ])


  res.status(201).json({
    success: true,
    cities: city,
    phones:phone,
    emails:email,
    names:name,
  });

 

});


