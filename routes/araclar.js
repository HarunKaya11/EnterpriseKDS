const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/az_olan_sorgu', (req, res) => {
    const sorguAz = `
            SELECT yakitlar.yakit_turu, araclar.arac_model, COUNT(kiralama.kiralama_id) as kiralama_sayisi
            FROM yakitlar 
            LEFT JOIN araclar ON yakitlar.yakit_id=araclar.yakit_id
            LEFT JOIN kiralama ON araclar.arac_id=kiralama.arac_id
            GROUP BY yakitlar.yakit_id, araclar.arac_id  
            ORDER BY kiralama_sayisi ASC
            LIMIT 20
        `;

    db.query(sorguAz, (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).json({ error: 'Veritabanı hatası' });
        }
        res.json(results);
    });
});

router.get('/cok_olan_sorgu', (req, res) => {
    const sorguCok = `
            SELECT yakitlar.yakit_turu, araclar.arac_model, COUNT(kiralama.kiralama_id) as kiralama_sayisi
            FROM yakitlar 
            LEFT JOIN araclar ON yakitlar.yakit_id=araclar.yakit_id
            LEFT JOIN kiralama ON araclar.arac_id=kiralama.arac_id
            GROUP BY yakitlar.yakit_id, araclar.arac_id  
            ORDER BY kiralama_sayisi DESC
            LIMIT 20
        `;

    db.query(sorguCok, (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).json({ error: 'Veritabanı hatası' });
        }
        res.json(results);
    });
});

router.get('/gelir_listesi', (req, res) => {
    // Toplam Gelir'in yanında, aracın kaç kez kiralandığı bilgisini de alıyoruz.
    const sorguGelir = `
        SELECT 
            araclar.arac_id, 
            araclar.arac_model, 
            COALESCE(SUM(kiralama.kiralama_ucreti), 0) as toplam_gelir,
            COUNT(kiralama.kiralama_id) as kiralama_sayisi
        FROM araclar
        LEFT JOIN kiralama ON araclar.arac_id = kiralama.arac_id
        GROUP BY araclar.arac_id, araclar.arac_model
        ORDER BY araclar.arac_model ASC
    `;

    db.query(sorguGelir, (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).json({ error: 'Veritabanı hatası' });
        }
        res.json(results);
    });
});

module.exports = router;