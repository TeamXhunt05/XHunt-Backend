const mongoose = require("mongoose");
const { PRODUCT_ORDER_STATUS_TYPES  ,DEFAULT_PRODUCT_ORDER_STATUS_TYPE} = require("../constant/constant");
const { Schema } = mongoose;

const languageSchema = new Schema({
  title: {
    type: String,
    default: "English",
  },
  code: {
    type: String,
    default: "en",
  },
});
const ImagesSchema = new Schema({
  title: {
    type: String,
    default: "",
  },
  url: {
    type: String,
    required: false,
    default: "",
  },
});


const geoLocactionSchema = new Schema({
  type: {
    type: String,
    default: 'Point'
  },
  coordinates: {
    type: [Number]
  }
});  



const embeddedProductSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "productmodels",
    required: true,
  }, 
  status: {
    type: String,
    enum: PRODUCT_ORDER_STATUS_TYPES, // Replace with your actual status options
    default: DEFAULT_PRODUCT_ORDER_STATUS_TYPE, // Replace with your default status
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  
}
,{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = { languageSchema, ImagesSchema,geoLocactionSchema ,embeddedProductSchema };
