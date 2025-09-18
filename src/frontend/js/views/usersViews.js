export function render_Users() {
    return `
        <div class="users-container">
            <!-- Page Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 mb-1">Users Management</h1>
                    <p class="text-muted mb-0">Manage drivers, accountants, and admin users.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-success" id="export-users">
                        <i class="bi bi-download me-1"></i>Export
                    </button>
                    <button class="btn btn-primary" id="add-user">
                        <i class="bi bi-plus-lg me-1"></i>Add User
                    </button>
                </div>
            </div>

            <!-- User Tabs -->
            <ul class="nav nav-tabs mb-4" id="userTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="all-tab" data-bs-toggle="tab" data-bs-target="#all-users" type="button" role="tab">
                        <i class="bi bi-people me-1"></i>All Users
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="drivers-tab" data-bs-toggle="tab" data-bs-target="#drivers" type="button" role="tab">
                        <i class="bi bi-truck me-1"></i>Drivers
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="accountants-tab" data-bs-toggle="tab" data-bs-target="#accountants" type="button" role="tab">
                        <i class="bi bi-calculator me-1"></i>Accountants
                    </button>
                </li>
            </ul>

            <!-- Search and Filter Bar -->
            <div class="search-filter-bar">
                <div class="row g-3">
                    <div class="col-md-4">
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-search"></i></span>
                            <input type="text" class="form-control" id="user-search" placeholder="Search users...">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <select class="form-select" id="status-filter">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <select class="form-select" id="role-filter">
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="driver">Driver</option>
                            <option value="accountant">Accountant</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-outline-secondary w-100" id="clear-filters">
                            <i class="bi bi-x-lg me-1"></i>Clear
                        </button>
                    </div>
                </div>
            </div>

            <!-- Users Table -->
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Users List</h5>
                    <div class="d-flex gap-2">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="select-all">
                            <label class="form-check-label" for="select-all">
                                Select All
                            </label>
                        </div>
                        <div class="btn-group" id="bulk-actions" style="display: none;">
                            <button class="btn btn-sm btn-outline-danger" id="bulk-deactivate">
                                <i class="bi bi-person-x me-1"></i>Deactivate
                            </button>
                            <button class="btn btn-sm btn-outline-success" id="bulk-activate">
                                <i class="bi bi-person-check me-1"></i>Activate
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
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Last Login</th>
                                    <th width="120">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="users-table">
                                <tr>
                                    <td colspan="7" class="text-center text-muted py-4">
                                        <div class="spinner-border spinner-border-sm me-2"></div>
                                        Loading users...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted">
                            Showing <span id="users-count">0</span> of <span id="total-users">0</span> users
                        </div>
                        <nav>
                            <ul class="pagination pagination-sm mb-0" id="users-pagination">
                                <!-- Pagination will be inserted here -->
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    `;
}