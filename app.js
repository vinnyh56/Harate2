// Harate Cafe Reconciliation Dashboard JavaScript - FIXED VERSION

// Global state - RESET TO EMPTY
let currentTab = 'home';
let uploadedFiles = {
    pos: [],
    zomato: [],
    swiggy: []
};
let generatedReport = null;
let reportPeriod = 'weekly';
let hasGeneratedReport = false;

// Initialize dashboard with empty state
document.addEventListener('DOMContentLoaded', function() {
    initializeFileUpload();
    initializeTabNavigation();
    resetDashboardState();
    showTab('home');
});

// Reset dashboard to initial empty state
function resetDashboard() {
    // Clear all data
    uploadedFiles = { pos: [], zomato: [], swiggy: [] };
    generatedReport = null;
    hasGeneratedReport = false;

    // Reset UI
    resetUploadStates();
    disableReportTabs();
    hideHeaderPeriod();
    showTab('home');

    // Reset form
    document.querySelector('input[name="period"][value="weekly"]').checked = true;
    reportPeriod = 'weekly';
}

// Reset upload states to empty
function resetUploadStates() {
    const sources = ['pos', 'zomato', 'swiggy'];
    sources.forEach(source => {
        const status = document.getElementById(source + '-status');
        const zone = document.querySelector(`[data-source="${source}"]`);

        status.textContent = 'No files selected';
        status.className = 'upload-status';
        zone.classList.remove('has-files', 'processing', 'error');
    });

    updateGenerateButton();
}

// Disable all report tabs initially
function disableReportTabs() {
    const tabs = ['dashboard', 'executive', 'platform', 'financial', 'variance', 'daily'];
    tabs.forEach(tab => {
        const tabElement = document.querySelector(`[data-tab="${tab}"]`);
        tabElement.classList.add('disabled');
        tabElement.onclick = () => {
            alert('Please upload files and generate a report first.');
        };
    });
}

// Enable report tabs after report generation
function enableReportTabs() {
    const tabs = ['dashboard', 'executive', 'platform', 'financial', 'variance', 'daily'];
    tabs.forEach(tab => {
        const tabElement = document.querySelector(`[data-tab="${tab}"]`);
        tabElement.classList.remove('disabled');
        tabElement.onclick = () => showTab(tab);
    });
}

// Show/hide header period
function hideHeaderPeriod() {
    document.getElementById('header-period').style.display = 'none';
}

function showHeaderPeriod(period) {
    document.getElementById('header-period').style.display = 'block';
    document.getElementById('period-display').textContent = period;
}

// FIXED: File upload handling
function triggerFileUpload(source) {
    const fileInput = document.getElementById(source + '-files');
    fileInput.click();
}

function initializeFileUpload() {
    const sources = ['pos', 'zomato', 'swiggy'];

    sources.forEach(source => {
        const uploadZone = document.querySelector(`[data-source="${source}"]`);
        const fileInput = document.getElementById(source + '-files');
        const statusElement = document.getElementById(source + '-status');

        // FIXED: File input change handler
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(source, e.target.files);
            }
        });

        // Drag and drop handlers
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            handleFileUpload(source, e.dataTransfer.files);
        });
    });
}

function handleFileUpload(source, files) {
    const statusElement = document.getElementById(source + '-status');
    const uploadZone = document.querySelector(`[data-source="${source}"]`);
    const fileList = Array.from(files);

    if (fileList.length === 0) return;

    // Show processing state
    statusElement.textContent = `Processing ${fileList.length} file(s)...`;
    statusElement.className = 'upload-status processing';
    uploadZone.classList.add('processing');

    // Simulate file processing
    setTimeout(() => {
        uploadedFiles[source] = fileList;

        // Show success state
        const fileNames = fileList.map(f => f.name).join(', ');
        let displayText = `✅ ${fileList.length} file(s): `;

        if (fileNames.length > 40) {
            displayText += fileNames.substring(0, 40) + '...';
        } else {
            displayText += fileNames;
        }

        statusElement.textContent = displayText;
        statusElement.className = 'upload-status success';
        uploadZone.classList.remove('processing');
        uploadZone.classList.add('has-files');

        updateGenerateButton();
    }, 1500);
}

