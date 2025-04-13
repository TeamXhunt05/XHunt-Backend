const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    user_id: { type: Schema.Types.ObjectId },
    payment_status: { type: String, default: "PENDING" }, // PENDING, SUCCESS, FAILED
    amount: { type: Number, },
    currency: { type: String }, 
    receipt_url: { type: String }, 
    payment_intent_id: { type: String }, 
    client_secret: { type: String }, 

    email: { type: String }, 
    payment_method_details: { type: String },
},{
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});


schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('stripe_payments', schema);
