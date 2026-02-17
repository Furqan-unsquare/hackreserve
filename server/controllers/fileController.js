// server/controllers/fileController.js
const File = require('../models/File');
const Client = require('../models/Client');
const mongoose = require('mongoose');

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
        const file = await File.findByIdAndUpdate(id, { status }, { new: true });
        if (!file) return res.status(404).json({ error: 'File not found' });
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
            timestamp: new Date()
        };

        file.documents.push(newDoc);
        await file.save();
        res.status(201).json(newDoc);
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

module.exports = {
    getAllFiles,
    createFile,
    updateFileStatus,
    deleteFile,
    updateFile,
    addFollowUp,
    getDocuments,
    addDocument,
    getClientFiles
};
