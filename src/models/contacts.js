const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {  type: String },
    email: { type: String },
    message: { type: String },

}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});


schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('contact_us', schema);
