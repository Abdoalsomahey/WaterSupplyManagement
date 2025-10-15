export function render_Customers() {
    return `
        <div class="customers-container">
            <!-- Page Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 mb-1">Customers Management</h1>
                    <p class="text-muted mb-0">Manage your customer database and delivery schedules.</p>
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

            <!-- Customers Stats Cards -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6">
                    <div class="card stats-card bg-primary text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 class="card-title mb-1">Total Customers</h4>
                                    <h2 class="mb-0" id="total-customers-card">0</h2>
                                    <small class="opacity-75">All registered customers</small>
                                </div>
                                <div class="stats-icon">
                                    <i class="bi bi-people-fill fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="card stats-card bg-success text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 class="card-title mb-1">Active This Month</h4>
                                    <h2 class="mb-0" id="active-customers-card">0</h2>
                                    <small class="opacity-75">New customers this month</small>
                                </div>
                                <div class="stats-icon">
                                    <i class="bi bi-graph-up-arrow fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="card stats-card bg-warning text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 class="card-title mb-1">With Meter</h4>
                                    <h2 class="mb-0" id="with-meter-card">0</h2>
                                    <small class="opacity-75">Customers with meter agreement</small>
                                </div>
                                <div class="stats-icon">
                                    <i class="bi bi-speedometer2 fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="card stats-card bg-info text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 class="card-title mb-1">Without Meter</h4>
                                    <h2 class="mb-0" id="without-meter-card">0</h2>
                                    <small class="opacity-75">Customers without meter agreement</small>
                                </div>
                                <div class="stats-icon">
                                    <i class="bi bi-dash-circle fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Advanced Search and Filter Bar -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row g-3">
                        <!-- Search -->
                        <div class="col-md-3">
                            <label class="form-label">Search</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-search"></i></span>
                                <input type="text" class="form-control" id="customer-search" 
                                       placeholder="Search name, phone, location...">
                            </div>
                        </div>

                        <!-- Filters -->
                        <div class="col-md-2">
                            <label class="form-label">Area</label>
                            <input type="text" class="form-control" id="area-filter" placeholder="Filter by area">
                        </div>

                        <div class="col-md-2">
                            <label class="form-label">Zone Number</label>
                            <input type="text" class="form-control" id="zone-filter" placeholder="Filter by zone">
                        </div>

                        <div class="col-md-2">
                            <label class="form-label">Plot Number</label>
                            <input type="text" class="form-control" id="plot-filter" placeholder="Filter by plot">
                        </div>

                        <div class="col-md-3">
                            <label class="form-label">Property Type</label>
                            <input type="text" class="form-control" id="property-type-filter" placeholder="Filter by type">
                        </div>

                        <div class="col-md-2">
                            <label class="form-label">Account Number</label>
                            <input type="text" class="form-control" id="account-filter" placeholder="Filter by account">
                        </div>

                        <div class="col-md-2">
                            <label class="form-label">Agreement Type</label>
                            <select class="form-select" id="agreement-filter">
                                <option value="">All Types</option>
                                <option value="with">With Meter</option>
                                <option value="without">Without Meter</option>
                            </select>
                        </div>

                        <div class="col-md-2">
                            <label class="form-label">Sort By</label>
                            <select class="form-select" id="ordering-select">
                                <option value="">Default</option>
                                <option value="id">ID</option>
                                <option value="full_name">Name</option>
                                <option value="account_number">Account Number</option>
                                <option value="starting_date">Starting Date</option>
                                <option value="registration_date">Registration Date</option>
                                <option value="-id">ID (Descending)</option>
                                <option value="-full_name">Name (Descending)</option>
                                <option value="-account_number">Account (Descending)</option>
                                <option value="-starting_date">Date (Descending)</option>
                                <option value="-registration_date">Registration Date (Descending)</option>
                            </select>
                        </div>

                        <div class="col-md-2 d-flex align-items-end">
                            <button class="btn btn-outline-secondary w-100" id="clear-filters">
                                <i class="bi bi-x-circle me-1"></i>Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Customers Table -->
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Customers List</h5>
                    <div class="d-flex gap-2 align-items-center">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="select-all-checkbox">
                            <label class="form-check-label" for="select-all-checkbox">
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
                                    <th>Customer Name</th>
                                    <th>Driver</th>
                                    <th>Area</th>
                                    <th>Zone</th>
                                    <th>Plot</th>
                                    <th>Property Type</th>
                                    <th>Contact Info</th>
                                    <th>Delivery Time</th>
                                    <th>Delivery Days</th>
                                    <th>Starting Date</th>
                                    <th>Registration Date</th>
                                    <th width="120">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="customers-table">
                                <tr>
                                    <td colspan="13" class="text-center text-muted py-4">
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