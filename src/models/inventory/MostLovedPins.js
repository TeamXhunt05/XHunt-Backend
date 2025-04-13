const mongoose = require('mongoose');

const {
  WALLET_STATUS,
  DEFAULT_WALLET_STATUS,
  DEFAULT_PAYMENT_STATUS_TYPE,
  PAYMENT_STATUS_TYPES
} = require("../../constant/constant");
const { Schema } = mongoose;



const mostLovedPinSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'users' },
  pin_id: { type: Schema.Types.ObjectId, ref: 'PinModel' },
  date: { type: Date, default: new Date() },



}, 
  {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
}
);
 mostLovedPinSchema.set("toJSON", { virtuals: true });
const MostLovedPin = mongoose.model('MostLovedPin', mostLovedPinSchema);

module.exports = MostLovedPin;
