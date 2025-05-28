// routes/remisionRoutes.js
const express = require('express');
const router = express.Router();
const remisionController = require('../controllers/remisionController');

// POST /api/remision
router.post('/', remisionController.generarNotaDeRemision);

module.exports = router;