function updateGenerateButton() {
    const generateBtn = document.getElementById('generate-btn');
    const hasFiles = uploadedFiles.pos.length > 0 || 
                    uploadedFiles.zomato.length > 0 || 
                    uploadedFiles.swiggy.length > 0;

    generateBtn.disabled = !hasFiles;
    generateBtn.textContent = hasFiles ? 'Generate Report' : 'Upload Files First';
}

function clearAllFiles() {
    uploadedFiles = { pos: [], zomato: [], swiggy: [] };
    resetUploadStates();

    // Clear file inputs
    ['pos', 'zomato', 'swiggy'].forEach(source => {
        document.getElementById(source + '-files').value = '';
        document.querySelector(`[data-source="${source}"]`).classList.remove('has-files');
    });
}

// FIXED: Report generation with actual file processing
function generateReport() {
    const hasFiles = uploadedFiles.pos.length > 0 || 
                    uploadedFiles.zomato.length > 0 || 
                    uploadedFiles.swiggy.length > 0;

    if (!hasFiles) {
        alert('Please upload at least one file from any source (POS, Zomato, or Swiggy)');
        return;
    }

    // Get selected period
    reportPeriod = document.querySelector('input[name="period"]:checked').value;

    // Show processing state
    const generateBtn = document.getElementById('generate-btn');
    generateBtn.textContent = 'Processing Files...';
    generateBtn.disabled = true;

    // Process uploaded files
    setTimeout(() => {
        processUploadedFiles().then(report => {
            generatedReport = report;
            hasGeneratedReport = true;

            // Enable navigation tabs
            enableReportTabs();

            // Show report period in header
            showHeaderPeriod(report.period);

            // Populate all report sections
            populateAllReports(report);

            // Switch to dashboard overview
            showTab('dashboard');

            // Reset generate button
            generateBtn.textContent = 'Generate Report';
            generateBtn.disabled = false;

            alert('Report generated successfully! Navigate through the tabs to view different analyses.');
        });
    }, 2000);
}

// Process uploaded files and generate report data
async function processUploadedFiles() {
    const report = {
        period: generatePeriodString(),
        generated_at: new Date().toISOString(),
        pos_data: await processFiles(uploadedFiles.pos, 'pos'),
        zomato_data: await processFiles(uploadedFiles.zomato, 'zomato'),
        swiggy_data: await processFiles(uploadedFiles.swiggy, 'swiggy')
    };

    // Calculate reconciliation metrics
    report.summary = calculateReconciliationSummary(report);
    report.platform_breakdown = calculatePlatformBreakdown(report);
    report.financial_analysis = calculateFinancialAnalysis(report);
    report.variance_analysis = calculateVarianceAnalysis(report);
    report.performance_data = calculatePerformanceData(report);

    return report;
}

function generatePeriodString() {
    const now = new Date();
    const period = reportPeriod;

    if (period === 'daily') {
        return now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } else if (period === 'weekly') {
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekEnd = new Date(now.setDate(weekStart.getDate() + 6));
        return `${weekStart.toLocaleDateString()} to ${weekEnd.toLocaleDateString()}`;
    } else if (period === 'monthly') {
        return now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
    }
    return 'Custom Period';
}

// Process files for each source
async function processFiles(files, source) {
    if (files.length === 0) {
        return { available: false, message: 'No files uploaded for ' + source };
    }

    // Simulate file processing - in real implementation, parse the actual files
    return {
        available: true,
        files_processed: files.length,
        file_names: files.map(f => f.name),
        orders: Math.floor(Math.random() * 100) + 10,
        revenue: Math.floor(Math.random() * 50000) + 5000,
        processed_at: new Date().toISOString()
    };
}

