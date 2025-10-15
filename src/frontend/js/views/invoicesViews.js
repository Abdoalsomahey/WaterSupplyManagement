export function render_Invoices() {
    return `
        <div class="invoices-container">
            <!-- Toast Container -->
            <div id="toast-container" class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1060">
                <!-- Toasts will be inserted here dynamically -->
            </div>

            <!-- Page Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 mb-1">Rechecks Management</h1>
                    <p class="text-muted mb-0">Manage fuel rechecks and accounting.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-success" id="export-excel">
                        <i class="bi bi-download me-1"></i>Export Excel
                    </button>
                    <button class="btn btn-primary" id="add-recheck">
                        <i class="bi bi-plus-lg me-1"></i>New Recheck
                    </button>
                </div>
            </div>

            <!-- Recheck Stats Cards -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-primary fs-2 fw-bold" id="total-rechecks-count">-</div>
                            <div class="text-muted">Total Rechecks</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-warning fs-2 fw-bold" id="draft-rechecks-count">-</div>
                            <div class="text-muted">Draft</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-success fs-2 fw-bold" id="paid-rechecks-count">-</div>
                            <div class="text-muted">Paid</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-info fs-2 fw-bold" id="other-rechecks-count">-</div>
                            <div class="text-muted">Other Status</div>
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
                            <input type="text" class="form-control" id="invoice-search" placeholder="Search rechecks...">
                        </div>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="status-filter">
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent to Accountant</option>
                            <option value="approved">Approved</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="assigned-to-filter">
                            <option value="">All Accountants</option>
                            <!-- Accountant options will be populated dynamically -->
                        </select>
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-outline-secondary w-100" id="clear-filters">
                            <i class="bi bi-x-lg"></i> Clear
                        </button>
                    </div>
                </div>
            </div>

            <!-- Rechecks Table -->
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Rechecks List</h5>
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
                                    <th>Status</th>
                                    <th>Assigned To</th>
                                    <th>Created At</th>
                                    <th width="180">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="invoices-table">
                                <tr>
                                    <td colspan="11" class="text-center text-muted py-4">
                                        <div class="spinner-border spinner-border-sm me-2"></div>
                                        Loading rechecks...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted">
                            Showing <span id="invoices-count">0</span> of <span id="total-invoices">0</span> rechecks
                        </div>
                        <nav>
                            <ul class="pagination pagination-sm mb-0" id="invoices-pagination">
                                <!-- Pagination will be inserted here -->
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            <!-- New Recheck Modal -->
            <div class="modal fade" id="newRecheckModal" tabindex="-1" aria-labelledby="newRecheckModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="newRecheckModalLabel">Create New Recheck</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="newRecheckForm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="new-customer" class="form-label">Customer *</label>
                                            <select class="form-select" id="new-customer" required>
                                                <option value="">Select a customer...</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label for="new-period-start" class="form-label">Period Start *</label>
                                            <input type="date" class="form-control" id="new-period-start" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="new-total-trips" class="form-label">Total Trips *</label>
                                            <input type="number" class="form-control" id="new-total-trips" min="0" step="1" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="new-price-per-gallon" class="form-label">Price per Gallon *</label>
                                            <input type="number" class="form-control" id="new-price-per-gallon" min="0" step="0.01" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="new-accountant" class="form-label">Accountant</label>
                                            <select class="form-select" id="new-accountant">
                                                <option value="">Select an accountant...</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label for="new-period-end" class="form-label">Period End *</label>
                                            <input type="date" class="form-control" id="new-period-end" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="new-total-gallons" class="form-label">Total Gallons *</label>
                                            <input type="number" class="form-control" id="new-total-gallons" min="0" step="0.01" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="new-vat-percent" class="form-label">VAT Percent *</label>
                                            <input type="number" class="form-control" id="new-vat-percent" min="0" max="100" step="0.01" value="15" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <label for="new-status" class="form-label">Status *</label>
                                            <select class="form-select" id="new-status" required>
                                                <option value="draft">Draft</option>
                                                <option value="sent">Sent to Accountant</option>
                                                <option value="approved">Approved</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label for="new-notes" class="form-label">Notes</label>
                                            <textarea class="form-control" id="new-notes" rows="3" placeholder="Optional notes..."></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="create-recheck-btn">Create Recheck</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- View Recheck Modal -->
            <div class="modal fade" id="viewRecheckModal" tabindex="-1" aria-labelledby="viewRecheckModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="viewRecheckModalLabel">View Recheck Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Recheck ID</label>
                                        <p class="form-control-static" id="view-id">-</p>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Customer</label>
                                        <p class="form-control-static" id="view-customer">-</p>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Period Start</label>
                                        <p class="form-control-static" id="view-period-start">-</p>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Period End</label>
                                        <p class="form-control-static" id="view-period-end">-</p>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Total Trips</label>
                                        <p class="form-control-static" id="view-total-trips">-</p>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Total Gallons</label>
                                        <p class="form-control-static" id="view-total-gallons">-</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Price per Gallon</label>
                                        <p class="form-control-static" id="view-price-per-gallon">-</p>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Subtotal</label>
                                        <p class="form-control-static" id="view-subtotal">-</p>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">VAT Percent</label>
                                        <p class="form-control-static" id="view-vat-percent">-</p>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">VAT Amount</label>
                                        <p class="form-control-static" id="view-vat-amount">-</p>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Total Amount</label>
                                        <p class="form-control-static" id="view-total">-</p>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Status</label>
                                        <p class="form-control-static"><span class="badge" id="view-status">-</span></p>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Assigned To</label>
                                        <p class="form-control-static" id="view-assigned-to">-</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Created At</label>
                                        <p class="form-control-static" id="view-created-at">-</p>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Notes</label>
                                        <p class="form-control-static" id="view-notes">-</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Recheck Modal -->
            <div class="modal fade" id="editRecheckModal" tabindex="-1" aria-labelledby="editRecheckModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editRecheckModalLabel">Edit Recheck</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editRecheckForm">
                                <input type="hidden" id="edit-id">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="edit-customer" class="form-label">Customer *</label>
                                            <select class="form-select" id="edit-customer" required>
                                                <option value="">Select a customer...</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label for="edit-period-start" class="form-label">Period Start *</label>
                                            <input type="date" class="form-control" id="edit-period-start" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="edit-total-trips" class="form-label">Total Trips *</label>
                                            <input type="number" class="form-control" id="edit-total-trips" min="0" step="1" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="edit-period-end" class="form-label">Period End *</label>
                                            <input type="date" class="form-control" id="edit-period-end" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="edit-total-gallons" class="form-label">Total Gallons *</label>
                                            <input type="number" class="form-control" id="edit-total-gallons" min="0" step="0.01" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="edit-status" class="form-label">Status *</label>
                                            <select class="form-select" id="edit-status" required>
                                                <option value="draft">Draft</option>
                                                <option value="sent">Sent to Accountant</option>
                                                <option value="approved">Approved</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="edit-assigned-to" class="form-label">Assigned To</label>
                                            <select class="form-select" id="edit-assigned-to">
                                                <option value="">Select an accountant...</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Created At</label>
                                            <p class="form-control-static" id="edit-created-at">-</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <label for="edit-notes" class="form-label">Notes</label>
                                            <textarea class="form-control" id="edit-notes" rows="3" placeholder="Optional notes..."></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="save-recheck-btn">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Send Recheck Modal -->
            <div class="modal fade" id="sendRecheckModal" tabindex="-1" aria-labelledby="sendRecheckModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="sendRecheckModalLabel">Send Recheck to Accountant</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="send-recheck-id">
                            <div class="mb-3">
                                <label for="accountant-select" class="form-label">Select Accountant *</label>
                                <select class="form-select" id="accountant-select" required>
                                    <option value="">Choose an accountant...</option>
                                </select>
                            </div>
                            <div class="alert alert-info">
                                <i class="bi bi-info-circle me-2"></i>
                                This will send the recheck to the selected accountant for review.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="confirm-send-btn">Send Recheck</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Delete Confirmation Modal -->
            <div class="modal fade" id="deleteRecheckModal" tabindex="-1" aria-labelledby="deleteRecheckModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="deleteRecheckModalLabel">Confirm Delete</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="delete-recheck-id">
                            <p>Are you sure you want to delete recheck #<span id="delete-recheck-number"></span>?</p>
                            <div class="alert alert-warning">
                                <i class="bi bi-exclamation-triangle me-2"></i>
                                This action cannot be undone.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirm-delete-btn">Delete Recheck</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}