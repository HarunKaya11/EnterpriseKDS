// Sayfa yüklendiğinde araç listesini dropdown'a doldur
fetch('/api/tahmin/tahminlemeAraclar') // Yeni Rota: /api/tahmin/...
    .then(response => response.json())
    .then(data => {
        const dropdown = document.getElementById('arac-secimi');
        data.forEach(arac => {
            const option = document.createElement('option');
            option.value = arac.arac_id; 
            option.textContent = `${arac.arac_model} - ${arac.yakit_turu}`;  
            dropdown.appendChild(option);
        });
    })
    .catch(error => console.error('Araçlar yüklenirken hata oluştu:', error));

document.getElementById('arac-secimi').addEventListener('change', function () {
    const aracId = this.value;

    if (aracId) {
        // 1. Kiralama Gün Sayısı Tahmini (Yeni Rota: /api/tahmin/...)
        fetch(`/api/tahmin/kiralama-verileri?arac_id=${aracId}`)
            .then(response => response.json())
            .then(data => {
                // 2021 - 2025 arası verileri tabloya yazdır
                document.getElementById('2021-gun-sayisi').innerText = data.totalDays[0] || 0;
                document.getElementById('2022-gun-sayisi').innerText = data.totalDays[1] || 0;
                document.getElementById('2023-gun-sayisi').innerText = data.totalDays[2] || 0;
                document.getElementById('2024-gun-sayisi').innerText = data.totalDays[3] || 0;
                document.getElementById('2025-gun-sayisi').innerText = data.totalDays[4] || 0;

                if (data.averagePrediction !== undefined) {
                    // KDS Tahminleme Mantığı: Ortalama + %20 Pay
                    const prediction2026 = Math.round(data.averagePrediction + (data.averagePrediction / 5));
                    document.getElementById('2026-gun').innerText = prediction2026;
                }
            })
            .catch(error => console.error('Kiralama verisi hatası:', error));

        // 2. Bakım Masrafı Tahmini (Yeni Rota: /api/tahmin/...)
        fetch(`/api/tahmin/bakim-masrafi?arac_id=${aracId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) return console.error('Veri hatası:', data.error);

                const formatTL = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

                document.getElementById('2021-masraf').innerText = formatTL.format(data.totalCosts[0] || 0);
                document.getElementById('2022-masraf').innerText = formatTL.format(data.totalCosts[1] || 0);
                document.getElementById('2023-masraf').innerText = formatTL.format(data.totalCosts[2] || 0);
                document.getElementById('2024-masraf').innerText = formatTL.format(data.totalCosts[3] || 0);
                document.getElementById('2025-masraf').innerText = formatTL.format(data.totalCosts[4] || 0);

                if (data.averageCost !== undefined) {
                    const predictionCost2026 = data.averageCost + (data.averageCost / 5);
                    document.getElementById('2026-masraf').innerText = formatTL.format(predictionCost2026);
                }
            })
            .catch(error => console.error('Bakım verisi hatası:', error));

        // 3. Kiralama Geliri Tahmini (Yeni Rota: /api/tahmin/...)
        fetch(`/api/tahmin/kiralama-geliri?arac_id=${aracId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) return console.error('Veri hatası:', data.error);

                const formatTL = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

                document.getElementById('2021-Gelir').innerText = formatTL.format(data.totalincome[0] || 0);
                document.getElementById('2022-Gelir').innerText = formatTL.format(data.totalincome[1] || 0);
                document.getElementById('2023-Gelir').innerText = formatTL.format(data.totalincome[2] || 0);
                document.getElementById('2024-Gelir').innerText = formatTL.format(data.totalincome[3] || 0);
                document.getElementById('2025-Gelir').innerText = formatTL.format(data.totalincome[4] || 0);

                if (data.averageincome !== undefined) {
                    document.getElementById('2026-Gelir').innerText = formatTL.format(data.averageincome);
                }
            })
            .catch(error => console.error('Gelir verisi hatası:', error));        
    }
});