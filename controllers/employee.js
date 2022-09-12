const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Employee = require("../models/Employee");
const ProductTransfer = require("../models/ProductTransfer");
const PurchaseProduct = require("../models/PurchaseProduct");
const Product = require("../models/Product");
const { default: mongoose } = require("mongoose");
const { count } = require("console");
const { updateOne } = require("../models/Employee");
const Department = require("../models/Department");
const Wing = require("../models/Wing");
const Office = require("../models/Office");

async function createdDepartments(listOfDepartments){

  let result =await Promise.all( listOfDepartments.map(async(department) => {
    let dept= await Department.create({
      name: department
    });
    
    return dept;
  }));
 
  return result;

}

//for wings creation 

async function createdWings(listOfWings){

  let result =await Promise.all( listOfWings.map(async(wing) => {
    let dept= await Wing.create({
      name: wing
    });
    
    return dept;
  }));
 
  return result;

}
// for office 

async function createdOffices(listOfOffices){

  let result =await Promise.all( listOfOffices.map(async(office) => {
    let dept= await Office.create({
      name: office
    });
    
    return dept;
  }));
 
  return result;

}


// importing employeees data
exports.postEmployeeData = asyncHandler(async (req, res, next) => {

  const employeeData = req.body.data.employee;
  

  const uniqueDepartments = req.body.data.departments;

  const uniqueWings = req.body.data.wings;

  const uniqueOffices = req.body.data.offices;
let createdDepartment = await createdDepartments(uniqueDepartments);
let createdWing = await createdWings(uniqueWings);
let createdOffice = await createdOffices(uniqueOffices);
  
  

  const createdEmployee = employeeData.map(async(employee) => {

    //  const dateOfJoining = new Date(employee.dateOfJoining)

 console.log("employeee",employee);
    const department = await Department.findOne({name: employee.department })
    let wings = await Wing.findOne({name:employee.wing})
    if(wings)
    {
      let resultOfWings  = await Wing.findOne({department : department});
      if(resultOfWings===null)
      {

     wings.department = department;
     wings.save();

      }
    }
   
    const office = await Office.findOne({name:employee.officeId})

    // ExcelDateToJSDate(employee.dateOfJoining)


    // console.log("dateOfJoining",dateOfJoining.toLocaleString())

    return await Employee.create({
      employeeId: employee.employeeID,
      name : employee.name,
      dateOfJoining: employee.dateOfJoining.toLocaleString(),
      pg: employee.pg,
      emailAddress: employee.emailAddress,
      mobileNumber: employee.mobileNumber,
      cnic: employee.cnic,
      gender: employee.gender,
      jobTitle: employee.jobTitle,
      dob: employee.dob.toLocaleString(),
      remarks : employee.remarks,
      designation: employee.designation,
      officeId: office !== null ? office._id : undefined,
      department: department !== undefined ? department._id : undefined,
      wing: wings !== undefined ? wings._id : undefined
    })
  })
  
  res.json({createdEmployee})

})

// const ExcelDateToJSDate = (dateOfJoining) => {
//   let converted_date = new Date(Math.round((dateOfJoining - 25569) * 864e5));
//   converted_date = String(converted_date).slice(4, 15)
//   date = converted_date.split(" ")
//   let day = dateOfJoining[1];
//   let month = dateOfJoining[0];
//   month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(month) / 3 + 1
//   if (month.toString().length <= 1)
//       month = '0' + month
//   let year = dateOfJoining[2];
//   return String(day + '-' + month + '-' + year.slice(2, 4))
// }


exports.getEmployees = asyncHandler(async (req, res, next) => {

  // NEW API
  const result = await Employee.aggregate([

    {
      $lookup: {
        from: "wings",
        localField: "wing",
        foreignField: "_id",
        as: "wing"
      }
    }, {
      $lookup: {
        from: "offices",
        localField: "officeId",
        foreignField: "_id",
        as: "office"
      }
    }, {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "department"
      }
    }, {
      $lookup: {
        from: "employees",
        localField: "reportingManager",
        foreignField: "_id",
        as: "reportingManager"
      }
    }
  ])


  //OLD
  // const employee = await Employee.find();
  res.status(200).json({
    success: true,
    count: result.length,
    data: result,
  });
});


