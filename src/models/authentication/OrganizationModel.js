const mongoose = require("mongoose");
const { ImagesSchema } = require("./common_models");
const { Schema } = mongoose;

const OrganizationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "UserLoginInfoModel",
      required: true,
    },
    title: { type: String, required: true },
    intro: { type: String, default: "" },
    domain: { type: String },
    latlong: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    theme: { type: String, default: "" },
    logo: { type: String },
    images: [ImagesSchema],
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    pin: { type: String, default: "" },
    establish_date: { type: Date },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

OrganizationSchema.index({ title: 1 });
OrganizationSchema.index({ created_at: 1 });

const OrganizationModel = mongoose.model(
  "OrganizationModel",
  OrganizationSchema
);

module.exports = OrganizationModel;
