const express = require("express");
const router = express.Router();

const {
  getBootcamps,
  createBootcamp,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
} = require("../controllers/bootcamps");

router.route("/").get(getBootcamps).post(createBootcamp);
router
  .route("/:id")
  .get(getBootcamp)
  .delete(deleteBootcamp)
  .put(updateBootcamp);

module.exports = router;
