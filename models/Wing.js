const mongoose = require("mongoose");

const WingSchema = new mongoose.Schema({
    wingId: {
        type: Number,
    },
    name: {
        type: String,
        // required: true,
    },
    createdBy: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    modifiedBy: {
        type: String,
    },
    modifiedAt: {
        type: Date,
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },

});

module.exports = mongoose.model("Wing", WingSchema);
