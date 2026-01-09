const db = require('../db/db');

// 1. Tahmin: Yıllık Kiralama Gün Sayısı
const getKiralamaVerileri = (req, res) => {
    const aracId = req.query.arac_id;
    const query = `
        SELECT YEAR(kiralama_tarihi) AS yil, SUM(kiralama_suresi) AS toplam_kiralanan_gun
        FROM kiralama WHERE arac_id = ?
        GROUP BY YEAR(kiralama_tarihi) HAVING yil BETWEEN 2021 AND 2026 ORDER BY yil ASC
    `;

    db.query(query, [aracId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const years = results.map(result => result.yil);
        let totalDays = results.map(result => result.toplam_kiralanan_gun);

        if (!totalDays || totalDays.length === 0) {
            return res.json({ error: 'Veri bulunamadı veya eksik.' });
        }

        totalDays = totalDays.map(cost => parseFloat(cost));
        const averagePrediction = totalDays.reduce((sum, val) => sum + val, 0) / totalDays.length;

        res.json({
            years,
            totalDays,
            averagePrediction: Math.round(averagePrediction)
        });
    });
};

// 2. Tahmin: Yıllık Ortalama Bakım Masrafı
const getBakimMasrafi = (req, res) => {
    const aracId = req.query.arac_id;
    const query = `
        SELECT YEAR(bakim_tarihi) AS yil, AVG(masraf) AS toplam_masraf
        FROM bakim WHERE arac_id = ?
        GROUP BY YEAR(bakim_tarihi) HAVING yil BETWEEN 2021 AND 2026 ORDER BY yil ASC
    `;

    db.query(query, [aracId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const years = results.map(result => result.yil);
        let totalCosts = results.map(result => result.toplam_masraf);

        if (!totalCosts || totalCosts.length === 0) {
            return res.json({ error: 'Veri bulunamadı veya eksik.' });
        }

        totalCosts = totalCosts.map(cost => parseFloat(cost));
        const averageCost = totalCosts.reduce((sum, val) => sum + val, 0) / totalCosts.length;

        res.json({
            years,
            totalCosts,
            averageCost: Math.round(averageCost)
        });
    });
};

// 3. Tahmin: Yıllık Ortalama Kiralama Geliri
const getKiralamaGeliriTahmin = (req, res) => {
    const aracId = req.query.arac_id;
    const query = `
        SELECT YEAR(kiralama_tarihi) AS yil, AVG(gunluk_ucret) AS ortalama
        FROM kiralama WHERE arac_id = ?
        GROUP BY YEAR(kiralama_tarihi) HAVING yil BETWEEN 2021 AND 2026 ORDER BY yil ASC
    `;

    db.query(query, [aracId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const years = results.map(result => result.yil);
        let totalincome = results.map(result => result.ortalama);

        if (!totalincome || totalincome.length === 0) {
            return res.json({ error: 'Veri bulunamadı veya eksik.' });
        }

        totalincome = totalincome.map(cost => parseFloat(cost));
        const averageincome = totalincome.reduce((sum, val) => sum + val, 0) / totalincome.length;

        res.json({
            years,
            totalincome,
            averageincome: Math.round(averageincome)
        });
    });
};

// Araçları listeleme sorgusu (Tahminleme ekranı için)
const getTahminlemeAraclar = (req, res) => {
    const sql = 'SELECT arac_id, arac_model, yakit_turu FROM yakitlar LEFT JOIN araclar ON yakitlar.yakit_id=araclar.yakit_id';
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
        res.json(results); 
    });
};


module.exports = { 
    getKiralamaVerileri, 
    getBakimMasrafi, 
    getKiralamaGeliriTahmin, 
    getTahminlemeAraclar 
};