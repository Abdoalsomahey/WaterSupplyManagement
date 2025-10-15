import { 
    api_GetOrders, 
    api_GetOrder, 
    api_PartialUpdateOrder, 
    api_DeleteOrder, 
    api_ExportOrders,
    api_CreateOrder,
    api_GetUsers,
    api_GetCustomers
} from '../apis.js';

let currentOrders = [];
let totalCount = 0;
let currentPage = 1;
const itemsPerPage = 10;
let currentQuery = "";
let currentOrderId = null;
let currentModal = null;
let customers = [];
let drivers = [];

export function initOrders() {
    loadOrders();
    setupEventListeners();
    setupModalEventListeners();
    loadCustomersAndDrivers();
}

async function loadCustomersAndDrivers() {
    try {
        // Load customers
        const customersResponse = await api_GetCustomers();
        if (customersResponse.ok) {
            const customersData = await customersResponse.json();
            customers = customersData.results || customersData;
        }

        // Load drivers (users with driver role)
        const usersResponse = await api_GetUsers();
        if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            drivers = (usersData.results || usersData).filter(user => 
                user.role === 'driver' || user.role === 'Driver'
            );
        }
    } catch (error) {
        console.error('Error loading customers and drivers:', error);
    }
}

async function loadOrders(query = "") {
    try {
        showLoadingState();
        
        const response = await api_GetOrders(query);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentOrders = data.results;
        totalCount = data.count;
        
        updateOrdersTable();
        updatePagination();
        updateOrderCounts();
        updateOrderStats();
        updateFilterOptions();
        
    } catch (error) {
        console.error('Error loading orders:', error);
        showErrorState();
        showToast('Error loading orders. Please try again.', 'error');
    }
}

function updateOrderStats() {
    const totalOrders = currentOrders.length;
    const pendingOrders = currentOrders.filter(order => order.status === 'pending').length;
    const deliveredOrders = currentOrders.filter(order => order.status === 'delivered').length;
    const problemOrders = currentOrders.filter(order => order.status === 'problem').length;

    // Update stats cards
    const totalOrdersCount = document.getElementById('total-orders-count');
    const pendingOrdersCount = document.getElementById('pending-orders-count');
    const deliveredOrdersCount = document.getElementById('delivered-orders-count');
    const problemOrdersCount = document.getElementById('problem-orders-count');

    if (totalOrdersCount) totalOrdersCount.textContent = totalOrders;
    if (pendingOrdersCount) pendingOrdersCount.textContent = pendingOrders;
    if (deliveredOrdersCount) deliveredOrdersCount.textContent = deliveredOrders;
    if (problemOrdersCount) problemOrdersCount.textContent = problemOrders;
}

function updateFilterOptions() {
    // Update customer filter options
    const customerFilter = document.getElementById('customer-filter');
    if (customerFilter) {
        const customerNames = [...new Set(currentOrders.map(order => order.customer?.full_name).filter(Boolean))];
        
        customerFilter.innerHTML = '<option value="">All Customers</option>';
        customerNames.forEach(customerName => {
            customerFilter.innerHTML += `<option value="${customerName}">${customerName}</option>`;
        });
    }

    // Update driver filter options
    const driverFilter = document.getElementById('driver-filter');
    if (driverFilter) {
        const driverUsernames = [...new Set(currentOrders.map(order => order.driver?.username).filter(Boolean))];
        
        driverFilter.innerHTML = '<option value="">All Drivers</option>';
        driverUsernames.forEach(driverUsername => {
            driverFilter.innerHTML += `<option value="${driverUsername}">${driverUsername}</option>`;
        });
    }
}