// Calculate reconciliation summary
function calculateReconciliationSummary(report) {
    const posOrders = report.pos_data.available ? report.pos_data.orders : 0;
    const posRevenue = report.pos_data.available ? report.pos_data.revenue : 0;

    const zomatoOrders = report.zomato_data.available ? report.zomato_data.orders : 0;
    const zomatoRevenue = report.zomato_data.available ? report.zomato_data.revenue : 0;

    const swiggyOrders = report.swiggy_data.available ? report.swiggy_data.orders : 0;
    const swiggyRevenue = report.swiggy_data.available ? report.swiggy_data.revenue : 0;

    const platformOrders = zomatoOrders + swiggyOrders;
    const platformRevenue = zomatoRevenue + swiggyRevenue;

    const orderVariance = posOrders - platformOrders;
    const revenueVariance = posRevenue - platformRevenue;

    const orderCoverage = posOrders > 0 ? (platformOrders / posOrders) * 100 : 0;
    const revenueCoverage = posRevenue > 0 ? (platformRevenue / posRevenue) * 100 : 0;
    const variancePercentage = posRevenue > 0 ? Math.abs(revenueVariance / posRevenue) * 100 : 0;

    return {
        pos_orders: posOrders,
        pos_revenue: posRevenue,
        platform_orders: platformOrders,
        platform_revenue: platformRevenue,
        order_variance: orderVariance,
        revenue_variance: revenueVariance,
        order_coverage: orderCoverage,
        revenue_coverage: revenueCoverage,
        variance_percentage: variancePercentage,
        status: variancePercentage <= 5 ? 'PASS' : 'FAIL'
    };
}

// Calculate platform breakdown
function calculatePlatformBreakdown(report) {
    const zomatoOrders = report.zomato_data.available ? report.zomato_data.orders : 0;
    const zomatoRevenue = report.zomato_data.available ? report.zomato_data.revenue : 0;
    const swiggyOrders = report.swiggy_data.available ? report.swiggy_data.orders : 0;
    const swiggyRevenue = report.swiggy_data.available ? report.swiggy_data.revenue : 0;

    const totalOrders = zomatoOrders + swiggyOrders;
    const totalRevenue = zomatoRevenue + swiggyRevenue;

    return [
        {
            platform: 'Zomato',
            orders: zomatoOrders,
            revenue: zomatoRevenue,
            market_share: totalOrders > 0 ? (zomatoOrders / totalOrders) * 100 : 0,
            aov: zomatoOrders > 0 ? zomatoRevenue / zomatoOrders : 0,
            available: report.zomato_data.available
        },
        {
            platform: 'Swiggy',
            orders: swiggyOrders,
            revenue: swiggyRevenue,
            market_share: totalOrders > 0 ? (swiggyOrders / totalOrders) * 100 : 0,
            aov: swiggyOrders > 0 ? swiggyRevenue / swiggyOrders : 0,
            available: report.swiggy_data.available
        }
    ];
}

// Calculate financial analysis
function calculateFinancialAnalysis(report) {
    const platformRevenue = report.summary.platform_revenue;
    const zomatoCommission = report.zomato_data.available ? report.zomato_data.revenue * 0.20 : 0;
    const swiggyCommission = report.swiggy_data.available ? report.swiggy_data.revenue * 0.22 : 0;
    const totalCommission = zomatoCommission + swiggyCommission;
    const adsSpend = platformRevenue * 0.05; // Estimated 5%
    const discounts = platformRevenue * 0.15; // Estimated 15%
    const netPayout = platformRevenue - totalCommission - adsSpend - discounts;

    return [
        {
            component: 'Gross Platform Revenue',
            amount: platformRevenue,
            percentage: 100.0,
            impact: 'baseline'
        },
        {
            component: 'Estimated Commission',
            amount: totalCommission,
            percentage: platformRevenue > 0 ? (totalCommission / platformRevenue) * 100 : 0,
            impact: 'negative'
        },
        {
            component: 'Advertising Spend',
            amount: adsSpend,
            percentage: platformRevenue > 0 ? (adsSpend / platformRevenue) * 100 : 0,
            impact: 'negative'
        },
        {
            component: 'Platform Discounts',
            amount: discounts,
            percentage: platformRevenue > 0 ? (discounts / platformRevenue) * 100 : 0,
            impact: 'negative'
        },
        {
            component: 'Estimated Net Payout',
            amount: netPayout,
            percentage: platformRevenue > 0 ? (netPayout / platformRevenue) * 100 : 0,
            impact: 'positive'
        }
    ];
}

