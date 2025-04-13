const { Schema, model } = require("mongoose");

const tagSchema = new Schema(
  {
    store_id: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

tagSchema.index({ title: 1 }, { name: "title", background: true });
tagSchema.set("autoIndex", true);

tagSchema.methods.toJSON = function () {
  return {
    id: this._id.toString(),
    title: this.title,
    store_id: this.store_id,
    description: this.description,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

const TagModel = model("TagModel", tagSchema);
module.exports = TagModel;