function updateOrdersTable() {
    const tbody = document.getElementById('orders-table');
    if (!tbody) return;
    
    if (currentOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                    No orders found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = currentOrders.map(order => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input order-checkbox" value="${order.id}">
            </td>
            <td>
                <div class="fw-semibold">${order.id}</div>
            </td>
            <td>
                <div>${order.customer?.full_name || 'N/A'}</div>
                <small class="text-muted">${order.customer?.account_number || ''}</small>
            </td>
            <td>
                <div>${order.driver?.username || 'Unassigned'}</div>
                <small class="text-muted">${order.driver?.first_name || ''} ${order.driver?.last_name || ''}</small>
            </td>
            <td>
                <div class="small">${formatDate(order.created_at)}</div>
            </td>
            <td>
                <div class="small">${formatDate(order.delivery_time)}</div>
            </td>
            <td>
                <div class="small">${order.required_gallons || 0} gallons</div>
            </td>
            <td>
                <div class="small">${order.filled_amount || 0} gallons</div>
            </td>
            <td>
                <span class="status-badge ${order.status}">${order.status}</span>
                ${order.is_late ? '<span class="badge bg-danger ms-1">Late</span>' : ''}
            </td>
            <td>
                <div class="data-table-actions">
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewOrder(${order.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning btn-action" onclick="editOrder(${order.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="showDeleteOrderModal(${order.id})" title="Delete">
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
    if (!pagination) return;
    
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
    const ordersCount = document.getElementById('orders-count');
    const totalOrders = document.getElementById('total-orders');
    
    if (ordersCount) ordersCount.textContent = currentOrders.length;
    if (totalOrders) totalOrders.textContent = totalCount;
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
    const orderingFilter = document.getElementById('ordering-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilter);
    }
    
    if (customerFilter) {
        customerFilter.addEventListener('change', handleFilter);
    }
    
    if (driverFilter) {
        driverFilter.addEventListener('change', handleFilter);
    }
    
    if (orderingFilter) {
        orderingFilter.addEventListener('change', handleFilter);
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
    
    // Bulk export button
    const bulkExportBtn = document.getElementById('bulk-export');
    if (bulkExportBtn) {
        bulkExportBtn.addEventListener('click', handleBulkExport);
    }
    
    // Export button
    const exportBtn = document.getElementById('export-orders');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
    
    // Add order button
    const addOrderBtn = document.getElementById('add-order');
    if (addOrderBtn) {
        addOrderBtn.addEventListener('click', showCreateOrderModal);
    }
    
    // Save edit button
    const saveEditBtn = document.getElementById('saveEditOrder');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', handleSaveEdit);
    }
    
    // Save create button
    const saveCreateBtn = document.getElementById('saveCreateOrder');
    if (saveCreateBtn) {
        saveCreateBtn.addEventListener('click', handleCreateOrder);
    }
    
    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('confirmDeleteOrder');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', handleDeleteOrder);
    }
}

function setupModalEventListeners() {
    // Setup modal event listeners for proper focus management
    const modals = ['viewOrderModal', 'editOrderModal', 'deleteOrderModal', 'createOrderModal'];
    
    modals.forEach(modalId => {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            modalElement.addEventListener('shown.bs.modal', function () {
                currentModal = modalElement;
                // Set focus to the first focusable element in the modal
                const focusableElements = modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            });
            
            modalElement.addEventListener('hidden.bs.modal', function () {
                currentModal = null;
                // Remove the backdrop if it persists
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => backdrop.remove());
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            });
        }
    });
}

function buildQueryString() {
    const params = new URLSearchParams();
    
    // Pagination
    params.append('page', currentPage);
    params.append('page_size', itemsPerPage);
    
    // Search
    const searchInput = document.getElementById('order-search');
    if (searchInput && searchInput.value) {
        params.append('search', searchInput.value);
    }
    
    // Filters - تطابق مع filterset_fields في OrderViewSet
    const statusFilter = document.getElementById('status-filter');
    const customerFilter = document.getElementById('customer-filter');
    const driverFilter = document.getElementById('driver-filter');
    const orderingFilter = document.getElementById('ordering-filter');
    
    if (statusFilter && statusFilter.value) {
        params.append('status', statusFilter.value);
    }
    
    if (customerFilter && customerFilter.value) {
        params.append('customer__full_name', customerFilter.value);
    }
    
    if (driverFilter && driverFilter.value) {
        params.append('driver__username', driverFilter.value);
    }
    
    // Ordering - تطابق مع ordering_fields في OrderViewSet
    if (orderingFilter && orderingFilter.value) {
        params.append('ordering', orderingFilter.value);
    }
    
    return `?${params.toString()}`;
}

function buildExportQueryString() {
    const params = new URLSearchParams();
    
    // Search
    const searchInput = document.getElementById('order-search');
    if (searchInput && searchInput.value) {
        params.append('search', searchInput.value);
    }
    
    // Filters - نفس الفلاتر المستخدمة في العرض
    const statusFilter = document.getElementById('status-filter');
    const customerFilter = document.getElementById('customer-filter');
    const driverFilter = document.getElementById('driver-filter');
    const orderingFilter = document.getElementById('ordering-filter');
    
    if (statusFilter && statusFilter.value) {
        params.append('status', statusFilter.value);
    }
    
    if (customerFilter && customerFilter.value) {
        params.append('customer__full_name', customerFilter.value);
    }
    
    if (driverFilter && driverFilter.value) {
        params.append('driver__username', driverFilter.value);
    }
    
    // Ordering
    if (orderingFilter && orderingFilter.value) {
        params.append('ordering', orderingFilter.value);
    }
    
    return params.toString() ? `?${params.toString()}` : '';
}

function handleSearch(e) {
    currentQuery = buildQueryString();
    currentPage = 1;
    loadOrders(currentQuery);
}

function handleFilter() {
    currentQuery = buildQueryString();
    currentPage = 1;
    loadOrders(currentQuery);
}

function clearFilters() {
    const searchInput = document.getElementById('order-search');
    const statusFilter = document.getElementById('status-filter');
    const customerFilter = document.getElementById('customer-filter');
    const driverFilter = document.getElementById('driver-filter');
    const orderingFilter = document.getElementById('ordering-filter');
    
    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    if (customerFilter) customerFilter.value = '';
    if (driverFilter) driverFilter.value = '';
    if (orderingFilter) orderingFilter.value = '-created_at';
    
    currentQuery = buildQueryString();
    currentPage = 1;
    loadOrders(currentQuery);
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
    
    if (bulkActions) {
        if (checkedBoxes.length > 0) {
            bulkActions.style.display = 'flex';
        } else {
            bulkActions.style.display = 'none';
        }
    }
}

function handleBulkExport() {
    const checkedBoxes = document.querySelectorAll('.order-checkbox:checked');
    const orderIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (orderIds.length === 0) {
        showToast('Please select orders to export', 'warning');
        return;
    }
    
    const queryParams = orderIds.map(id => `id=${id}`).join('&');
    const query = `?${queryParams}`;
    handleExport(query);
}

async function handleExport() {
    try {
        const exportQuery = buildExportQueryString();
        
        const response = await api_ExportOrders(exportQuery);
        if (!response.ok) {
            throw new Error(`Export failed! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `orders_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        showToast('Orders exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting orders:', error);
        showToast('Error exporting orders: ' + error.message, 'error');
    }
}

// Create Order Functions
function showCreateOrderModal() {
    const modalBody = document.getElementById('createOrderModalBody');
    if (!modalBody) {
        console.error('Create modal body not found');
        return;
    }
    
    // Populate customer dropdown
    const customerSelect = document.getElementById('createCustomer');
    if (customerSelect) {
        customerSelect.innerHTML = '<option value="">Select Customer</option>';
        customers.forEach(customer => {
            customerSelect.innerHTML += `<option value="${customer.full_name}">${customer.full_name}</option>`;
        });
    }
    
    // Populate driver dropdown
    const driverSelect = document.getElementById('createDriver');
    if (driverSelect) {
        driverSelect.innerHTML = '<option value="">Select Driver</option>';
        drivers.forEach(driver => {
            driverSelect.innerHTML += `<option value="${driver.username}">${driver.username}</option>`;
        });
    }
    
    // Set default delivery time to current time + 1 hour
    const deliveryTimeInput = document.getElementById('createDeliveryTime');
    if (deliveryTimeInput) {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        deliveryTimeInput.value = formatDateTimeLocal(now.toISOString());
    }
    
    const modalElement = document.getElementById('createOrderModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
        });
        modal.show();
    } else {
        console.error('Create modal element not found');
    }
}


async function handleCreateOrder() {
    try {
        const form = document.getElementById('createOrderForm');
        if (!form) {
            throw new Error('Create form not found');
        }
        
        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const data = {
            customer_name: formData.get('customer'),
            driver_username: formData.get('driver'),
            delivery_time: new Date(formData.get('delivery_time')).toISOString(),
            required_gallons: parseInt(formData.get('required_gallons')),
            customer_location: formData.get('customer_location') || ''
        };
        
        const response = await api_CreateOrder(data);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP error! status: ${response.status}. ${JSON.stringify(errorData)}`);
        }
        
        // Close modal and refresh data
        const modalElement = document.getElementById('createOrderModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        
        // Reset form
        form.reset();
        
        loadOrders(currentQuery);
        showToast('Order created successfully', 'success');
        
    } catch (error) {
        console.error('Error creating order:', error);
        showToast('Error creating order: ' + error.message, 'error');
    }
}

// View Order Function
window.viewOrder = async function(orderId) {
    try {
        const response = await api_GetOrder(orderId);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const order = await response.json();
        showViewModal(order);
        showToast('Order details loaded successfully', 'success');
        
    } catch (error) {
        console.error('Error viewing order:', error);
        showToast('Error loading order details', 'error');
    }
};

function showViewModal(order) {
    const modalBody = document.getElementById('viewOrderModalBody');
    if (!modalBody) {
        console.error('View modal body not found');
        return;
    }
    
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Order Information</h6>
                <table class="table table-sm">
                    <tr>
                        <td><strong>ID:</strong></td>
                        <td>${order.id}</td>
                    </tr>
                    <tr>
                        <td><strong>Status:</strong></td>
                        <td><span class="status-badge ${order.status}">${order.status}</span></td>
                    </tr>
                    <tr>
                        <td><strong>Created At:</strong></td>
                        <td>${formatDateTime(order.created_at)}</td>
                    </tr>
                    <tr>
                        <td><strong>Confirmed At:</strong></td>
                        <td>${order.confirmed_at ? formatDateTime(order.confirmed_at) : 'Not confirmed'}</td>
                    </tr>
                    <tr>
                        <td><strong>Delivery Time:</strong></td>
                        <td>${formatDateTime(order.delivery_time)}</td>
                    </tr>
                    <tr>
                        <td><strong>Required Gallons:</strong></td>
                        <td>${order.required_gallons || 0}</td>
                    </tr>
                    <tr>
                        <td><strong>Filled Amount:</strong></td>
                        <td>${order.filled_amount || 0}</td>
                    </tr>
                    <tr>
                        <td><strong>Is Late:</strong></td>
                        <td>${order.is_late ? 'Yes' : 'No'}</td>
                    </tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6>Customer Information</h6>
                <table class="table table-sm">
                    <tr>
                        <td><strong>Name:</strong></td>
                        <td>${order.customer?.full_name || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Account Number:</strong></td>
                        <td>${order.customer?.account_number || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Phone:</strong></td>
                        <td>${order.customer?.phone || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Area:</strong></td>
                        <td>${order.customer?.area || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Zone Number:</strong></td>
                        <td>${order.customer?.zone_number || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Plot Number:</strong></td>
                        <td>${order.customer?.plot_number || 'N/A'}</td>
                    </tr>
                </table>
            </div>
        </div>
        ${order.driver ? `
        <div class="row mt-3">
            <div class="col-12">
                <h6>Driver Information</h6>
                <table class="table table-sm">
                    <tr>
                        <td><strong>Username:</strong></td>
                        <td>${order.driver.username}</td>
                    </tr>
                    <tr>
                        <td><strong>Name:</strong></td>
                        <td>${order.driver.first_name} ${order.driver.last_name}</td>
                    </tr>
                    <tr>
                        <td><strong>Email:</strong></td>
                        <td>${order.driver.email}</td>
                    </tr>
                    <tr>
                        <td><strong>Phone:</strong></td>
                        <td>${order.driver.phone || 'N/A'}</td>
                    </tr>
                </table>
            </div>
        </div>
        ` : ''}
        ${order.problem_reason ? `
        <div class="row mt-3">
            <div class="col-12">
                <h6>Problem Information</h6>
                <p><strong>Reason:</strong> ${order.problem_reason}</p>
            </div>
        </div>
        ` : ''}
        ${order.proof_image ? `
        <div class="row mt-3">
            <div class="col-12">
                <h6>Proof Image</h6>
                <img src="${order.proof_image}" alt="Proof Image" class="img-fluid" style="max-height: 200px;">
            </div>
        </div>
        ` : ''}
    `;

    const modalElement = document.getElementById('viewOrderModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
        });
        modal.show();
    } else {
        console.error('View modal element not found');
    }
}

// Edit Order Function
window.editOrder = async function(orderId) {
    try {
        const response = await api_GetOrder(orderId);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const order = await response.json();
        showEditModal(order);
        showToast('Order loaded for editing', 'success');
        
    } catch (error) {
        console.error('Error loading order for edit:', error);
        showToast('Error loading order details', 'error');
    }
};

function showEditModal(order) {
    currentOrderId = order.id;
    const modalBody = document.getElementById('editOrderModalBody');
    if (!modalBody) {
        console.error('Edit modal body not found');
        return;
    }
    
    modalBody.innerHTML = `
        <form id="editOrderForm">
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="editStatus" class="form-label">Status</label>
                        <select class="form-select" id="editStatus" name="status">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="problem" ${order.status === 'problem' ? 'selected' : ''}>Problem</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="editFilledAmount" class="form-label">Filled Amount</label>
                        <input type="number" class="form-control" id="editFilledAmount" name="filled_amount" value="${order.filled_amount || 0}" step="0.1">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="editRequiredGallons" class="form-label">Required Gallons</label>
                        <input type="number" class="form-control" id="editRequiredGallons" name="required_gallons" value="${order.required_gallons || 0}" step="0.1">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="editDeliveryTime" class="form-label">Delivery Time</label>
                        <input type="datetime-local" class="form-control" id="editDeliveryTime" name="delivery_time" value="${formatDateTimeLocal(order.delivery_time)}">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="mb-3">
                        <label for="editProblemReason" class="form-label">Problem Reason</label>
                        <textarea class="form-control" id="editProblemReason" name="problem_reason" rows="3">${order.problem_reason || ''}</textarea>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="mb-3">
                        <label for="editCustomerLocation" class="form-label">Customer Location</label>
                        <input type="text" class="form-control" id="editCustomerLocation" name="customer_location" value="${order.customer_location || ''}">
                    </div>
                </div>
            </div>
        </form>
    `;

    const modalElement = document.getElementById('editOrderModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
        });
        modal.show();
    } else {
        console.error('Edit modal element not found');
    }
}

