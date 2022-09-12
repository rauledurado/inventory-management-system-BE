const express = require("express");
const router = express.Router();

const {
    getAllWings, getDepartmentWings, createWing, updateWing, deleteWing,wingsSuggestion
} = require("../controllers/wing");

router.route("/").get(getAllWings).post(createWing);
router.route("/wingsSuggestions").post(wingsSuggestion);
router.route("/:id").delete(deleteWing).put(updateWing).get(getDepartmentWings);


module.exports = router;
