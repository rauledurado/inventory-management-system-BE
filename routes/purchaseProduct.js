const express = require("express");
const router = express.Router();

const {
  getAllPurchaseProducts,
  createPurchaseProduct,
  getPurchaseProduct,
  updatePurchaseProduct,
  deletePurchaseProduct,
  searchPurchaseProduct,
  getCreatedBySuggestion,
  getVendorsSuggestion,
  getallFeaturesSuggestion,
  getProductFeaturesSuggestion,
  qrBasedSearch,
  postData,
  getAssetsNameById

} = require("../controllers/purchaseProduct");
// router.route("/vendors").get(searchVendors);
router.post("/postData", postData)
router.post("/", createPurchaseProduct)
router.route("/:page").get(getAllPurchaseProducts);
router.route("/:id").get(getPurchaseProduct).put(updatePurchaseProduct);
router.route("/delete/:id").put(deletePurchaseProduct);
router.route("/createdBySuggestions").post(getCreatedBySuggestion);
router.route("/vendorsSuggestions").post(getVendorsSuggestion)
router.route("/searchFilters").post(searchPurchaseProduct);
router.route("/allFeaturesSuggestions").post(getallFeaturesSuggestion);
router.route("/allFeaturesSuggestions/:id").post(getProductFeaturesSuggestion);
router.route("/qrBasedSearch/:id").get(qrBasedSearch);
router.post("/assetName/:id", getAssetsNameById)


module.exports = router;
