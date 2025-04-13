const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");


const notificationSchema = new Schema(
  {
     for_notification: {
      type: String,
      required: false,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    message: {
      type: String,
      default: "",
    },
    notification_type: {
      type: String,
      default: "",
    },

    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);



const NotificationModel = model("NotificationModel", notificationSchema);
module.exports = NotificationModel;