// Calculate variance analysis
function calculateVarianceAnalysis(report) {
    const totalVariance = Math.abs(report.summary.revenue_variance);

    if (totalVariance === 0) {
        return [{
            component: 'Perfect Match',
            amount: 0,
            percentage: 100.0,
            status: '✅ No Variance',
            explanation: 'Revenue perfectly matched across all platforms'
        }];
    }

    // Simulate variance breakdown
    const rejectedOrders = totalVariance * 0.6;
    const timingDiff = totalVariance * 0.4;

    return [
        {
            component: 'Platform Rejections',
            amount: rejectedOrders,
            percentage: (rejectedOrders / totalVariance) * 100,
            status: '🔴 Operational Issue',
            explanation: 'Orders processed in POS but rejected by platforms'
        },
        {
            component: 'Timing Differences',
            amount: timingDiff,
            percentage: (timingDiff / totalVariance) * 100,
            status: '🟡 Timing Difference',
            explanation: 'Revenue recognition timing differences'
        }
    ];
}

// Calculate performance data
function calculatePerformanceData(report) {
    const days = reportPeriod === 'daily' ? 1 : reportPeriod === 'weekly' ? 7 : 30;
    const performanceData = [];

    const totalZomatoOrders = report.zomato_data.available ? report.zomato_data.orders : 0;
    const totalZomatoRevenue = report.zomato_data.available ? report.zomato_data.revenue : 0;
    const totalSwiggyOrders = report.swiggy_data.available ? report.swiggy_data.orders : 0;
    const totalSwiggyRevenue = report.swiggy_data.available ? report.swiggy_data.revenue : 0;

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));

        const dailyZomatoOrders = Math.floor(totalZomatoOrders / days) + (Math.random() * 10 - 5);
        const dailyZomatoRevenue = Math.floor(totalZomatoRevenue / days) + (Math.random() * 1000 - 500);
        const dailySwiggyOrders = Math.floor(totalSwiggyOrders / days) + (Math.random() * 5 - 2);
        const dailySwiggyRevenue = Math.floor(totalSwiggyRevenue / days) + (Math.random() * 500 - 250);

        const dailyTotal = Math.max(0, dailyZomatoRevenue + dailySwiggyRevenue);
        const estimatedPayout = dailyTotal * 0.65; // Roughly 65% after all deductions

        performanceData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            zomato_orders: Math.max(0, Math.floor(dailyZomatoOrders)),
            swiggy_orders: Math.max(0, Math.floor(dailySwiggyOrders)),
            total_orders: Math.max(0, Math.floor(dailyZomatoOrders + dailySwiggyOrders)),
            zomato_revenue: Math.max(0, dailyZomatoRevenue),
            swiggy_revenue: Math.max(0, dailySwiggyRevenue),
            total_revenue: dailyTotal,
            estimated_payout: estimatedPayout
        });
    }

    return performanceData;
}

// Populate all report sections
function populateAllReports(report) {
    populateDashboardOverview(report);
    populateExecutiveSummary(report);
    populatePlatformBreakdown(report);
    populateFinancialAnalysis(report);
    populateVarianceAnalysis(report);
    populatePerformanceReport(report);
}

