import { mockApi_GetDashboardData, sampleDashboardData } from '../apis.js';

export function initDashboard() {
    loadDashboardData();
    setupEventListeners();
}

async function loadDashboardData() {
    try {
        // Show loading state
        showLoadingState();
        
        // Load dashboard data
        const response = await mockApi_GetDashboardData();
        const data = await response.json();
        
        // Update KPI cards
        updateKPICards(data.kpis);
        
        // Update recent orders table
        updateRecentOrdersTable(data.recent_orders);
        
        // Update recent invoices table
        updateRecentInvoicesTable(data.recent_invoices);
        
        // Update quick stats
        updateQuickStats(data);
        
        // Create chart
        createOrdersChart(data.chart_data.orders_over_time);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showErrorState();
    }
}

function updateKPICards(kpis) {
    // Total Orders
    document.getElementById('total-orders').textContent = kpis.total_orders.value.toLocaleString();
    updateKPIChange('orders-change', kpis.total_orders.change, kpis.total_orders.trend);
    
    // Total Revenue
    document.getElementById('total-revenue').textContent = `$${kpis.total_revenue.value.toLocaleString()}`;
    updateKPIChange('revenue-change', kpis.total_revenue.change, kpis.total_revenue.trend);
    
    // Active Customers
    document.getElementById('active-customers').textContent = kpis.active_customers.value.toLocaleString();
    updateKPIChange('customers-change', kpis.active_customers.change, kpis.active_customers.trend);
    
    // Pending Orders
    document.getElementById('pending-orders').textContent = kpis.pending_orders.value.toLocaleString();
    updateKPIChange('pending-change', kpis.pending_orders.change, kpis.pending_orders.trend);
}

function updateKPIChange(elementId, change, trend) {
    const element = document.getElementById(elementId);
    const icon = element.querySelector('i');
    const span = element.querySelector('span');
    
    // Update icon based on trend
    if (trend === 'up') {
        icon.className = 'bi bi-arrow-up';
        element.className = 'kpi-change positive';
    } else {
        icon.className = 'bi bi-arrow-down';
        element.className = 'kpi-change negative';
    }
    
    // Update change text
    span.textContent = `${Math.abs(change)}% from last period`;
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
            <td><strong>${order.order_number}</strong></td>
            <td>${order.customer_name}</td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
            <td>$${order.total_amount.toFixed(2)}</td>
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
            <td><strong>${invoice.invoice_number}</strong></td>
            <td>${invoice.customer_name}</td>
            <td><span class="status-badge ${invoice.status}">${invoice.status}</span></td>
            <td>$${invoice.total.toFixed(2)}</td>
            <td>${formatDate(invoice.date)}</td>
        </tr>
    `).join('');
}

function updateQuickStats(data) {
    // Calculate today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = data.recent_orders.filter(order => 
        order.date.startsWith(today)
    ).length;
    
    const todayRevenue = data.recent_orders
        .filter(order => order.date.startsWith(today))
        .reduce((sum, order) => sum + order.total_amount, 0);
    
    const avgOrderValue = data.recent_orders.length > 0 
        ? data.recent_orders.reduce((sum, order) => sum + order.total_amount, 0) / data.recent_orders.length
        : 0;
    
    const conversionRate = data.kpis.active_customers.value > 0 
        ? (data.kpis.total_orders.value / data.kpis.active_customers.value).toFixed(1)
        : 0;
    
    // Update elements
    document.getElementById('today-orders').textContent = todayOrders;
    document.getElementById('today-revenue').textContent = `$${todayRevenue.toFixed(0)}`;
    document.getElementById('avg-order-value').textContent = `$${avgOrderValue.toFixed(0)}`;
    document.getElementById('conversion-rate').textContent = conversionRate;
}

function createOrdersChart(chartData) {
    const container = document.getElementById('orders-chart');
    
    if (!chartData || chartData.length === 0) {
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
    const maxOrders = Math.max(...chartData.map(d => d.orders));
    const maxRevenue = Math.max(...chartData.map(d => d.revenue));
    
    // Create bars for orders
    chartData.forEach((d, i) => {
        const x = margin.left + (i * (width / chartData.length)) + 10;
        const barWidth = (width / chartData.length) - 20;
        const barHeight = (d.orders / maxOrders) * height * 0.4;
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
        
        // Revenue bars (green)
        const revenueBarHeight = (d.revenue / maxRevenue) * height * 0.4;
        const revenueY = margin.top + height - revenueBarHeight - barHeight - 5;
        
        const revenueBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        revenueBar.setAttribute('x', x);
        revenueBar.setAttribute('y', revenueY);
        revenueBar.setAttribute('width', barWidth);
        revenueBar.setAttribute('height', revenueBarHeight);
        revenueBar.setAttribute('fill', '#198754');
        revenueBar.setAttribute('opacity', '0.7');
        svg.appendChild(revenueBar);
        
        // Date labels
        const dateLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dateLabel.setAttribute('x', x + barWidth / 2);
        dateLabel.setAttribute('y', margin.top + height + 20);
        dateLabel.setAttribute('text-anchor', 'middle');
        dateLabel.setAttribute('font-size', '10');
        dateLabel.setAttribute('fill', '#6c757d');
        dateLabel.textContent = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        svg.appendChild(dateLabel);
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
    
    const revenueLegend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const revenueRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    revenueRect.setAttribute('x', margin.left + width - 120);
    revenueRect.setAttribute('y', margin.top + 30);
    revenueRect.setAttribute('width', '12');
    revenueRect.setAttribute('height', '12');
    revenueRect.setAttribute('fill', '#198754');
    revenueLegend.appendChild(revenueRect);
    
    const revenueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    revenueText.setAttribute('x', margin.left + width - 100);
    revenueText.setAttribute('y', margin.top + 40);
    revenueText.setAttribute('font-size', '12');
    revenueText.setAttribute('fill', '#495057');
    revenueText.textContent = 'Revenue';
    revenueLegend.appendChild(revenueText);
    
    legend.appendChild(ordersLegend);
    legend.appendChild(revenueLegend);
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
        radio.addEventListener('change', (e) => {
            // In a real app, this would filter the chart data
            console.log('Chart period changed to:', e.target.value);
        });
    });
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
