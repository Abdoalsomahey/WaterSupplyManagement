import { 
    api_GetCustomers, 
    api_CreateCustomer, 
    api_GetCustomer, 
    api_UpdateCustomer, 
    api_PartialUpdateCustomer, 
    api_DeleteCustomer, 
    api_ExportCustomers,
    api_GetUsers 
} from '../apis.js';

let currentCustomers = [];
let currentPage = 1;
const itemsPerPage = 10;
let totalCount = 0;
let currentQueryParams = new URLSearchParams();
let customerToDelete = null;

// CSS fix for aria-hidden issue and stats cards
const style = document.createElement('style');
style.textContent = `
    .modal.fade { 
        background: rgba(0,0,0,0.5); 
    }
    .modal-backdrop {
        z-index: 1040;
    }
    .modal {
        z-index: 1050;
    }
    .toast-container {
        z-index: 1060;
    }
    .stats-card {
        border: none;
        border-radius: 12px;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }
    .stats-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .stats-card .card-title {
        font-size: 0.9rem;
        font-weight: 600;
        opacity: 0.9;
    }
    .stats-card h2 {
        font-weight: 700;
        font-size: 2rem;
    }
    .stats-card small {
        font-size: 0.75rem;
    }
    .stats-icon {
        opacity: 0.8;
    }
    .stats-card.bg-primary {
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
    }
    .stats-card.bg-success {
        background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%) !important;
    }
    .stats-card.bg-warning {
        background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%) !important;
    }
    .stats-card.bg-info {
        background: linear-gradient(135deg, #17a2b8 0%, #138496 100%) !important;
    }
`;
document.head.appendChild(style);

export function initCustomers() {
    loadCustomers();
    setupEventListeners();
}

async function loadCustomers(queryParams = '') {
    try {
        showLoadingState();
        
        const response = await api_GetCustomers(queryParams);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentCustomers = data.results;
        totalCount = data.count;
        currentQueryParams = new URLSearchParams(queryParams);
        
        updateCustomersTable();
        updatePagination();
        updateCustomerCounts();
        updateStatsCards(currentCustomers);
        
    } catch (error) {
        console.error('Error loading customers:', error);
        showErrorState('Failed to load customers');
        showToast('Failed to load customers', 'error');
    }
}

