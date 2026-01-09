document.addEventListener("DOMContentLoaded", () => {
    const filterContainer = document.getElementById('filter-buttons');

    // --- 1. Dinamik Tarih Filtreleme Butonlarını Oluşturma ---
    function generateDateRanges() {
        const startYear = 2021;
        const startMonth = 0;
        const today = new Date();
        let current = new Date(startYear, startMonth, 1);
        const years = {};

        while (current <= today) {
            const next = new Date(current);
            next.setMonth(current.getMonth() + 3);
            const year = current.getFullYear();
            const label = `${year} ${current.toLocaleString('tr', { month: 'long' })} - ${next.toLocaleString('tr', { month: 'long' })}`;
            
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.textContent = label;
            button.setAttribute('data-start', current.toISOString().split('T')[0]);
            button.setAttribute('data-end', next.toISOString().split('T')[0]);

            if (!years[year]) years[year] = [];
            years[year].push(button);
            current = next;
        }

        for (const year in years) {
            const yearGroup = document.createElement('div');
            yearGroup.className = 'year-group';
            const yearTitle = document.createElement('h4');
            yearTitle.textContent = year;
            yearGroup.appendChild(yearTitle);
            years[year].forEach(button => yearGroup.appendChild(button));
            filterContainer.appendChild(yearGroup);
        }
    }

    generateDateRanges();

    function formatCurrency(amount) {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    }

    // --- 2. Özet Verileri Çekme (Yeni Rota: /api/analiz/...) ---
    function fetchSummaryData(startDate, endDate) {
        // Toplam Gün
        fetch(`/api/analiz/total-rental-days?start=${startDate}&end=${endDate}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById('total-vehicles').textContent = `${data.totalRentalDays || 0} Gün`;
            });

        // Toplam Gelir
        fetch(`/api/analiz/total-revenue?start=${startDate}&end=${endDate}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById('total-revenue').textContent = formatCurrency(data.totalRevenue || 0);
            });

        // Toplam Masraf
        fetch(`/api/analiz/total-maintenance?start=${startDate}&end=${endDate}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById('total-expenses').textContent = formatCurrency(data.totalMaintenance || 0);
            });
    }

    function addFilterButtonListeners() {
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                const startDate = button.getAttribute('data-start');
                const endDate = button.getAttribute('data-end');
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                fetchSummaryData(startDate, endDate);
            });
        });
    }

    setTimeout(addFilterButtonListeners, 500);

    // --- 3. Grafik ve Tablo Verileri (Yeni Rota: /api/dashboard/...) ---

    // Bakım Sayısı ve Masraf Grafiği
    fetch('/api/dashboard/getTopMaintenanceCars')
        .then(res => res.json())
        .then(data => {
            const carModels = data.map(item => `${item.arac_model} (${item.yakit_turu})`);
            const maintenanceCounts = data.map(item => item.toplam_bakim_sayisi);
            const maintenanceCosts = data.map(item => item.ortalama_masraf);

            new Chart(document.getElementById('maintenanceCarsChart'), {
                type: 'bar',
                data: {
                    labels: carModels,
                    datasets: [
                        { label: 'Bakım Sayısı', data: maintenanceCounts, backgroundColor: 'rgba(135, 206, 250, 0.6)', yAxisID: 'y1' },
                        { label: 'Ortalama Masraf (₺)', data: maintenanceCosts, type: 'line', borderColor: 'rgba(255, 165, 0, 1)', yAxisID: 'y2' }
                    ]
                },
                options: { scales: { y1: { position: 'left' }, y2: { position: 'right' } } }
            });
        });

    // En Çok Kiralananlar
    fetch('/api/dashboard/getTopRentedCars')
        .then(res => res.json())
        .then(data => {
            new Chart(document.getElementById('rentedCarsChart'), {
                type: 'bar',
                data: {
                    labels: data.map(item => `${item.arac_model} (${item.yakit_turu})`),
                    datasets: [{ label: 'Kiralama Sayısı', data: data.map(item => item.kiralama_sayisi) }]
                }
            });
        });

    // En Az Kiralananlar
    fetch('/api/dashboard/getBottomRentedCars')
        .then(res => res.json())
        .then(data => {
            new Chart(document.getElementById('bottomRentedCarsChart'), {
                type: 'bar',
                data: {
                    labels: data.map(item => `${item.arac_model} (${item.yakit_turu})`),
                    datasets: [{ label: 'Kiralama Sayısı (En Az)', data: data.map(item => item.kiralama_sayisi) }]
                }
            });
        });

    // Ortak Araçlar Tablosu
    fetch('/api/dashboard/getCommonCars')
        .then(res => res.json())
        .then(data => {
            const tableBody = document.getElementById('commonCarsTable').getElementsByTagName('tbody')[0];
            data.forEach(car => {
                const row = tableBody.insertRow();
                row.insertCell(0).textContent = car.arac_id;
                row.insertCell(1).textContent = `${car.arac_model} (${car.yakit_turu})`;
            });
        });
});