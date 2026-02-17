const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    telegramId: { type: String },
    category: { type: String, enum: ['salaried', 'small business'], required: true },
    status: { type: String, default: 'onboarded' },
    details: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Client', ClientSchema);
