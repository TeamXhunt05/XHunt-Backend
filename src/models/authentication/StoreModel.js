const mongoose = require("mongoose");
const { ImagesSchema ,geoLocactionSchema} = require("./common_models");

const StoreSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationModel",
      required: false,
      null: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "", required: false },
    images: [ImagesSchema],
    open_time: { type: Date, default: "", required: false },
    close_time: { type: Date, default: "", required: false },
    latitude: { type: Number },
    longitude: { type: Number },
    location: {
      type: geoLocactionSchema,
      index: '2dsphere'
  },
    address: { type: String, default: "", required: false },
    city: { type: String, default: "", required: false },
    state: { type: String, default: "", required: false },
    postal: { type: String, default: "", required: false },
    cuisine: { type: [String], default: [] },
    store_category: { type: [String], default: [] },
    
    visiting_days: { type: [String], default: [] },
    status: { type: Boolean, required: false ,  default :  true},
    is_approve: { type: Boolean, required: false ,  default :  false},
    domain: { type: String, required: false, default: ""},
    theme: { type: String, default: "", required: false },
    establish_date: { type: Date, required: false , default: ""},




  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

StoreSchema.index({ title: 1 });
StoreSchema.index({ created_at: 1 });

StoreSchema.set("toJSON", { virtuals: true });

StoreSchema.virtual("userObject", {
  ref: "users",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

StoreSchema.virtual("organizationObject", {
  ref: "OrganizationModel",
  localField: "organization",
  foreignField: "_id",
  justOne: true,
});

StoreSchema.methods.toJSON = function () {
  const store = this.toObject();
  delete store.user;
  delete store.organization;
  return store;
};

const StoreModel = mongoose.model("StoreModel", StoreSchema);

module.exports = StoreModel;
