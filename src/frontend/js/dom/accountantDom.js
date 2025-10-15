import { 
    api_GetFinalInvoices, 
    api_GetFinalInvoice, 
    api_PatchFinalInvoice, 
    api_DeleteFinalInvoice,
    api_ApproveFinalInvoice,
    api_MarkPaidFinalInvoice,
    api_ExportFinalInvoiceExcel,
    api_ExportFinalInvoicePDF
} from '../apis.js';

let currentInvoices = [];
let currentPage = 1;
const itemsPerPage = 10;
let totalCount = 0;
let nextPageUrl = null;
let previousPageUrl = null;

let currentInvoiceId = null;

export function initAccountant() {
    loadInvoices();
    setupEventListeners();
    setupModalEvents();
}

async function loadInvoices(queryParams = '') {
    try {
        showLoadingState();
        
        const response = await api_GetFinalInvoices(queryParams);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentInvoices = data.results;
        totalCount = data.count;
        nextPageUrl = data.next;
        previousPageUrl = data.previous;
        
        updateInvoicesTable();
        updatePagination();
        updateInvoiceCounts();
        updateStatsCards();
        
    } catch (error) {
        console.error('Error loading invoices:', error);
        showErrorState();
        showToast('Error loading invoices', 'error');
    }
}

function updateStatsCards() {
    const stats = {
        total: totalCount,
        sent: currentInvoices.filter(inv => inv.status === 'sent').length,
        approved: currentInvoices.filter(inv => inv.status === 'approved').length,
        paid: currentInvoices.filter(inv => inv.status === 'paid').length
    };

    document.getElementById('total-invoices-count').textContent = stats.total;
    document.getElementById('sent-invoices-count').textContent = stats.sent;
    document.getElementById('approved-invoices-count').textContent = stats.approved;
    document.getElementById('paid-invoices-count').textContent = stats.paid;
}

