// routes/notaRemisionRoutes.js
const express = require('express');
const router = express.Router();
const { generarNotaDeRemision } = require('../controllers/remisionController');

router.post('/remision', generarNotaDeRemision);

module.exports = router;
