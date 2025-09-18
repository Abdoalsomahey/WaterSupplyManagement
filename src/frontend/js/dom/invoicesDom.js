import { mockApi_GetInvoices, sampleInvoices, exportToCSV } from '../apis.js';

let currentInvoices = [];
let filteredInvoices = [];
let currentPage = 1;
const itemsPerPage = 10;

export function initInvoices() {
    loadInvoices();
    setupEventListeners();
}

async function loadInvoices() {
    try {
        showLoadingState();
        
        const response = await mockApi_GetInvoices();
        currentInvoices = await response.json();
        filteredInvoices = [...currentInvoices];
        
        updateInvoicesTable();
        updatePagination();
        updateInvoiceCounts();
        updateInvoiceStats();
        
    } catch (error) {
        console.error('Error loading invoices:', error);
        showErrorState();
    }
}

function updateInvoicesTable() {
    const tbody = document.getElementById('invoices-table');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageInvoices = filteredInvoices.slice(startIndex, endIndex);
    
    if (pageInvoices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                    No invoices found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pageInvoices.map(invoice => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input invoice-checkbox" value="${invoice.id}">
            </td>
            <td>
                <div class="fw-semibold">${invoice.invoice_number}</div>
            </td>
            <td>
                <div>${invoice.customer_name}</div>
            </td>
            <td>
                <div class="small">${formatDate(invoice.date)}</div>
            </td>
            <td>
                <div class="small">${formatDate(invoice.due_date)}</div>
            </td>
            <td>
                <div class="fw-semibold">$${invoice.total.toFixed(2)}</div>
            </td>
            <td>
                <span class="status-badge ${invoice.status}">${invoice.status}</span>
            </td>
            <td>
                <div class="small">${invoice.payment_date ? formatDate(invoice.payment_date) : 'N/A'}</div>
            </td>
            <td>
                <div class="data-table-actions">
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewInvoice(${invoice.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning btn-action" onclick="editInvoice(${invoice.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success btn-action" onclick="printInvoice(${invoice.id})" title="Print">
                        <i class="bi bi-printer"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteInvoice(${invoice.id})" title="Delete">
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
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    
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

function updateInvoiceCounts() {
    document.getElementById('invoices-count').textContent = filteredInvoices.length;
    document.getElementById('total-invoices').textContent = currentInvoices.length;
}

function updateInvoiceStats() {
    const totalInvoices = currentInvoices.length;
    const paidInvoices = currentInvoices.filter(i => i.status === 'paid').length;
    const pendingInvoices = currentInvoices.filter(i => i.status === 'pending').length;
    const overdueInvoices = currentInvoices.filter(i => i.status === 'overdue').length;
    
    document.getElementById('total-invoices-count').textContent = totalInvoices;
    document.getElementById('paid-invoices-count').textContent = paidInvoices;
    document.getElementById('pending-invoices-count').textContent = pendingInvoices;
    document.getElementById('overdue-invoices-count').textContent = overdueInvoices;
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('invoice-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filter functionality
    const statusFilter = document.getElementById('status-filter');
    const customerFilter = document.getElementById('customer-filter');
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilter);
    }
    
    if (customerFilter) {
        customerFilter.addEventListener('change', handleFilter);
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
    const bulkSendEmailBtn = document.getElementById('bulk-send-email');
    const bulkMarkPaidBtn = document.getElementById('bulk-mark-paid');
    
    if (bulkExportBtn) {
        bulkExportBtn.addEventListener('click', handleBulkExport);
    }
    
    if (bulkSendEmailBtn) {
        bulkSendEmailBtn.addEventListener('click', handleBulkSendEmail);
    }
    
    if (bulkMarkPaidBtn) {
        bulkMarkPaidBtn.addEventListener('click', handleBulkMarkPaid);
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
    
    // Add invoice button
    const addInvoiceBtn = document.getElementById('add-invoice');
    if (addInvoiceBtn) {
        addInvoiceBtn.addEventListener('click', showAddInvoiceModal);
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    filteredInvoices = currentInvoices.filter(invoice => 
        invoice.invoice_number.toLowerCase().includes(searchTerm) ||
        invoice.customer_name.toLowerCase().includes(searchTerm)
    );
    
    currentPage = 1;
    updateInvoicesTable();
    updatePagination();
    updateInvoiceCounts();
}

function handleFilter() {
    const statusFilter = document.getElementById('status-filter').value;
    const customerFilter = document.getElementById('customer-filter').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    
    filteredInvoices = currentInvoices.filter(invoice => {
        const statusMatch = !statusFilter || invoice.status === statusFilter;
        const customerMatch = !customerFilter || invoice.customer_name === customerFilter;
        
        let dateMatch = true;
        if (dateFrom || dateTo) {
            const invoiceDate = new Date(invoice.date);
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                dateMatch = dateMatch && invoiceDate >= fromDate;
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                dateMatch = dateMatch && invoiceDate <= toDate;
            }
        }
        
        return statusMatch && customerMatch && dateMatch;
    });
    
    currentPage = 1;
    updateInvoicesTable();
    updatePagination();
    updateInvoiceCounts();
}

function clearFilters() {
    document.getElementById('invoice-search').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('customer-filter').value = '';
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    
    filteredInvoices = [...currentInvoices];
    currentPage = 1;
    updateInvoicesTable();
    updatePagination();
    updateInvoiceCounts();
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
    
    if (checkedBoxes.length > 0) {
        bulkActions.style.display = 'flex';
    } else {
        bulkActions.style.display = 'none';
    }
}

function handleBulkExport() {
    const checkedBoxes = document.querySelectorAll('.invoice-checkbox:checked');
    const invoiceIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (invoiceIds.length === 0) {
        showToast('Please select invoices to export', 'warning');
        return;
    }
    
    const invoicesToExport = currentInvoices.filter(i => invoiceIds.includes(i.id));
    const dataToExport = invoicesToExport.map(invoice => ({
        'Invoice #': invoice.invoice_number,
        Customer: invoice.customer_name,
        Date: formatDate(invoice.date),
        'Due Date': formatDate(invoice.due_date),
        Amount: invoice.amount,
        Tax: invoice.tax,
        Total: invoice.total,
        Status: invoice.status,
        'Payment Date': invoice.payment_date ? formatDate(invoice.payment_date) : 'N/A'
    }));
    
    exportToCSV(dataToExport, 'selected_invoices');
    showToast(`Exported ${invoiceIds.length} invoice(s)`, 'success');
}

function handleBulkSendEmail() {
    const checkedBoxes = document.querySelectorAll('.invoice-checkbox:checked');
    const invoiceIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (invoiceIds.length === 0) {
        showToast('Please select invoices to send email', 'warning');
        return;
    }
    
    showToast(`Email functionality for ${invoiceIds.length} invoice(s) would be implemented here`, 'info');
}

function handleBulkMarkPaid() {
    const checkedBoxes = document.querySelectorAll('.invoice-checkbox:checked');
    const invoiceIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (invoiceIds.length === 0) {
        showToast('Please select invoices to mark as paid', 'warning');
        return;
    }
    
    if (confirm(`Are you sure you want to mark ${invoiceIds.length} invoice(s) as paid?`)) {
        // Update invoices in the array
        invoiceIds.forEach(id => {
            const invoice = currentInvoices.find(i => i.id === id);
            if (invoice) {
                invoice.status = 'paid';
                invoice.payment_date = new Date().toISOString();
            }
        });
        
        // Refresh the table
        updateInvoicesTable();
        updateInvoiceCounts();
        updateInvoiceStats();
        
        showToast(`Successfully marked ${invoiceIds.length} invoice(s) as paid`, 'success');
    }
}

function handleExport(format = 'excel') {
    const dataToExport = filteredInvoices.map(invoice => ({
        'Invoice #': invoice.invoice_number,
        Customer: invoice.customer_name,
        Date: formatDate(invoice.date),
        'Due Date': formatDate(invoice.due_date),
        Amount: invoice.amount,
        Tax: invoice.tax,
        Total: invoice.total,
        Status: invoice.status,
        'Payment Date': invoice.payment_date ? formatDate(invoice.payment_date) : 'N/A'
    }));
    
    const filename = format === 'pdf' ? 'invoices.pdf' : 'invoices.csv';
    if (format === 'excel') {
        exportToCSV(dataToExport, 'invoices');
    } else {
        showToast('PDF export functionality would be implemented here', 'info');
    }
    
    showToast(`Invoices exported successfully as ${format.toUpperCase()}`, 'success');
}

function showAddInvoiceModal() {
    showToast('Add invoice functionality would be implemented here', 'info');
}

// Global functions for inline event handlers
window.viewInvoice = function(invoiceId) {
    const invoice = currentInvoices.find(i => i.id === invoiceId);
    if (invoice) {
        showToast(`Viewing invoice: ${invoice.invoice_number}`, 'info');
    }
};

window.editInvoice = function(invoiceId) {
    const invoice = currentInvoices.find(i => i.id === invoiceId);
    if (invoice) {
        showToast(`Editing invoice: ${invoice.invoice_number}`, 'info');
    }
};

window.printInvoice = function(invoiceId) {
    const invoice = currentInvoices.find(i => i.id === invoiceId);
    if (invoice) {
        showToast(`Print functionality for invoice: ${invoice.invoice_number} would be implemented here`, 'info');
    }
};

window.deleteInvoice = function(invoiceId) {
    const invoice = currentInvoices.find(i => i.id === invoiceId);
    if (invoice && confirm(`Are you sure you want to delete invoice: ${invoice.invoice_number}?`)) {
        currentInvoices = currentInvoices.filter(i => i.id !== invoiceId);
        filteredInvoices = filteredInvoices.filter(i => i.id !== invoiceId);
        updateInvoicesTable();
        updatePagination();
        updateInvoiceCounts();
        updateInvoiceStats();
        showToast('Invoice deleted successfully', 'success');
    }
};

window.changePage = function(page) {
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateInvoicesTable();
        updatePagination();
    }
};

function showLoadingState() {
    const tbody = document.getElementById('invoices-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="9" class="text-center text-muted py-4">
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
            <td colspan="9" class="text-center text-muted py-4">
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
