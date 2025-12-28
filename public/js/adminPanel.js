document.addEventListener("DOMContentLoaded", () => {
    const filterContainer = document.getElementById('filter-buttons');
    const yearButtons = document.querySelectorAll('.year-btn');

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
            const startLabel = current.toLocaleString('tr', { month: 'long' });
            const endLabel = next.toLocaleString('tr', { month: 'long' });
            const label = `${year} ${startLabel} - ${endLabel}`;
            const value = `${current.toISOString().split('T')[0]}_${next.toISOString().split('T')[0]}`;

            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.textContent = label;
            button.setAttribute('data-start', current.toISOString().split('T')[0]);
            button.setAttribute('data-end', next.toISOString().split('T')[0]);

            if (!years[year]) {
                years[year] = [];
            }
            years[year].push(button);
            current = next;
        }

        for (const year in years) {
            const yearGroup = document.createElement('div');
            yearGroup.className = 'year-group';
            const yearTitle = document.createElement('h4');
            yearTitle.textContent = year;
            yearGroup.appendChild(yearTitle);

            years[year].forEach(button => {
                yearGroup.appendChild(button);
            });

            filterContainer.appendChild(yearGroup);
        }
    }

    generateDateRanges();

    function formatCurrency(amount) {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    }

    function fetchSummaryData(startDate, endDate) {
        fetch(`/api/summary/total-rental-days?start=${startDate}&end=${endDate}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('total-vehicles').textContent = `${data.totalRentalDays || 0} Gün`;
            })
            .catch(err => console.error("Toplam gün sayısı hatası:", err));

        fetch(`/api/summary/total-revenue?start=${startDate}&end=${endDate}`)
            .then(response => response.json())
            .then(data => {
                const formattedRevenue = formatCurrency(data.totalRevenue || 0);
                document.getElementById('total-revenue').textContent = formattedRevenue;
            })
            .catch(err => console.error("Toplam gelir hatası:", err));

        fetch(`/api/summary/total-maintenance?start=${startDate}&end=${endDate}`)
            .then(response => response.json())
            .then(data => {
                const formattedExpenses = formatCurrency(data.totalMaintenance || 0);
                document.getElementById('total-expenses').textContent = formattedExpenses;
            })
            .catch(err => console.error("Toplam masraf hatası:", err));
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
});

fetch('/api/vehicles/getTopMaintenanceCars')
    .then(response => response.json())
    .then(data => {
        const carModels = data.map(item => `${item.arac_model} (${item.yakit_turu})`); 
        const maintenanceCounts = data.map(item => item.toplam_bakim_sayisi); 
        const maintenanceCosts = data.map(item => item.ortalama_masraf); 

        new Chart(document.getElementById('maintenanceCarsChart'), {
            type: 'bar', 
            data: {
                labels: carModels,
                datasets: [
                    {
                        label: 'Bakım Sayısı',
                        data: maintenanceCounts,
                        backgroundColor: 'rgba(135, 206, 250, 0.6)',
                        borderColor: 'rgba(135, 206, 250, 1)', 
                        borderWidth: 1,
                        type: 'bar', 
                        yAxisID: 'y1', 
                    },
                    {
                        label: 'Ortalama Masraf (₺)',
                        data: maintenanceCosts,
                        borderColor: 'rgba(255, 165, 0, 1)', 
                        backgroundColor: 'rgba(255, 165, 0, 0)', 
                        borderWidth: 2,
                        fill: false, 
                        type: 'line',
                        yAxisID: 'y2', 
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y1: {
                        beginAtZero: true,
                        ticks: {
                            max: Math.max(...maintenanceCounts) + 5, 
                            stepSize: 5,
                        },
                        position: 'left',
                    },
                    y2: {
                        beginAtZero: true,
                        ticks: {
                            max: Math.max(...maintenanceCosts) + 1000, 
                            stepSize: 1000,
                        },
                        position: 'right',
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    });


fetch('/api/vehicles/getTopRentedCars')
    .then(response => response.json())
    .then(data => {
        const carModels = data.map(item => `${item.arac_model} (${item.yakit_turu})`); 
        const rentalCounts = data.map(item => item.kiralama_sayisi);

        new Chart(document.getElementById('rentedCarsChart'), {
            type: 'bar',
            data: {
                labels: carModels, 
                datasets: [{
                    label: 'Kiralama Sayısı',
                    data: rentalCounts
                }]
            }
        });
    });


document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/vehicles/getCommonCars')
        .then(response => response.json())
        .then(data => {
            const commonCars = data; 
            const tableBody = document.getElementById('commonCarsTable').getElementsByTagName('tbody')[0];

            commonCars.forEach(car => {
                const row = tableBody.insertRow(); 

                const carId = car.id;  
                const carModel = car.model; 
                const fuelType = car.fuel; 

                const cell1 = row.insertCell(0);
                cell1.textContent = carId; 

                const cell2 = row.insertCell(1); 
                cell2.textContent = `${carModel} (${fuelType})`; 
            });
        })
        .catch(err => {
            console.error('Veri çekme hatası:', err);
        });
});







fetch('/api/vehicles/getBottomRentedCars')
    .then(response => response.json())
    .then(data => {
        const carModels = data.map(item => `${item.arac_model} (${item.yakit_turu})`);
        const rentalCounts = data.map(item => item.kiralama_sayisi);

        new Chart(document.getElementById('bottomRentedCarsChart'), {
            type: 'bar',
            data: {
                labels: carModels, 
                datasets: [{
                    label: 'Kiralama Sayısı',
                    data: rentalCounts
                }]
            }
        });
    });

fetch('/api/vehicles/getTopCostLowMaintenanceCars')
    .then(response => response.json())
    .then(data => {
        const carModels = data.map(item => `${item.arac_model} (${item.yakit_turu})`); 
        const maintenanceCounts = data.map(item => item.toplam_bakim_sayisi); 
        const maintenanceCosts = data.map(item => item.ortalama_masraf);

        new Chart(document.getElementById('topCostLowMaintenanceCarsChart'), {
            type: 'bar',
            data: {
                labels: carModels,
                datasets: [
                    {
                        label: 'Bakım Sayısı',
                        data: maintenanceCounts,
                        backgroundColor: 'rgba(135, 206, 250, 0.6)', 
                        borderColor: 'rgba(135, 206, 250, 1)', 
                        borderWidth: 1,
                        type: 'bar', 
                        yAxisID: 'y1' 
                    },
                    {
                        label: 'Ortalama Masraf (₺)',
                        data: maintenanceCosts,
                        borderColor: 'rgba(255, 165, 0, 1)',
                        backgroundColor: 'rgba(255, 165, 0, 0)', 
                        borderWidth: 2,
                        fill: false, 
                        type: 'line', 
                        yAxisID: 'y2' 
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y1: {
                        beginAtZero: true,
                        ticks: {
                            max: Math.max(...maintenanceCounts) + 5, 
                            stepSize: 5
                        },
                        position: 'left', 
                    },
                    y2: {
                        beginAtZero: true,
                        ticks: {
                            max: Math.max(...maintenanceCosts) + 1000, 
                            stepSize: 1000
                        },
                        position: 'right', 
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    });


document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/vehicles/getCommonCarsForGraphs')
        .then(response => response.json())
        .then(data => {
            const commonCars = data; 
            const tableBody = document.getElementById('araclariGetir').getElementsByTagName('tbody')[0];

            commonCars.forEach(car => {
                const row = tableBody.insertRow(); 

                const carId = car.id;  
                const carModel = car.model; 
                const fuelType = car.fuel; 

                const cell1 = row.insertCell(0); 
                cell1.textContent = carId;

                const cell2 = row.insertCell(1);
                cell2.textContent = `${carModel} (${fuelType})`; 
            });
        })
        .catch(err => {
            console.error('Veri çekme hatası:', err);
        });
});


   
