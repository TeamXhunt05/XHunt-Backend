const  { Schema } = require('mongoose');
const  mongoose = require('mongoose');



const {
  CURRENCY_TYPES,
    DEFAULT_CURRENCY_TYPE,
    PAYMENT_STATUS_TYPES ,
    DEFAULT_PAYMENT_STATUS_TYPE ,
    DEFAULT_ORDER_STATUS_TYPE ,
    ORDER_STATUS_TYPES
} = require("../../constant/constant");
const { embeddedProductSchema } = require('../common_models');

const orderSchema = new Schema({
  cart_id:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cartmodels",
    // required: true,
  }, 
  store_id:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "storemodels",
    required: true,
  }, 
  user_id:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    // required: true,
  },
  reference_id:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    // required: true,
  }, 
  max_discount_value: { type: Number, default: null },
  min_transaction_value: { type: Number, default: null },
  discount_unit: { type: String, default: null },
  discount: { type: Number, default: null },
  is_storebilling: { type: Boolean, default: false },
  pin_id:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "pinmodels",
    required: true,
  }, 
  products:  { type: [ embeddedProductSchema], default: [] },
  total_amount: { type: Number, default: null },
  payable_amount: { type: Number, default: null },
  discounted_amount: { type: Number, default: null },
  extra_added_amount: [
    {
      _id: false,
      title: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  currency: { type: String, enum:CURRENCY_TYPES, default: DEFAULT_CURRENCY_TYPE },
  payment_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "payments",
    // required: true,
  }, 
  status: { type: String, enum: ORDER_STATUS_TYPES, default: DEFAULT_ORDER_STATUS_TYPE, required: true },
  payment_status: { type: String, enum: PAYMENT_STATUS_TYPES, default: DEFAULT_PAYMENT_STATUS_TYPE, required: true },
  order_id: { type: String,  },
  order_type: { type: String,  },

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

const OrderModel = mongoose.model('OrderModel', orderSchema);

module.exports = OrderModel;


