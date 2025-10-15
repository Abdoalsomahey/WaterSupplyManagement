export function render_Users() {
    const userRole = localStorage.getItem('user_role');
    const isManager = userRole === 'manager';
    
    return `
        <div class="users-container">
            <!-- Page Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 mb-1">Users Management</h1>
                    <p class="text-muted mb-0">${isManager ? 'Manage drivers' : 'Manage drivers, accountants, and admin users'}.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-success" id="export-users">
                        <i class="bi bi-download me-1"></i>Export
                    </button>
                    ${!isManager ? `
                    <button class="btn btn-primary" id="add-user">
                        <i class="bi bi-plus-lg me-1"></i>Add User
                    </button>
                    ` : `
                    <button class="btn btn-primary" id="add-user" data-role="driver">
                        <i class="bi bi-plus-lg me-1"></i>Add Driver
                    </button>
                    `}
                </div>
            </div>

            <!-- Users Stats Cards -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6">
                    <div class="card stats-card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0">
                                    <div class="stats-icon bg-primary">
                                        <i class="bi bi-people text-white"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h4 class="card-title mb-0" id="total-users-count">0</h4>
                                    <p class="text-muted mb-0">Total Users</p>
                                </div>
                            </div>
                            <div class="mt-3">
                                <small class="text-success">
                                    <i class="bi bi-arrow-up me-1"></i>
                                    All platform users
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="card stats-card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0">
                                    <div class="stats-icon bg-success">
                                        <i class="bi bi-truck text-white"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h4 class="card-title mb-0" id="drivers-count">0</h4>
                                    <p class="text-muted mb-0">Drivers</p>
                                </div>
                            </div>
                            <div class="mt-3">
                                <small class="text-success">
                                    <i class="bi bi-person-check me-1"></i>
                                    Active drivers
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                ${!isManager ? `
                <div class="col-xl-3 col-md-6">
                    <div class="card stats-card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0">
                                    <div class="stats-icon bg-info">
                                        <i class="bi bi-calculator text-white"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h4 class="card-title mb-0" id="accountants-count">0</h4>
                                    <p class="text-muted mb-0">Accountants</p>
                                </div>
                            </div>
                            <div class="mt-3">
                                <small class="text-success">
                                    <i class="bi bi-graph-up me-1"></i>
                                    Finance team
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="card stats-card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0">
                                    <div class="stats-icon bg-warning">
                                        <i class="bi bi-person-gear text-white"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h4 class="card-title mb-0" id="managers-count">0</h4>
                                    <p class="text-muted mb-0">Managers</p>
                                </div>
                            </div>
                            <div class="mt-3">
                                <small class="text-success">
                                    <i class="bi bi-shield-check me-1"></i>
                                    Management team
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
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
                ${!isManager ? `
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="accountants-tab" data-bs-toggle="tab" data-bs-target="#accountants" type="button" role="tab">
                        <i class="bi bi-calculator me-1"></i>Accountants
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="managers-tab" data-bs-toggle="tab" data-bs-target="#managers" type="button" role="tab">
                        <i class="bi bi-person-gear me-1"></i>Managers
                    </button>
                </li>
                ` : ''}
            </ul>

            <!-- Search and Filter Bar -->
            <div class="search-filter-bar">
                <div class="row g-3">
                    <div class="col-md-10">
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-search"></i></span>
                            <input type="text" class="form-control" id="user-search" placeholder="Search by username, name, phone, or email...">
                        </div>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-outline-secondary w-100" id="clear-filters">
                            <i class="bi bi-x-lg me-1"></i>Clear
                        </button>
                    </div>
                </div>
            </div>

            <!-- Users Table -->
            <div class="card mt-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">${isManager ? 'Drivers List' : 'Users List'}</h5>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Contact Info</th>
                                    <th>Phone</th>
                                    <th>Driver Details</th>
                                    <th width="120">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="users-table">
                                <tr>
                                    <td colspan="6" class="text-center text-muted py-4">
                                        <div class="spinner-border spinner-border-sm me-2"></div>
                                        Loading ${isManager ? 'drivers' : 'users'}...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted">
                            Showing <span id="users-count">0</span> of <span id="total-users">0</span> ${isManager ? 'drivers' : 'users'}
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

        <style>
            .stats-card {
                transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                border: none;
                border-radius: 12px;
            }
            .stats-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }
            .stats-icon {
                width: 50px;
                height: 50px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }
            .stats-card .card-title {
                font-size: 1.8rem;
                font-weight: 700;
                color: #2c3e50;
            }
            .stats-card .text-muted {
                font-size: 0.9rem;
                font-weight: 500;
            }
        </style>
    `;
}