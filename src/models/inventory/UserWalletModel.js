const mongoose = require('mongoose');

const {
  WALLET_STATUS,
  DEFAULT_WALLET_STATUS,
  DEFAULT_PAYMENT_STATUS_TYPE,
  PAYMENT_STATUS_TYPES
} = require("../../constant/constant");
const { Schema } = mongoose;



const userWalletSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'users' },
  pin_id: { type: Schema.Types.ObjectId, ref: 'PinModel' },
  coupon_code: { type: String, default: '' },
  is_public: { type: Boolean, default: true },
  status: { type: String,enum : WALLET_STATUS, default: DEFAULT_WALLET_STATUS },
  payment_status: { type: String,enum : PAYMENT_STATUS_TYPES , default: DEFAULT_PAYMENT_STATUS_TYPE },


}, 
  {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
}
);
 userWalletSchema.set("toJSON", { virtuals: true });
const UserWalletModel = mongoose.model('UserWalletModel', userWalletSchema);

module.exports = UserWalletModel;
