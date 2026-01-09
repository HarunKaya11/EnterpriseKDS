const express = require('express');
const router = express.Router();
const bakimController = require('../controllers/bakimController');

// URL'leri Controller'daki fonksiyonlara bağlıyoruz
router.get('/az-bakim-cok-masraf', bakimController.azBakimCokMasraf);
router.get('/cok-bakim-az-masraf', bakimController.cokBakimAzMasraf);
router.get('/masrafli-arac', bakimController.masrafliArac);
router.get('/bakim-sayisi', bakimController.bakimSayisi);

module.exports = router;