const db = require("../db/db"); 

// 1. Sorgun: Az olanlar
const az_olan_sorgu = (req, res) => {
    const sql = `
        SELECT yakitlar.yakit_turu, araclar.arac_model, COUNT(kiralama.kiralama_id) as kiralama_sayisi
        FROM yakitlar 
        LEFT JOIN araclar ON yakitlar.yakit_id=araclar.yakit_id
        LEFT JOIN kiralama ON araclar.arac_id=kiralama.arac_id
        GROUP BY yakitlar.yakit_id, araclar.arac_id  
        ORDER BY kiralama_sayisi ASC LIMIT 20
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
        res.json(results);
    });
};

// 2. Sorgun: Gelir listesi
const gelir_listesi = (req, res) => {
    const sql = `
        SELECT araclar.arac_id, araclar.arac_model, 
        COALESCE(SUM(kiralama.kiralama_ucreti), 0) as toplam_gelir,
        COUNT(kiralama.kiralama_id) as kiralama_sayisi
        FROM araclar
        LEFT JOIN kiralama ON araclar.arac_id = kiralama.arac_id
        GROUP BY araclar.arac_id, araclar.arac_model
        ORDER BY araclar.arac_model ASC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
        res.json(results);
    });
};

// Fonksiyonları dışarı aktarıyoruz
module.exports = { az_olan_sorgu, gelir_listesi };