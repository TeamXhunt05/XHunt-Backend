const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "UserLoginInfoModel",
      required: true,
    },
    name: { type: String, required: true },
    profile_summary: { type: String, default: "" },
    profile_image: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

UserProfileSchema.index({ name: 1 });
UserProfileSchema.index({ created_at: 1 });

const UserProfileModel = mongoose.model("UserProfileModel", UserProfileSchema);

module.exports = UserProfileModel;
