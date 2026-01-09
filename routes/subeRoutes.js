const express = require('express');
const router = express.Router();
const subeController = require('../controllers/subeController');

// URL'leri Controller'daki fonksiyonlara bağlıyoruz
router.get('/kiralanan-gun', subeController.getKiralananGun);
router.get('/kiralama-geliri', subeController.getKiralamaGeliri);

module.exports = router;