exports.createEmployee = asyncHandler(async (req, res, next) => {


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


  req.body.dateOfJoining = new Date(req.body.dateOfJoining);
  console.log("outcoming date of joining", req.body.dateOfJoining);

  const employee = await Employee.create(req.body);
  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.updateEmployee = asyncHandler(async (req, res, next) => {

  console.log("The update body has for employ has incming request has",req.body);
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

  const employee = await Employee.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.deleteEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(201).json({
    success: true,
    msg: `Employee deleted with id: ${req.params.id}`,
  });
});

exports.searchFilters = asyncHandler(async (req, res, next) => {


  console.log("The emply search filters are called",req.body);

  // MAKING VARIABLES NEEDED

  const employeeId = req.body.employeeId;
  const designation = req.body.designation;
  const location = req.body.location;
  const department = req.body.department;
  const pg = req.body.pg;
  const sDate = req.body.startDate;
  const eDate = req.body.endDate;


  let startDate = new Date(sDate);
  startDate.setHours(0, 0, 0, 0);

  let endDate = new Date(eDate);
  endDate.setDate(endDate.getDate() + 1);
  endDate.setHours(0, 0, 0, 0);



  const query = {};

  // MAKING A QUERY
  if (employeeId !== "") {
    query._id =  mongoose.Types.ObjectId(employeeId);
  }
  if (designation !== "") {
    query.designation = designation;
  }
  if (location !== "") {
    query.officeId = mongoose.Types.ObjectId(location);
  }
  if (pg !== "") {
    query.pg = parseInt(pg);
  }
  if (department !== "") {
    query.department = mongoose.Types.ObjectId(department);
  }
  if (sDate !== "" && eDate!== "") {
    query.dateOfJoining = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }



  console.log("The query has", query);


  
  // FINDING THE RESULTS AGAINTS QUERY
  const result = await Employee.aggregate([

    {
      $match:query
    },
    {
      $lookup: {
        from: "wings",
        localField: "wing",
        foreignField: "_id",
        as: "wing"
      }
    }, {
      $lookup: {
        from: "offices",
        localField: "officeId",
        foreignField: "_id",
        as: "office"
      }
    }, {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "department"
      }
    }, {
      $lookup: {
        from: "employees",
        localField: "reportingManager",
        foreignField: "_id",
        as: "reportingManager"
      }
    }
  ])
   

  //OLD
  // let result = await Employee.find(query);
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

exports.designationSuggestion = asyncHandler(async (req, res, next) => {

  const result = await Employee.aggregate([

    {
      $group:{_id:"$designation"}
    }
  
  ])
 
  res.status(201).json({
    success: true,
    count:  result.length,
    data: result,
  });

 

});


exports.getEmployProductsCurrentDetails = asyncHandler(async (req, res, next) => {

  var EmployId = req.params.id;
  

  const productTransfer = await ProductTransfer.aggregate([
    {
      $match:
      {
        employId: mongoose.Types.ObjectId(EmployId)
      }
    },
    {
      $project: {
        employId: "$employId",
        productId: "$productId",
        ItemId: "$ItemId",
        quantity: "$quantity",
        transferedFrom:"$transferedFrom",
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



exports.magic = asyncHandler(async (req, res, next) => {


  console.log("Yes the magic api is called");

  /////////////////// first Implemendation ////////////////////////////////
  // find all emp 
  // const allEmploys = await Employee.find();

  // maping all employs
  //  const result = await Promise.all(allEmploys.map( async (item)=>{

  //   console.log("The Item has", item)
  //   // getting employ mongoose id
  //     const employID = item._id;
  //   // Getting the reporting manager name
  //     const reportingManagerName = item.reportingManager;

  //   // find the reporing manager Id in db 
  //   const reportingManagerRecord = await Employee.findOne({name:reportingManagerName});

  //   if(reportingManagerRecord){

  //     // getting reporting manager id
  //     const repotingManangerId = reportingManagerRecord._id;

  //     // Changing the nreporting manager name to mongoose id 
  //     const EmpData = item;
  //     EmpData.reportingManager = repotingManangerId;
      
  //     // updating the remploy record with reporting manager id found
  //     const UpdateEmploy =  await Employee.updateOne({_id:employID},EmpData)


  //   }


  // })

  // )


  ///////////// Second Implementation Reporting Manager //////////////
 
  const employWitRepotingManager = await Employee.aggregate([
   
    {
      $lookup: {
        from: "employees",
        localField: "reportingManager",
        foreignField: "name",
        as: "reportingManagerDetails"
      }
    },
  ])


  var refinedData  = [];

  if(employWitRepotingManager){
 
    const result = await Promise.all( employWitRepotingManager.map(async (item)=>{ 
      if(item.reportingManagerDetails.length != 0){
       
      let data ={};
       data = item
      data.reportingManager = item.reportingManagerDetails[0]._id;
      data.reportingManagerDetails = undefined;
      data.wing = undefined;
      // data.officeId = undefined;

      refinedData.push(data)
        console.log("The id to update has",item._id);
      const updateRecord = await Employee.updateOne({_id:item._id},data)
       console.log("The update response is",updateRecord);
      }
    
 
      
    }))
    
    console.log("final data array has",refinedData);









  }




console.log("The final result has",employWitRepotingManager);














  // if (!productTransfer) {
  //   return next(
  //     new ErrorResponse(
  //       ` Product Transfer not found with id of ${req.params.id}`,
  //       404
  //     )
  //   );
  // }
  if(employWitRepotingManager){

    res.status(200).json({
      success: true,
      count:employWitRepotingManager.length,
      data: employWitRepotingManager,
    });
  
  }
 

});



exports.magicOffice = asyncHandler(async (req, res, next) => {



  const employWitRepotingManager = await Employee.aggregate([

    {
      $lookup: {
        from: "offices",
        localField: "officeId",
        foreignField: "officeId",
        as: "office"
      }
    },
  ])
  


  var refinedData  = [];

  if(employWitRepotingManager){
 
    const result = await Promise.all( employWitRepotingManager.map(async (item)=>{ 
      if(item.office.length != 0){
       
      let data ={};
       data = item
      data.officeId = item.office[0]._id;
      data.office = undefined;
      data.wing = undefined;
      // data.officeId = undefined;

      refinedData.push(data)
        console.log("The id to update has",item._id);
      const updateRecord = await Employee.updateOne({_id:item._id},data)
       console.log("The update response is",updateRecord);
      }
    
    }))
    
    console.log("final data array has",refinedData);

  }

console.log("The final result has",employWitRepotingManager);
  if(employWitRepotingManager){

    res.status(200).json({
      success: true,
      count:result.length,
      data: result,
    });
  
  }
 

});












// API'S NOT IN USE



exports.searchFiltersOld = asyncHandler(async (req, res, next) => {

  console.log("Yes I am getting called");

  const dynamic = req.body.dynamic;
  const designation = req.body.designation;
  const reportingManager = req.body.location;
  const department = req.body.department;
  const sDate = req.body.startDate;
  const eDate = req.body.endDate;





  let startDate = new Date(sDate);
  startDate.setHours(0, 0, 0, 0);

  let endDate = new Date(eDate);
  endDate.setDate(endDate.getDate() + 1);
  endDate.setHours(0, 0, 0, 0);




  try {

    var emailRegex = /\S+@\S+\.\S+/;
    var NumberRegex = /^[0-9]*$/;
    var cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/;

    if (dynamic !== "" && designation !== "" && reportingManager !== "" && department !== "" && CurrentDate !== "") {

      console.log("Pass 31");
      console.log("The Dynamic has", dynamic);


      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, designation: designation, reportingManager: reportingManager, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with email ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, designation: designation, reportingManager: reportingManager, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, designation: designation, reportingManager: reportingManager, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }

    }


    else if (designation !== "" && reportingManager !== "" && department !== "" && CurrentDate !== "") {

      console.log("Pass 30");
      let employee = await Employee.find({ designation: designation, reportingManager: reportingManager, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found`, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });


    }





    else if (dynamic !== "" && reportingManager !== "" && department !== "" && CurrentDate !== "") {

      console.log("Pass 29");
      console.log("The Dynamic has", dynamic);

      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, reportingManager: reportingManager, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with email ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, reportingManager: reportingManager, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with employ Id ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, reportingManager: reportingManager, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }

    }


    else if (dynamic !== "" && designation !== "" && department !== "" && CurrentDate !== "") {

      console.log("The Dynamic has", dynamic);
      console.log("Pass 28");
      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, designation: designation, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with email ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, designation: designation, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with employ Id ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, designation: designation, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }


    }


    else if (dynamic !== "" && designation !== "" && reportingManager !== "" && CurrentDate !== "") {

      console.log("Pass 27");
      console.log("The Dynamic has", dynamic);

      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, designation: designation, reportingManager: reportingManager, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, designation: designation, reportingManager: reportingManager, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, designation: designation, reportingManager: reportingManager, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }

    }



    else if (dynamic !== "" && designation !== "" && reportingManager !== "" && department !== "") {

      console.log("Pass 26");
      console.log("The Dynamic has", dynamic);

      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, designation: designation, reportingManager: reportingManager, department: department })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, designation: designation, reportingManager: reportingManager, department: department })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with employ Id ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, designation: designation, reportingManager: reportingManager, department: department })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }

    }

    else if (reportingManager !== "" && department !== "" && CurrentDate !== "") {

      console.log("Pass 25");
      let employee = await Employee.find({ reportingManager: reportingManager, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found `, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });

    }

    else if (designation !== "" && department !== "" && CurrentDate !== "") {
      console.log("Pass 24");
      let employee = await Employee.find({ designation: designation, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found`, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });





    }

    else if (designation !== "" && reportingManager !== "" && CurrentDate !== "") {
      console.log("Pass 23");
      let employee = await Employee.find({ designation: designation, reportingManager: reportingManager, dateOfJoining: { $gte: startDate, $lte: endDate } })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found `, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });



    }


    else if (designation !== "" && reportingManager !== "" && department !== "") {

      console.log("Pass 22");
      let employee = await Employee.find({ designation: designation, reportingManager: reportingManager, department: department })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found`, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });

    }


    else if (dynamic !== "" && department !== "" && CurrentDate !== "") {

      console.log("Pass 21");
      console.log("The Dynamic has", dynamic);

      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })

        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with employ Id ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }

    }

    else if (dynamic !== "" && reportingManager !== "" && CurrentDate !== "") {

      console.log("Pass 20");
      console.log("The Dynamic has", dynamic);
      console.log("The incominf date is", CurrentDate);
      console.log("The start date is", startDate);
      console.log("The end date is", endDate);

      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, reportingManager: reportingManager, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, reportingManager: reportingManager, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with employ Id ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, reportingManager: reportingManager, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }

    }



    else if (dynamic !== "" && reportingManager !== "" && department !== "") {

      console.log("Pass 19");
      console.log("The Dynamic has", dynamic);

      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, reportingManager: reportingManager, department: department })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, reportingManager: reportingManager, department: department })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with employ Id ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, reportingManager: reportingManager, department: department })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }



    }



    else if (dynamic !== "" && designation !== "" && CurrentDate !== "") {

      console.log("Pass 18");
      console.log("The Dynamic has", dynamic);

      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, designation: designation, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, designation: designation, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with employ Id ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, designation: designation, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }



    }


    else if (dynamic !== "" && designation !== "" && department !== "") {

      console.log("Pass 17");
      console.log("The Dynamic has", dynamic);

      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, designation: designation, department: department })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, designation: designation, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with employ Id ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, designation: designation, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }



    }



    else if (dynamic !== "" && designation !== "" && reportingManager !== "") {

      console.log("Pass 16");
      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, designation: designation, reportingManager: reportingManager })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, designation: designation, reportingManager: reportingManager })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with employ Id ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, designation: designation, reportingManager: reportingManager })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }


    }



    else if (department !== "" && CurrentDate !== "") {

      console.log("Pass 15");
      let employee = await Employee.find({ department: department, dateOfJoining: { $gte: startDate, $lte: endDate } })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found `, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });




    }

    // else if (subCategory !== "" && startPrice !== "") {

    //   console.log("Pass 15");
    //   let response = await Product.find({ subCategory: subCategory, salePrice: { $gte: startPrice, $lte: endPrice } }).sort({ rating: -1 })
    //   console.log("response is :", response)
    //   res.send({ code: 0, data: response })

    // }



    else if (reportingManager !== "" && CurrentDate !== "") {

      console.log("Pass 14");
      let employee = await Employee.find({ reportingManager: reportingManager, dateOfJoining: { $gte: startDate, $lte: endDate } })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found `, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });



    }

    else if (reportingManager !== "" && department !== "") {

      console.log("Pass 13");
      let employee = await Employee.find({ reportingManager: reportingManager, department: department })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found `, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });



    }


    else if (designation !== "" && CurrentDate !== "") {

      console.log("Pass 12");
      let employee = await Employee.find({ designation: designation, dateOfJoining: { $gte: startDate, $lte: endDate } })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found `, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });



    }



    else if (designation !== "" && department !== "") {

      console.log("Pass 11");
      let employee = await Employee.find({ designation: designation, department: department })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found `, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });


    }



    else if (designation !== "" && reportingManager !== "") {

      console.log("Pass 10");
      let employee = await Employee.find({ designation: designation, reportingManager: reportingManager })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found `, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });

    }

    else if (dynamic !== "" && CurrentDate !== "") {

      console.log("Pass 9");
      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with employ Id ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, dateOfJoining: { $gte: startDate, $lte: endDate } })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }


    }

    else if (dynamic !== "" && department !== "") {

      console.log("Pass 8");
      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, department: department })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, department: department })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with employ Id ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, department: department })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }



    }


    else if (dynamic !== "" && reportingManager !== "") {

      console.log("Pass 7");
      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, reportingManager: reportingManager })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, reportingManager: reportingManager })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with employ Id ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, reportingManager: reportingManager })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }



    }


    else if (dynamic !== "" && designation !== "") {

      console.log("Pass 6");
      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic, designation: designation })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic, designation: designation })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with employ Id ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic, designation: designation })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }

    }


    else if (CurrentDate !== "") {

      console.log("Pass 5");
      let employee = await Employee.find({ dateOfJoining: { $gte: startDate, $lte: endDate } })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found `, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });

    }



    else if (department !== "") {

      console.log("Pass 4");
      let employee = await Employee.find({ department: department })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found `, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });


    }



    else if (reportingManager !== "") {

      console.log("Pass 3");
      let employee = await Employee.find({ reportingManager: reportingManager })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found `, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    }


    else if (designation !== "") {

      console.log("Pass 2");
      let employee = await Employee.find({ designation: designation })
      if (!employee) {
        return next(
          new ErrorResponse(`Employee not found `, 404)
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });

    }

    else if (dynamic !== "") {

      console.log("Pass 1");
      if (emailRegex.test(dynamic)) {
        console.log("It is  a valid email")
        let employee = await Employee.find({ emailAddress: dynamic })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (NumberRegex.test(dynamic)) {
        console.log("It is a number")
        let employee = await Employee.find({ employeeId: dynamic })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found with employ Id ${req.body.dynamic}`, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });
      }
      if (cnicRegex.test(dynamic)) {
        console.log("It is the cnic")
        let employee = await Employee.find({ cnic: dynamic })
        if (!employee) {
          return next(
            new ErrorResponse(`Employee not found `, 404)
          );
        }
        res.status(201).json({
          success: true,
          data: employee,
        });

      }



    }

    else {

      console.log("pass 0");
      return next(
        new ErrorResponse(`Employee not found `, 404)
      );


    }



  }

  catch (e) {
    console.log('Error occured, possible cause: ' + e.message);
    res.send({ code: 1, error: 'Error occured, possible cause: ' + e.message });
  }



});

exports.modified = asyncHandler(async (req, res, next) => {

  const employId = req.params.id;
  const dataArray = [];
  const allUniqueIds = await ProductTransfer.aggregate([{ $match: { employId: mongoose.Types.ObjectId(employId) } }, { $group: { _id: "$uuid" } }])
  await Promise.all(allUniqueIds.map(async (ids) => {
    var uuid = ids._id
    var quantityFound = await ProductTransfer.find({ employId: employId, uuid: uuid }).sort({ createdAt: -1 }).limit(1);
    console.log("single item has", quantityFound);
    dataArray.push(quantityFound);

  }))
  // console.log("The data array has",dataArray);
  // sending response       
  res.status(201).json({
    success: true,
    data: dataArray,
    message: "Employs fetched successfully"
  });

});
