const mongoose = require("mongoose");
const { Schema } = mongoose;

const storeReviewsSchema = new Schema({
 
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "storemodels",
    required: true,
  }, 
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  rating_number: { type: Number, required: true },
  rating_texts: { type: String, required: true },
});

storeReviewsSchema.methods.toJSON = function () {
  return {
    id: this._id.toString(),
    store_id: this.store_id,
    user_id: this.user_id,
    rating_number: this.rating_number,
    rating_text: this.rating_texts,
  };
};

const StoreReviewsModel = mongoose.model("StoreReviewModel", storeReviewsSchema);

module.exports = StoreReviewsModel;
