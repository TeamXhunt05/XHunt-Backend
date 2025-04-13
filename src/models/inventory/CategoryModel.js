const { Schema } = require('mongoose');

const categorySchema = new Schema(
  {
    parent_category_id: {
      type: String,
      default: '',
    },
    store: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    is_special_category: {
      type: Boolean,
      default: false,
    },
    is_occasional_category: {
      type: Boolean,
      default: false,
    },
    offer_code: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: null,
    },
    is_published: {
      type: Boolean,
      default: false,
    },

  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

categorySchema.index({ title: 1 }, { name: "title", background: true });
categorySchema.set("autoIndex", true);

categorySchema.methods.toJSON = function () {
  return {
    id: this._id.toString(),
    title: this.title,
    parent_category_id: this.parent_category_id,
    description: this.description,
    icon: this.icon,
    store_id: this.store,
    city: this.city,
    is_special_category: this.is_special_category,
    is_occasional_category: this.is_occasional_category,
    offer_code: this.offer_code,
    order: this.order,
    is_published: this.is_published,
    created_at: this.created_at.toISOString(),
    updated_at: this.updated_at.toISOString(),
  };
};





const CategoryModel = model("CategoryModel", categorySchema);
module.exports = CategoryModel;
