const express = require("express");
const router = express.Router();

const {
  getDepartments,
  createDepartment,
  getDepartment,
  updateDepartment,
  deleteDepartment,
  searchDepartment
} = require("../controllers/department");

router.route("/").get(getDepartments).post(createDepartment);
router.route("/:id").get(getDepartment).delete(deleteDepartment).put(updateDepartment);
router.route("/searchDepartment").post(searchDepartment)

module.exports = router;
