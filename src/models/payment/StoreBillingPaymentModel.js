const mongoose = require('mongoose');

const storeBillingPaymentSchema = new mongoose.Schema({
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
  amount: { type: String, required: true },
  reference_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    // required: true,
  }, 
  transaction_status: { type: String },
  max_discount_value: { type: Number },
  min_transaction_value: { type: Number },
  discount_amount: { type: Number },
  discount_unit: { type: String },
  discount: { type: Number },
}, {
  timestamps: true,

});

storeBillingPaymentSchema.index({ pin_id: 1 });
storeBillingPaymentSchema.index({ user_id: 1 });

const StoreBillingPaymentModel = mongoose.model('StoreBillingPayment', storeBillingPaymentSchema);

module.exports = StoreBillingPaymentModel;