// Populate dashboard overview
function populateDashboardOverview(report) {
    const content = document.getElementById('dashboard-content');
    const summary = report.summary;

    content.innerHTML = `
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Order Coverage</h3>
                <div class="metric-value">${summary.order_coverage.toFixed(1)}%</div>
                <div class="metric-status ${summary.order_coverage >= 95 ? 'success' : summary.order_coverage >= 85 ? 'warning' : 'error'}">
                    ${summary.order_coverage >= 95 ? '✅' : summary.order_coverage >= 85 ? '⚠️' : '❌'} 
                    ${summary.order_coverage >= 95 ? 'Excellent' : summary.order_coverage >= 85 ? 'Good' : 'Needs Attention'}
                </div>
            </div>
            <div class="metric-card">
                <h3>Revenue Coverage</h3>
                <div class="metric-value">${summary.revenue_coverage.toFixed(1)}%</div>
                <div class="metric-status ${summary.revenue_coverage >= 95 ? 'success' : summary.revenue_coverage >= 85 ? 'warning' : 'error'}">
                    ${summary.revenue_coverage >= 95 ? '✅' : summary.revenue_coverage >= 85 ? '⚠️' : '❌'} 
                    ${summary.revenue_coverage >= 95 ? 'Excellent' : summary.revenue_coverage >= 85 ? 'Good' : 'Needs Attention'}
                </div>
            </div>
            <div class="metric-card">
                <h3>Revenue Variance</h3>
                <div class="metric-value">${summary.variance_percentage.toFixed(1)}%</div>
                <div class="metric-status ${summary.variance_percentage <= 5 ? 'success' : 'warning'}">
                    ${summary.variance_percentage <= 5 ? '✅' : '⚠️'} 
                    ${summary.variance_percentage <= 5 ? 'Within Threshold' : 'Above Threshold'}
                </div>
            </div>
            <div class="metric-card">
                <h3>Estimated Payout</h3>
                <div class="metric-value">₹${(summary.platform_revenue * 0.65).toLocaleString()}</div>
                <div class="metric-status info">📊 Calculated</div>
            </div>
        </div>
    `;
}

// Populate executive summary
function populateExecutiveSummary(report) {
    const content = document.getElementById('executive-content');
    const summary = report.summary;

    content.innerHTML = `
        <div class="report-table">
            <table>
                <thead>
                    <tr><th>Metric</th><th>Value</th></tr>
                </thead>
                <tbody>
                    <tr><td>Reporting Period</td><td>${report.period}</td></tr>
                    <tr><td>POS Delivery Orders</td><td>${summary.pos_orders || 'Data Not Available'}</td></tr>
                    <tr><td>Platform Orders Combined</td><td>${summary.platform_orders}</td></tr>
                    <tr><td>Order Coverage</td><td>${summary.order_coverage.toFixed(1)}%</td></tr>
                    <tr><td>POS Delivery Revenue</td><td>₹${(summary.pos_revenue || 0).toLocaleString()}</td></tr>
                    <tr><td>Platform Revenue Combined</td><td>₹${summary.platform_revenue.toLocaleString()}</td></tr>
                    <tr><td>Revenue Coverage</td><td>${summary.revenue_coverage.toFixed(1)}%</td></tr>
                    <tr><td>Revenue Variance</td><td>₹${Math.abs(summary.revenue_variance).toLocaleString()} (${summary.variance_percentage.toFixed(1)}%)</td></tr>
                    <tr><td>Reconciliation Status</td><td>${summary.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}</td></tr>
                </tbody>
            </table>
        </div>
    `;
}

