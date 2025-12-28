Promise.all([
    fetch('/api/araclar/az_olan_sorgu').then(res => res.json()),
    fetch('/api/araclar/cok_olan_sorgu').then(res => res.json())
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
                label: 'Kiralama Sayısı',
                data: azValues,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function (context) {
                            const index = context.dataIndex;
                            return 'Yakıt Türü: ' + azYakit[index];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const ctxCok = document.getElementById('chartCok').getContext('2d');
    new Chart(ctxCok, {
        type: 'bar',
        data: {
            labels: cokLabels,
            datasets: [{
                label: 'Kiralama Sayısı',
                data: cokValues,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function (context) {
                            const index = context.dataIndex;
                            return 'Yakıt Türü: ' + cokYakit[index];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
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
    fetch('/api/araclar/gelir_listesi') 
        .then(response => response.json())
        .then(data => {
            const selectBox = document.getElementById('car-select');
            
            data.forEach(arac => {
                const option = document.createElement('option');
                option.value = arac.arac_id;
                
            
                const yillikOrtalamaGelir = arac.toplam_gelir / 5; 
                
                const formattedIncome = formatCurrency(yillikOrtalamaGelir);
                
                // Kullanıcıya artık "Yıllık Ortalama Ciro"yu gösteriyoruz
                option.textContent = `${arac.arac_model} - (Yıllık Ort. Ciro: ${formattedIncome})`;
                
                // Hesaplama için yıllık ortalamayı saklıyoruz
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

    // YENİ FORMÜL: Yıllık Ortalama Ciro * (1 + Enflasyon)
    const tahmini2026Cirosu = yillikGelir * (1 + (enflasyonOrani / 100));

    resultValue.textContent = formatCurrency(tahmini2026Cirosu);
    resultBox.style.display = 'block'; 
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
}

// Enflasyon ipucuna tıklanınca input'u doldurur
function fillInflation(rate) {
    const input = document.getElementById('inflation-rate');
    input.value = rate;
    
    // Kullanıcıya görsel bir geri bildirim verelim (Input yanıp sönsün)
    input.style.borderColor = "#169a5a";
    input.style.boxShadow = "0 0 0 4px rgba(22, 154, 90, 0.1)";
    setTimeout(() => {
        input.style.borderColor = "";
        input.style.boxShadow = "";
    }, 500);
}