const db = require('../db/db');

// 1. Çok Bakım - Az Masraf
const getTopMaintenanceCars = (req, res) => {
    const query = `
        SELECT araclar.arac_model, yakitlar.yakit_turu, COUNT(bakim.bakim_id) AS toplam_bakim_sayisi,
               ROUND(AVG(bakim.masraf)) AS ortalama_masraf
        FROM bakim 
        LEFT JOIN araclar ON araclar.arac_id = bakim.arac_id
        LEFT JOIN yakitlar ON yakitlar.yakit_id = araclar.yakit_id
        GROUP BY araclar.arac_id, yakitlar.yakit_turu  
        ORDER BY toplam_bakim_sayisi DESC, ortalama_masraf ASC LIMIT 20;
    `;
    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
        res.json(result);
    });
};

// 2. En Çok Kiralanan 20 Araç
const getTopRentedCars = (req, res) => {
    const query = `
        SELECT yakitlar.yakit_turu, araclar.arac_model, COUNT(kiralama.kiralama_id) AS kiralama_sayisi
        FROM yakitlar LEFT JOIN araclar ON yakitlar.yakit_id = araclar.yakit_id
        LEFT JOIN kiralama ON araclar.arac_id = kiralama.arac_id
        GROUP BY yakitlar.yakit_id, araclar.arac_id ORDER BY kiralama_sayisi DESC LIMIT 20;
    `;
    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
        res.json(result);
    });
};

const getCommonCars = (req, res) => {
    const rentedCarsQuery = `
        SELECT araclar.arac_id, araclar.arac_model, yakitlar.yakit_turu 
        FROM yakitlar 
        LEFT JOIN araclar ON yakitlar.yakit_id = araclar.yakit_id
        LEFT JOIN kiralama ON araclar.arac_id = kiralama.arac_id
        GROUP BY araclar.arac_id 
        ORDER BY COUNT(kiralama.kiralama_id) DESC 
        LIMIT 20;
    `;

    const maintenanceCarsQuery = `
        SELECT araclar.arac_id, araclar.arac_model, yakitlar.yakit_turu 
        FROM bakim
        LEFT JOIN araclar ON araclar.arac_id = bakim.arac_id
        LEFT JOIN yakitlar ON yakitlar.yakit_id = araclar.yakit_id
        GROUP BY araclar.arac_id 
        ORDER BY COUNT(bakim.bakim_id) DESC 
        LIMIT 20;
    `;

    db.query(rentedCarsQuery, (err, rentedResult) => {
        if (err) return res.status(500).json({ error: 'Sorgu hatası' });

        db.query(maintenanceCarsQuery, (err, maintenanceResult) => {
            if (err) return res.status(500).json({ error: 'Sorgu hatası' });

            // KRİTİK DÜZELTME: İsimleri frontend'in beklediği gibi bırakıyoruz
            const rentedCars = rentedResult.map(item => ({ 
                arac_id: item.arac_id, 
                arac_model: item.arac_model, 
                yakit_turu: item.yakit_turu 
            }));

            const maintenanceCars = maintenanceResult.map(item => ({ 
                arac_id: item.arac_id, 
                arac_model: item.arac_model, 
                yakit_turu: item.yakit_turu 
            }));

            // Ortak araçları bul (ID üzerinden karşılaştır)
            const commonCars = rentedCars.filter(car => 
                maintenanceCars.some(mCar => mCar.arac_id === car.arac_id)
            );

            res.json(commonCars);
        });
    });
};

// 4. Araç Finansal Verileri (Gelir vs Bakım)
const getCarFinancialData = (req, res) => {
    const { carId } = req.query;
    const rentalQuery = `SELECT YEAR(kiralama_tarihi) AS year, SUM(kiralama_ucreti) AS revenue 
                         FROM kiralama WHERE arac_id = ? GROUP BY YEAR(kiralama_tarihi)`;

    db.query(rentalQuery, [carId], (err, rentalResults) => {
        if (err) return res.status(500).send(err);

        const maintenanceQuery = `SELECT YEAR(bakim_tarihi) AS year, SUM(masraf) AS maintenanceCost
                                  FROM bakim WHERE arac_id = ? GROUP BY YEAR(bakim_tarihi)`;

        db.query(maintenanceQuery, [carId], (err, maintenanceResults) => {
            if (err) return res.status(500).send(err);

            const yearlyStats = {};
            rentalResults.forEach(r => yearlyStats[r.year] = { revenue: r.revenue, maintenanceCost: 0 });
            maintenanceResults.forEach(m => {
                if (!yearlyStats[m.year]) yearlyStats[m.year] = { revenue: 0, maintenanceCost: 0 };
                yearlyStats[m.year].maintenanceCost = m.maintenanceCost;
            });
            res.json(yearlyStats);
        });
    });
};