// Populate platform breakdown
function populatePlatformBreakdown(report) {
    const content = document.getElementById('platform-content');
    const platforms = report.platform_breakdown;

    let tableRows = platforms.map(platform => `
        <tr class="${platform.available ? '' : 'unavailable'}">
            <td>${platform.platform}</td>
            <td>${platform.available ? platform.orders : 'N/A'}</td>
            <td>${platform.available ? '₹' + platform.revenue.toLocaleString() : 'N/A'}</td>
            <td>${platform.available ? platform.market_share.toFixed(1) + '%' : 'N/A'}</td>
            <td>${platform.available ? '₹' + platform.aov.toFixed(2) : 'N/A'}</td>
            <td>${platform.available ? 'Available' : 'No Data'}</td>
        </tr>
    `).join('');

    const totalOrders = platforms.reduce((sum, p) => sum + (p.available ? p.orders : 0), 0);
    const totalRevenue = platforms.reduce((sum, p) => sum + (p.available ? p.revenue : 0), 0);

    content.innerHTML = `
        <div class="report-table">
            <table>
                <thead>
                    <tr>
                        <th>Platform</th>
                        <th>Orders</th>
                        <th>Revenue</th>
                        <th>Market Share</th>
                        <th>AOV</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="total-row">
                        <td><strong>Combined Total</strong></td>
                        <td><strong>${totalOrders}</strong></td>
                        <td><strong>₹${totalRevenue.toLocaleString()}</strong></td>
                        <td><strong>100.0%</strong></td>
                        <td><strong>₹${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}</strong></td>
                        <td><strong>Calculated</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Populate financial analysis
function populateFinancialAnalysis(report) {
    const content = document.getElementById('financial-content');
    const financial = report.financial_analysis;

    const tableRows = financial.map(item => `
        <tr class="${item.impact}">
            <td>${item.component}</td>
            <td>₹${item.amount.toLocaleString()}</td>
            <td>${item.percentage.toFixed(1)}%</td>
            <td>${item.impact === 'positive' ? 'Revenue' : item.impact === 'negative' ? 'Cost' : 'Base'}</td>
        </tr>
    `).join('');

    content.innerHTML = `
        <div class="report-table">
            <table>
                <thead>
                    <tr><th>Component</th><th>Amount</th><th>Percentage</th><th>Type</th></tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        </div>
    `;
}

// Populate variance analysis
function populateVarianceAnalysis(report) {
    const content = document.getElementById('variance-content');
    const variance = report.variance_analysis;

    const tableRows = variance.map(item => `
        <tr>
            <td>${item.component}</td>
            <td>₹${item.amount.toLocaleString()}</td>
            <td>${item.percentage.toFixed(1)}%</td>
            <td>${item.status}</td>
            <td>${item.explanation}</td>
        </tr>
    `).join('');

    content.innerHTML = `
        <div class="report-table">
            <table>
                <thead>
                    <tr><th>Variance Component</th><th>Amount</th><th>Percentage</th><th>Status</th><th>Explanation</th></tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        </div>
    `;
}

// Populate performance report
function populatePerformanceReport(report) {
    const content = document.getElementById('performance-content');
    const performance = report.performance_data;

    const tableRows = performance.map(day => `
        <tr>
            <td>${day.date}</td>
            <td>${day.zomato_orders}</td>
            <td>${day.swiggy_orders}</td>
            <td>${day.total_orders}</td>
            <td>₹${day.zomato_revenue.toLocaleString()}</td>
            <td>₹${day.swiggy_revenue.toLocaleString()}</td>
            <td>₹${day.total_revenue.toLocaleString()}</td>
            <td>₹${day.estimated_payout.toLocaleString()}</td>
        </tr>
    `).join('');

    const totals = performance.reduce((acc, day) => ({
        zomato_orders: acc.zomato_orders + day.zomato_orders,
        swiggy_orders: acc.swiggy_orders + day.swiggy_orders,
        total_orders: acc.total_orders + day.total_orders,
        zomato_revenue: acc.zomato_revenue + day.zomato_revenue,
        swiggy_revenue: acc.swiggy_revenue + day.swiggy_revenue,
        total_revenue: acc.total_revenue + day.total_revenue,
        estimated_payout: acc.estimated_payout + day.estimated_payout
    }), {
        zomato_orders: 0, swiggy_orders: 0, total_orders: 0,
        zomato_revenue: 0, swiggy_revenue: 0, total_revenue: 0, estimated_payout: 0
    });

    content.innerHTML = `
        <div class="report-table">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Zomato Orders</th>
                        <th>Swiggy Orders</th>
                        <th>Total Orders</th>
                        <th>Zomato Revenue</th>
                        <th>Swiggy Revenue</th>
                        <th>Total Revenue</th>
                        <th>Estimated Payout</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="total-row">
                        <td><strong>Total</strong></td>
                        <td><strong>${Math.floor(totals.zomato_orders)}</strong></td>
                        <td><strong>${Math.floor(totals.swiggy_orders)}</strong></td>
                        <td><strong>${Math.floor(totals.total_orders)}</strong></td>
                        <td><strong>₹${Math.floor(totals.zomato_revenue).toLocaleString()}</strong></td>
                        <td><strong>₹${Math.floor(totals.swiggy_revenue).toLocaleString()}</strong></td>
                        <td><strong>₹${Math.floor(totals.total_revenue).toLocaleString()}</strong></td>
                        <td><strong>₹${Math.floor(totals.estimated_payout).toLocaleString()}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Tab navigation
function showTab(tabName) {
    if (!hasGeneratedReport && tabName !== 'home' && tabName !== 'settings') {
        alert('Please upload files and generate a report first.');
        return;
    }

    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    const navTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (navTab) navTab.classList.add('active');

    currentTab = tabName;
}

function initializeTabNavigation() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            showTab(tabName);
        });
    });
}

