// EMI Calculator JavaScript

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Get form elements
    const form = document.getElementById('emi-form');
    const principalInput = document.getElementById('principal');
    const yearsInput = document.getElementById('years');
    const monthsInput = document.getElementById('months');
    const rateInput = document.getElementById('rate');
    const calculateText = document.getElementById('calculate-text');
    const resultsSection = document.getElementById('results-section');
    const toggleChartBtn = document.getElementById('toggle-chart');
    const chartContent = document.getElementById('chart-content');
    const chartIcon = document.getElementById('chart-icon');
    
    let showChart = true;
    
    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            calculateEMI();
        }
    });
    
    // Toggle chart visibility
    toggleChartBtn.addEventListener('click', function() {
        showChart = !showChart;
        chartContent.style.display = showChart ? 'block' : 'none';
        chartIcon.setAttribute('data-lucide', showChart ? 'chevron-up' : 'chevron-down');
        lucide.createIcons();
    });
    
    // Validation function
    function validateForm() {
        let isValid = true;
        
        // Clear previous errors
        clearErrors();
        
        const principal = parseFloat(principalInput.value);
        const years = parseInt(yearsInput.value);
        const months = parseInt(monthsInput.value);
        const rate = parseFloat(rateInput.value);
        
        // Validate principal
        if (!principal || principal <= 0) {
            showError('principal-error', 'Principal amount must be positive');
            isValid = false;
        }
        
        // Validate years
        if (years < 0) {
            showError('years-error', 'Years must be 0 or greater');
            isValid = false;
        }
        
        // Validate months
        if (months < 0 || months > 12) {
            showError('months-error', 'Months must be between 0 and 12');
            isValid = false;
        }
        
        // Validate total tenure
        if (years === 0 && months === 0) {
            showError('years-error', 'Total tenure must be greater than 0');
            showError('months-error', 'Total tenure must be greater than 0');
            isValid = false;
        }
        
        // Validate rate
        if (!rate || rate <= 0) {
            showError('rate-error', 'Interest rate must be positive');
            isValid = false;
        }
        
        return isValid;
    }
    
    function clearErrors() {
        const errors = document.querySelectorAll('.form-error');
        errors.forEach(error => {
            error.style.display = 'none';
            error.textContent = '';
        });
    }
    
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    // EMI calculation function
    function calculateEMI() {
        const principal = parseFloat(principalInput.value);
        const years = parseInt(yearsInput.value);
        const months = parseInt(monthsInput.value);
        const rate = parseFloat(rateInput.value);
        
        // Calculate total tenure in months
        const tenure = (years * 12) + months;
        
        // Calculate monthly interest rate
        const monthlyInterestRate = rate / (12 * 100);
        
        // Calculate EMI using the exact formula from Java code
        const qrq = Math.pow((1 + monthlyInterestRate), tenure);
        const emi = principal * monthlyInterestRate * (qrq / (qrq - 1));
        
        // Calculate total interest
        const totalInterest = (emi * tenure) - principal;
        const totalAmount = principal + totalInterest;
        
        // Generate monthly breakdown
        const monthlyBreakdown = [];
        let balance = principal;
        
        for (let i = 1; i <= tenure; i++) {
            const interestPart = balance * monthlyInterestRate;
            const principalPart = emi - interestPart;
            balance -= principalPart;
            
            // Calculate percentage for visual bars
            const principalPercentage = Math.round((principalPart / emi) * 100);
            
            monthlyBreakdown.push({
                month: i,
                principalPart: Math.round(principalPart * 100) / 100,
                interestPart: Math.round(interestPart * 100) / 100,
                balance: Math.round(Math.max(balance, 0) * 100) / 100,
                principalPercentage: principalPercentage
            });
        }
        
        const result = {
            emi: Math.round(emi * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100,
            totalAmount: Math.round(totalAmount * 100) / 100,
            monthlyBreakdown: monthlyBreakdown
        };
        
        // Display results
        displayResults(result, principal, years, months);
        
        // Show success toast
        showToast('EMI Calculated Successfully', `Your monthly EMI is ${formatCurrency(result.emi)}`);
    }
    
    function displayResults(result, principal, years, months) {
        // Show results section
        resultsSection.classList.remove('hidden');
        
        // Update result displays
        document.getElementById('emi-amount').textContent = formatCurrency(result.emi);
        document.getElementById('total-interest').textContent = formatCurrency(result.totalInterest);
        document.getElementById('principal-display').textContent = formatCurrency(principal);
        document.getElementById('total-amount').textContent = formatCurrency(result.totalAmount);
        document.getElementById('tenure-display').textContent = `${years} years ${months} months`;
        
        // Generate payment breakdown table
        generatePaymentBreakdown(result.monthlyBreakdown);
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function generatePaymentBreakdown(breakdown) {
        const container = document.getElementById('payment-breakdown');
        container.innerHTML = '';
        
        breakdown.forEach(payment => {
            const row = document.createElement('div');
            row.className = 'payment-row';
            
            row.innerHTML = `
                <div class="font-medium text-center">${payment.month}</div>
                <div class="text-right text-green-700 font-medium px-1">${formatCompactCurrency(payment.principalPart)}</div>
                <div class="text-right text-blue-700 px-1">${formatCompactCurrency(payment.interestPart)}</div>
                <div class="text-right text-gray-700 px-1">${formatCompactCurrency(Math.max(payment.balance, 0))}</div>
                <div class="text-center text-xs">
                    <div class="text-green-700">${payment.principalPercentage}%</div>
                    <div class="text-blue-700">${100 - payment.principalPercentage}%</div>
                </div>
                <div class="flex items-center justify-center">
                    <div class="chart-bar">
                        <div class="chart-bar-principal" style="width: ${payment.principalPercentage}%"></div>
                        <div class="chart-bar-interest" style="width: ${100 - payment.principalPercentage}%"></div>
                    </div>
                </div>
            `;
            
            container.appendChild(row);
        });
    }
    
    // Currency formatting functions
    function formatCurrency(amount) {
        return `₹${amount.toLocaleString('en-IN')}`;
    }
    
    function formatCompactCurrency(amount) {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(1)}Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        } else {
            return `₹${amount.toFixed(0)}`;
        }
    }
    
    // Toast notification function
    function showToast(title, description) {
        const toast = document.getElementById('toast');
        const toastTitle = document.getElementById('toast-title');
        const toastDescription = document.getElementById('toast-description');
        
        toastTitle.textContent = title;
        toastDescription.textContent = description;
        
        toast.classList.remove('hidden');
        toast.classList.add('show');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hidden');
        }, 3000);
    }
});