const express = require("express");
const router = express.Router();

const {
  getBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/brand");

router.route("/").get(getBrands).post(createBrand);
router.route("/:id").get(getBrand).delete(deleteBrand).put(updateBrand);

module.exports = router;
