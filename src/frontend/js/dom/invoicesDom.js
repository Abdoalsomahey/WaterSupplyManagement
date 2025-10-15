import { 
    api_GetRechecks, 
    api_GetRecheck, 
    api_CreateRecheck,
    api_PatchRecheck, 
    api_DeleteRecheck, 
    api_SendRecheckToAccountant,
    api_GetUsers,
    api_GetCustomers,
    api_ExportRechecksExcel
} from '../apis.js';

let currentRechecks = [];
let currentPage = 1;
const itemsPerPage = 10;
let totalCount = 0;
let currentQuery = "";

export function initInvoices() {
    loadRechecks();
    setupEventListeners();
    loadAccountantsForFilter();
    loadCustomersForNewModal();
    loadAccountantsForNewModal();
}

async function loadRechecks(query = "") {
    try {
        showLoadingState();
        
        const response = await api_GetRechecks(query);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentRechecks = data.results;
        totalCount = data.count;
        currentQuery = query;
        
        updateRechecksTable();
        updatePagination();
        updateRecheckCounts();
        updateRecheckStats();
        
    } catch (error) {
        console.error('Error loading rechecks:', error);
        showErrorState();
        showToast('Error loading rechecks', 'error');
    }
}

function updateRechecksTable() {
    const tbody = document.getElementById('invoices-table');
    if (!tbody) {
        console.error('invoices-table element not found');
        return;
    }
    
    if (currentRechecks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                    No rechecks found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = currentRechecks.map(recheck => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input invoice-checkbox" value="${recheck.id}">
            </td>
            <td>
                <div class="fw-semibold">${recheck.id}</div>
            </td>
            <td>
                <div class="fw-semibold">${recheck.customer?.full_name || 'N/A'}</div>
                <div class="small text-muted">${recheck.customer?.phone || ''}</div>
            </td>
            <td>
                <div class="small">${formatDate(recheck.period_start)}</div>
            </td>
            <td>
                <div class="small">${formatDate(recheck.period_end)}</div>
            </td>
            <td>
                <div class="fw-semibold">${recheck.total_trips}</div>
            </td>
            <td>
                <div class="fw-semibold">${recheck.total_gallons}</div>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(recheck.status)}">${recheck.status}</span>
            </td>
            <td>
                <div class="small">${recheck.assigned_to ? `${recheck.assigned_to.first_name} ${recheck.assigned_to.last_name}` : 'Not assigned'}</div>
            </td>
            <td>
                <div class="small">${formatDateTime(recheck.created_at)}</div>
            </td>
            <td>
                <div class="data-table-actions">
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewRecheck(${recheck.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning btn-action" onclick="editRecheck(${recheck.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info btn-action" onclick="sendRecheck(${recheck.id})" title="Send to Accountant">
                        <i class="bi bi-send"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="showDeleteModal(${recheck.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    updateBulkActionsVisibility();
}

// إضافة دالة لتحديث إحصائيات الـ rechecks
function updateRecheckStats() {
    const totalRechecks = currentRechecks.length;
    const draftRechecks = currentRechecks.filter(recheck => recheck.status === 'draft').length;
    const paidRechecks = currentRechecks.filter(recheck => recheck.status === 'paid').length;
    const otherRechecks = totalRechecks - draftRechecks - paidRechecks;
    
    // التحقق من وجود العناصر قبل التحديث
    const totalRechecksElement = document.getElementById('total-rechecks-count');
    const draftRechecksElement = document.getElementById('draft-rechecks-count');
    const paidRechecksElement = document.getElementById('paid-rechecks-count');
    const otherRechecksElement = document.getElementById('other-rechecks-count');
    
    if (totalRechecksElement) totalRechecksElement.textContent = totalRechecks;
    if (draftRechecksElement) draftRechecksElement.textContent = draftRechecks;
    if (paidRechecksElement) paidRechecksElement.textContent = paidRechecks;
    if (otherRechecksElement) otherRechecksElement.textContent = otherRechecks;
}

function getStatusBadgeClass(status) {
    const classes = {
        'draft': 'bg-secondary',
        'sent': 'bg-primary',
        'approved': 'bg-warning',
        'paid': 'bg-success'
    };
    return classes[status] || 'bg-secondary';
}

// New Recheck Function
window.showNewRecheckModal = function() {
    // Reset form
    const newForm = document.getElementById('newRecheckForm');
    if (newForm) newForm.reset();
    
    const vatPercent = document.getElementById('new-vat-percent');
    if (vatPercent) vatPercent.value = '15';
    
    // Show modal
    const modalElement = document.getElementById('newRecheckModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
};

// View Recheck Function
window.viewRecheck = async function(recheckId) {
    try {
        const response = await api_GetRecheck(recheckId);
        if (response.ok) {
            const recheck = await response.json();
            showViewModal(recheck);
            showToast('Recheck details loaded successfully', 'success');
        } else {
            throw new Error('Failed to fetch recheck details');
        }
    } catch (error) {
        console.error('Error viewing recheck:', error);
        showToast('Error loading recheck details', 'error');
    }
};

function showViewModal(recheck) {
    const modalElement = document.getElementById('viewRecheckModal');
    if (!modalElement) return;

    // Populate modal with recheck data
    setElementText('view-id', recheck.id);
    setElementText('view-customer', recheck.customer?.full_name || 'N/A');
    setElementText('view-period-start', formatDate(recheck.period_start));
    setElementText('view-period-end', formatDate(recheck.period_end));
    setElementText('view-total-trips', recheck.total_trips);
    setElementText('view-total-gallons', recheck.total_gallons);
    setElementText('view-price-per-gallon', `$${parseFloat(recheck.price_per_gallon || 0).toFixed(2)}`);
    setElementText('view-subtotal', `$${parseFloat(recheck.subtotal || 0).toFixed(2)}`);
    setElementText('view-vat-percent', `${parseFloat(recheck.vat_percent || 0).toFixed(1)}%`);
    setElementText('view-vat-amount', `$${parseFloat(recheck.vat_amount || 0).toFixed(2)}`);
    setElementText('view-total', `$${parseFloat(recheck.total || 0).toFixed(2)}`);
    
    const statusBadge = document.getElementById('view-status');
    if (statusBadge) {
        statusBadge.textContent = recheck.status;
        statusBadge.className = `badge ${getStatusBadgeClass(recheck.status)}`;
    }
    
    setElementText('view-assigned-to', recheck.assigned_to ? 
        `${recheck.assigned_to.first_name} ${recheck.assigned_to.last_name}` : 'Not assigned');
    setElementText('view-created-at', formatDateTime(recheck.created_at));
    setElementText('view-notes', recheck.notes || 'No notes');
    
    // Show modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// Edit Recheck Function
window.editRecheck = async function(recheckId) {
    try {
        const response = await api_GetRecheck(recheckId);
        if (response.ok) {
            const recheck = await response.json();
            showEditModal(recheck);
            showToast('Recheck loaded for editing', 'info');
        } else {
            throw new Error('Failed to fetch recheck details');
        }
    } catch (error) {
        console.error('Error loading recheck for edit:', error);
        showToast('Error loading recheck for editing', 'error');
    }
};

function showEditModal(recheck) {
    const modalElement = document.getElementById('editRecheckModal');
    if (!modalElement) return;

    // Populate form with recheck data
    setElementValue('edit-id', recheck.id);
    setElementValue('edit-period-start', recheck.period_start);
    setElementValue('edit-period-end', recheck.period_end);
    setElementValue('edit-total-trips', recheck.total_trips);
    setElementValue('edit-total-gallons', recheck.total_gallons);
    setElementValue('edit-status', recheck.status);
    setElementValue('edit-notes', recheck.notes || '');
    setElementText('edit-created-at', formatDateTime(recheck.created_at));
    
    // Load customers and accountants dropdowns
    loadCustomersForEditModal(recheck.customer?.id);
    loadAccountantsForEditModal(recheck.assigned_to?.id);
    
    // Show modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// Send Recheck Function
window.sendRecheck = async function(recheckId) {
    try {
        // Load accountants list
        const accountantsResponse = await api_GetUsers('?role=accountant');
        if (!accountantsResponse.ok) {
            throw new Error('Failed to fetch accountants');
        }
        
        const accountantsData = await accountantsResponse.json();
        const accountants = accountantsData.results || [];
        
        if (accountants.length === 0) {
            showToast('No accountants found', 'warning');
            return;
        }
        
        showSendModal(recheckId, accountants);
    } catch (error) {
        console.error('Error loading accountants:', error);
        showToast('Error loading accountants list', 'error');
    }
};

function showSendModal(recheckId, accountants) {
    const modalElement = document.getElementById('sendRecheckModal');
    if (!modalElement) return;

    // Set recheck ID
    setElementValue('send-recheck-id', recheckId);
    
    // Populate accountants dropdown
    const accountantSelect = document.getElementById('accountant-select');
    if (accountantSelect) {
        accountantSelect.innerHTML = '<option value="">Choose an accountant...</option>';
        
        accountants.forEach(accountant => {
            const option = document.createElement('option');
            option.value = accountant.username;
            option.textContent = `${accountant.first_name} ${accountant.last_name} (${accountant.email})`;
            accountantSelect.appendChild(option);
        });
    }
    
    // Show modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// Delete Recheck Function
window.showDeleteModal = function(recheckId) {
    const modalElement = document.getElementById('deleteRecheckModal');
    if (!modalElement) return;

    setElementValue('delete-recheck-id', recheckId);
    setElementText('delete-recheck-number', recheckId);
    
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
};

// Setup event listeners for modal buttons
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('invoice-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filter functionality
    const statusFilter = document.getElementById('status-filter');
    const assignedToFilter = document.getElementById('assigned-to-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilter);
    }
    
    if (assignedToFilter) {
        assignedToFilter.addEventListener('change', handleFilter);
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
    
    // Export buttons
    const exportExcelBtn = document.getElementById('export-excel');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => handleExport('excel'));
    }
    
    // New recheck button
    const addRecheckBtn = document.getElementById('add-recheck');
    if (addRecheckBtn) {
        addRecheckBtn.addEventListener('click', () => window.showNewRecheckModal());
    }
    
    // Create recheck button
    const createRecheckBtn = document.getElementById('create-recheck-btn');
    if (createRecheckBtn) {
        createRecheckBtn.addEventListener('click', handleCreateRecheck);
    }
    
    // Save recheck button
    const saveRecheckBtn = document.getElementById('save-recheck-btn');
    if (saveRecheckBtn) {
        saveRecheckBtn.addEventListener('click', handleSaveRecheck);
    }
    
    // Confirm send button
    const confirmSendBtn = document.getElementById('confirm-send-btn');
    if (confirmSendBtn) {
        confirmSendBtn.addEventListener('click', handleSendRecheck);
    }
    
    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', handleDeleteRecheck);
    }
}

// Handle Create Recheck
async function handleCreateRecheck() {
    const formData = {
        customer_name: getElementValue('new-customer'),
        accountant_name: getElementValue('new-accountant') || '',
        period_start: getElementValue('new-period-start'),
        period_end: getElementValue('new-period-end'),
        total_trips: parseInt(getElementValue('new-total-trips') || 0),
        total_gallons: parseFloat(getElementValue('new-total-gallons') || 0),
        price_per_gallon: parseFloat(getElementValue('new-price-per-gallon') || 0),
        vat_percent: parseFloat(getElementValue('new-vat-percent') || 15),
        status: getElementValue('new-status'),
        notes: getElementValue('new-notes') || ''
    };
    
    // Validate required fields
    if (!formData.customer_name || !formData.period_start || !formData.period_end) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    try {
        const response = await api_CreateRecheck(formData);
        if (response.ok) {
            // Close modal and refresh data
            const modalElement = document.getElementById('newRecheckModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
            loadRechecks(currentQuery ? `?${currentQuery}` : '');
            showToast('Recheck created successfully', 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create recheck');
        }
    } catch (error) {
        console.error('Error creating recheck:', error);
        showToast(`Error creating recheck: ${error.message}`, 'error');
    }
}

// Handle Save Recheck
async function handleSaveRecheck() {
    const recheckId = getElementValue('edit-id');
    const formData = {
        customer_name: getElementValue('edit-customer'),
        accountant_name: getElementValue('edit-assigned-to') || '',
        period_start: getElementValue('edit-period-start'),
        period_end: getElementValue('edit-period-end'),
        total_trips: parseInt(getElementValue('edit-total-trips') || 0),
        total_gallons: parseFloat(getElementValue('edit-total-gallons') || 0),
        status: getElementValue('edit-status'),
        notes: getElementValue('edit-notes') || ''
    };
    
    try {
        const response = await api_PatchRecheck(recheckId, formData);
        if (response.ok) {
            // Close modal and refresh data
            const modalElement = document.getElementById('editRecheckModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
            loadRechecks(currentQuery ? `?${currentQuery}` : '');
            showToast('Recheck updated successfully', 'success');
        } else {
            throw new Error('Failed to update recheck');
        }
    } catch (error) {
        console.error('Error updating recheck:', error);
        showToast('Error updating recheck', 'error');
    }
}

// Handle Send Recheck
async function handleSendRecheck() {
    const recheckId = getElementValue('send-recheck-id');
    const accountantUsername = getElementValue('accountant-select');
    
    if (!accountantUsername) {
        showToast('Please select an accountant', 'warning');
        return;
    }
    
    try {
        const sendResponse = await api_SendRecheckToAccountant(recheckId, accountantUsername);
        if (sendResponse.ok) {
            // Close modal and refresh data
            const modalElement = document.getElementById('sendRecheckModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
            loadRechecks(currentQuery ? `?${currentQuery}` : '');
            showToast('Recheck sent to accountant successfully', 'success');
        } else {
            throw new Error('Failed to send recheck');
        }
    } catch (error) {
        console.error('Error sending recheck:', error);
        showToast('Error sending recheck to accountant', 'error');
    }
}

// Handle Delete Recheck
async function handleDeleteRecheck() {
    const recheckId = getElementValue('delete-recheck-id');
    
    try {
        const response = await api_DeleteRecheck(recheckId);
        if (response.ok) {
            // Close modal and refresh data
            const modalElement = document.getElementById('deleteRecheckModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
            loadRechecks(currentQuery ? `?${currentQuery}` : '');
            showToast('Recheck deleted successfully', 'success');
        } else {
            throw new Error('Failed to delete recheck');
        }
    } catch (error) {
        console.error('Error deleting recheck:', error);
        showToast('Error deleting recheck', 'error');
    }
}

// Helper functions for safe DOM manipulation
function setElementText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function setElementValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value;
}

function getElementValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
}

// Load customers for new modal
async function loadCustomersForNewModal() {
    try {
        const response = await api_GetCustomers();
        if (response.ok) {
            const data = await response.json();
            const customers = data.results || [];
            const customerSelect = document.getElementById('new-customer');
            
            if (customerSelect) {
                customers.forEach(customer => {
                    const option = document.createElement('option');
                    option.value = customer.full_name;
                    option.textContent = `${customer.full_name} - ${customer.phone || 'No phone'}`;
                    customerSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading customers for new modal:', error);
    }
}

// Load accountants for new modal
async function loadAccountantsForNewModal() {
    try {
        const response = await api_GetUsers('?role=accountant');
        if (response.ok) {
            const data = await response.json();
            const accountants = data.results || [];
            const accountantSelect = document.getElementById('new-accountant');
            
            if (accountantSelect) {
                accountants.forEach(accountant => {
                    const option = document.createElement('option');
                    option.value = accountant.username;
                    option.textContent = `${accountant.first_name} ${accountant.last_name} (${accountant.email})`;
                    accountantSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading accountants for new modal:', error);
    }
}

// Load customers for edit modal
async function loadCustomersForEditModal(selectedCustomerId = null) {
    try {
        const response = await api_GetCustomers();
        if (response.ok) {
            const data = await response.json();
            const customers = data.results || [];
            const customerSelect = document.getElementById('edit-customer');
            
            if (customerSelect) {
                customerSelect.innerHTML = '<option value="">Select a customer...</option>';
                
                customers.forEach(customer => {
                    const option = document.createElement('option');
                    option.value = customer.full_name;
                    option.textContent = `${customer.full_name} - ${customer.phone || 'No phone'}`;
                    if (selectedCustomerId && customer.id === selectedCustomerId) {
                        option.selected = true;
                    }
                    customerSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading customers for edit modal:', error);
    }
}

// Load accountants for edit modal
async function loadAccountantsForEditModal(selectedAccountantId = null) {
    try {
        const response = await api_GetUsers('?role=accountant');
        if (response.ok) {
            const data = await response.json();
            const accountants = data.results || [];
            const accountantSelect = document.getElementById('edit-assigned-to');
            
            if (accountantSelect) {
                accountantSelect.innerHTML = '<option value="">Select an accountant...</option>';
                
                accountants.forEach(accountant => {
                    const option = document.createElement('option');
                    option.value = accountant.username;
                    option.textContent = `${accountant.first_name} ${accountant.last_name} (${accountant.email})`;
                    if (selectedAccountantId && accountant.id === selectedAccountantId) {
                        option.selected = true;
                    }
                    accountantSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading accountants for edit modal:', error);
    }
}

// Load accountants for filter dropdown
async function loadAccountantsForFilter() {
    try {
        const response = await api_GetUsers('?role=accountant');
        if (response.ok) {
            const data = await response.json();
            const accountants = data.results || [];
            const assignedToFilter = document.getElementById('assigned-to-filter');
            
            if (assignedToFilter) {
                accountants.forEach(accountant => {
                    const option = document.createElement('option');
                    option.value = accountant.id;
                    option.textContent = `${accountant.first_name} ${accountant.last_name}`;
                    assignedToFilter.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading accountants for filter:', error);
    }
}

function updatePagination() {
    const pagination = document.getElementById('invoices-pagination');
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

function updateRecheckCounts() {
    // التحقق من وجود العناصر قبل التحديث
    const invoicesCount = document.getElementById('invoices-count');
    const totalInvoices = document.getElementById('total-invoices');
    const totalInvoicesCount = document.getElementById('total-invoices-count');
    
    if (invoicesCount) invoicesCount.textContent = currentRechecks.length;
    if (totalInvoices) totalInvoices.textContent = totalCount;
    if (totalInvoicesCount) totalInvoicesCount.textContent = totalCount;
}

function buildQueryString() {
    const params = new URLSearchParams();
    
    // Search
    const searchInput = document.getElementById('invoice-search');
    if (searchInput && searchInput.value) {
        params.append('search', searchInput.value);
    }
    
    // Filters
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter && statusFilter.value) {
        params.append('status', statusFilter.value);
    }
    
    const assignedToFilter = document.getElementById('assigned-to-filter');
    if (assignedToFilter && assignedToFilter.value) {
        params.append('assigned_to', assignedToFilter.value);
    }
    
    // Pagination
    params.append('page', currentPage);
    params.append('page_size', itemsPerPage);
    
    return params.toString();
}

function handleSearch(e) {
    currentPage = 1;
    const query = buildQueryString();
    loadRechecks(`?${query}`);
}

function handleFilter() {
    currentPage = 1;
    const query = buildQueryString();
    loadRechecks(`?${query}`);
}

function clearFilters() {
    const searchInput = document.getElementById('invoice-search');
    const statusFilter = document.getElementById('status-filter');
    const assignedToFilter = document.getElementById('assigned-to-filter');
    
    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    if (assignedToFilter) assignedToFilter.value = '';
    
    currentPage = 1;
    loadRechecks(`?page=${currentPage}&page_size=${itemsPerPage}`);
    showToast('Filters cleared', 'info');
}

function handleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.invoice-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
    });
    updateBulkActionsVisibility();
}

function updateBulkActionsVisibility() {
    const checkedBoxes = document.querySelectorAll('.invoice-checkbox:checked');
    const bulkActions = document.getElementById('bulk-actions');
    
    if (bulkActions) {
        if (checkedBoxes.length > 0) {
            bulkActions.style.display = 'flex';
        } else {
            bulkActions.style.display = 'none';
        }
    }
}

async function handleBulkExport() {
    const checkedBoxes = document.querySelectorAll('.invoice-checkbox:checked');
    const recheckIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (recheckIds.length === 0) {
        showToast('Please select rechecks to export', 'warning');
        return;
    }
    
    try {
        const query = `?ids=${recheckIds.join(',')}`;
        const response = await api_ExportRechecksExcel(query);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'rechecks.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast(`Exported ${recheckIds.length} recheck(s) successfully`, 'success');
        } else {
            throw new Error('Export failed');
        }
    } catch (error) {
        console.error('Error exporting rechecks:', error);
        showToast('Error exporting rechecks', 'error');
    }
}

async function handleExport(format = 'excel') {
    try {
        const query = currentQuery ? currentQuery.replace('?', '') : '';
        const response = await api_ExportRechecksExcel(query ? `?${query}` : '');
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rechecks.${format === 'excel' ? 'xlsx' : 'csv'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast('Rechecks exported successfully', 'success');
        } else {
            throw new Error('Export failed');
        }
    } catch (error) {
        console.error('Error exporting rechecks:', error);
        showToast('Error exporting rechecks', 'error');
    }
}

window.changePage = function(page) {
    if (page >= 1) {
        currentPage = page;
        const query = buildQueryString();
        loadRechecks(`?${query}`);
    }
};

function showLoadingState() {
    const tbody = document.getElementById('invoices-table');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-muted py-4">
                    <div class="spinner-border spinner-border-sm me-2"></div>
                    Loading rechecks...
                </td>
            </tr>
        `;
    }
}

function showErrorState() {
    const tbody = document.getElementById('invoices-table');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-muted py-4">
                    <i class="bi bi-exclamation-triangle fs-1 mb-3 d-block text-danger"></i>
                    Error loading rechecks. Please try again.
                </td>
            </tr>
        `;
    }
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

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

// Toast notification function
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1060';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${getToastBgClass(type)} border-0" role="alert" aria-live="assertive" aria-atomic="true">
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

    // Show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 4000
    });
    toast.show();

    // Remove toast from DOM after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function getToastBgClass(type) {
    const classes = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning',
        'info': 'info'
    };
    return classes[type] || 'info';
}

function getToastIcon(type) {
    const icons = {
        'success': 'bi-check-circle-fill',
        'error': 'bi-exclamation-triangle-fill',
        'warning': 'bi-exclamation-triangle-fill',
        'info': 'bi-info-circle-fill'
    };
    return icons[type] || 'bi-info-circle-fill';
}