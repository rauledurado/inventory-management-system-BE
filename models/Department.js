const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  departmentId: {
    type: Number,
  },
  name: {
    type: String,
    // required: true,
    // unique: true,
  },
  createdBy: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedBy: {
    type: String,
  },
  modifiedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Department", DepartmentSchema);
