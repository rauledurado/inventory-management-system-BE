const express = require("express");
const router = express.Router();

const {
  getProductTypes,
  createProductType,
  getProductType,
  updateProductType,
  deleteProductType,
} = require("../controllers/productType");

router.route("/").get(getProductTypes).post(createProductType);
router
  .route("/:id")
  .get(getProductType)
  .delete(deleteProductType)
  .put(updateProductType);

module.exports = router;
