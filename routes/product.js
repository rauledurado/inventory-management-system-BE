const express = require("express");
const router = express.Router();

const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getCreatedBySuggestion,
  searchProducts
} = require("../controllers/product");

router.route("/").get(getProducts).post(createProduct);
router.route("/:id").get(getProduct).delete(deleteProduct).put(updateProduct);
router.route("/createdBySuggestions").post(getCreatedBySuggestion);
router.route("/searchProducts").post(searchProducts);


module.exports = router;
