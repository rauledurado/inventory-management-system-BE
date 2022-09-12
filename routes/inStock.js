const express = require("express");
const router = express.Router();

const {
  getAllInStock,
  createInStock,
  getInStock,
  updateInStock,
  deleteInStock,
} = require("../controllers/inStock");

router.route("/").get(getAllInStock).post(createInStock);
router.route("/:id").get(getInStock).delete(deleteInStock).put(updateInStock);

module.exports = router;
