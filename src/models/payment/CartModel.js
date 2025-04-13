const mongoose = require("mongoose");
const { Schema } = mongoose;

const storeReviewsSchema = new Schema({
 
  pin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "pinmodels",
    required: true,
  }, 
     user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "productmodels",
    required: true,
  }, 
  quantity: { type: Number,  },
});


const StoreReviewsModel = mongoose.model("CartModel", storeReviewsSchema);

module.exports = StoreReviewsModel;
