const express = require("express");
const router = express.Router();

const {
  createPoductTransfer, getProductsTransferDetails, updateProductTransfer, ProductTransfer, getAllProductsTransfer, deleteProductTransfer
} = require("../controllers/productTransfer");

router.route("/").get(getAllProductsTransfer).post(createPoductTransfer);
router.route("/:id").get(getProductsTransferDetails).delete(deleteProductTransfer);
router.route("/update").put(updateProductTransfer);
router.route("/transfer").post(ProductTransfer);


module.exports = router;
