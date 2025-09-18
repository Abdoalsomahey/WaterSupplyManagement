import { mockApi_GetCustomers, sampleCustomers, exportToCSV } from '../apis.js';

let currentCustomers = [];
let filteredCustomers = [];
let currentPage = 1;
const itemsPerPage = 10;

export function initCustomers() {
    loadCustomers();
    setupEventListeners();
}

async function loadCustomers() {
    try {
        showLoadingState();
        
        const response = await mockApi_GetCustomers();
        currentCustomers = await response.json();
        filteredCustomers = [...currentCustomers];
        
        updateCustomersTable();
        updatePagination();
        updateCustomerCounts();
        
    } catch (error) {
        console.error('Error loading customers:', error);
        showErrorState();
    }
}

function updateCustomersTable() {
    const tbody = document.getElementById('customers-table');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageCustomers = filteredCustomers.slice(startIndex, endIndex);
    
    if (pageCustomers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                    No customers found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pageCustomers.map(customer => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input customer-checkbox" value="${customer.id}">
            </td>
            <td>
                <div>
                    <div class="fw-semibold">${customer.name}</div>
                    <small class="text-muted">ID: ${customer.id}</small>
                </div>
            </td>
            <td>
                <div>
                    <div class="fw-medium">${customer.contact_person}</div>
                </div>
            </td>
            <td>
                <div>
                    <div class="small">${customer.email}</div>
                    <div class="small text-muted">${customer.phone}</div>
                </div>
            </td>
            <td>
                <span class="badge bg-${getOrderVolumeColor(customer.orders_count)}">${customer.orders_count}</span>
            </td>
            <td>
                <div class="fw-semibold">$${customer.total_spent.toFixed(2)}</div>
            </td>
            <td>
                <span class="status-badge ${customer.status}">${customer.status}</span>
            </td>
            <td>
                <div class="small">${formatDate(customer.last_order)}</div>
            </td>
            <td>
                <div class="data-table-actions">
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewCustomer(${customer.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning btn-action" onclick="editCustomer(${customer.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteCustomer(${customer.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    updateBulkActionsVisibility();
}

function updatePagination() {
    const pagination = document.getElementById('customers-pagination');
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    
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

function updateCustomerCounts() {
    document.getElementById('customers-count').textContent = filteredCustomers.length;
    document.getElementById('total-customers').textContent = currentCustomers.length;
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filter functionality
    const statusFilter = document.getElementById('status-filter');
    const ordersFilter = document.getElementById('orders-filter');
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilter);
    }
    
    if (ordersFilter) {
        ordersFilter.addEventListener('change', handleFilter);
    }
    
    if (dateFrom) {
        dateFrom.addEventListener('change', handleFilter);
    }
    
    if (dateTo) {
        dateTo.addEventListener('change', handleFilter);
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
    const bulkExportBtn = document.getElementById('bulk-export');
    const bulkEmailBtn = document.getElementById('bulk-email');
    
    if (bulkExportBtn) {
        bulkExportBtn.addEventListener('click', handleBulkExport);
    }
    
    if (bulkEmailBtn) {
        bulkEmailBtn.addEventListener('click', handleBulkEmail);
    }
    
    // Export button
    const exportBtn = document.getElementById('export-customers');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
    
    // Add customer button
    const addCustomerBtn = document.getElementById('add-customer');
    if (addCustomerBtn) {
        addCustomerBtn.addEventListener('click', showAddCustomerModal);
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    filteredCustomers = currentCustomers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.contact_person.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm)
    );
    
    currentPage = 1;
    updateCustomersTable();
    updatePagination();
    updateCustomerCounts();
    updateActiveFilters();
}

function handleFilter() {
    const statusFilter = document.getElementById('status-filter').value;
    const ordersFilter = document.getElementById('orders-filter').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    
    filteredCustomers = currentCustomers.filter(customer => {
        const statusMatch = !statusFilter || customer.status === statusFilter;
        
        let ordersMatch = true;
        if (ordersFilter) {
            const orderCount = customer.orders_count;
            switch (ordersFilter) {
                case 'high': ordersMatch = orderCount >= 15; break;
                case 'medium': ordersMatch = orderCount >= 5 && orderCount < 15; break;
                case 'low': ordersMatch = orderCount < 5; break;
            }
        }
        
        let dateMatch = true;
        if (dateFrom || dateTo) {
            const customerDate = new Date(customer.created_at);
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                dateMatch = dateMatch && customerDate >= fromDate;
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                dateMatch = dateMatch && customerDate <= toDate;
            }
        }
        
        return statusMatch && ordersMatch && dateMatch;
    });
    
    currentPage = 1;
    updateCustomersTable();
    updatePagination();
    updateCustomerCounts();
    updateActiveFilters();
}

function updateActiveFilters() {
    const activeFiltersContainer = document.getElementById('active-filters');
    const filters = [];
    
    const statusFilter = document.getElementById('status-filter').value;
    const ordersFilter = document.getElementById('orders-filter').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    
    if (statusFilter) {
        filters.push({ type: 'status', value: statusFilter, label: `Status: ${statusFilter}` });
    }
    
    if (ordersFilter) {
        filters.push({ type: 'orders', value: ordersFilter, label: `Orders: ${ordersFilter}` });
    }
    
    if (dateFrom) {
        filters.push({ type: 'dateFrom', value: dateFrom, label: `From: ${dateFrom}` });
    }
    
    if (dateTo) {
        filters.push({ type: 'dateTo', value: dateTo, label: `To: ${dateTo}` });
    }
    
    if (filters.length === 0) {
        activeFiltersContainer.innerHTML = '';
        return;
    }
    
    activeFiltersContainer.innerHTML = filters.map(filter => `
        <div class="filter-tag">
            ${filter.label}
            <button type="button" class="btn-close" onclick="removeFilter('${filter.type}')"></button>
        </div>
    `).join('');
}

function clearFilters() {
    document.getElementById('customer-search').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('orders-filter').value = '';
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    
    filteredCustomers = [...currentCustomers];
    currentPage = 1;
    updateCustomersTable();
    updatePagination();
    updateCustomerCounts();
    updateActiveFilters();
}

function handleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.customer-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
    });
    updateBulkActionsVisibility();
}

function updateBulkActionsVisibility() {
    const checkedBoxes = document.querySelectorAll('.customer-checkbox:checked');
    const bulkActions = document.getElementById('bulk-actions');
    
    if (checkedBoxes.length > 0) {
        bulkActions.style.display = 'flex';
    } else {
        bulkActions.style.display = 'none';
    }
}

function handleBulkExport() {
    const checkedBoxes = document.querySelectorAll('.customer-checkbox:checked');
    const customerIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (customerIds.length === 0) {
        showToast('Please select customers to export', 'warning');
        return;
    }
    
    const customersToExport = currentCustomers.filter(c => customerIds.includes(c.id));
    const dataToExport = customersToExport.map(customer => ({
        ID: customer.id,
        Name: customer.name,
        'Contact Person': customer.contact_person,
        Email: customer.email,
        Phone: customer.phone,
        Address: customer.address,
        'Orders Count': customer.orders_count,
        'Total Spent': customer.total_spent,
        Status: customer.status,
        'Created At': formatDate(customer.created_at),
        'Last Order': formatDate(customer.last_order)
    }));
    
    exportToCSV(dataToExport, 'selected_customers');
    showToast(`Exported ${customerIds.length} customer(s)`, 'success');
}

function handleBulkEmail() {
    const checkedBoxes = document.querySelectorAll('.customer-checkbox:checked');
    const customerIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (customerIds.length === 0) {
        showToast('Please select customers to send email', 'warning');
        return;
    }
    
    showToast(`Email functionality for ${customerIds.length} customer(s) would be implemented here`, 'info');
}

function handleExport() {
    const dataToExport = filteredCustomers.map(customer => ({
        ID: customer.id,
        Name: customer.name,
        'Contact Person': customer.contact_person,
        Email: customer.email,
        Phone: customer.phone,
        Address: customer.address,
        'Orders Count': customer.orders_count,
        'Total Spent': customer.total_spent,
        Status: customer.status,
        'Created At': formatDate(customer.created_at),
        'Last Order': formatDate(customer.last_order)
    }));
    
    exportToCSV(dataToExport, 'customers');
    showToast('Customers exported successfully', 'success');
}

function showAddCustomerModal() {
    showToast('Add customer functionality would be implemented here', 'info');
}

// Global functions for inline event handlers
window.viewCustomer = function(customerId) {
    const customer = currentCustomers.find(c => c.id === customerId);
    if (customer) {
        showToast(`Viewing customer: ${customer.name}`, 'info');
    }
};

window.editCustomer = function(customerId) {
    const customer = currentCustomers.find(c => c.id === customerId);
    if (customer) {
        showToast(`Editing customer: ${customer.name}`, 'info');
    }
};

window.deleteCustomer = function(customerId) {
    const customer = currentCustomers.find(c => c.id === customerId);
    if (customer && confirm(`Are you sure you want to delete customer: ${customer.name}?`)) {
        currentCustomers = currentCustomers.filter(c => c.id !== customerId);
        filteredCustomers = filteredCustomers.filter(c => c.id !== customerId);
        updateCustomersTable();
        updatePagination();
        updateCustomerCounts();
        showToast('Customer deleted successfully', 'success');
    }
};

window.changePage = function(page) {
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateCustomersTable();
        updatePagination();
    }
};

window.removeFilter = function(filterType) {
    switch (filterType) {
        case 'status':
            document.getElementById('status-filter').value = '';
            break;
        case 'orders':
            document.getElementById('orders-filter').value = '';
            break;
        case 'dateFrom':
            document.getElementById('date-from').value = '';
            break;
        case 'dateTo':
            document.getElementById('date-to').value = '';
            break;
    }
    handleFilter();
};

function getOrderVolumeColor(orderCount) {
    if (orderCount >= 15) return 'success';
    if (orderCount >= 5) return 'warning';
    return 'secondary';
}

function showLoadingState() {
    const tbody = document.getElementById('customers-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="9" class="text-center text-muted py-4">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Loading customers...
            </td>
        </tr>
    `;
}

function showErrorState() {
    const tbody = document.getElementById('customers-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="9" class="text-center text-muted py-4">
                <i class="bi bi-exclamation-triangle fs-1 mb-3 d-block text-danger"></i>
                Error loading customers. Please try again.
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
