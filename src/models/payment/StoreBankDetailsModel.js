const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const { BANK_ACCOUNT_TYPE } = require("../../constant/constant");

const StoreBankDetailsSchema = new Schema({
  store_id:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "storemodels",
    required: true,
  }, 
  bank_name: { type: String, required: true },
  bank_barnchname: { type: String, required: true },
  bank_address: { type: String, required: true },
  account_holder_name: { type: String, required: true },
  account_number: { type: String, required: true },
  account_type: {
    type: String,
    enum: BANK_ACCOUNT_TYPE,
    required: true
  },
  ifsc_code: { type: String, required: true },
  cheque_pic: { type: String, required: true },
}, {
  timestamps: true,
});

const StoreBankDetailsModel =  mongoose.model('StoreBankDetailsModel', StoreBankDetailsSchema);



module.exports = StoreBankDetailsModel