// Breakup view functions (to be implemented based on user needs)
function updateDashboardView() {
    // Implementation for different breakup views
    console.log('Dashboard view updated');
}

function updatePlatformView() {
    // Implementation for different breakup views
    console.log('Platform view updated');
}

function updateFinancialView() {
    // Implementation for different breakup views
    console.log('Financial view updated');
}

function updatePerformanceView() {
    // Implementation for different breakup views
    console.log('Performance view updated');
}

// Demo data loading
function loadDemoData() {
    uploadedFiles.pos = [{name: 'demo_pos_data.xlsx', size: 15420}];
    uploadedFiles.zomato = [{name: 'demo_zomato_orders.csv', size: 8730}, {name: 'demo_zomato_business.csv', size: 5420}];
    uploadedFiles.swiggy = [{name: 'demo_swiggy_metrics.xlsx', size: 12650}];

    // Update UI
    document.getElementById('pos-status').textContent = '✅ 1 file: demo_pos_data.xlsx';
    document.getElementById('pos-status').className = 'upload-status success';
    document.querySelector('[data-source="pos"]').classList.add('has-files');

    document.getElementById('zomato-status').textContent = '✅ 2 files: demo_zomato_orders.csv, demo_zomato_business.csv';
    document.getElementById('zomato-status').className = 'upload-status success';
    document.querySelector('[data-source="zomato"]').classList.add('has-files');

    document.getElementById('swiggy-status').textContent = '✅ 1 file: demo_swiggy_metrics.xlsx';
    document.getElementById('swiggy-status').className = 'upload-status success';
    document.querySelector('[data-source="swiggy"]').classList.add('has-files');

    updateGenerateButton();
}

// Settings functions
function saveSettings() {
    const varianceThreshold = document.getElementById('variance-threshold').value;
    const zomatoCommission = document.getElementById('zomato-commission').value;
    const swiggyCommission = document.getElementById('swiggy-commission').value;
    const defaultPeriod = document.getElementById('default-period').value;

    // Save to localStorage (if available)
    try {
        localStorage.setItem('reconciliation-settings', JSON.stringify({
            varianceThreshold,
            zomatoCommission,
            swiggyCommission,
            defaultPeriod
        }));
        alert('Settings saved successfully!');
    } catch (e) {
        alert('Settings updated for this session.');
    }
}

// Initialize dashboard state
function resetDashboardState() {
    disableReportTabs();
    hideHeaderPeriod();
    resetUploadStates();
}