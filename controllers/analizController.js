const db = require('../db/db');

// 1. Sorgu: Kiralanan toplam gün sayısını getir
const getTotalRentalDays = (req, res) => {
    const { start, end } = req.query;
    const query = `
        SELECT SUM(kiralama_suresi) AS totalRentalDays 
        FROM kiralama 
        WHERE kiralama_tarihi BETWEEN ? AND ?
    `;
    db.query(query, [start, end], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results[0]);
    });
};

// 2. Sorgu: Toplam kiralama gelirini getir
const getTotalRevenue = (req, res) => {
    const { start, end } = req.query;
    const query = `SELECT SUM(kiralama_ucreti) AS totalRevenue FROM kiralama WHERE kiralama_tarihi BETWEEN ? AND ?`;
    db.query(query, [start, end], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results[0]);
    });
};

// 3. Sorgu: Toplam bakım masrafını getir
const getTotalMaintenance = (req, res) => {
    const { start, end } = req.query;
    const query = `SELECT SUM(masraf) AS totalMaintenance FROM bakim WHERE bakim_tarihi BETWEEN ? AND ?`;
    db.query(query, [start, end], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results[0]);
    });
};

module.exports = { getTotalRentalDays, getTotalRevenue, getTotalMaintenance };