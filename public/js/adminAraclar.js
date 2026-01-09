Promise.all([
    // Yeni rota yapımıza göre adresleri güncelledik
    fetch('/api/filo/az_olan_sorgu').then(res => res.json()),
    fetch('/api/filo/cok_olan_sorgu').then(res => res.json())
]).then(([azData, cokData]) => {
    const azLabels = azData.map(item => item.arac_model);
    const azValues = azData.map(item => item.kiralama_sayisi);
    const azYakit = azData.map(item => item.yakit_turu);

    const cokLabels = cokData.map(item => item.arac_model);
    const cokValues = cokData.map(item => item.kiralama_sayisi);
    const cokYakit = cokData.map(item => item.yakit_turu);

    // Az kiralananlar grafiği
    const ctxAz = document.getElementById('chartAz').getContext('2d');
    new Chart(ctxAz, {
        type: 'bar',
        data: {
            labels: azLabels,
            datasets: [{
                label: 'Kiralama Sayısı (Az)',
                data: azValues,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: function (context) {
                            return 'Yakıt Türü: ' + azYakit[context.dataIndex];
                        }
                    }
                }
            }
        }
    });

    // Çok kiralananlar grafiği
    const ctxCok = document.getElementById('chartCok').getContext('2d');
    new Chart(ctxCok, {
        type: 'bar',
        data: {
            labels: cokLabels,
            datasets: [{
                label: 'Kiralama Sayısı (Çok)',
                data: cokValues,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: function (context) {
                            return 'Yakıt Türü: ' + cokYakit[context.dataIndex];
                        }
                    }
                }
            }
        }
    });

}).catch(err => console.error('Veri çekme hatası:', err));

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    fetchCarData();
});

function fetchCarData() {
    // API yolu güncellendi: /api/araclar/ -> /api/filo/
    fetch('/api/filo/gelir_listesi') 
        .then(response => response.json())
        .then(data => {
            const selectBox = document.getElementById('car-select');
            
            data.forEach(arac => {
                const option = document.createElement('option');
                option.value = arac.arac_id;
                
                // Yıllık ortalama gelir hesabı
                const yillikOrtalamaGelir = arac.toplam_gelir / 5; 
                const formattedIncome = formatCurrency(yillikOrtalamaGelir);
                
                option.textContent = `${arac.arac_model} - (Yıllık Ort. Ciro: ${formattedIncome})`;
                option.setAttribute('data-yillik-gelir', yillikOrtalamaGelir);
                
                selectBox.appendChild(option);
            });
        })
        .catch(error => console.error('Veri çekme hatası:', error));
}

function calculateRevenue() {
    const inflationInput = document.getElementById('inflation-rate').value;
    const carSelect = document.getElementById('car-select');
    const resultBox = document.getElementById('result-box');
    const resultValue = document.getElementById('result-value');

    if (inflationInput === "" || carSelect.value === "") {
        alert("Lütfen tüm alanları doldurun.");
        return;
    }

    const selectedOption = carSelect.options[carSelect.selectedIndex];
    const yillikGelir = parseFloat(selectedOption.getAttribute('data-yillik-gelir'));
    const enflasyonOrani = parseFloat(inflationInput);

    if (isNaN(yillikGelir)) return;

    // Enflasyon Tahmin Formülü
    const tahmini2026Cirosu = yillikGelir * (1 + (enflasyonOrani / 100));

    resultValue.textContent = formatCurrency(tahmini2026Cirosu);
    resultBox.style.display = 'block'; 
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
}

function fillInflation(rate) {
    const input = document.getElementById('inflation-rate');
    input.value = rate;
    input.style.borderColor = "#169a5a";
    setTimeout(() => { input.style.borderColor = ""; }, 500);
}