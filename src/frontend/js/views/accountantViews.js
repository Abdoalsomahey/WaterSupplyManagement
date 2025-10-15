export function render_accountant() {
    return `
        <div class="invoices-container">
            <!-- Stats Cards -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 class="mb-0" id="total-invoices-count">0</h4>
                                    <p class="mb-0">Total Invoices</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-receipt fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 class="mb-0" id="sent-invoices-count">0</h4>
                                    <p class="mb-0">Sent</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-send fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 class="mb-0" id="approved-invoices-count">0</h4>
                                    <p class="mb-0">Approved</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-check-circle fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 class="mb-0" id="paid-invoices-count">0</h4>
                                    <p class="mb-0">Paid</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-currency-dollar fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Page Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 mb-1">Invoices Management</h1>
                    <p class="text-muted mb-0">Manage and track final invoices.</p>
                </div>
                <div class="d-flex gap-2">
                    <div class="btn-group">
                        <button class="btn btn-outline-success dropdown-toggle" data-bs-toggle="dropdown">
                            <i class="bi bi-download me-1"></i>Export
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" id="export-excel">
                                <i class="bi bi-file-excel me-2"></i>Export to Excel
                            </a></li>
                            <li><a class="dropdown-item" href="#" id="export-pdf">
                                <i class="bi bi-file-pdf me-2"></i>Export to PDF
                            </a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Search and Filter Bar -->
            <div class="search-filter-bar mb-4">
                <div class="row g-3">
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-search"></i></span>
                            <input type="text" class="form-control" id="invoice-search" 
                                   placeholder="Search by customer name, phone...">
                        </div>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="status-filter">
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="approved">Approved</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <input type="date" class="form-control" id="period-start-filter" 
                               placeholder="Period Start">
                    </div>
                    <div class="col-md-2">
                        <input type="date" class="form-control" id="period-end-filter" 
                               placeholder="Period End">
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-outline-secondary w-100" id="clear-filters">
                            <i class="bi bi-x-lg me-1"></i>Clear
                        </button>
                    </div>
                </div>
            </div>

            <!-- Invoices Table -->
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Invoices List</h5>
                    <div class="d-flex gap-2">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="select-all-checkbox">
                            <label class="form-check-label" for="select-all-checkbox">
                                Select All
                            </label>
                        </div>
                        <div class="btn-group" id="bulk-actions" style="display: none;">
                            <button class="btn btn-sm btn-outline-success" id="bulk-export-excel">
                                <i class="bi bi-file-excel me-1"></i>Export Excel
                            </button>
                            <button class="btn btn-sm btn-outline-danger" id="bulk-export-pdf">
                                <i class="bi bi-file-pdf me-1"></i>Export PDF
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th width="50">
                                        <input type="checkbox" class="form-check-input" id="select-all-checkbox">
                                    </th>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Period Start</th>
                                    <th>Period End</th>
                                    <th>Total Trips</th>
                                    <th>Total Gallons</th>
                                    <th>Subtotal</th>
                                    <th>VAT Amount</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th width="200">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="invoices-table">
                                <tr>
                                    <td colspan="12" class="text-center text-muted py-4">
                                        <div class="spinner-border spinner-border-sm me-2"></div>
                                        Loading invoices...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted">
                            Showing <span id="invoices-count">0</span> of <span id="total-invoices">0</span> invoices
                        </div>
                        <nav>
                            <ul class="pagination pagination-sm mb-0" id="invoices-pagination">
                                <!-- Pagination will be inserted here -->
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            <!-- Invoice Modal -->
            <div class="modal fade" id="invoiceModal" tabindex="-1" aria-labelledby="invoiceModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="invoiceModalLabel">Invoice Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="invoiceModalBody">
                            <!-- Content will be loaded dynamically -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="saveInvoiceBtn">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Delete Confirmation Modal -->
            <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="deleteModalLabel">Confirm Delete</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            Are you sure you want to delete this invoice? This action cannot be undone.
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete Invoice</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}