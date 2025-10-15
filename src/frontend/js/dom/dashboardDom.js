import { 
    api_RefreshDashboard, 
    api_GetDashboardChartData, 
    api_GetDashboardRecentOrders, 
    api_GetDashboardRecentInvoices, 
    api_GetDashboardAlerts,
    api_ExportDashboardExcel
} from '../apis.js';
import { navigateTo } from '../spa.js';

export function initDashboard() {
    loadDashboardData();
    setupEventListeners();
}

async function loadDashboardData() {
    try {
        // Show loading state
        showLoadingState();
        
        // Load all dashboard data concurrently
        const [summaryResponse, chartResponse, ordersResponse, invoicesResponse, alertsResponse] = await Promise.all([
            api_RefreshDashboard(),
            api_GetDashboardChartData("7d"),
            api_GetDashboardRecentOrders(),
            api_GetDashboardRecentInvoices(),
            api_GetDashboardAlerts()
        ]);

        // Check if all responses are ok
        if (!summaryResponse.ok || !chartResponse.ok || !ordersResponse.ok || !invoicesResponse.ok || !alertsResponse.ok) {
            throw new Error('Failed to load dashboard data');
        }

        // Parse responses
        const summaryData = await summaryResponse.json();
        const chartData = await chartResponse.json();
        const recentOrders = await ordersResponse.json();
        const recentInvoices = await invoicesResponse.json();
        const alertsData = await alertsResponse.json();

        // Update all dashboard components
        updateKPICards(summaryData);
        updateRecentOrdersTable(recentOrders);
        updateRecentInvoicesTable(recentInvoices);
        updateQuickStats(summaryData);
        createOrdersChart(chartData);
        updateAlerts(alertsData);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showErrorState();
    }
}

function updateKPICards(summaryData) {
    // Total Orders
    document.getElementById('total-orders').textContent = summaryData.orders_count.toLocaleString();
    
    // Pending Orders
    document.getElementById('pending-orders').textContent = summaryData.orders_pending.toLocaleString();
    
    // Total Revenue (using invoices_total)
    document.getElementById('total-revenue').textContent = `$${parseFloat(summaryData.invoices_total || 0).toLocaleString()}`;
    
    // Active Customers (using new_customers)
    document.getElementById('active-customers').textContent = summaryData.new_customers.toLocaleString();
    
    // Remove change indicators since they're not in the API
    document.querySelectorAll('.kpi-change').forEach(el => {
        el.style.display = 'none';
    });
}

