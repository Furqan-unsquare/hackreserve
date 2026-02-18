const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
    transactions: [{
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        method: { type: String, default: 'Manual' },
        reference: { type: String }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    followUp: { type: String, enum: ['pending', 'sent', 'reminded'], default: 'pending' }
});

module.exports = mongoose.model('Billing', BillingSchema);
