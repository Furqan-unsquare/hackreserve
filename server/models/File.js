const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }, // 'file' or 'url'
    url: { type: String },
    timestamp: { type: Date, default: Date.now }
});

const FollowUpSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    version: { type: Number, required: true }
});

const FileSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    clientName: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, default: 'onboarded' },
    documents: [DocumentSchema],
    followUps: [FollowUpSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', FileSchema);
