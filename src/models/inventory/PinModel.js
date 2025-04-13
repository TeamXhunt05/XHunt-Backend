const mongoose = require('mongoose');

const {
  PIN_TYPES,
  DEFAULT_PIN_TYPE,
  OFFER_TYPES,
  DEFAULT_OFFER_TYPES,
  DEFAULT_SCHEDULE_TYPES,
  SCHEDULE_TYPES,
  DISCOUNT_UNIT_TYPES,
  DEFAULT_DISCOUNT_UNIT_TYPES,
  SCHEDULE_DAYS,
  DEFAULT_PAYMENT_TYPE,
  PAYMENT_TYPES ,
  PIN_CATEGORY_TYPES,
  DEFAULT_PIN_CATEGORY_TYPES
} = require("../../constant/constant");
const { Schema } = mongoose;

const { ImagesSchema ,geoLocactionSchema} = require("../common_models");


const PinSchema = new Schema({
  store_id: { type: Schema.Types.ObjectId, ref: 'StoreModel' },
  categories: { type: String, enum:PIN_CATEGORY_TYPES, default: DEFAULT_PIN_CATEGORY_TYPES},
  type: { type: String, enum:PIN_TYPES, default: DEFAULT_PIN_TYPE },
  offer_type: { type: String, enum:OFFER_TYPES, default: DEFAULT_OFFER_TYPES},
  discount_unit: { type: String, enum:DISCOUNT_UNIT_TYPES, default:   DEFAULT_DISCOUNT_UNIT_TYPES,
  },

  title: { type: String, required: true },
  description: { type: String, default: '' },
  discount_amount: { type: Number, required: false , default: 0  },
  pin: { type: String, default: '' },
  min_transaction_value: { type: Number ,  default: 0 },
  max_discount_value: { type: Number  , default: 0},
  is_published: { type: Boolean, default: true },





  is_limited_available: { type: Boolean, default: false },
  schedule_type: { type: String, enum:SCHEDULE_TYPES, default:DEFAULT_SCHEDULE_TYPES },
  schedule_days: [{ type: String, enum: SCHEDULE_DAYS }],
  start_time: { type: Date },
  end_time: { type: Date },
  total_pin_count: { type: Number },
  latitude: { type: Number },
  longitude: { type: Number },
  location: {
    type: geoLocactionSchema,
    index: '2dsphere'
},
images: [ImagesSchema],
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  payment_type: { type: String, enum: PAYMENT_TYPES, default: DEFAULT_PAYMENT_TYPE},
  products: [{ type: Schema.Types.ObjectId, ref: 'ProductModel' }],
  meta_info: { type: String },
  is_approved_by_admin: { type: Boolean, default: false },
}, 
  {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
}
);

PinSchema.set("toJSON", { virtuals: true });
const PinModel = mongoose.model('PinModel', PinSchema);

module.exports = PinModel;
