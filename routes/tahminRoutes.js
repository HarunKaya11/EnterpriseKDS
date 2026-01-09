const express = require('express');
const router = express.Router();
const tahminController = require('../controllers/tahminController');

router.get('/kiralama-verileri', tahminController.getKiralamaVerileri);
router.get('/bakim-masrafi', tahminController.getBakimMasrafi);
router.get('/kiralama-geliri', tahminController.getKiralamaGeliriTahmin);
router.get('/tahminlemeAraclar', tahminController.getTahminlemeAraclar);

module.exports = router;