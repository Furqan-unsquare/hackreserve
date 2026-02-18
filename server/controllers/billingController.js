const Billing = require('../models/Billing');
const File = require('../models/File');

// Create or Get Billing Record
const createBilling = async (req, res) => {
    try {
        const { clientId, fileId, totalAmount } = req.body;

        let billing = await Billing.findOne({ fileId });
        if (billing) {
            return res.status(400).json({ error: 'Billing record already exists for this file' });
        }

        billing = new Billing({
            clientId,
            fileId,
            totalAmount,
            paidAmount: 0,
            status: 'pending'
        });

        await billing.save();

        // Update File Status to 'billed'
        await File.findByIdAndUpdate(fileId, {
            status: 'billed',
            billingAmount: totalAmount,
            receivedAmount: 0,
            paymentStatus: 'pending'
        });

        res.status(201).json(billing);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Billing by File ID
const getBillingByFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const billing = await Billing.findOne({ fileId }).populate('clientId', 'name email');
        if (!billing) return res.status(404).json({ error: 'Billing record not found' });
        res.json(billing);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Payment (Add Transaction)
const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, method, reference } = req.body;

        const billing = await Billing.findById(id);
        if (!billing) return res.status(404).json({ error: 'Billing record not found' });

        const newPaidAmount = billing.paidAmount + Number(amount);

        if (newPaidAmount > billing.totalAmount) {
            return res.status(400).json({ error: 'Payment exceeds total amount' });
        }

        billing.paidAmount = newPaidAmount;
        billing.transactions.push({ amount, method, reference });
        billing.updatedAt = new Date();

        // Determine Status
        if (billing.paidAmount >= billing.totalAmount) {
            billing.status = 'paid';
        } else if (billing.paidAmount > 0) {
            billing.status = 'partial';
        } else {
            billing.status = 'pending';
        }

        await billing.save();

        // Sync with File Model
        const fileUpdate = {
            receivedAmount: billing.paidAmount,
            paymentStatus: billing.status
        };

        if (billing.status === 'paid') {
            fileUpdate.status = 'completed';
        }

        await File.findByIdAndUpdate(billing.fileId, fileUpdate);

        res.json(billing);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createBilling,
    getBillingByFile,
    updatePayment
};