function updateInvoicesTable() {
    const tbody = document.getElementById('invoices-table');
    
    if (currentInvoices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                    No invoices found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = currentInvoices.map(invoice => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input invoice-checkbox" value="${invoice.id}">
            </td>
            <td>
                <div class="fw-semibold">${invoice.id}</div>
            </td>
            <td>
                <div class="fw-semibold">${invoice.customer?.full_name || 'N/A'}</div>
                <small class="text-muted">${invoice.customer?.phone || 'N/A'}</small>
            </td>
            <td>
                <div class="small">${formatDate(invoice.period_start)}</div>
            </td>
            <td>
                <div class="small">${formatDate(invoice.period_end)}</div>
            </td>
            <td>
                <div class="fw-semibold">${invoice.total_trips || 0}</div>
            </td>
            <td>
                <div class="fw-semibold">${invoice.total_gallons || 0}</div>
            </td>
            <td>
                <div class="fw-semibold">${formatCurrency(invoice.subtotal)}</div>
            </td>
            <td>
                <div class="fw-semibold">${formatCurrency(invoice.vat_amount)}</div>
            </td>
            <td>
                <div class="fw-semibold text-success">${formatCurrency(invoice.total)}</div>
            </td>
            <td>
                <span class="badge bg-${getStatusBadgeClass(invoice.status)}">${getStatusText(invoice.status)}</span>
            </td>
            <td>
                <div class="data-table-actions">
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewInvoice(${invoice.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning btn-action" onclick="editInvoice(${invoice.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    ${invoice.status === 'draft' || invoice.status === 'sent' ? `
                        <button class="btn btn-sm btn-outline-info btn-action" onclick="approveInvoice(${invoice.id})" title="Approve">
                            <i class="bi bi-check-lg"></i>
                        </button>
                    ` : ''}
                    ${invoice.status === 'approved' ? `
                        <button class="btn btn-sm btn-outline-success btn-action" onclick="markPaidInvoice(${invoice.id})" title="Mark as Paid">
                            <i class="bi bi-currency-dollar"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="showDeleteModal(${invoice.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    updateBulkActionsVisibility();
}

function updatePagination() {
    const pagination = document.getElementById('invoices-pagination');
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${!previousPageUrl ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage('${previousPageUrl}')">Previous</a>
        </li>
    `;
    
    // Calculate page numbers to display
    const currentPageNumber = getCurrentPageNumber();
    const startPage = Math.max(1, currentPageNumber - 2);
    const endPage = Math.min(totalPages, currentPageNumber + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPageNumber ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePageByNumber(${i})">${i}</a>
            </li>
        `;
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${!nextPageUrl ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage('${nextPageUrl}')">Next</a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function getCurrentPageNumber() {
    if (nextPageUrl) {
        const urlParams = new URLSearchParams(nextPageUrl.split('?')[1]);
        return parseInt(urlParams.get('page')) - 1;
    } else if (previousPageUrl) {
        const urlParams = new URLSearchParams(previousPageUrl.split('?')[1]);
        return parseInt(urlParams.get('page')) + 1;
    }
    return 1;
}

function updateInvoiceCounts() {
    document.getElementById('invoices-count').textContent = currentInvoices.length;
    document.getElementById('total-invoices').textContent = totalCount;
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('invoice-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filter functionality
    const statusFilter = document.getElementById('status-filter');
    const periodStartFilter = document.getElementById('period-start-filter');
    const periodEndFilter = document.getElementById('period-end-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilter);
    }
    if (periodStartFilter) {
        periodStartFilter.addEventListener('change', handleFilter);
    }
    if (periodEndFilter) {
        periodEndFilter.addEventListener('change', handleFilter);
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
    
    // Bulk export buttons
    const bulkExportExcelBtn = document.getElementById('bulk-export-excel');
    const bulkExportPdfBtn = document.getElementById('bulk-export-pdf');
    
    if (bulkExportExcelBtn) {
        bulkExportExcelBtn.addEventListener('click', () => handleBulkExport('excel'));
    }
    
    if (bulkExportPdfBtn) {
        bulkExportPdfBtn.addEventListener('click', () => handleBulkExport('pdf'));
    }
    
    // Export buttons
    const exportExcelBtn = document.getElementById('export-excel');
    const exportPdfBtn = document.getElementById('export-pdf');
    
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => handleExport('excel'));
    }
    
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => handleExport('pdf'));
    }
}

function setupModalEvents() {
    // Delete modal events
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', handleDeleteInvoice);
    }

    // Save invoice event
    const saveInvoiceBtn = document.getElementById('saveInvoiceBtn');
    if (saveInvoiceBtn) {
        saveInvoiceBtn.addEventListener('click', handleSaveInvoice);
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.trim();
    let queryParams = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '?';
    loadInvoices(queryParams);
}

function handleFilter() {
    const status = document.getElementById('status-filter').value;
    const periodStart = document.getElementById('period-start-filter').value;
    const periodEnd = document.getElementById('period-end-filter').value;
    
    let queryParams = '?';
    const params = [];
    
    if (status) params.push(`status=${status}`);
    if (periodStart) params.push(`period_start=${periodStart}`);
    if (periodEnd) params.push(`period_end=${periodEnd}`);
    
    if (params.length > 0) {
        queryParams += params.join('&');
    }
    
    loadInvoices(queryParams);
}

function clearFilters() {
    document.getElementById('invoice-search').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('period-start-filter').value = '';
    document.getElementById('period-end-filter').value = '';
    
    loadInvoices();
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
    
    if (bulkActions && checkedBoxes.length > 0) {
        bulkActions.style.display = 'flex';
    } else if (bulkActions) {
        bulkActions.style.display = 'none';
    }
}

async function handleBulkExport(format = 'excel') {
    const checkedBoxes = document.querySelectorAll('.invoice-checkbox:checked');
    const invoiceIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (invoiceIds.length === 0) {
        showToast('Please select invoices to export', 'warning');
        return;
    }
    
    try {
        for (const id of invoiceIds) {
            await exportSingleInvoice(id, format);
        }
    } catch (error) {
        console.error('Error exporting invoices:', error);
        showToast('Error exporting invoices', 'error');
    }
}

async function handleExport(format = 'excel') {
    const checkedBoxes = document.querySelectorAll('.invoice-checkbox:checked');
    const invoiceIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (invoiceIds.length === 0) {
        showToast('Please select invoices to export', 'warning');
        return;
    }
    
    try {
        for (const id of invoiceIds) {
            await exportSingleInvoice(id, format);
        }
    } catch (error) {
        console.error('Error exporting invoices:', error);
        showToast('Error exporting invoices', 'error');
    }
}

async function exportSingleInvoice(id, format) {
    let response;
    if (format === 'excel') {
        response = await api_ExportFinalInvoiceExcel(id);
    } else {
        response = await api_ExportFinalInvoicePDF(id);
    }
    
    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${id}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showToast(`Invoice ${id} exported successfully`, 'success');
    } else {
        throw new Error(`Failed to export invoice ${id}`);
    }
}

// Global functions for inline event handlers
window.viewInvoice = async function(invoiceId) {
    try {
        const response = await api_GetFinalInvoice(invoiceId);
        if (response.ok) {
            const invoice = await response.json();
            showInvoiceModal(invoice, 'view');
        } else {
            throw new Error('Failed to load invoice');
        }
    } catch (error) {
        console.error('Error viewing invoice:', error);
        showToast('Error loading invoice details', 'error');
    }
};

window.editInvoice = async function(invoiceId) {
    try {
        const response = await api_GetFinalInvoice(invoiceId);
        if (response.ok) {
            const invoice = await response.json();
            showInvoiceModal(invoice, 'edit');
        } else {
            throw new Error('Failed to load invoice');
        }
    } catch (error) {
        console.error('Error loading invoice for edit:', error);
        showToast('Error loading invoice for editing', 'error');
    }
};

window.approveInvoice = async function(invoiceId) {
    if (confirm('Are you sure you want to approve this invoice?')) {
        try {
            const response = await api_ApproveFinalInvoice(invoiceId);
            if (response.ok) {
                showToast('Invoice approved successfully', 'success');
                loadInvoices();
            } else {
                throw new Error('Failed to approve invoice');
            }
        } catch (error) {
            console.error('Error approving invoice:', error);
            showToast('Error approving invoice', 'error');
        }
    }
};

window.markPaidInvoice = async function(invoiceId) {
    if (confirm('Are you sure you want to mark this invoice as paid?')) {
        try {
            const response = await api_MarkPaidFinalInvoice(invoiceId);
            if (response.ok) {
                showToast('Invoice marked as paid successfully', 'success');
                loadInvoices();
            } else {
                throw new Error('Failed to mark invoice as paid');
            }
        } catch (error) {
            console.error('Error marking invoice as paid:', error);
            showToast('Error marking invoice as paid', 'error');
        }
    }
};

window.showDeleteModal = function(invoiceId) {
    currentInvoiceId = invoiceId;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
};

async function handleDeleteInvoice() {
    if (!currentInvoiceId) return;

    try {
        const response = await api_DeleteFinalInvoice(currentInvoiceId);
        if (response.ok) {
            showToast('Invoice deleted successfully', 'success');
            loadInvoices();
            // Close modal
            const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
            deleteModal.hide();
        } else {
            throw new Error('Failed to delete invoice');
        }
    } catch (error) {
        console.error('Error deleting invoice:', error);
        showToast('Error deleting invoice', 'error');
    }
}

async function handleSaveInvoice() {
    if (!currentInvoiceId) return;

    try {
        const formData = new FormData(document.getElementById('invoiceForm'));
        const data = Object.fromEntries(formData.entries());
        
        // Convert numeric fields
        data.total_trips = parseInt(data.total_trips) || 0;
        data.total_gallons = parseFloat(data.total_gallons) || 0;
        data.vat_percent = parseFloat(data.vat_percent) || 0;

        const response = await api_PatchFinalInvoice(currentInvoiceId, data);
        if (response.ok) {
            showToast('Invoice updated successfully', 'success');
            loadInvoices();
            // Close modal
            const invoiceModal = bootstrap.Modal.getInstance(document.getElementById('invoiceModal'));
            invoiceModal.hide();
        } else {
            throw new Error('Failed to update invoice');
        }
    } catch (error) {
        console.error('Error updating invoice:', error);
        showToast('Error updating invoice', 'error');
    }
}

function showInvoiceModal(invoice, mode) {
    currentInvoiceId = invoice.id;
    
    const modal = new bootstrap.Modal(document.getElementById('invoiceModal'));
    const modalTitle = document.getElementById('invoiceModalLabel');
    const modalBody = document.getElementById('invoiceModalBody');
    const saveBtn = document.getElementById('saveInvoiceBtn');

    modalTitle.textContent = `${mode === 'view' ? 'View' : 'Edit'} Invoice #${invoice.id}`;
    saveBtn.style.display = mode === 'edit' ? 'block' : 'none';

    modalBody.innerHTML = `
        <form id="invoiceForm">
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Customer Name</label>
                        <input type="text" class="form-control" value="${invoice.customer?.full_name || 'N/A'}" readonly>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Customer Phone</label>
                        <input type="text" class="form-control" value="${invoice.customer?.phone || 'N/A'}" readonly>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Period Start</label>
                        <input type="date" class="form-control" name="period_start" 
                               value="${invoice.period_start}" ${mode === 'view' ? 'readonly' : ''}>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Period End</label>
                        <input type="date" class="form-control" name="period_end" 
                               value="${invoice.period_end}" ${mode === 'view' ? 'readonly' : ''}>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">Total Trips</label>
                        <input type="number" class="form-control" name="total_trips" 
                               value="${invoice.total_trips || 0}" ${mode === 'view' ? 'readonly' : ''}>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">Total Gallons</label>
                        <input type="number" step="0.01" class="form-control" name="total_gallons" 
                               value="${invoice.total_gallons || 0}" ${mode === 'view' ? 'readonly' : ''}>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">VAT Percent</label>
                        <input type="number" step="0.01" class="form-control" name="vat_percent" 
                               value="${invoice.vat_percent || 0}" ${mode === 'view' ? 'readonly' : ''}>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">Subtotal</label>
                        <input type="text" class="form-control" value="${formatCurrency(invoice.subtotal)}" readonly>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">VAT Amount</label>
                        <input type="text" class="form-control" value="${formatCurrency(invoice.vat_amount)}" readonly>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">Total Amount</label>
                        <input type="text" class="form-control" value="${formatCurrency(invoice.total)}" readonly>
                    </div>
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Status</label>
                <input type="text" class="form-control" value="${getStatusText(invoice.status)}" readonly>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Notes</label>
                <textarea class="form-control" name="notes" rows="3" ${mode === 'view' ? 'readonly' : ''}>${invoice.notes || ''}</textarea>
            </div>
        </form>
    `;

    modal.show();
}

window.changePage = function(pageUrl) {
    if (pageUrl) {
        const queryString = pageUrl.split('?')[1] || '';
        loadInvoices(`?${queryString}`);
    }
};

window.changePageByNumber = function(pageNumber) {
    loadInvoices(`?page=${pageNumber}`);
};

function showLoadingState() {
    const tbody = document.getElementById('invoices-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="12" class="text-center text-muted py-4">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Loading invoices...
            </td>
        </tr>
    `;
}

function showErrorState() {
    const tbody = document.getElementById('invoices-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="12" class="text-center text-muted py-4">
                <i class="bi bi-exclamation-triangle fs-1 mb-3 d-block text-danger"></i>
                Error loading invoices. Please try again.
            </td>
        </tr>
    `;
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

function formatCurrency(amount) {
    if (!amount) return '0.00';
    return parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function getStatusBadgeClass(status) {
    const statusClasses = {
        'draft': 'secondary',
        'sent': 'info',
        'approved': 'warning',
        'paid': 'success'
    };
    return statusClasses[status] || 'secondary';
}

function getStatusText(status) {
    const statusTexts = {
        'draft': 'Draft',
        'sent': 'Sent',
        'approved': 'Approved',
        'paid': 'Paid'
    };
    return statusTexts[status] || status;
}

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
    const bgClass = {
        'success': 'bg-success',
        'error': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info'
    }[type] || 'bg-info';

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    // Remove toast from DOM after hide
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
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