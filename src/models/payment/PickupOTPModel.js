const mongoose = require('mongoose');

const pickupOTPModelSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ordermodels",
    required: true,
  },
  otp: { type: Number, required: true },
  expiry: { type: Date, required: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});



pickupOTPModelSchema.index({ otp: 1 });

const PickupOTPModel = mongoose.model('PickupOTPModel', pickupOTPModelSchema);

module.exports = PickupOTPModel;