// 5. Tüm Araçları Getir
const getAllCars = (req, res) => {
    db.query(`SELECT arac_id, arac_model, yakit_turu FROM yakitlar 
              LEFT JOIN araclar ON yakitlar.yakit_id=araclar.yakit_id`, (err, result) => {
        if (err) return res.status(500).json({ error: 'Hata' });
        res.json(result);
    });
};

// En az kiralanan 20 aracı getiren fonksiyon
const getBottomRentedCars = (req, res) => {
    const query = `
        SELECT 
            yakitlar.yakit_turu, 
            araclar.arac_model, 
            COUNT(kiralama.kiralama_id) as kiralama_sayisi
        FROM yakitlar 
        LEFT JOIN araclar ON yakitlar.yakit_id = araclar.yakit_id
        LEFT JOIN kiralama ON araclar.arac_id = kiralama.arac_id
        GROUP BY yakitlar.yakit_id, araclar.arac_id  
        ORDER BY kiralama_sayisi ASC
        LIMIT 20;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('En az kiralanan araçlar çekilirken hata:', err);
            return res.status(500).json({ error: 'Veritabanı sorgu hatası' });
        }
        res.json(results);
    });
};

// Az Bakım - Çok Masraf Analizi (Kritik Araçlar)
const getTopCostLowMaintenanceCars = (req, res) => {
    const query = `
        SELECT 
            araclar.arac_model, 
            yakitlar.yakit_turu, 
            COUNT(bakim.bakim_id) AS toplam_bakim_sayisi, 
            ROUND(AVG(bakim.bakim_masrafi)) AS ortalama_masraf
        FROM bakim
        LEFT JOIN araclar ON araclar.arac_id = bakim.arac_id
        LEFT JOIN yakitlar ON yakitlar.yakit_id = araclar.yakit_id
        GROUP BY araclar.arac_id, yakitlar.yakit_turu
        ORDER BY toplam_bakim_sayisi ASC, ortalama_masraf DESC
        LIMIT 20;
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Kritik araçlar sorgu hatası:', err.message);
            return res.status(500).json({ error: 'Veritabanı sorgusu başarısız oldu.' });
        }
        res.json(result);
    });
};

// Çok Masraflı ve Az Kiralanan Araçların Kesişimini Bulma (Sağ Alt Tablo)
const getCommonCarsForGraphs = (req, res) => {
    const maintenanceCarsQuery = `
        SELECT araclar.arac_id, araclar.arac_model, yakitlar.yakit_turu
        FROM bakim
        LEFT JOIN araclar ON araclar.arac_id = bakim.arac_id
        LEFT JOIN yakitlar ON yakitlar.yakit_id = araclar.yakit_id
        GROUP BY araclar.arac_id, araclar.arac_model, yakitlar.yakit_turu
        ORDER BY AVG(bakim.masraf) DESC, COUNT(bakim.bakim_id) ASC
        LIMIT 20;
    `;

    const rentedCarsQuery = `
        SELECT araclar.arac_id, araclar.arac_model, yakitlar.yakit_turu
        FROM yakitlar
        LEFT JOIN araclar ON yakitlar.yakit_id = araclar.yakit_id
        LEFT JOIN kiralama ON araclar.arac_id = kiralama.arac_id
        GROUP BY araclar.arac_id, araclar.arac_model, yakitlar.yakit_turu
        ORDER BY COUNT(kiralama.kiralama_id) ASC
        LIMIT 20;
    `;

    db.query(rentedCarsQuery, (err, rentedResult) => {
        if (err) {
            console.error('Kiralanan araçlar sorgu hatası:', err.message);
            return res.status(500).json({ error: 'Veritabanı sorgusu başarısız oldu.' });
        }

        db.query(maintenanceCarsQuery, (err, maintenanceResult) => {
            if (err) {
                console.error('Bakım araçları sorgu hatası:', err.message);
                return res.status(500).json({ error: 'Veritabanı sorgusu başarısız oldu.' });
            }

            // Kesişim kümesini bulurken frontend'in beklediği orijinal anahtarları (arac_model, yakit_turu) koruyoruz
            const commonCars = rentedResult
                .filter(car => maintenanceResult.some(mCar => mCar.arac_id === car.arac_id))
                .map(item => ({
                    arac_id: item.arac_id,
                    arac_model: item.arac_model,
                    yakit_turu: item.yakit_turu
                }));

            res.json(commonCars);
        });
    });
};




module.exports = { getTopMaintenanceCars, getTopRentedCars, getCommonCars, getCarFinancialData, getAllCars, getBottomRentedCars, getTopCostLowMaintenanceCars, getCommonCarsForGraphs };