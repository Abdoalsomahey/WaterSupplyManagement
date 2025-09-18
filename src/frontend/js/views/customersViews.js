export function render_Customers() {
    return `
        <div class="customers-container">
            <!-- Page Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 mb-1">Customers Management</h1>
                    <p class="text-muted mb-0">Manage your customer database and relationships.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-success" id="export-customers">
                        <i class="bi bi-download me-1"></i>Export
                    </button>
                    <button class="btn btn-primary" id="add-customer">
                        <i class="bi bi-plus-lg me-1"></i>Add Customer
                    </button>
                </div>
            </div>

            <!-- Search and Filter Bar -->
            <div class="search-filter-bar">
                <div class="row g-3">
                    <div class="col-md-4">
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-search"></i></span>
                            <input type="text" class="form-control" id="customer-search" placeholder="Search customers...">
                        </div>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="status-filter">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="orders-filter">
                            <option value="">All Orders</option>
                            <option value="high">High Volume</option>
                            <option value="medium">Medium Volume</option>
                            <option value="low">Low Volume</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <input type="date" class="form-control" id="date-from" placeholder="From Date">
                    </div>
                    <div class="col-md-2">
                        <input type="date" class="form-control" id="date-to" placeholder="To Date">
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-12">
                        <div class="filter-tags" id="active-filters">
                            <!-- Active filters will be displayed here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Customers Table -->
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Customers List</h5>
                    <div class="d-flex gap-2">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="select-all">
                            <label class="form-check-label" for="select-all">
                                Select All
                            </label>
                        </div>
                        <div class="btn-group" id="bulk-actions" style="display: none;">
                            <button class="btn btn-sm btn-outline-success" id="bulk-export">
                                <i class="bi bi-download me-1"></i>Export Selected
                            </button>
                            <button class="btn btn-sm btn-outline-warning" id="bulk-email">
                                <i class="bi bi-envelope me-1"></i>Send Email
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
                                    <th>Customer</th>
                                    <th>Contact Person</th>
                                    <th>Contact Info</th>
                                    <th>Orders</th>
                                    <th>Total Spent</th>
                                    <th>Status</th>
                                    <th>Last Order</th>
                                    <th width="120">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="customers-table">
                                <tr>
                                    <td colspan="9" class="text-center text-muted py-4">
                                        <div class="spinner-border spinner-border-sm me-2"></div>
                                        Loading customers...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted">
                            Showing <span id="customers-count">0</span> of <span id="total-customers">0</span> customers
                        </div>
                        <nav>
                            <ul class="pagination pagination-sm mb-0" id="customers-pagination">
                                <!-- Pagination will be inserted here -->
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    `;
}