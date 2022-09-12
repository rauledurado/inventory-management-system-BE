const mongoose = require("mongoose");

const AssetsNameSchema = new mongoose.Schema({
    
    name: {
        type: String,
       
    },
    quantity: {
        type: Number,
        default: 0
       
    },
    purchasedItemsId: [{ type: mongoose.Schema.Types.ObjectId, ref: "PurchaseProduct" }],
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }

});

module.exports = mongoose.model("AssetsName", AssetsNameSchema);
