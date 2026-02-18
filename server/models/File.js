const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }, // 'file' or 'url'
    url: { type: String },
    timestamp: { type: Date, default: Date.now },
    verification: {
        status: { type: String, enum: ['pending', 'verified', 'flagged', 'failed'], default: 'pending' },
        score: { type: Number },
        extractedData: { type: mongoose.Schema.Types.Mixed }, // Flexible JSON storage
        logs: [{
            timestamp: { type: Date, default: Date.now },
            message: { type: String }
        }],
        error: { type: String }
    }
});

const FollowUpSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    type: { type: String }
});

const FileSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    clientName: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, default: 'onboarded' },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'flagged', 'failed'], default: 'pending' },
    documents: [DocumentSchema],
    followUps: [FollowUpSchema],
    billingAmount: { type: Number, default: 0 },
    receivedAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
    dueDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', FileSchema);
