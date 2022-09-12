const express = require("express");
const router = express.Router();

const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadImage,
} = require("../controllers/category");

router.route("/").get(getCategories).post(createCategory);
router
  .route("/:id")
  .get(getCategory)
  .delete(deleteCategory)
  .put(updateCategory);
// router.route("/:id/photo").put(uploadImage);
module.exports = router;
