const File = require('../models/File');
const Client = require('../models/Client');
const Billing = require('../models/Billing');
const mongoose = require('mongoose');
const kycService = require('../services/kycService');
const { uploadToS3 } = require('../services/uploadService');
const stringSimilarity = require('string-similarity');
const { generateInvoice } = require('../services/invoiceService');

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
            followUps: [],
            billingAmount: req.body.amount || 0,
            dueDate: req.body.dueDate || null,
            paymentStatus: 'pending'
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

        // Handle Billing Transitions
        if (status === 'billed') {
            file.billedAt = new Date();
            const { billingAmount, receivedAmount, paymentStatus } = req.body;
            if (billingAmount !== undefined) file.billingAmount = billingAmount;
            if (receivedAmount !== undefined) file.receivedAmount = receivedAmount;

            if (!paymentStatus) {
                // Auto-calculate status based on amounts
                const billed = file.billingAmount || 0;
                const received = file.receivedAmount || 0;

                if (billed > 0 && received >= billed) {
                    file.paymentStatus = 'paid';
                    file.status = 'completed';
                } else if (received > 0 && received < billed) {
                    file.paymentStatus = 'partial';
                } else {
                    file.paymentStatus = 'pending';
                }
            } else {
                file.paymentStatus = paymentStatus;
                // If explicitly set to paid, ensure completed
                if (paymentStatus === 'paid') {
                    file.status = 'completed';
                    // Optional: If paid but amounts don't match, maybe we should auto-correct? 
                    // For now, trust the manual override but ensure completed.
                }
            }
        } else if (req.body.paymentStatus) {
            // Support updating finance fields directly
            file.paymentStatus = req.body.paymentStatus;
            if (req.body.billingAmount !== undefined) file.billingAmount = req.body.billingAmount;
            if (req.body.receivedAmount !== undefined) {
                file.receivedAmount = req.body.receivedAmount;
                // Auto-complete if fully paid
                if (file.receivedAmount >= file.billingAmount && file.billingAmount > 0) {
                    file.paymentStatus = 'paid';
                    file.status = 'completed';
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
        const { type } = req.body; // 'sent' or 'reminded'

        const file = await File.findById(id);
        if (!file) return res.status(404).json({ error: 'File not found' });

        if (!['sent', 'reminded'].includes(type)) {
            return res.status(400).json({ error: 'Invalid follow-up type' });
        }

        const followUp = {
            timestamp: new Date(),
            type
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

const updateOverallStatus = async (fileId) => {
    const file = await File.findById(fileId);
    const docs = file.documents.filter(d => d.verification && d.verification.status === 'verified');

    if (docs.length < 2) {
        // file.verificationStatus uses default
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

const getInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findById(id);
        if (!file) return res.status(404).json({ error: 'File not found' });

        if (file.status !== 'billed' && file.status !== 'completed') {
            return res.status(400).json({ error: 'Invoice available only for billed files' });
        }

        // 🔥 Auto-create Billing Record if not exists
        const existingBilling = await Billing.findOne({ fileId: file._id });
        if (!existingBilling) {
            const newBilling = new Billing({
                clientId: file.clientId,
                fileId: file._id,
                totalAmount: file.billingAmount || 0,
                paidAmount: file.receivedAmount || 0,
                status: file.paymentStatus || 'pending'
            });
            await newBilling.save();
            console.log(`[AUTO-BILLING] Created billing record for File ${file._id}`);
        }

        generateInvoice(file, res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type } = req.body;

        const file = await File.findById(id);
        if (!file) return res.status(404).json({ error: 'File not found' });

        let s3Url = null;

        // 🔥 FIX: Handle various upload formats (File Buffer, Base64 String in Body, Base64 String in File)
        if (req.file) {
            // Check if buffer is actually a Base64 string (common in n8n/Postman raw uploads)
            const bufferString = req.file.buffer.toString('utf-8');
            if (bufferString.startsWith('data:') && bufferString.includes('base64,')) {
                // It's a Base64 string sent as a file
                s3Url = await uploadToS3(bufferString, name);
            } else {
                // It's a real binary file
                s3Url = await uploadToS3(
                    req.file.buffer,
                    req.file.originalname,
                    req.file.mimetype
                );
            }
        } else if (req.body.url && req.body.url.startsWith('data:')) {
            // Base64 in body.url
            s3Url = await uploadToS3(req.body.url, name);
        } else {
            return res.status(400).json({ error: 'No file provided' });
        }

        const newDoc = {
            name,
            type,
            url: s3Url,
            timestamp: new Date(),
            verification: {
                status: 'pending',
                logs: [{ message: 'Document uploaded to S3, waiting for processing...' }]
            }
        };

        // 🔥 OVERWRITE LOGIC: Replace existing document with same name
        const existingDocIndex = file.documents.findIndex(d => d.name === name);
        if (existingDocIndex !== -1) {
            // Preserve ID if needed, or just replace
            file.documents[existingDocIndex] = newDoc;
        } else {
            file.documents.push(newDoc);
        }

        // 🔥 Auto-update status to 'documentation' if it was 'onboarded' (since docs are now present)
        if (file.status === 'onboarded' || file.status === 'kyc') {
            file.status = 'documentation';
        }

        const savedFile = await file.save();
        const docWithId = savedFile.documents.find(d => d.name === name);

        // Verification & Auto-Advance Logic
        const client = await Client.findById(file.clientId);
        if (client && s3Url) {
            // Pass the document name as the expected type for validation
            const clientWithExpectedType = { ...client.toObject(), expectedType: name };

            kycService.verifyDocument(s3Url, clientWithExpectedType)
                .then(async (result) => {
                    const updatedFile = await File.findById(file._id);
                    const doc = updatedFile.documents.id(docWithId._id);

                    if (doc) {
                        doc.detectedType = result.detectedType || 'Unknown';
                        doc.verification = {
                            status: result.status,
                            score: result.score,
                            extractedData: result.extracted,
                            logs: result.logs,
                            error: result.error
                        };

                        await updatedFile.save();
                        await updateOverallStatus(file._id);

                        // 🔥 AUTO-ADVANCE LOGIC (Salaried Only)
                        if (updatedFile.category?.toLowerCase() === 'salaried') {
                            const required = REQUIRED_DOCUMENTS['salaried'];
                            const verifiedDocs = updatedFile.documents
                                .filter(d => d.verification.status === 'verified')
                                .map(d => d.name);

                            const allVerified = required.every(req => verifiedDocs.includes(req));

                            if (allVerified && updatedFile.status !== 'completed' && updatedFile.status !== 'billed') {
                                updatedFile.status = 'itr-filing';
                                await updatedFile.save();
                                console.log(`[AUTO-ADVANCE] File ${updatedFile._id} moved to ITR-Filing`);
                            }
                        }
                    }
                })
                .catch(console.error);
        }

        res.status(201).json(docWithId);

    } catch (err) {
        console.error('Add Document Error:', err);
        res.status(400).json({ error: err.message });
    }
};

const getMissingDocuments = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findById(id);
        if (!file) return res.status(404).json({ error: 'File not found' });

        const requiredDocNames = REQUIRED_DOCUMENTS[file.category?.toLowerCase()] || [];
        const uploadedDocNames = file.documents.map(d => d.name);
        const missing = requiredDocNames.filter(reqName => !uploadedDocNames.includes(reqName));

        res.json({
            category: file.category,
            required: requiredDocNames,
            uploaded: uploadedDocNames,
            missing: missing,
            isComplete: missing.length === 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
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

const getDashboardStats = async (req, res) => {
    try {
        const totalClients = await Client.countDocuments();
        const totalFiles = await File.countDocuments();

        const files = await File.find({});
        const recentFiles = await File.find().sort({ updatedAt: -1 }).limit(5);

        const stats = {
            totalClients,
            totalFiles,
            pendingBilling: files.filter(f => f.status === 'itr-filing').length,
            pendingDocuments: files.filter(f => f.status === 'onboarded').length,
            completedFilings: files.filter(f => f.status === 'billed').length,
            revenue: files.reduce((sum, f) => sum + (f.receivedAmount || 0), 0),
            totalDue: files.reduce((sum, f) => sum + ((f.billingAmount || 0) - (f.receivedAmount || 0)), 0),
            statusDistribution: {
                onboarded: files.filter(f => f.status === 'onboarded').length,
                documentation: files.filter(f => f.status === 'documentation' || f.status === 'kyc').length,
                'itr-filing': files.filter(f => f.status === 'itr-filing').length,
                billed: files.filter(f => f.status === 'billed').length,
                completed: files.filter(f => f.status === 'completed').length
            },
            recentActivity: recentFiles.map(f => ({
                t: f.status === 'completed' ? 'Filing Completed' : f.status === 'billed' ? 'Billed Client' : 'File Updated',
                d: f.clientName || 'Unknown Client',
                s: f.paymentStatus === 'paid' ? 'Success' : 'Pending',
                time: f.updatedAt
            }))
        };

        res.json(stats);
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
    verifyDocument,
    getDashboardStats,
    getMissingDocuments,
    getInvoice
};