function updateCustomersTable() {
    const tbody = document.getElementById('customers-table');
    
    if (currentCustomers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="13" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                    No customers found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = currentCustomers.map(customer => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input customer-checkbox" value="${customer.id}">
            </td>
            <td>
                <div class="fw-semibold">${customer.full_name || 'N/A'}</div>
                <small class="text-muted">ID: ${customer.id}</small>
            </td>
            <td>${customer.driver || 'N/A'}</td>
            <td>${customer.area || 'N/A'}</td>
            <td>${customer.zone_number || 'N/A'}</td>
            <td>${customer.plot_number || 'N/A'}</td>
            <td>${customer.property_type || 'N/A'}</td>
            <td>
                <div class="small">${customer.account_number || 'N/A'}</div>
                <div class="small text-muted">${customer.phone || 'N/A'}</div>
            </td>
            <td>${formatTime(customer.delivery_time)}</td>
            <td>${customer.delivery_days ? customer.delivery_days.join(', ') : 'N/A'}</td>
            <td>${formatDate(customer.starting_date)}</td>
            <td>${formatDateTime(customer.registration_date)}</td>
            <td>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewCustomer(${customer.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning btn-action" onclick="editCustomer(${customer.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="showDeleteConfirmation(${customer.id})" title="Delete">
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
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    
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
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
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
    document.getElementById('customers-count').textContent = currentCustomers.length;
    document.getElementById('total-customers').textContent = totalCount;
}

function updateStatsCards(customers) {
    // إجمالي العملاء
    document.getElementById('total-customers-card').textContent = customers.length;
    
    // العملاء النشطين هذا الشهر (بناءً على registration_date)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const activeThisMonth = customers.filter(customer => {
        if (!customer.registration_date) return false;
        const customerDate = new Date(customer.registration_date);
        return customerDate.getMonth() === currentMonth && customerDate.getFullYear() === currentYear;
    }).length;
    document.getElementById('active-customers-card').textContent = activeThisMonth;
    
    // العملاء مع عداد
    const withMeter = customers.filter(customer => !customer.agreement_without_meter).length;
    document.getElementById('with-meter-card').textContent = withMeter;
    
    // العملاء بدون عداد
    const withoutMeter = customers.filter(customer => customer.agreement_without_meter).length;
    document.getElementById('without-meter-card').textContent = withoutMeter;
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 500));
    }
    
    // Filter functionality
    const areaFilter = document.getElementById('area-filter');
    const zoneFilter = document.getElementById('zone-filter');
    const plotFilter = document.getElementById('plot-filter');
    const propertyTypeFilter = document.getElementById('property-type-filter');
    const accountFilter = document.getElementById('account-filter');
    const agreementFilter = document.getElementById('agreement-filter');
    
    if (areaFilter) areaFilter.addEventListener('change', handleFilter);
    if (zoneFilter) zoneFilter.addEventListener('change', handleFilter);
    if (plotFilter) plotFilter.addEventListener('change', handleFilter);
    if (propertyTypeFilter) propertyTypeFilter.addEventListener('change', handleFilter);
    if (accountFilter) accountFilter.addEventListener('change', handleFilter);
    if (agreementFilter) agreementFilter.addEventListener('change', handleFilter);
    
    // Ordering functionality
    const orderingSelect = document.getElementById('ordering-select');
    if (orderingSelect) {
        orderingSelect.addEventListener('change', handleOrdering);
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
    if (bulkExportBtn) {
        bulkExportBtn.addEventListener('click', handleBulkExport);
    }
    
    // Export button
    const exportBtn = document.getElementById('export-customers');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => handleExport());
    }
    
    // Add customer button
    const addCustomerBtn = document.getElementById('add-customer');
    if (addCustomerBtn) {
        addCustomerBtn.addEventListener('click', showAddCustomerModal);
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.trim();
    currentQueryParams.set('search', searchTerm);
    if (!searchTerm) currentQueryParams.delete('search');
    
    currentPage = 1;
    currentQueryParams.set('page', '1');
    loadCustomers('?' + currentQueryParams.toString());
}

function handleFilter() {
    // Update filters in query params
    const areaFilter = document.getElementById('area-filter').value;
    const zoneFilter = document.getElementById('zone-filter').value;
    const plotFilter = document.getElementById('plot-filter').value;
    const propertyTypeFilter = document.getElementById('property-type-filter').value;
    const accountFilter = document.getElementById('account-filter').value;
    const agreementFilter = document.getElementById('agreement-filter').value;
    
    if (areaFilter) currentQueryParams.set('area', areaFilter);
    else currentQueryParams.delete('area');
    
    if (zoneFilter) currentQueryParams.set('zone_number', zoneFilter);
    else currentQueryParams.delete('zone_number');
    
    if (plotFilter) currentQueryParams.set('plot_number', plotFilter);
    else currentQueryParams.delete('plot_number');
    
    if (propertyTypeFilter) currentQueryParams.set('property_type', propertyTypeFilter);
    else currentQueryParams.delete('property_type');
    
    if (accountFilter) currentQueryParams.set('account_number', accountFilter);
    else currentQueryParams.delete('account_number');
    
    if (agreementFilter) {
        currentQueryParams.set('agreement_without_meter', agreementFilter === 'without');
    } else {
        currentQueryParams.delete('agreement_without_meter');
    }
    
    currentPage = 1;
    currentQueryParams.set('page', '1');
    loadCustomers('?' + currentQueryParams.toString());
}

function handleOrdering(e) {
    const orderingValue = e.target.value;
    
    if (orderingValue) {
        currentQueryParams.set('ordering', orderingValue);
    } else {
        currentQueryParams.delete('ordering');
    }
    
    currentPage = 1;
    currentQueryParams.set('page', '1');
    loadCustomers('?' + currentQueryParams.toString());
}

function clearFilters() {
    // Clear all input fields
    document.getElementById('customer-search').value = '';
    document.getElementById('area-filter').value = '';
    document.getElementById('zone-filter').value = '';
    document.getElementById('plot-filter').value = '';
    document.getElementById('property-type-filter').value = '';
    document.getElementById('account-filter').value = '';
    document.getElementById('agreement-filter').value = '';
    document.getElementById('ordering-select').value = '';
    
    // Reset query params
    currentQueryParams = new URLSearchParams();
    currentPage = 1;
    
    loadCustomers('');
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

async function handleBulkExport() {
    const checkedBoxes = document.querySelectorAll('.customer-checkbox:checked');
    const customerIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (customerIds.length === 0) {
        showToast('Please select customers to export', 'warning');
        return;
    }
    
    const queryParams = customerIds.map(id => `id=${id}`).join('&');
    const query = `?${queryParams}`;
    handleExport(query);
}

async function handleExport(customQuery = '') {
    try {
        const exportQuery = customQuery || buildExportQueryString();
        
        const response = await api_ExportCustomers(exportQuery);
        if (!response.ok) {
            throw new Error(`Export failed! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `customers_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showToast('Customers exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting customers:', error);
        showToast('Error exporting customers: ' + error.message, 'error');
    }
}

function buildExportQueryString() {
    const queryParams = new URLSearchParams(currentQueryParams);
    
    // إزالة معلمات التصفية غير الضرورية للتصدير
    queryParams.delete('page');
    queryParams.delete('ordering');
    
    return queryParams.toString() ? `?${queryParams.toString()}` : '';
}

async function showAddCustomerModal() {
    try {
        // Fetch drivers for dropdown
        const driversResponse = await api_GetUsers('?role=driver');
        if (!driversResponse.ok) {
            throw new Error('Failed to fetch drivers');
        }
        
        const driversData = await driversResponse.json();
        const drivers = driversData.results || [];
        
        const modalHTML = `
            <div class="modal fade" id="addCustomerModal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Add New Customer</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addCustomerForm">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Full Name *</label>
                                        <input type="text" class="form-control" name="full_name" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Driver</label>
                                        <select class="form-select" name="driver_username">
                                            <option value="">Select Driver</option>
                                            ${drivers.map(driver => 
                                                `<option value="${driver.username}">${driver.full_name || driver.username}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Area</label>
                                        <input type="text" class="form-control" name="area">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Zone Number</label>
                                        <input type="text" class="form-control" name="zone_number">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Plot Number</label>
                                        <input type="text" class="form-control" name="plot_number">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Property Type</label>
                                        <input type="text" class="form-control" name="property_type">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Account Number</label>
                                        <input type="text" class="form-control" name="account_number">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Phone</label>
                                        <input type="text" class="form-control" name="phone">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Delivery Time</label>
                                        <input type="time" class="form-control" name="delivery_time">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Starting Date</label>
                                        <input type="date" class="form-control" name="starting_date">
                                    </div>
                                    <div class="col-md-12">
                                        <label class="form-label">Delivery Days</label>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" name="delivery_days" value="Monday">
                                            <label class="form-check-label">Mon</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" name="delivery_days" value="Tuesday">
                                            <label class="form-check-label">Tue</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" name="delivery_days" value="Wednesday">
                                            <label class="form-check-label">Wed</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" name="delivery_days" value="Thursday">
                                            <label class="form-check-label">Thu</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" name="delivery_days" value="Friday">
                                            <label class="form-check-label">Fri</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" name="delivery_days" value="Saturday">
                                            <label class="form-check-label">Sat</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" name="delivery_days" value="Sunday">
                                            <label class="form-check-label">Sun</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="agreement_without_meter">
                                            <label class="form-check-label">Agreement Without Meter</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Weekly Trips</label>
                                        <input type="number" class="form-control" name="weekly_trips">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Gallons</label>
                                        <input type="number" class="form-control" name="gallons">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Filling Stations</label>
                                        <input type="text" class="form-control" name="filling_stations">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Location Link</label>
                                        <input type="url" class="form-control" name="location_link">
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="submitCustomerForm()">Save Customer</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('addCustomerModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modalElement = document.getElementById('addCustomerModal');
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
        });
        
        modalElement.addEventListener('shown.bs.modal', function() {
            this.removeAttribute('aria-hidden');
            this.setAttribute('aria-modal', 'true');
        });
        
        modalElement.addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
        
        modal.show();
        
    } catch (error) {
        console.error('Error showing add customer modal:', error);
        showToast('Error loading customer form', 'error');
    }
}

// Delete Confirmation Modal
function showDeleteConfirmationModal(customer) {
    customerToDelete = customer;
    
    const modalHTML = `
        <div class="modal fade" id="deleteCustomerModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">Confirm Delete</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center">
                            <i class="bi bi-exclamation-triangle text-warning fs-1 mb-3 d-block"></i>
                            <h6>Are you sure you want to delete this customer?</h6>
                            <p class="text-muted">
                                <strong>${customer.full_name}</strong><br>
                                ID: ${customer.id} | Phone: ${customer.phone || 'N/A'}
                            </p>
                            <p class="text-danger small">
                                <i class="bi bi-info-circle me-1"></i>
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" onclick="confirmDeleteCustomer()">
                            <i class="bi bi-trash me-1"></i>Delete Customer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('deleteCustomerModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalElement = document.getElementById('deleteCustomerModal');
    const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
    });
    
    modalElement.addEventListener('shown.bs.modal', function() {
        this.removeAttribute('aria-hidden');
        this.setAttribute('aria-modal', 'true');
    });
    
    modalElement.addEventListener('hidden.bs.modal', function() {
        this.remove();
        customerToDelete = null;
    });
    
    modal.show();
}

// View Customer Modal
function showViewCustomerModal(customer) {
    const modalHTML = `
        <div class="modal fade" id="viewCustomerModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">View Customer - ${customer.full_name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Full Name</label>
                                <p class="form-control-plaintext">${customer.full_name || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Driver</label>
                                <p class="form-control-plaintext">${customer.driver || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Area</label>
                                <p class="form-control-plaintext">${customer.area || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Zone Number</label>
                                <p class="form-control-plaintext">${customer.zone_number || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Plot Number</label>
                                <p class="form-control-plaintext">${customer.plot_number || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Property Type</label>
                                <p class="form-control-plaintext">${customer.property_type || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Account Number</label>
                                <p class="form-control-plaintext">${customer.account_number || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Phone</label>
                                <p class="form-control-plaintext">${customer.phone || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Delivery Time</label>
                                <p class="form-control-plaintext">${formatTime(customer.delivery_time)}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Starting Date</label>
                                <p class="form-control-plaintext">${formatDate(customer.starting_date)}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Registration Date</label>
                                <p class="form-control-plaintext">${formatDateTime(customer.registration_date)}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Agreement Type</label>
                                <p class="form-control-plaintext">${customer.agreement_without_meter ? 'Without Meter' : 'With Meter'}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Weekly Trips</label>
                                <p class="form-control-plaintext">${customer.weekly_trips || 0}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Gallons</label>
                                <p class="form-control-plaintext">${customer.gallons || 0}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Filling Stations</label>
                                <p class="form-control-plaintext">${customer.filling_stations || 'N/A'}</p>
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-bold">Delivery Days</label>
                                <p class="form-control-plaintext">${customer.delivery_days ? customer.delivery_days.join(', ') : 'N/A'}</p>
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-bold">Location Link</label>
                                <p class="form-control-plaintext">
                                    ${customer.location_link ? 
                                        `<a href="${customer.location_link}" target="_blank">${customer.location_link}</a>` : 
                                        'N/A'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('viewCustomerModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalElement = document.getElementById('viewCustomerModal');
    const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
    });
    
    modalElement.addEventListener('shown.bs.modal', function() {
        this.removeAttribute('aria-hidden');
        this.setAttribute('aria-modal', 'true');
    });
    
    modalElement.addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
    
    modal.show();
}

// Edit Customer Modal
async function showEditCustomerModal(customer) {
    try {
        // Fetch drivers for dropdown
        const driversResponse = await api_GetUsers('?role=driver');
        if (!driversResponse.ok) {
            throw new Error('Failed to fetch drivers');
        }
        
        const driversData = await driversResponse.json();
        const drivers = driversData.results || [];
        
        const modalHTML = `
            <div class="modal fade" id="editCustomerModal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Customer - ${customer.full_name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editCustomerForm">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Full Name *</label>
                                        <input type="text" class="form-control" name="full_name" value="${customer.full_name || ''}" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Driver</label>
                                        <select class="form-select" name="driver_username">
                                            <option value="">Select Driver</option>
                                            ${drivers.map(driver => 
                                                `<option value="${driver.username}" ${customer.driver === driver.username ? 'selected' : ''}>
                                                    ${driver.full_name || driver.username}
                                                </option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Area</label>
                                        <input type="text" class="form-control" name="area" value="${customer.area || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Zone Number</label>
                                        <input type="text" class="form-control" name="zone_number" value="${customer.zone_number || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Plot Number</label>
                                        <input type="text" class="form-control" name="plot_number" value="${customer.plot_number || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Property Type</label>
                                        <input type="text" class="form-control" name="property_type" value="${customer.property_type || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Account Number</label>
                                        <input type="text" class="form-control" name="account_number" value="${customer.account_number || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Phone</label>
                                        <input type="text" class="form-control" name="phone" value="${customer.phone || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Delivery Time</label>
                                        <input type="time" class="form-control" name="delivery_time" value="${formatTimeForInput(customer.delivery_time)}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Starting Date</label>
                                        <input type="date" class="form-control" name="starting_date" value="${customer.starting_date || ''}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Registration Date</label>
                                        <input type="datetime-local" class="form-control" name="registration_date" value="${formatDateTimeForInput(customer.registration_date)}" readonly>
                                        <small class="form-text text-muted">Registration date is automatically set and cannot be modified</small>
                                    </div>
                                    <div class="col-md-12">
                                        <label class="form-label">Delivery Days</label>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" name="delivery_days" value="Monday" ${customer.delivery_days?.includes('Monday') ? 'checked' : ''}>
                                            <label class="form-check-label">Mon</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" name="delivery_days" value="Tuesday" ${customer.delivery_days?.includes('Tuesday') ? 'checked' : ''}>
                                            <label class="form-check-label">Tue</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" name="delivery_days" value="Wednesday" ${customer.delivery_days?.includes('Wednesday') ? 'checked' : ''}>
                                            <label class="form-check-label">Wed</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" name="delivery_days" value="Thursday" ${customer.delivery_days?.includes('Thursday') ? 'checked' : ''}>
                                            <label class="form-check-label">Thu</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" name="delivery_days" value="Friday" ${customer.delivery_days?.includes('Friday') ? 'checked' : ''}>
                                            <label class="form-check-label">Fri</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" name="delivery_days" value="Saturday" ${customer.delivery_days?.includes('Saturday') ? 'checked' : ''}>
                                            <label class="form-check-label">Sat</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="checkbox" name="delivery_days" value="Sunday" ${customer.delivery_days?.includes('Sunday') ? 'checked' : ''}>
                                            <label class="form-check-label">Sun</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="agreement_without_meter" ${customer.agreement_without_meter ? 'checked' : ''}>
                                            <label class="form-check-label">Agreement Without Meter</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Weekly Trips</label>
                                        <input type="number" class="form-control" name="weekly_trips" value="${customer.weekly_trips || 0}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Gallons</label>
                                        <input type="number" class="form-control" name="gallons" value="${customer.gallons || 0}">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Filling Stations</label>
                                        <input type="text" class="form-control" name="filling_stations" value="${customer.filling_stations || ''}">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Location Link</label>
                                        <input type="url" class="form-control" name="location_link" value="${customer.location_link || ''}">
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="updateCustomer(${customer.id})">Update Customer</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('editCustomerModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modalElement = document.getElementById('editCustomerModal');
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
        });
        
        modalElement.addEventListener('shown.bs.modal', function() {
            this.removeAttribute('aria-hidden');
            this.setAttribute('aria-modal', 'true');
        });
        
        modalElement.addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
        
        modal.show();
        
    } catch (error) {
        console.error('Error showing edit customer modal:', error);
        showToast('Error loading customer form for editing', 'error');
    }
}

// Global functions for inline event handlers
window.viewCustomer = async function(customerId) {
    try {
        const response = await api_GetCustomer(customerId);
        if (!response.ok) {
            throw new Error('Failed to fetch customer');
        }
        
        const customer = await response.json();
        showViewCustomerModal(customer);
        showToast(`Viewing customer: ${customer.full_name}`, 'info');
        
    } catch (error) {
        console.error('Error viewing customer:', error);
        showToast('Error loading customer details', 'error');
    }
};

window.editCustomer = async function(customerId) {
    try {
        const response = await api_GetCustomer(customerId);
        if (!response.ok) {
            throw new Error('Failed to fetch customer');
        }
        
        const customer = await response.json();
        showEditCustomerModal(customer);
        showToast(`Editing customer: ${customer.full_name}`, 'info');
        
    } catch (error) {
        console.error('Error editing customer:', error);
        showToast('Error loading customer for editing', 'error');
    }
};

window.showDeleteConfirmation = async function(customerId) {
    try {
        const response = await api_GetCustomer(customerId);
        if (!response.ok) {
            throw new Error('Failed to fetch customer');
        }
        
        const customer = await response.json();
        showDeleteConfirmationModal(customer);
        
    } catch (error) {
        console.error('Error loading customer for deletion:', error);
        showToast('Error loading customer details', 'error');
    }
};

window.confirmDeleteCustomer = async function() {
    if (!customerToDelete) return;
    
    try {
        const response = await api_DeleteCustomer(customerToDelete.id);
        if (!response.ok) {
            throw new Error('Delete failed');
        }
        
        // Close the modal
        const modalElement = document.getElementById('deleteCustomerModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        
        // Reload customers
        loadCustomers('?' + currentQueryParams.toString());
        showToast(`Customer "${customerToDelete.full_name}" deleted successfully`, 'success');
        
    } catch (error) {
        console.error('Error deleting customer:', error);
        showToast('Error deleting customer', 'error');
    }
};

window.changePage = function(page) {
    currentPage = page;
    currentQueryParams.set('page', page.toString());
    loadCustomers('?' + currentQueryParams.toString());
};

window.submitCustomerForm = async function() {
    const form = document.getElementById('addCustomerForm');
    const formData = new FormData(form);
    
    const customerData = {
        full_name: formData.get('full_name'),
        driver_username: formData.get('driver_username') || null,
        area: formData.get('area') || '',
        zone_number: formData.get('zone_number') || '',
        plot_number: formData.get('plot_number') || '',
        property_type: formData.get('property_type') || '',
        account_number: formData.get('account_number') || '',
        phone: formData.get('phone') || '',
        delivery_time: formData.get('delivery_time') || null,
        delivery_days: Array.from(form.querySelectorAll('input[name="delivery_days"]:checked')).map(cb => cb.value),
        starting_date: formData.get('starting_date') || null,
        agreement_without_meter: formData.get('agreement_without_meter') === 'on',
        weekly_trips: parseInt(formData.get('weekly_trips')) || 0,
        gallons: parseInt(formData.get('gallons')) || 0,
        filling_stations: formData.get('filling_stations') || '',
        location_link: formData.get('location_link') || ''
    };
    
    try {
        const response = await api_CreateCustomer(customerData);
        if (!response.ok) {
            throw new Error('Create customer failed');
        }
        
        const modalElement = document.getElementById('addCustomerModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        
        loadCustomers('?' + currentQueryParams.toString());
        showToast('Customer created successfully', 'success');
        
    } catch (error) {
        console.error('Error creating customer:', error);
        showToast('Error creating customer', 'error');
    }
};

window.updateCustomer = async function(customerId) {
    const form = document.getElementById('editCustomerForm');
    const formData = new FormData(form);
    
    const customerData = {
        full_name: formData.get('full_name'),
        driver_username: formData.get('driver_username') || null,
        area: formData.get('area') || '',
        zone_number: formData.get('zone_number') || '',
        plot_number: formData.get('plot_number') || '',
        property_type: formData.get('property_type') || '',
        account_number: formData.get('account_number') || '',
        phone: formData.get('phone') || '',
        delivery_time: formData.get('delivery_time') || null,
        delivery_days: Array.from(form.querySelectorAll('input[name="delivery_days"]:checked')).map(cb => cb.value),
        starting_date: formData.get('starting_date') || null,
        agreement_without_meter: formData.get('agreement_without_meter') === 'on',
        weekly_trips: parseInt(formData.get('weekly_trips')) || 0,
        gallons: parseInt(formData.get('gallons')) || 0,
        filling_stations: formData.get('filling_stations') || '',
        location_link: formData.get('location_link') || ''
    };
    
    try {
        const response = await api_PartialUpdateCustomer(customerId, customerData);
        if (!response.ok) {
            throw new Error('Update customer failed');
        }
        
        const modalElement = document.getElementById('editCustomerModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        
        loadCustomers('?' + currentQueryParams.toString());
        showToast('Customer updated successfully', 'success');
        
    } catch (error) {
        console.error('Error updating customer:', error);
        showToast('Error updating customer', 'error');
    }
};

// Toast function
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${getToastColor(type)} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${getToastIcon(type)} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 4000
    });
    
    toast.show();
    
    // Remove toast from DOM after hide
    toastElement.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

function getToastColor(type) {
    switch (type) {
        case 'success': return 'success';
        case 'error': return 'danger';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'primary';
    }
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'bi-check-circle-fill';
        case 'error': return 'bi-exclamation-triangle-fill';
        case 'warning': return 'bi-exclamation-triangle-fill';
        case 'info': return 'bi-info-circle-fill';
        default: return 'bi-info-circle-fill';
    }
}

function showLoadingState() {
    const tbody = document.getElementById('customers-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="13" class="text-center text-muted py-4">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Loading customers...
            </td>
        </tr>
    `;
}

function showErrorState(message) {
    const tbody = document.getElementById('customers-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="13" class="text-center text-muted py-4">
                <i class="bi bi-exclamation-triangle fs-1 mb-3 d-block text-danger"></i>
                ${message}
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

function formatTime(timeString) {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5); // Extract HH:MM from ISO time
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTimeForInput(timeString) {
    if (!timeString) return '';
    // Convert ISO time to HH:MM format for input[type="time"]
    const time = new Date(`1970-01-01T${timeString}Z`);
    return time.toTimeString().slice(0, 5);
}

function formatDateTimeForInput(dateTimeString) {
    if (!dateTimeString) return '';
    // Convert ISO datetime to local datetime format for input[type="datetime-local"]
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16);
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