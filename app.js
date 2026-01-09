const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const logger = require('./middleware/logger');

// Ana dizine (/) gelen istekleri otomatik olarak giriş sayfasına yönlendirir
app.get('/', (req, res) => {
    res.redirect('/pages/adminGiris.html');
});
// Rotaları (Routes) İçe Aktarma
const filoRoutes = require('./routes/filoRoutes');
const bakimRoutes = require('./routes/bakimRoutes');
const subeRoutes = require('./routes/subeRoutes');
const analizRoutes = require('./routes/analizRoutes');
const tahminRoutes = require('./routes/tahminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');


const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static('public'));
app.use(logger); 


// --- MVC Rotalarını Tanımlama ---
app.use('/api/filo', filoRoutes);           // Araç listeleme ve filo işlemleri
app.use('/api/bakim', bakimRoutes);         // Bakım masraf ve sayı analizleri
app.use('/api/sube', subeRoutes);           // Şube bazlı gelir ve kiralama verileri
app.use('/api/analiz', analizRoutes);       // Genel toplamlar ve özet veriler
app.use('/api/tahmin', tahminRoutes);       // Yıllık tahminleme ve araç öngörüleri
app.use('/api/dashboard', dashboardRoutes); // Karmaşık dashboard ve finansal analizler

// --- Sunucuyu Başlatma ---
app.listen(PORT, () => {
    console.log(`
    ====================================================
    🚀 Enterprise KDS Sunucusu Hazır!
    📡 Port: ${PORT}
    ====================================================
    `);
});
