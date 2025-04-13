const mongoose = require("mongoose");
const {
  LOCATION_TYPES,
  DEFAULT_LOCATION_TYPE,
} = require("../../constant/constant");
const { Schema } = mongoose;

const UserLocationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "UserLoginInfoModel",
      required: true,
    },
    is_default_location: { type: Boolean, default: false },
    offer_radius: { type: Number, default: 3 },
    location_type: {
      type: String,
      enum: LOCATION_TYPES,
      default: DEFAULT_LOCATION_TYPE,
      required: true,
    },
    other_location_title: { type: String, default: "" },
    latlong: { type: { type: String }, coordinates: [Number] },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    pin: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

UserLocationSchema.index({ created_at: 1 });

const UserLocationModel = mongoose.model(
  "UserLocationModel",
  UserLocationSchema
);

module.exports = UserLocationModel;
