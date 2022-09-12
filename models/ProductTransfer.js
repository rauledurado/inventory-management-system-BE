const mongoose = require("mongoose");

ProductTransferSchema = new mongoose.Schema({
  quantity: {
    type: String,
  },
  status: {
    type: String,
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
  uuid: {
    type: String,
  },
  modifiedAt: {
    type: Date,
  },
  transferedTo: {
    type: String,
  },

  // transferedFrom: {
  //   type: String,
  // },
  transferedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  employId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  ItemId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseProduct" },
});

module.exports = mongoose.model("ProductTransfer", ProductTransferSchema);
