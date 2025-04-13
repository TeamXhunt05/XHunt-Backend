const mongoose = require('mongoose');

const { Schema } = mongoose;

const {ImagesSchema} = require('../common_models'); 
const {
  CURRENCY_TYPES,
  DEFAULT_CURRENCY_TYPE,
  ITEM_UNITS,
  DEFAULT_OFFER_TYPES,
} = require("../../constant/constant");

const ProductSchema = new Schema({
  category: [{ type: Schema.Types.ObjectId, ref: 'CategoryModel'  , default: []} ,],
  store_id: { type: Schema.Types.ObjectId, ref: 'StoreModel' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  tags: [{ type: Schema.Types.ObjectId, ref: 'TagModel', default: [] }],
  price: { type: Number, required: true },
  number_of_pieces: { type: Number, required: true },
  discount_amount: { type: Number, required: true },
  currency: {
    type: String,
    enum: CURRENCY_TYPES,
    default: DEFAULT_CURRENCY_TYPE,
  },
  available_from: { type: Date },
  item_unit: {
    type: String,
    enum: ITEM_UNITS,
    default: DEFAULT_OFFER_TYPES,
  },
  available_to: { type: Date },
  images: [ImagesSchema],
  is_limited_available: { type: Boolean, default: true },
  is_published: { type: Boolean, default: true },
  total_available_items: { type: Number, default: null },

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

ProductSchema.index({ title: 'text', tags: 'text', created_at: 1 });

const ProductModel = mongoose.model('ProductModel', ProductSchema);

module.exports = ProductModel;
