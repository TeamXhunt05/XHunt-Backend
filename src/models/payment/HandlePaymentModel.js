const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const {
  CURRENCY_TYPES,
    DEFAULT_CURRENCY_TYPE,
    PAYMENT_STATUS_TYPES ,
    DEFAULT_ORDER_STATUS_TYPE ,
    DEFAULT_PAYMENT_STATUS_TYPE
} = require("../../constant/constant");

const HandlePaymentSchema = new Schema({
  amount: { type: String, default: null },
  currency: { type: String, default: DEFAULT_CURRENCY_TYPE },
  rezorpay_error_code: { type: String, default: null },
  rezorpay_error_message: { type: String, default: null },
  rezorpay_external_wallet: { type: String, default: null },
  rezorpay_payment_id: { type: String, default: null },
  rezorpay_signature: { type: String, default: null },
  rezorpay_order_id: { type: String, default: null },
  order_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "ordermodels",
    default: null
  }, 
  order_number: { type: String, default: null } ,
  status: { type: String, enum: PAYMENT_STATUS_TYPES, default: DEFAULT_PAYMENT_STATUS_TYPE, },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const HandlePaymentModel =  mongoose.model('Payment', HandlePaymentSchema);
module.exports = HandlePaymentModel;
