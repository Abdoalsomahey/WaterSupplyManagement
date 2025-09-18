export function render_Invoices() {
    return `
        <div class="invoices-container">
            <!-- Page Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 mb-1">Invoices Management</h1>
                    <p class="text-muted mb-0">Manage billing and payment tracking.</p>
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
                    <button class="btn btn-primary" id="add-invoice">
                        <i class="bi bi-plus-lg me-1"></i>New Invoice
                    </button>
                </div>
            </div>

            <!-- Invoice Stats Cards -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-primary fs-2 fw-bold" id="total-invoices-count">-</div>
                            <div class="text-muted">Total Invoices</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-success fs-2 fw-bold" id="paid-invoices-count">-</div>
                            <div class="text-muted">Paid</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-warning fs-2 fw-bold" id="pending-invoices-count">-</div>
                            <div class="text-muted">Pending</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-danger fs-2 fw-bold" id="overdue-invoices-count">-</div>
                            <div class="text-muted">Overdue</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Search and Filter Bar -->
            <div class="search-filter-bar">
                <div class="row g-3">
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-search"></i></span>
                            <input type="text" class="form-control" id="invoice-search" placeholder="Search invoices...">
                        </div>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="status-filter">
                            <option value="">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="customer-filter">
                            <option value="">All Customers</option>
                            <!-- Customer options will be populated dynamically -->
                        </select>
                    </div>
                    <div class="col-md-2">
                        <input type="date" class="form-control" id="date-from" placeholder="From Date">
                    </div>
                    <div class="col-md-2">
                        <input type="date" class="form-control" id="date-to" placeholder="To Date">
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-outline-secondary w-100" id="clear-filters">
                            <i class="bi bi-x-lg"></i>
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
                            <input class="form-check-input" type="checkbox" id="select-all">
                            <label class="form-check-label" for="select-all">
                                Select All
                            </label>
                        </div>
                        <div class="btn-group" id="bulk-actions" style="display: none;">
                            <button class="btn btn-sm btn-outline-success" id="bulk-export">
                                <i class="bi bi-download me-1"></i>Export
                            </button>
                            <button class="btn btn-sm btn-outline-primary" id="bulk-send-email">
                                <i class="bi bi-envelope me-1"></i>Send Email
                            </button>
                            <button class="btn btn-sm btn-outline-warning" id="bulk-mark-paid">
                                <i class="bi bi-check-circle me-1"></i>Mark as Paid
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-container">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th width="50">
                                        <input type="checkbox" class="form-check-input" id="select-all-checkbox">
                                    </th>
                                    <th>Invoice #</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Due Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Payment Date</th>
                                    <th width="120">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="invoices-table">
                                <tr>
                                    <td colspan="9" class="text-center text-muted py-4">
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
        </div>
    `;
}