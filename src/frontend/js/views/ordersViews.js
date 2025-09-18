export function render_Orders() {
    return `
        <div class="orders-container">
            <!-- Page Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 mb-1">Orders Management</h1>
                    <p class="text-muted mb-0">Track and manage all water supply orders.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-success" id="export-orders">
                        <i class="bi bi-download me-1"></i>Export
                    </button>
                    <button class="btn btn-primary" id="add-order">
                        <i class="bi bi-plus-lg me-1"></i>New Order
                    </button>
                </div>
            </div>

            <!-- Order Stats Cards -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-primary fs-2 fw-bold" id="total-orders-count">-</div>
                            <div class="text-muted">Total Orders</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-success fs-2 fw-bold" id="delivered-orders-count">-</div>
                            <div class="text-muted">Delivered</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-warning fs-2 fw-bold" id="pending-orders-count">-</div>
                            <div class="text-muted">Pending</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-danger fs-2 fw-bold" id="cancelled-orders-count">-</div>
                            <div class="text-muted">Cancelled</div>
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
                            <input type="text" class="form-control" id="order-search" placeholder="Search orders...">
                        </div>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="status-filter">
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="customer-filter">
                            <option value="">All Customers</option>
                            <!-- Customer options will be populated dynamically -->
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="driver-filter">
                            <option value="">All Drivers</option>
                            <!-- Driver options will be populated dynamically -->
                        </select>
                    </div>
                    <div class="col-md-2">
                        <input type="date" class="form-control" id="date-filter" placeholder="Order Date">
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-outline-secondary w-100" id="clear-filters">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Orders Table -->
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Orders List</h5>
                    <div class="d-flex gap-2">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="select-all">
                            <label class="form-check-label" for="select-all">
                                Select All
                            </label>
                        </div>
                        <div class="btn-group" id="bulk-actions" style="display: none;">
                            <button class="btn btn-sm btn-outline-primary" id="bulk-assign-driver">
                                <i class="bi bi-person-plus me-1"></i>Assign Driver
                            </button>
                            <button class="btn btn-sm btn-outline-success" id="bulk-export">
                                <i class="bi bi-download me-1"></i>Export
                            </button>
                            <button class="btn btn-sm btn-outline-warning" id="bulk-update-status">
                                <i class="bi bi-pencil me-1"></i>Update Status
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
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Driver</th>
                                    <th>Date</th>
                                    <th>Delivery Date</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                    <th width="120">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="orders-table">
                                <tr>
                                    <td colspan="9" class="text-center text-muted py-4">
                                        <div class="spinner-border spinner-border-sm me-2"></div>
                                        Loading orders...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted">
                            Showing <span id="orders-count">0</span> of <span id="total-orders">0</span> orders
                        </div>
                        <nav>
                            <ul class="pagination pagination-sm mb-0" id="orders-pagination">
                                <!-- Pagination will be inserted here -->
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    `;
}