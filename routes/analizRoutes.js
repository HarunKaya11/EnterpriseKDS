const express = require('express');
const router = express.Router();
const analizController = require('../controllers/analizController');

// URL'leri Controller'daki fonksiyonlara bağlıyoruz
router.get('/total-rental-days', analizController.getTotalRentalDays);
router.get('/total-revenue', analizController.getTotalRevenue);
router.get('/total-maintenance', analizController.getTotalMaintenance);

module.exports = router;