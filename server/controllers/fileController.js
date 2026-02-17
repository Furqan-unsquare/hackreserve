const File = require('../models/File');
const Client = require('../models/Client');
const mongoose = require('mongoose');
const kycService = require('../services/kycService');
const stringSimilarity = require('string-similarity');

const REQUIRED_DOCUMENTS = {
    'salaried': [
        'PAN Card',
        'Aadhaar Card',
        'Form 16',
        'Passbook'
    ],
    'small business': [
        'Bank Statement (Annual)',
        'TDS Quarterly',
        'TDS Monthly Challan',
        'GST Return (Monthly/Annually)',
        'Annual Income Statement',
        'P&L Balance Sheet'
    ]
};

const getAllFiles = async (req, res) => {
    try {
        const files = await File.find().sort({ createdAt: -1 });
        res.json(files.map(f => ({ ...f._doc, id: f._id })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createFile = async (req, res) => {
    try {
        const { clientId, name } = req.body;
        const client = await Client.findById(clientId);

        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        const newFile = new File({
            clientId: client._id,
            clientName: client.name,
            name,
            category: client.category,
            status: 'onboarded',
            documents: [],
            followUps: []
        });

        await newFile.save();
        res.status(201).json({ ...newFile._doc, id: newFile._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const updateFileStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const file = await File.findById(id);
        if (!file) return res.status(404).json({ error: 'File not found' });

        // Strict Requirement Check for ITR Filing
        if (status === 'itr-filing') {
            const requiredDocNames = REQUIRED_DOCUMENTS[file.category?.toLowerCase()];
            if (requiredDocNames) {
                const uploadedDocNames = file.documents.map(d => d.name);
                const missing = requiredDocNames.filter(reqName => !uploadedDocNames.includes(reqName));

                if (missing.length > 0) {
                    return res.status(400).json({
                        error: 'Incomplete Documents',
                        missing,
                        message: `Cannot move to ITR Filing. Missing: ${missing.join(', ')}`
                    });
                }
            }
        }

        file.status = status;
        await file.save();
        res.json({ ...file._doc, id: file._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findByIdAndDelete(id);
        if (!file) return res.status(404).json({ error: 'File not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findByIdAndUpdate(id, req.body, { new: true });
        if (!file) return res.status(404).json({ error: 'File not found' });
        res.json({ ...file._doc, id: file._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const addFollowUp = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findById(id);
        if (!file) return res.status(404).json({ error: 'File not found' });

        const followUp = {
            timestamp: new Date(),
            version: (file.followUps?.length || 0) + 1
        };

        file.followUps.push(followUp);
        await file.save();
        res.json({ ...file._doc, id: file._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getDocuments = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findById(id);
        if (!file) return res.status(404).json({ error: 'File not found' });
        res.json(file.documents || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Checks overall verification by comparing multiple documents
 */
const updateOverallStatus = async (fileId) => {
    const file = await File.findById(fileId);
    const docs = file.documents.filter(d => d.verification && d.verification.status === 'verified');

    if (docs.length < 2) {
        file.verificationStatus = docs.length === 1 ? 'pending' : 'pending';
        return await file.save();
    }

    // Compare first two verified documents (e.g. PAN and Aadhaar)
    const [d1, d2] = docs;
    const name1 = kycService.normalizeText(d1.verification.extractedData.name);
    const name2 = kycService.normalizeText(d2.verification.extractedData.name);
    const dob1 = d1.verification.extractedData.dob;
    const dob2 = d2.verification.extractedData.dob;

    const nameSimilarity = stringSimilarity.compareTwoStrings(name1, name2);
    const dobMatch = dob1 === dob2 && dob1 !== null;

    if (nameSimilarity > 0.85 && dobMatch) {
        file.verificationStatus = 'verified';
    } else {
        file.verificationStatus = 'flagged';
    }

    await file.save();
};

const addDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, url } = req.body;
        const file = await File.findById(id);
        if (!file) return res.status(404).json({ error: 'File not found' });

        const newDoc = {
            name,
            type,
            url,
            timestamp: new Date(),
            verification: { status: 'pending', logs: [{ message: 'Document added, waiting for processing...' }] }
        };

        file.documents.push(newDoc);
        const savedFile = await file.save();
        const docWithId = savedFile.documents[savedFile.documents.length - 1];

        const lowerName = name.toLowerCase();
        if ((lowerName.includes('pan') || lowerName.includes('aadhar')) && url && url.startsWith('data:image')) {
            const client = await Client.findById(file.clientId);
            if (client) {
                // Background processing
                kycService.verifyDocument(url, client).then(async (result) => {
                    const updatedFile = await File.findById(file._id);
                    const doc = updatedFile.documents.id(docWithId._id);
                    if (doc) {
                        doc.verification = {
                            status: result.status,
                            score: result.score,
                            extractedData: result.extracted,
                            logs: result.logs,
                            error: result.error
                        };
                        await updatedFile.save();
                        await updateOverallStatus(file._id);
                    }
                }).catch(console.error);
            }
        }

        res.status(201).json(docWithId);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getClientFiles = async (req, res) => {
    try {
        const { clientId } = req.params;
        const files = await File.find({ clientId: new mongoose.Types.ObjectId(clientId) }).sort({ createdAt: -1 });
        res.json(files.map(f => ({ ...f._doc, id: f._id })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const verifyDocument = async (req, res) => {
    try {
        const { id, docId } = req.params;
        const file = await File.findById(id);
        if (!file) return res.status(404).json({ error: 'File not found' });

        const doc = file.documents.id(docId);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const client = await Client.findById(file.clientId);
        if (!client) return res.status(404).json({ error: 'Client not found' });

        if (!doc.url || !doc.url.startsWith('data:image')) {
            return res.status(400).json({ error: 'Document must be a local image for OCR' });
        }

        doc.verification.status = 'pending';
        doc.verification.logs = [{ message: 'Manual verification triggered...' }];
        await file.save();

        const result = await kycService.verifyDocument(doc.url, client);

        doc.verification = {
            status: result.status,
            score: result.score,
            extractedData: result.extracted,
            logs: result.logs,
            error: result.error
        };

        await file.save();
        await updateOverallStatus(file._id);
        res.json(doc.verification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllFiles,
    createFile,
    updateFileStatus,
    deleteFile,
    updateFile,
    addFollowUp,
    getDocuments,
    addDocument,
    getClientFiles,
    verifyDocument
};
