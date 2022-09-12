const express = require("express");
const router = express.Router();

const {
  getEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  searchFilters,
  getEmployProductsCurrentDetails,
  designationSuggestion,
  magic,
  magicOffice,
  postEmployeeData

} = require("../controllers/employee");
router.post("/postEmployeeData", postEmployeeData)
router.route("/").get(getEmployees).post(createEmployee);
router.route("/search").post(searchFilters);
router.route("/designationSuggestions").post(designationSuggestion);
router.route("/currentProducts/:id").get(getEmployProductsCurrentDetails);
router.route("/:id").get(getEmployee).delete(deleteEmployee).put(updateEmployee);
router.route("/magic").post(magic)
router.route("/magicOffice").post(magicOffice)

module.exports = router;
