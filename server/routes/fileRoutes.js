// server/routes/fileRoutes.js
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

router.get('/', fileController.getAllFiles);
router.post('/', fileController.createFile);
router.put('/:id', fileController.updateFile);
router.delete('/:id', fileController.deleteFile);
router.put('/:id/status', fileController.updateFileStatus);
router.post('/:id/follow-up', fileController.addFollowUp);
router.get('/client/:clientId', fileController.getClientFiles); // Alternative route
router.get('/:id/documents', fileController.getDocuments);
router.post('/:id/documents', fileController.addDocument);

module.exports = router;