async function handleSaveEdit() {
    if (!currentOrderId) return;
    
    try {
        const form = document.getElementById('editOrderForm');
        if (!form) {
            throw new Error('Edit form not found');
        }
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Convert numeric fields
        if (data.filled_amount) data.filled_amount = parseFloat(data.filled_amount);
        if (data.required_gallons) data.required_gallons = parseFloat(data.required_gallons);
        
        const response = await api_PartialUpdateOrder(currentOrderId, data);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Close modal and refresh data
        const modalElement = document.getElementById('editOrderModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        
        loadOrders(currentQuery);
        showToast('Order updated successfully', 'success');
        
    } catch (error) {
        console.error('Error updating order:', error);
        showToast('Error updating order', 'error');
    }
}

// Delete Order Function
window.showDeleteOrderModal = function(orderId) {
    currentOrderId = orderId;
    const order = currentOrders.find(o => o.id === orderId);
    
    if (order) {
        const modalBody = document.getElementById('deleteOrderModalBody');
        if (modalBody) {
            modalBody.innerHTML = `Are you sure you want to delete order #${orderId} for customer "${order.customer?.full_name || 'Unknown'}"?`;
            
            const modalElement = document.getElementById('deleteOrderModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement, {
                    backdrop: 'static',
                    keyboard: false
                });
                modal.show();
            } else {
                console.error('Delete modal element not found');
            }
        } else {
            console.error('Delete modal body not found');
        }
    } else {
        console.error('Order not found with ID:', orderId);
    }
};

