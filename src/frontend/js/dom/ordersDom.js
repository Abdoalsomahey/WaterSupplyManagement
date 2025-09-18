import { mockApi_GetOrders, sampleOrders, exportToCSV } from '../apis.js';

let currentOrders = [];
let filteredOrders = [];
let currentPage = 1;
const itemsPerPage = 10;

export function initOrders() {
    loadOrders();
    setupEventListeners();
}

async function loadOrders() {
    try {
        showLoadingState();
        
        const response = await mockApi_GetOrders();
        currentOrders = await response.json();
        filteredOrders = [...currentOrders];
        
        updateOrdersTable();
        updatePagination();
        updateOrderCounts();
        updateOrderStats();
        
    } catch (error) {
        console.error('Error loading orders:', error);
        showErrorState();
    }
}

function updateOrdersTable() {
    const tbody = document.getElementById('orders-table');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageOrders = filteredOrders.slice(startIndex, endIndex);
    
    if (pageOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                    No orders found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pageOrders.map(order => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input order-checkbox" value="${order.id}">
            </td>
            <td>
                <div class="fw-semibold">${order.order_number}</div>
            </td>
            <td>
                <div>${order.customer_name}</div>
            </td>
            <td>
                <div>${order.driver_name || 'Unassigned'}</div>
            </td>
            <td>
                <div class="small">${formatDate(order.date)}</div>
            </td>
            <td>
                <div class="small">${formatDate(order.delivery_date)}</div>
            </td>
            <td>
                <span class="status-badge ${order.status}">${order.status}</span>
            </td>
            <td>
                <div class="fw-semibold">$${order.total_amount.toFixed(2)}</div>
            </td>
            <td>
                <div class="data-table-actions">
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewOrder(${order.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning btn-action" onclick="editOrder(${order.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteOrder(${order.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    updateBulkActionsVisibility();
}

function updatePagination() {
    const pagination = document.getElementById('orders-pagination');
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function updateOrderCounts() {
    document.getElementById('orders-count').textContent = filteredOrders.length;
    document.getElementById('total-orders').textContent = currentOrders.length;
}

function updateOrderStats() {
    const totalOrders = currentOrders.length;
    const deliveredOrders = currentOrders.filter(o => o.status === 'delivered').length;
    const pendingOrders = currentOrders.filter(o => o.status === 'pending').length;
    const cancelledOrders = currentOrders.filter(o => o.status === 'cancelled').length;
    
    document.getElementById('total-orders-count').textContent = totalOrders;
    document.getElementById('delivered-orders-count').textContent = deliveredOrders;
    document.getElementById('pending-orders-count').textContent = pendingOrders;
    document.getElementById('cancelled-orders-count').textContent = cancelledOrders;
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('order-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filter functionality
    const statusFilter = document.getElementById('status-filter');
    const customerFilter = document.getElementById('customer-filter');
    const driverFilter = document.getElementById('driver-filter');
    const dateFilter = document.getElementById('date-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilter);
    }
    
    if (customerFilter) {
        customerFilter.addEventListener('change', handleFilter);
    }
    
    if (driverFilter) {
        driverFilter.addEventListener('change', handleFilter);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', handleFilter);
    }
    
    // Clear filters
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }
    
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }
    
    // Bulk actions
    const bulkAssignDriverBtn = document.getElementById('bulk-assign-driver');
    const bulkExportBtn = document.getElementById('bulk-export');
    const bulkUpdateStatusBtn = document.getElementById('bulk-update-status');
    
    if (bulkAssignDriverBtn) {
        bulkAssignDriverBtn.addEventListener('click', handleBulkAssignDriver);
    }
    
    if (bulkExportBtn) {
        bulkExportBtn.addEventListener('click', handleBulkExport);
    }
    
    if (bulkUpdateStatusBtn) {
        bulkUpdateStatusBtn.addEventListener('click', handleBulkUpdateStatus);
    }
    
    // Export button
    const exportBtn = document.getElementById('export-orders');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
    
    // Add order button
    const addOrderBtn = document.getElementById('add-order');
    if (addOrderBtn) {
        addOrderBtn.addEventListener('click', showAddOrderModal);
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    filteredOrders = currentOrders.filter(order => 
        order.order_number.toLowerCase().includes(searchTerm) ||
        order.customer_name.toLowerCase().includes(searchTerm) ||
        (order.driver_name && order.driver_name.toLowerCase().includes(searchTerm))
    );
    
    currentPage = 1;
    updateOrdersTable();
    updatePagination();
    updateOrderCounts();
}

function handleFilter() {
    const statusFilter = document.getElementById('status-filter').value;
    const customerFilter = document.getElementById('customer-filter').value;
    const driverFilter = document.getElementById('driver-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    
    filteredOrders = currentOrders.filter(order => {
        const statusMatch = !statusFilter || order.status === statusFilter;
        const customerMatch = !customerFilter || order.customer_name === customerFilter;
        const driverMatch = !driverFilter || order.driver_name === driverFilter;
        
        let dateMatch = true;
        if (dateFilter) {
            const orderDate = new Date(order.date).toISOString().split('T')[0];
            dateMatch = orderDate === dateFilter;
        }
        
        return statusMatch && customerMatch && driverMatch && dateMatch;
    });
    
    currentPage = 1;
    updateOrdersTable();
    updatePagination();
    updateOrderCounts();
}

function clearFilters() {
    document.getElementById('order-search').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('customer-filter').value = '';
    document.getElementById('driver-filter').value = '';
    document.getElementById('date-filter').value = '';
    
    filteredOrders = [...currentOrders];
    currentPage = 1;
    updateOrdersTable();
    updatePagination();
    updateOrderCounts();
}

function handleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.order-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
    });
    updateBulkActionsVisibility();
}

function updateBulkActionsVisibility() {
    const checkedBoxes = document.querySelectorAll('.order-checkbox:checked');
    const bulkActions = document.getElementById('bulk-actions');
    
    if (checkedBoxes.length > 0) {
        bulkActions.style.display = 'flex';
    } else {
        bulkActions.style.display = 'none';
    }
}

function handleBulkAssignDriver() {
    const checkedBoxes = document.querySelectorAll('.order-checkbox:checked');
    const orderIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (orderIds.length === 0) {
        showToast('Please select orders to assign driver', 'warning');
        return;
    }
    
    showToast(`Driver assignment functionality for ${orderIds.length} order(s) would be implemented here`, 'info');
}

function handleBulkExport() {
    const checkedBoxes = document.querySelectorAll('.order-checkbox:checked');
    const orderIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (orderIds.length === 0) {
        showToast('Please select orders to export', 'warning');
        return;
    }
    
    const ordersToExport = currentOrders.filter(o => orderIds.includes(o.id));
    const dataToExport = ordersToExport.map(order => ({
        'Order #': order.order_number,
        Customer: order.customer_name,
        Driver: order.driver_name || 'Unassigned',
        Date: formatDate(order.date),
        'Delivery Date': formatDate(order.delivery_date),
        Status: order.status,
        'Total Amount': order.total_amount,
        'Delivery Address': order.delivery_address,
        Notes: order.notes
    }));
    
    exportToCSV(dataToExport, 'selected_orders');
    showToast(`Exported ${orderIds.length} order(s)`, 'success');
}

function handleBulkUpdateStatus() {
    const checkedBoxes = document.querySelectorAll('.order-checkbox:checked');
    const orderIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (orderIds.length === 0) {
        showToast('Please select orders to update status', 'warning');
        return;
    }
    
    showToast(`Status update functionality for ${orderIds.length} order(s) would be implemented here`, 'info');
}

function handleExport() {
    const dataToExport = filteredOrders.map(order => ({
        'Order #': order.order_number,
        Customer: order.customer_name,
        Driver: order.driver_name || 'Unassigned',
        Date: formatDate(order.date),
        'Delivery Date': formatDate(order.delivery_date),
        Status: order.status,
        'Total Amount': order.total_amount,
        'Delivery Address': order.delivery_address,
        Notes: order.notes
    }));
    
    exportToCSV(dataToExport, 'orders');
    showToast('Orders exported successfully', 'success');
}

function showAddOrderModal() {
    showToast('Add order functionality would be implemented here', 'info');
}

// Global functions for inline event handlers
window.viewOrder = function(orderId) {
    const order = currentOrders.find(o => o.id === orderId);
    if (order) {
        showToast(`Viewing order: ${order.order_number}`, 'info');
    }
};

window.editOrder = function(orderId) {
    const order = currentOrders.find(o => o.id === orderId);
    if (order) {
        showToast(`Editing order: ${order.order_number}`, 'info');
    }
};

window.deleteOrder = function(orderId) {
    const order = currentOrders.find(o => o.id === orderId);
    if (order && confirm(`Are you sure you want to delete order: ${order.order_number}?`)) {
        currentOrders = currentOrders.filter(o => o.id !== orderId);
        filteredOrders = filteredOrders.filter(o => o.id !== orderId);
        updateOrdersTable();
        updatePagination();
        updateOrderCounts();
        updateOrderStats();
        showToast('Order deleted successfully', 'success');
    }
};

window.changePage = function(page) {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateOrdersTable();
        updatePagination();
    }
};

function showLoadingState() {
    const tbody = document.getElementById('orders-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="9" class="text-center text-muted py-4">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Loading orders...
            </td>
        </tr>
    `;
}

function showErrorState() {
    const tbody = document.getElementById('orders-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="9" class="text-center text-muted py-4">
                <i class="bi bi-exclamation-triangle fs-1 mb-3 d-block text-danger"></i>
                Error loading orders. Please try again.
            </td>
        </tr>
    `;
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

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type === 'success' ? 'bg-success' : type === 'warning' ? 'bg-warning' : type === 'error' ? 'bg-danger' : 'bg-info'} text-white`;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}
