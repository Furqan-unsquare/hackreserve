// server/controllers/clientController.js
const Client = require('../models/Client');
const File = require('../models/File');
const mongoose = require('mongoose');

const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 });
        res.json(clients.map(c => ({ ...c._doc, id: c._id })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getClientFiles = async (req, res) => {
    try {
        const { id } = req.params;
        // Ensure id is valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid client ID' });
        }
        const files = await File.find({ clientId: new mongoose.Types.ObjectId(id) }).sort({ createdAt: -1 });
        res.json(files.map(f => ({ ...f._doc, id: f._id })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createClient = async (req, res) => {
    try {
        const newClient = new Client(req.body);
        await newClient.save();
        res.status(201).json({ ...newClient._doc, id: newClient._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findByIdAndUpdate(id, req.body, { new: true });
        if (!client) return res.status(404).json({ error: 'Client not found' });
        res.json({ ...client._doc, id: client._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findByIdAndDelete(id);
        if (!client) return res.status(404).json({ error: 'Client not found' });

        // Delete associated files
        await File.deleteMany({ clientId: id });

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllClients, createClient, updateClient, deleteClient, getClientFiles };
