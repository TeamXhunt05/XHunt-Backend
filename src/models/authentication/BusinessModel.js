const mongoose = require("mongoose");
const { ImagesSchema ,geoLocactionSchema} = require("./common_models");

const BusinessSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    store_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "storemodels",
    },

  is_approve: { type: Boolean, required: false ,  default :  false},
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);



const BusinessModel = mongoose.model("BusinessModel", BusinessSchema);

module.exports = BusinessModel;
