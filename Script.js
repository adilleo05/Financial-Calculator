// Main calculation function
function calculate() {
    // Get user inputs
    const initialInvestment = parseFloat(document.getElementById('initialInvestment').value);
    const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value);
    const yearlyIncrease = parseFloat(document.getElementById('yearlyIncrease').value) / 100;
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value) / 100;
    const inflation = parseFloat(document.getElementById('inflation').value) / 100;
    const years = parseInt(document.getElementById('years').value);
    const swpStart = parseInt(document.getElementById('swpStart').value);
    const monthlySWP = parseFloat(document.getElementById('monthlySWP').value);

    // Initialize variables
    let data = [];
    let currentMonthlyInvestment = monthlyInvestment;
    let totalInvested = initialInvestment;
    let currentValue = initialInvestment;
    let swpActive = false;

    // Monthly calculation
    for (let year = 1; year <= years; year++) {
        for (let month = 1; month <= 12; month++) {
            const monthNumber = (year - 1) * 12 + month;
            
            // Check if SWP should start
            if (year >= swpStart && !swpActive) {
                swpActive = true;
            }

            // Calculate monthly return (compounded)
            const monthlyReturn = currentValue * (expectedReturn / 12);
            currentValue += monthlyReturn;

            // Add monthly investment (with yearly increase)
            if (month === 1 && year > 1) {
                currentMonthlyInvestment *= (1 + yearlyIncrease);
            }
            currentValue += currentMonthlyInvestment;
            totalInvested += currentMonthlyInvestment;

            // Apply SWP if active
            let withdrawal = 0;
            if (swpActive) {
                withdrawal = Math.min(monthlySWP, currentValue);
                currentValue -= withdrawal;
            }

            // Inflation-adjusted value
            const inflationAdjustedValue = currentValue / Math.pow(1 + inflation, year);

            data.push({
                year,
                month: monthNumber,
                value: currentValue,
                invested: totalInvested,
                withdrawal,
                inflationAdjustedValue
            });
        }
    }

    // Display results
    displayResults(data);
    renderCharts(data);
}

// Display results in table
function displayResults(data) {
    const table = document.getElementById('resultsTable');
    table.innerHTML = `
        <tr>
            <th>Year</th>
            <th>Total Invested (PKR)</th>
            <th>Portfolio Value (PKR)</th>
            <th>Inflation-Adjusted (PKR)</th>
            <th>Withdrawals (PKR)</th>
        </tr>
    `;

    // Show yearly summary
    for (let year = 1; year <= data[data.length - 1].year; year++) {
        const yearData = data.filter(d => d.year === year);
        const lastMonth = yearData[yearData.length - 1];

        table.innerHTML += `
            <tr>
                <td>${year}</td>
                <td>${lastMonth.invested.toLocaleString('en-PK')}</td>
                <td>${lastMonth.value.toLocaleString('en-PK')}</td>
                <td>${lastMonth.inflationAdjustedValue.toLocaleString('en-PK')}</td>
                <td>${yearData.reduce((sum, d) => sum + d.withdrawal, 0).toLocaleString('en-PK')}</td>
            </tr>
        `;
    }

    // Show final summary
    const final = data[data.length - 1];
    document.getElementById('summary').innerHTML = `
        <h3>Final Results After ${years} Years</h3>
        <p>Total Invested: ₨${final.invested.toLocaleString('en-PK')}</p>
        <p>Final Value: ₨${final.value.toLocaleString('en-PK')}</p>
        <p>Inflation-Adjusted: ₨${final.inflationAdjustedValue.toLocaleString('en-PK')}</p>
        <p>Total Withdrawn: ₨${data.reduce((sum, d) => sum + d.withdrawal, 0).toLocaleString('en-PK')}</p>
    `;
}

// Render interactive charts
function renderCharts(data) {
    const ctx = document.getElementById('growthChart').getContext('2d');
    
    // Destroy previous chart if exists
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => `Year ${d.year} Month ${d.month % 12 || 12}`),
            datasets: [
                {
                    label: 'Portfolio Value (PKR)',
                    data: data.map(d => d.value),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
                {
                    label: 'Inflation-Adjusted (PKR)',
                    data: data.map(d => d.inflationAdjustedValue),
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Investment Growth Over Time'
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `₨${context.raw.toLocaleString('en-PK')}`
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value) => `₨${value.toLocaleString('en-PK')}`
                    }
                }
            }
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', calculate);
