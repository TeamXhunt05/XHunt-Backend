const mongoose = require("mongoose");
const { Schema } = mongoose;

const ratingSchema = new Schema({
  rating_text: { type: String, required: true },
});

ratingSchema.methods.toJSON = function () {
  return {
    id: this._id.toString(),
    rating_text: this.rating_text,
  };
};

const RatingModel = mongoose.model("RatingModel", ratingSchema);

module.exports = RatingModel;
