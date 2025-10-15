export function render_driver() {
    return `
    <div class="content-wrapper">
        <div class="container-fluid">
            <!-- Page Header -->
            <div class="action-bar">
                <div>
                    <h1 class="h3 mb-2">My Delivery Orders</h1>
                    <p class="text-muted mb-0">Manage your assigned delivery orders and update their status.</p>
                </div>
                <div class="data-table-actions">
                    <small class="text-muted">
                        Filter: <span id="currentFilter" class="fw-semibold">Pending</span>
                    </small>
                </div>
            </div>

            <!-- Status Filter Buttons -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex flex-wrap align-items-center gap-2">
                        <button class="btn btn-sm filter-btn active" data-filter="pending">
                            <i class="fas fa-clock me-1"></i> Pending
                        </button>
                        <button class="btn btn-sm filter-btn btn-outline-success" data-filter="completed">
                            <i class="fas fa-check-circle me-1"></i> Completed
                        </button>
                        <button class="btn btn-sm filter-btn btn-outline-danger" data-filter="failed">
                            <i class="fas fa-times-circle me-1"></i> Failed
                        </button>
                        <button class="btn btn-sm filter-btn btn-outline-secondary" data-filter="">
                            <i class="fas fa-list me-1"></i> All Orders
                        </button>
                    </div>
                </div>
            </div>

            <!-- Orders Table -->
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-truck me-2"></i>
                            Delivery Orders
                        </h5>
                        <div class="text-muted small" id="paginationInfo">
                            Loading...
                        </div>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-container">
                        <table class="table table-hover mb-0" id="driverOrdersTable">
                            <thead>
                                <tr>
                                    <th width="80">Order ID</th>
                                    <th width="150">Customer</th>
                                    <th width="120">Order Details</th>
                                    <th width="100">Status</th>
                                    <th width="180">Timeline</th>
                                    <th width="200">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="driverOrdersBody">
                                <tr>
                                    <td colspan="6" class="text-center py-4">
                                        <div class="d-flex justify-content-center align-items-center">
                                            <div class="spinner-border text-primary me-3" role="status">
                                                <span class="visually-hidden">Loading...</span>
                                            </div>
                                            <span>Loading orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer">
                    <nav aria-label="Order pagination">
                        <ul class="pagination justify-content-center mb-0" id="paginationControls">
                            <li class="page-item disabled">
                                <span class="page-link">Previous</span>
                            </li>
                            <li class="page-item active">
                                <span class="page-link">1</span>
                            </li>
                            <li class="page-item disabled">
                                <span class="page-link">Next</span>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>

    <!-- Confirm Order Modal -->
    <div class="modal fade" id="confirmOrderModal" tabindex="-1" aria-labelledby="confirmOrderModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="confirmOrderModalLabel">
                        <i class="fas fa-check-circle text-success me-2"></i>
                        Complete Order Delivery
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="confirmOrderId">
                    
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Complete delivery for order: <strong id="customerName"></strong>
                    </div>
                    
                    <div class="mb-3">
                        <label for="filledAmount" class="form-label">
                            Actual Gallons Delivered <span class="text-danger">*</span>
                        </label>
                        <input type="number" 
                               class="form-control" 
                               id="filledAmount" 
                               placeholder="Enter delivered amount"
                               min="1"
                               required>
                        <div class="form-text">
                            Maximum allowed: <span id="maxGallons" class="fw-semibold">0</span> gallons
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="proofImage" class="form-label">
                            Proof Image <span class="text-danger">*</span>
                        </label>
                        <input type="file" 
                               class="form-control" 
                               id="proofImage" 
                               accept="image/*"
                               required>
                        <div class="form-text">
                            Upload photo proof of delivery (JPEG, PNG, etc.)
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-success" onclick="confirmOrder()">
                        <i class="fas fa-check me-1"></i> Complete Delivery
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Report Failed Modal -->
    <div class="modal fade" id="reportFailedModal" tabindex="-1" aria-labelledby="reportFailedModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="reportFailedModalLabel">
                        <i class="fas fa-times-circle text-danger me-2"></i>
                        Report Failed Delivery
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="failedOrderId">
                    
                    <div class="alert alert-warning">
                        <i class="fas fa-info-circle me-2"></i>
                        Report failed delivery for order: <strong id="failedCustomerName"></strong>
                    </div>
                    
                    <div class="mb-3">
                        <label for="failureReason" class="form-label">
                            Failure Reason <span class="text-danger">*</span>
                        </label>
                        <select class="form-select" id="failureReason" required>
                            <option value="">-- Select Failure Reason --</option>
                            <option value="customer_not_found">Customer not found</option>
                            <option value="wrong_address">Wrong address</option>
                            <option value="refused">Customer refused delivery</option>
                            <option value="location_issue">Location access issue</option>
                            <option value="vehicle_issue">Vehicle breakdown</option>
                            <option value="other">Other issue</option>
                        </select>
                    </div>
                    
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Reporting a failed delivery will mark this order as failed for review by management.
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" onclick="reportFailed()">
                        <i class="fas fa-times-circle me-1"></i> Report Failed
                    </button>
                </div>
            </div>
        </div>
    </div>

    <style>
        .table th {
            font-weight: var(--font-weight-semibold);
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
            background-color: var(--gray-50);
        }
        .status-badge {
            font-size: 0.7rem;
            padding: 0.25rem 0.75rem;
            border-radius: var(--border-radius-full);
        }
        .status-badge.pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        .status-badge.completed {
            background-color: #dcfce7;
            color: #166534;
        }
        .status-badge.failed {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .filter-btn {
            transition: all var(--transition-fast);
        }
        .filter-btn.active {
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }
        .btn-success {
            background: linear-gradient(135deg, #198754 0%, #146c43 100%);
            border: none;
        }
        .btn-danger {
            background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%);
            border: none;
        }
        .btn-success:hover {
            background: linear-gradient(135deg, #157347 0%, #0f5632 100%);
            transform: translateY(-1px);
        }
        .btn-danger:hover {
            background: linear-gradient(135deg, #bb2d3b 0%, #8a2530 100%);
            transform: translateY(-1px);
        }
    </style>
    `;
}