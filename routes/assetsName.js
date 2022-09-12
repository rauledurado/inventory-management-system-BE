const express = require("express");
const router = express.Router();

const {
    getAllAssetsName, createAssetsName,updateAssetsName,deleteAssetsName
} = require("../controllers/assetsName");

router.route("/").get(getAllAssetsName).post(createAssetsName);
router.route("/:id").delete(deleteAssetsName).put(updateAssetsName);



module.exports = router;
