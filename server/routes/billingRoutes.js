const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

router.post('/', billingController.createBilling);
router.get('/:fileId', billingController.getBillingByFile);
router.put('/:id/pay', billingController.updatePayment);

module.exports = router;