function updateRecentOrdersTable(orders) {
    const tbody = document.getElementById('recent-orders-table');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                    No recent orders found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>#${order.id}</strong></td>
            <td>${order.customer || 'N/A'}</td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
            <td>${order.amount ? `$${parseFloat(order.amount).toFixed(2)}` : 'N/A'}</td>
            <td>${formatDate(order.date)}</td>
        </tr>
    `).join('');
}

function updateRecentInvoicesTable(invoices) {
    const tbody = document.getElementById('recent-invoices-table');
    
    if (!invoices || invoices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                    No recent invoices found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = invoices.map(invoice => `
        <tr>
            <td><strong>#${invoice.id}</strong></td>
            <td>${invoice.customer || 'N/A'}</td>
            <td><span class="status-badge ${invoice.status}">${invoice.status}</span></td>
            <td>${invoice.amount ? `$${parseFloat(invoice.amount).toFixed(2)}` : 'N/A'}</td>
            <td>${formatDate(invoice.date)}</td>
        </tr>
    `).join('');
}

function updateQuickStats(summaryData) {
    // Update elements with data from summary
    document.getElementById('today-orders').textContent = summaryData.today_orders || 0;
    document.getElementById('today-revenue').textContent = `$${parseFloat(summaryData.today_revenue || 0).toFixed(0)}`;
    document.getElementById('avg-order-value').textContent = `$${parseFloat(summaryData.avg_order_value || 0).toFixed(0)}`;
    document.getElementById('conversion-rate').textContent = parseFloat(summaryData.conversion_rate || 0).toFixed(1);
}

function updateAlerts(alertsData) {
    const container = document.getElementById('alerts-container');
    
    container.innerHTML = `
        <div class="col-md-4 mb-3">
            <div class="alert alert-warning d-flex align-items-center" role="alert">
                <i class="bi bi-clock me-2"></i>
                <div>
                    <strong>${alertsData.pending_orders} Pending Orders</strong><br>
                    <small>Orders waiting for processing</small>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-3">
            <div class="alert alert-danger d-flex align-items-center" role="alert">
                <i class="bi bi-credit-card me-2"></i>
                <div>
                    <strong>${alertsData.overdue_invoices} Overdue Invoices</strong><br>
                    <small>Invoices requiring attention</small>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-3">
            <div class="alert alert-info d-flex align-items-center" role="alert">
                <i class="bi bi-chat-dots me-2"></i>
                <div>
                    <strong>${alertsData.new_complaints} New Complaints</strong><br>
                    <small>Customer complaints to review</small>
                </div>
            </div>
        </div>
    `;
}

function createOrdersChart(chartData) {
    const container = document.getElementById('orders-chart');
    
    if (!chartData.orders || chartData.orders.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">
                <i class="bi bi-bar-chart fs-1 mb-3"></i>
                <p>No chart data available</p>
            </div>
        `;
        return;
    }
    
    // Create a simple SVG chart
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '250');
    svg.setAttribute('viewBox', '0 0 800 250');
    
    // Chart dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;
    
    // Find max values for scaling
    const maxOrders = Math.max(...chartData.orders.map(d => d.count));
    
    // Create bars for orders
    chartData.orders.forEach((d, i) => {
        const x = margin.left + (i * (width / chartData.orders.length)) + 10;
        const barWidth = (width / chartData.orders.length) - 20;
        const barHeight = (d.count / maxOrders) * height * 0.8;
        const y = margin.top + height - barHeight;
        
        // Order bars (blue)
        const orderBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        orderBar.setAttribute('x', x);
        orderBar.setAttribute('y', y);
        orderBar.setAttribute('width', barWidth);
        orderBar.setAttribute('height', barHeight);
        orderBar.setAttribute('fill', '#0d6efd');
        orderBar.setAttribute('opacity', '0.7');
        svg.appendChild(orderBar);
        
        // Date labels
        const dateLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dateLabel.setAttribute('x', x + barWidth / 2);
        dateLabel.setAttribute('y', margin.top + height + 20);
        dateLabel.setAttribute('text-anchor', 'middle');
        dateLabel.setAttribute('font-size', '10');
        dateLabel.setAttribute('fill', '#6c757d');
        dateLabel.textContent = new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        svg.appendChild(dateLabel);
        
        // Value labels
        const valueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valueLabel.setAttribute('x', x + barWidth / 2);
        valueLabel.setAttribute('y', y - 5);
        valueLabel.setAttribute('text-anchor', 'middle');
        valueLabel.setAttribute('font-size', '10');
        valueLabel.setAttribute('fill', '#495057');
        valueLabel.textContent = d.count;
        svg.appendChild(valueLabel);
    });
    
    // Add Y-axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', margin.left);
    yAxis.setAttribute('y1', margin.top);
    yAxis.setAttribute('x2', margin.left);
    yAxis.setAttribute('y2', margin.top + height);
    yAxis.setAttribute('stroke', '#dee2e6');
    yAxis.setAttribute('stroke-width', '1');
    svg.appendChild(yAxis);
    
    // Add X-axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', margin.left);
    xAxis.setAttribute('y1', margin.top + height);
    xAxis.setAttribute('x2', margin.left + width);
    xAxis.setAttribute('y2', margin.top + height);
    xAxis.setAttribute('stroke', '#dee2e6');
    xAxis.setAttribute('stroke-width', '1');
    svg.appendChild(xAxis);
    
    // Add legend
    const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const ordersLegend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const ordersRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ordersRect.setAttribute('x', margin.left + width - 120);
    ordersRect.setAttribute('y', margin.top + 10);
    ordersRect.setAttribute('width', '12');
    ordersRect.setAttribute('height', '12');
    ordersRect.setAttribute('fill', '#0d6efd');
    ordersLegend.appendChild(ordersRect);
    
    const ordersText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    ordersText.setAttribute('x', margin.left + width - 100);
    ordersText.setAttribute('y', margin.top + 20);
    ordersText.setAttribute('font-size', '12');
    ordersText.setAttribute('fill', '#495057');
    ordersText.textContent = 'Orders';
    ordersLegend.appendChild(ordersText);
    
    legend.appendChild(ordersLegend);
    svg.appendChild(legend);
    
    container.innerHTML = '';
    container.appendChild(svg);
}

function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-dashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadDashboardData();
        });
    }
    
    // Chart period buttons
    const chartPeriods = document.querySelectorAll('input[name="chart-period"]');
    chartPeriods.forEach(radio => {
        radio.addEventListener('change', async (e) => {
            try {
                const period = e.target.value;
                const response = await api_GetDashboardChartData(period);
                
                if (response.ok) {
                    const chartData = await response.json();
                    createOrdersChart(chartData);
                }
            } catch (error) {
                console.error('Error loading chart data:', error);
            }
        });
    });
    
    // Export Excel button
    const exportBtn = document.getElementById('export-excel');
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            try {
                const response = await api_ExportDashboardExcel();
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'dashboard-export.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }
            } catch (error) {
                console.error('Error exporting Excel:', error);
            }
        });
    }
    
    // View All buttons for navigation
    setupNavigationButtons();
}

function setupNavigationButtons() {
    // View All Orders button
    const viewOrdersBtn = document.querySelector('a[data-route="/orders/"]');
    if (viewOrdersBtn) {
        viewOrdersBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/orders/');
        });
    }
    
    // View All Invoices button
    const viewInvoicesBtn = document.querySelector('a[data-route="/invoices/"]');
    if (viewInvoicesBtn) {
        viewInvoicesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/invoices/');
        });
    }
}

function showLoadingState() {
    // Show loading spinners in KPI cards
    document.querySelectorAll('.kpi-value').forEach(el => {
        el.textContent = '-';
    });
    
    document.querySelectorAll('.kpi-change span').forEach(el => {
        el.textContent = 'Loading...';
    });
}

function showErrorState() {
    // Show error state
    document.querySelectorAll('.kpi-value').forEach(el => {
        el.textContent = 'Error';
    });
    
    document.querySelectorAll('.kpi-change span').forEach(el => {
        el.textContent = 'Failed to load';
    });
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}