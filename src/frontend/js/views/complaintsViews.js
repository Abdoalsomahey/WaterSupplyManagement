export function render_Complaints() {
    return `
        <div class="complaints-container">
            <!-- Page Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 mb-1">Complaints & Notifications</h1>
                    <p class="text-muted mb-0">Manage customer complaints and system notifications.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary" id="mark-all-read">
                        <i class="bi bi-check-all me-1"></i>Mark All Read
                    </button>
                    <button class="btn btn-primary" id="add-complaint">
                        <i class="bi bi-plus-lg me-1"></i>Add Complaint
                    </button>
                </div>
            </div>

            <!-- Complaint Stats Cards -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-primary fs-2 fw-bold" id="total-complaints-count">-</div>
                            <div class="text-muted">Total Complaints</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-warning fs-2 fw-bold" id="new-complaints-count">-</div>
                            <div class="text-muted">New</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-info fs-2 fw-bold" id="in-progress-count">-</div>
                            <div class="text-muted">In Progress</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <div class="text-success fs-2 fw-bold" id="resolved-count">-</div>
                            <div class="text-muted">Resolved</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs for Complaints and Notifications -->
            <ul class="nav nav-tabs mb-4" id="complaintsTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="complaints-tab" data-bs-toggle="tab" data-bs-target="#complaints" type="button" role="tab">
                        <i class="bi bi-exclamation-triangle me-1"></i>Complaints
                        <span class="badge bg-warning ms-2" id="complaints-badge">0</span>
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="notifications-tab" data-bs-toggle="tab" data-bs-target="#notifications" type="button" role="tab">
                        <i class="bi bi-bell me-1"></i>Notifications
                        <span class="badge bg-primary ms-2" id="notifications-badge">0</span>
                    </button>
                </li>
            </ul>

            <!-- Tab Content -->
            <div class="tab-content" id="complaintsTabContent">
                <!-- Complaints Tab -->
                <div class="tab-pane fade show active" id="complaints" role="tabpanel">
                    <!-- Search and Filter Bar -->
                    <div class="search-filter-bar">
                        <div class="row g-3">
                            <div class="col-md-4">
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                                    <input type="text" class="form-control" id="complaint-search" placeholder="Search complaints...">
                                </div>
                            </div>
                            <div class="col-md-2">
                                <select class="form-select" id="status-filter">
                                    <option value="">All Status</option>
                                    <option value="new">New</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <select class="form-select" id="priority-filter">
                                    <option value="">All Priority</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <select class="form-select" id="customer-filter">
                                    <option value="">All Customers</option>
                                    <!-- Customer options will be populated dynamically -->
                                </select>
                            </div>
                            <div class="col-md-2">
                                <button class="btn btn-outline-secondary w-100" id="clear-filters">
                                    <i class="bi bi-x-lg me-1"></i>Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Complaints Table -->
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Complaints List</h5>
                            <div class="d-flex gap-2">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="select-all">
                                    <label class="form-check-label" for="select-all">
                                        Select All
                                    </label>
                                </div>
                                <div class="btn-group" id="bulk-actions" style="display: none;">
                                    <button class="btn btn-sm btn-outline-primary" id="bulk-assign">
                                        <i class="bi bi-person-plus me-1"></i>Assign
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
                                            <th>ID</th>
                                            <th>Customer</th>
                                            <th>Issue</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Order #</th>
                                            <th width="120">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="complaints-table">
                                        <tr>
                                            <td colspan="9" class="text-center text-muted py-4">
                                                <div class="spinner-border spinner-border-sm me-2"></div>
                                                Loading complaints...
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="text-muted">
                                    Showing <span id="complaints-count">0</span> of <span id="total-complaints">0</span> complaints
                                </div>
                                <nav>
                                    <ul class="pagination pagination-sm mb-0" id="complaints-pagination">
                                        <!-- Pagination will be inserted here -->
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Notifications Tab -->
                <div class="tab-pane fade" id="notifications" role="tabpanel">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">System Notifications</h5>
                            <button class="btn btn-sm btn-outline-primary" id="refresh-notifications">
                                <i class="bi bi-arrow-clockwise me-1"></i>Refresh
                            </button>
                        </div>
                        <div class="card-body p-0">
                            <div class="list-group list-group-flush" id="notifications-list">
                                <div class="list-group-item text-center text-muted py-4">
                                    <div class="spinner-border spinner-border-sm me-2"></div>
                                    Loading notifications...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}