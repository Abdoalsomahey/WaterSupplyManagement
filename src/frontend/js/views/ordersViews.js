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

            <!-- Orders Stats Cards -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card text-center border-0 shadow-sm">
                        <div class="card-body py-4">
                            <div class="text-primary fs-2 fw-bold" id="total-orders-count">0</div>
                            <div class="text-muted">Total Orders</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-0 shadow-sm">
                        <div class="card-body py-4">
                            <div class="text-warning fs-2 fw-bold" id="pending-orders-count">0</div>
                            <div class="text-muted">Pending Orders</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-0 shadow-sm">
                        <div class="card-body py-4">
                            <div class="text-success fs-2 fw-bold" id="delivered-orders-count">0</div>
                            <div class="text-muted">Delivered Orders</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-0 shadow-sm">
                        <div class="card-body py-4">
                            <div class="text-danger fs-2 fw-bold" id="problem-orders-count">0</div>
                            <div class="text-muted">Problem Orders</div>
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
                            <input type="text" class="form-control" id="order-search" placeholder="Search by customer or driver...">
                        </div>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="status-filter">
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="delivered">Delivered</option>
                            <option value="problem">Problem</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="customer-filter">
                            <option value="">All Customers</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="driver-filter">
                            <option value="">All Drivers</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="ordering-filter">
                            <option value="-created_at">Newest First</option>
                            <option value="created_at">Oldest First</option>
                            <option value="-delivered_at">Recently Delivered</option>
                            <option value="delivered_at">Old Delivered</option>
                            <option value="status">Status A-Z</option>
                            <option value="-status">Status Z-A</option>
                        </select>
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-outline-secondary w-100" id="clear-filters" title="Clear filters">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Orders Table -->
            <div class="card mt-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Orders List</h5>
                    <div class="d-flex gap-2">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="select-all-checkbox">
                            <label class="form-check-label" for="select-all-checkbox">
                                Select All
                            </label>
                        </div>
                        <div class="btn-group" id="bulk-actions" style="display: none;">
                            <!-- تم إزالة bulk-assign-driver و bulk-update-status -->
                            <button class="btn btn-sm btn-outline-success" id="bulk-export">
                                <i class="bi bi-download me-1"></i>Export Selected
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
                                    <th>Driver</th>
                                    <th>Created At</th>
                                    <th>Delivery Time</th>
                                    <th>Required Gallons</th>
                                    <th>Filled Amount</th>
                                    <th>Status</th>
                                    <th width="120">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="orders-table">
                                <tr>
                                    <td colspan="10" class="text-center text-muted py-4">
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

            <!-- View Order Modal -->
            <div class="modal fade" id="viewOrderModal" tabindex="-1" aria-labelledby="viewOrderModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="viewOrderModalLabel">Order Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="viewOrderModalBody">
                            <!-- Content will be loaded dynamically -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Order Modal -->
            <div class="modal fade" id="editOrderModal" tabindex="-1" aria-labelledby="editOrderModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editOrderModalLabel">Edit Order</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="editOrderModalBody">
                            <!-- Content will be loaded dynamically -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Cancel editing">Cancel</button>
                            <button type="button" class="btn btn-primary" id="saveEditOrder">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Delete Confirmation Modal -->
            <div class="modal fade" id="deleteOrderModal" tabindex="-1" aria-labelledby="deleteOrderModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="deleteOrderModalLabel">Confirm Deletion</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="deleteOrderModalBody">
                            Are you sure you want to delete this order?
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Cancel deletion">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirmDeleteOrder" aria-label="Confirm deletion">Delete</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Create Order Modal -->
            <div class="modal fade" id="createOrderModal" tabindex="-1" aria-labelledby="createOrderModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="createOrderModalLabel">Create New Order</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="createOrderModalBody">
                            <form id="createOrderForm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="createCustomer" class="form-label">Customer *</label>
                                            <select class="form-select" id="createCustomer" name="customer" required>
                                                <option value="">Select Customer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="createDriver" class="form-label">Driver</label>
                                            <select class="form-select" id="createDriver" name="driver">
                                                <option value="">Select Driver</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="createRequiredGallons" class="form-label">Required Gallons *</label>
                                            <input type="number" class="form-control" id="createRequiredGallons" name="required_gallons" required min="1" step="0.1">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="createDeliveryTime" class="form-label">Delivery Time *</label>
                                            <input type="datetime-local" class="form-control" id="createDeliveryTime" name="delivery_time" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <label for="createCustomerLocation" class="form-label">Customer Location</label>
                                            <input type="text" class="form-control" id="createCustomerLocation" name="customer_location" placeholder="Enter customer location">
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Cancel creation">Cancel</button>
                            <button type="button" class="btn btn-primary" id="saveCreateOrder">Create Order</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}