async function handleDeleteOrder() {
    if (!currentOrderId) return;
    
    try {
        const response = await api_DeleteOrder(currentOrderId);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Close modal and refresh data
        const modalElement = document.getElementById('deleteOrderModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        
        loadOrders(currentQuery);
        showToast('Order deleted successfully', 'success');
        
    } catch (error) {
        console.error('Error deleting order:', error);
        showToast('Error deleting order', 'error');
    }
}

// Pagination
window.changePage = function(page) {
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        currentQuery = buildQueryString();
        loadOrders(currentQuery);
    }
};

function showLoadingState() {
    const tbody = document.getElementById('orders-table');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-4">
                    <div class="spinner-border spinner-border-sm me-2"></div>
                    Loading orders...
                </td>
            </tr>
        `;
    }
}

function showErrorState() {
    const tbody = document.getElementById('orders-table');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-4">
                    <i class="bi bi-exclamation-triangle fs-1 mb-3 d-block text-danger"></i>
                    Error loading orders. Please try again.
                </td>
            </tr>
        `;
    }
}

// Toast notification function
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
        <div id="${toastId}" class="toast align-items-center text-white bg-${getToastBgColor(type)} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${getToastIcon(type)} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { 
        autohide: true, 
        delay: type === 'error' ? 5000 : 3000 
    });
    
    toast.show();

    // Remove toast from DOM after it hides
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}

function getToastBgColor(type) {
    const colors = {
        success: 'success',
        error: 'danger',
        warning: 'warning',
        info: 'info'
    };
    return colors[type] || 'info';
}

function getToastIcon(type) {
    const icons = {
        success: 'bi-check-circle',
        error: 'bi-exclamation-triangle',
        warning: 'bi-exclamation-triangle',
        info: 'bi-info-circle'
    };
    return icons[type] || 'bi-info-circle';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateTimeLocal(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
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

// Add CSS fix for modal backdrop issue
const style = document.createElement('style');
style.textContent = `
    .modal-backdrop {
        z-index: 1040 !important;
    }
    .modal {
        z-index: 1050 !important;
    }
    .modal-open {
        overflow: hidden;
        padding-right: 0 !important;
    }
    
    .status-badge {
        padding: 0.35em 0.65em;
        font-size: 0.75em;
        font-weight: 600;
        border-radius: 0.375rem;
    }
    
    .status-badge.pending {
        background-color: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
    }
    
    .status-badge.delivered {
        background-color: #d1edff;
        color: #0c5460;
        border: 1px solid #bee5eb;
    }
    
    .status-badge.problem {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
`;
document.head.appendChild(style);