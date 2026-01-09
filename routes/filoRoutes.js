const express = require('express');
const router = express.Router();
const filoController = require('../controllers/filoController'); // Yukarıdaki dosyayı çağırdık

// Adresleri fonksiyonlara bağlıyoruz
router.get('/az_olan_sorgu', filoController.az_olan_sorgu);
router.get('/gelir_listesi', filoController.gelir_listesi);

module.exports = router;