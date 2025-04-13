const mongoose = require('mongoose');

const {
    CURRENCY_TYPES,
      DEFAULT_CURRENCY_TYPE,
      REFUND_STATUS_TYPES ,
      DEFAULT_REFUND_STATUS_TYPE,
      PRODUCT_ORDER_STATUS_TYPES ,
      DEFAULT_PRODUCT_ORDER_STATUS_TYPE
  } = require("../../constant/constant");
  

const EmbeddedProductSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "productmodels",
        required: true,
      }, 
    status: { type: String, enum: PRODUCT_ORDER_STATUS_TYPES, default: DEFAULT_PRODUCT_ORDER_STATUS_TYPE},
    quantity: { type: Number, required: true }
    
} ,
{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const ReturnSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    pin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pinmodels",
        required: true,
      }, 
    refund_id: { type: String },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ordermodels",
        required: true,
      },
    products: { type: [EmbeddedProductSchema], default: [] },
    total_amount: { type: Number, default: null },
    refundable_amount: { type: Number, default: null },
    discounted_amount: { type: Number, default: null },
    currency: { type: String, enum: CURRENCY_TYPES, default: DEFAULT_CURRENCY_TYPE },
    status: { type: String, enum: REFUND_STATUS_TYPES, default: DEFAULT_REFUND_STATUS_TYPE, required: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});


const ReturnModel = mongoose.model('ReturnModel', ReturnSchema);

module.exports = ReturnModel;
