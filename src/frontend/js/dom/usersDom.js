import { api_GetUsers, api_GetUser, api_CreateUser, api_PartialUpdateUser, api_DeleteUser, api_ExportUsers } from '../apis.js';

let currentUsers = [];
let currentPage = 1;
const itemsPerPage = 10;
let totalCount = 0;
let currentQuery = "";
let usersStats = {
    total: 0,
    drivers: 0,
    accountants: 0,
    managers: 0
};

// Add CSS fix for modal aria-hidden issue
function addModalFixCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .modal.fade:not(.show) {
            display: none !important;
        }
        .modal.fade.show {
            display: block !important;
        }
    `;
    document.head.appendChild(style);
}

export function initUsers() {
    addModalFixCSS(); // Add CSS fix for modal issues
    loadUsers();
    setupEventListeners();
}

async function loadUsers(query = "") {
    try {
        showLoadingState();
        currentQuery = query;
        
        const response = await api_GetUsers(query);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentUsers = data.results;
        totalCount = data.count;
        
        // Calculate user statistics
        calculateUserStats();
        
        updateUsersTable();
        updatePagination();
        updateUserCounts();
        updateStatsCards();
        
    } catch (error) {
        console.error('Error loading users:', error);
        showErrorState();
        showToast('Error loading users', 'error');
    }
}

function calculateUserStats() {
    // Reset stats
    usersStats = {
        total: totalCount,
        drivers: 0,
        accountants: 0,
        managers: 0
    };
    
    // Count users by role from current data
    currentUsers.forEach(user => {
        switch (user.role) {
            case 'driver':
                usersStats.drivers++;
                break;
            case 'accountant':
                usersStats.accountants++;
                break;
            case 'manager':
                usersStats.managers++;
                break;
        }
    });
}

function updateStatsCards() {
    // Update total users count
    const totalUsersElement = document.getElementById('total-users-count');
    if (totalUsersElement) {
        totalUsersElement.textContent = usersStats.total.toLocaleString();
    }
    
    // Update drivers count
    const driversElement = document.getElementById('drivers-count');
    if (driversElement) {
        driversElement.textContent = usersStats.drivers.toLocaleString();
    }
    
    // Update accountants count (only for non-managers)
    const userRole = localStorage.getItem('user_role');
    const isManager = userRole === 'manager';
    
    if (!isManager) {
        const accountantsElement = document.getElementById('accountants-count');
        if (accountantsElement) {
            accountantsElement.textContent = usersStats.accountants.toLocaleString();
        }
        
        const managersElement = document.getElementById('managers-count');
        if (managersElement) {
            managersElement.textContent = usersStats.managers.toLocaleString();
        }
    }
}

function updateUsersTable() {
    const tbody = document.getElementById('users-table');
    
    if (currentUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                    No users found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = currentUsers.map(user => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-placeholder rounded-circle me-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; background-color: #e9ecef;">
                        <i class="bi bi-person text-muted"></i>
                    </div>
                    <div>
                        <div class="fw-semibold">${user.username}</div>
                        <small class="text-muted">ID: ${user.id}</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge bg-${getRoleColor(user.role)}">${user.role}</span>
            </td>
            <td>
                <div>
                    <div class="fw-semibold">${user.first_name || '-'} ${user.last_name || '-'}</div>
                    <div class="small text-muted">${user.email}</div>
                </div>
            </td>
            <td>${user.phone || '-'}</td>
            <td>
                ${user.driver_profile ? `
                    <div class="small">
                        <div><strong>License:</strong> ${user.driver_profile.license_type || '-'}</div>
                        <div><strong>Vehicle:</strong> ${user.driver_profile.vehicle_plate || ''} ${user.driver_profile.plate_no || ''}</div>
                        <div><strong>Tablet:</strong> ${user.driver_profile.tablet_number || '-'}</div>
                    </div>
                ` : '<span class="text-muted">-</span>'}
            </td>
            <td>
                <div class="data-table-actions">
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewUser(${user.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning btn-action" onclick="editUser(${user.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteUser(${user.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePagination() {
    const pagination = document.getElementById('users-pagination');
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function updateUserCounts() {
    document.getElementById('users-count').textContent = currentUsers.length;
    document.getElementById('total-users').textContent = totalCount;
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Clear filters
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }
    
    // Export button
    const exportBtn = document.getElementById('export-users');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
    
    // Add user button
    const addUserBtn = document.getElementById('add-user');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', showAddUserModal);
    }
    
    // Tab functionality
    const tabs = document.querySelectorAll('#userTabs .nav-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', handleTabChange);
    });
}

function handleSearch(e) {
    const searchTerm = e.target.value;
    buildAndLoadQuery();
}

function handleTabChange(e) {
    const tabId = e.target.getAttribute('data-bs-target');
    buildAndLoadQuery();
}

function buildAndLoadQuery() {
    const searchTerm = document.getElementById('user-search').value;
    const activeTab = document.querySelector('#userTabs .nav-link.active').getAttribute('data-bs-target');
    const userRole = localStorage.getItem('user_role');
    const isManager = userRole === 'manager';
    
    let queryParams = [];
    
    // Add search term
    if (searchTerm) {
        queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
    }
    
    // Handle tabs
    if (activeTab === '#drivers') {
        queryParams.push('role=driver');
    } else if (activeTab === '#accountants') {
        queryParams.push('role=accountant');
    } else if (activeTab === '#managers') {
        queryParams.push('role=manager');
    }
    
    if (isManager) {
        queryParams.push('role=driver');
    }
    
    // Add pagination
    queryParams.push(`page=${currentPage}`);
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    loadUsers(queryString);
}

function clearFilters() {
    document.getElementById('user-search').value = '';
    
    // Reset to first tab
    const firstTab = document.querySelector('#userTabs .nav-link');
    const activeTab = document.querySelector('#userTabs .nav-link.active');
    if (activeTab && firstTab && activeTab !== firstTab) {
        firstTab.click();
    }
    
    currentPage = 1;
    buildAndLoadQuery();
}

async function handleExport() {
    try {
        const response = await api_ExportUsers(currentQuery);
        if (!response.ok) {
            throw new Error('Export failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showToast('Users exported successfully', 'success');
        
    } catch (error) {
        console.error('Error exporting users:', error);
        showToast('Error exporting users', 'error');
    }
}

// Global functions for inline event handlers
window.viewUser = async function(userId) {
    try {
        const response = await api_GetUser(userId);
        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }
        const user = await response.json();
        
        // Show view modal with user data
        showViewModal(user);
        showToast('User details loaded successfully', 'success');
    } catch (error) {
        console.error('Error viewing user:', error);
        showToast('Error loading user details', 'error');
    }
};

window.editUser = async function(userId) {
    try {
        const response = await api_GetUser(userId);
        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }
        const user = await response.json();
        
        // Show edit modal with user data
        showEditModal(user);
        showToast('User data loaded for editing', 'success');
    } catch (error) {
        console.error('Error editing user:', error);
        showToast('Error loading user for editing', 'error');
    }
};

window.deleteUser = async function(userId) {
    try {
        const response = await api_GetUser(userId);
        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }
        const user = await response.json();
        
        // Show delete confirmation modal
        showDeleteModal(user);
    } catch (error) {
        console.error('Error loading user for deletion:', error);
        showToast('Error loading user details', 'error');
    }
};

window.changePage = function(page) {
    if (page >= 1 && page <= Math.ceil(totalCount / itemsPerPage)) {
        currentPage = page;
        buildAndLoadQuery();
    }
};

function showAddUserModal() {
    const userRole = localStorage.getItem('user_role');
    const isManager = userRole === 'manager';

    // Create and show add user modal
    const modalHTML = `
        <div class="modal fade" id="addUserModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${isManager ? 'Add New Driver' : 'Add New User'}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addUserForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Username</label>
                                    <input type="text" class="form-control" name="username" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Role</label>
                                    ${isManager ? `
                                    <input type="text" class="form-control" value="Driver" readonly>
                                    <input type="hidden" name="role" value="driver">
                                    ` : `
                                    <select class="form-select" name="role" id="role-select" required>
                                        <option value="">Select Role</option>
                                        <option value="driver">Driver</option>
                                        <option value="accountant">Accountant</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                    `}
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">First Name</label>
                                    <input type="text" class="form-control" name="first_name">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Last Name</label>
                                    <input type="text" class="form-control" name="last_name">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" name="email" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Phone</label>
                                    <input type="tel" class="form-control" name="phone">
                                </div>
                                <div class="col-12 mb-3">
                                    <label class="form-label">Password</label>
                                    <input type="password" class="form-control" name="password" required>
                                </div>
                            </div>

                            <!-- Driver Profile Fields -->
                            <div id="driver-profile-fields" style="display: none;">
                                <hr>
                                <h6>Driver Profile</h6>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">License Type</label>
                                        <select class="form-select" name="license_type">
                                            <option value="">Select License Type</option>
                                            <option value="light">Light</option>
                                            <option value="heavy">Heavy</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">License Number</label>
                                        <input type="text" class="form-control" name="license_number">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">License Issue Date</label>
                                        <input type="date" class="form-control" name="license_issue_date">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">License Expiry Date</label>
                                        <input type="date" class="form-control" name="license_expiry_date">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Vehicle Plate</label>
                                        <input type="text" class="form-control" name="vehicle_plate">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Plate No</label>
                                        <input type="text" class="form-control" name="plate_no">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Tablet Number</label>
                                        <input type="text" class="form-control" name="tablet_number">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">UAE ID</label>
                                        <input type="text" class="form-control" name="uae_id">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Registration Date</label>
                                        <input type="date" class="form-control" name="registration_date">
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="submitAddUserForm()">${isManager ? 'Add Driver' : 'Add User'}</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('addUserModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalElement = document.getElementById('addUserModal');
    const modal = new bootstrap.Modal(modalElement);
    
    // Add event listener for role change to show/hide driver profile fields
    if (!isManager) {
        const roleSelect = modalElement.querySelector('#role-select');
        const driverProfileFields = modalElement.querySelector('#driver-profile-fields');
        
        roleSelect.addEventListener('change', function() {
            if (this.value === 'driver') {
                driverProfileFields.style.display = 'block';
            } else {
                driverProfileFields.style.display = 'none';
            }
        });
    } else {
        // If manager, always show driver profile fields
        const driverProfileFields = modalElement.querySelector('#driver-profile-fields');
        driverProfileFields.style.display = 'block';
    }
    
    // Add event listeners to handle focus properly
    modalElement.addEventListener('shown.bs.modal', function() {
        // Focus on first input when modal opens
        const firstInput = modalElement.querySelector('input[name="username"]');
        if (firstInput) {
            firstInput.focus();
        }
    });
    
    modalElement.addEventListener('hidden.bs.modal', function() {
        // Remove modal from DOM when closed
        modalElement.remove();
    });
    
    modal.show();
}

window.submitAddUserForm = async function() {
    try {
        const form = document.getElementById('addUserForm');
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());
        
        // Process driver profile data if role is driver
        if (userData.role === 'driver') {
            userData.driver_profile = {
                license_type: userData.license_type,
                license_number: userData.license_number,
                license_issue_date: userData.license_issue_date,
                license_expiry_date: userData.license_expiry_date,
                vehicle_plate: userData.vehicle_plate,
                plate_no: userData.plate_no,
                tablet_number: userData.tablet_number,
                uae_id: userData.uae_id,
                registration_date: userData.registration_date
            };
            
            // Remove the individual driver profile fields from userData
            delete userData.license_type;
            delete userData.license_number;
            delete userData.license_issue_date;
            delete userData.license_expiry_date;
            delete userData.vehicle_plate;
            delete userData.plate_no;
            delete userData.tablet_number;
            delete userData.uae_id;
            delete userData.registration_date;
        }
        
        const response = await api_CreateUser(userData);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create user');
        }
        
        // Close modal and reload users
        bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
        buildAndLoadQuery();
        
        const userRole = localStorage.getItem('user_role');
        const isManager = userRole === 'manager';
        showToast(`${isManager ? 'Driver' : 'User'} created successfully`, 'success');
        
    } catch (error) {
        console.error('Error creating user:', error);
        showToast(`Error creating user: ${error.message}`, 'error');
    }
};

function showViewModal(user) {
    const driverProfileHTML = user.driver_profile ? `
        <div class="row mt-4">
            <div class="col-12">
                <h6 class="border-bottom pb-2">Driver Profile</h6>
            </div>
            <div class="col-6 mb-2">
                <strong>License Type:</strong><br>
                ${user.driver_profile.license_type || '-'}
            </div>
            <div class="col-6 mb-2">
                <strong>License Number:</strong><br>
                ${user.driver_profile.license_number || '-'}
            </div>
            <div class="col-6 mb-2">
                <strong>License Issue Date:</strong><br>
                ${user.driver_profile.license_issue_date || '-'}
            </div>
            <div class="col-6 mb-2">
                <strong>License Expiry Date:</strong><br>
                ${user.driver_profile.license_expiry_date || '-'}
            </div>
            <div class="col-6 mb-2">
                <strong>Vehicle Plate:</strong><br>
                ${user.driver_profile.vehicle_plate || '-'}
            </div>
            <div class="col-6 mb-2">
                <strong>Plate No:</strong><br>
                ${user.driver_profile.plate_no || '-'}
            </div>
            <div class="col-6 mb-2">
                <strong>Tablet Number:</strong><br>
                ${user.driver_profile.tablet_number || '-'}
            </div>
            <div class="col-6 mb-2">
                <strong>UAE ID:</strong><br>
                ${user.driver_profile.uae_id || '-'}
            </div>
            <div class="col-6 mb-2">
                <strong>Registration Date:</strong><br>
                ${user.driver_profile.registration_date || '-'}
            </div>
        </div>
    ` : '';

    const modalHTML = `
        <div class="modal fade" id="viewUserModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">User Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-6 mb-3">
                                <strong>Username:</strong><br>
                                ${user.username}
                            </div>
                            <div class="col-6 mb-3">
                                <strong>Role:</strong><br>
                                <span class="badge bg-${getRoleColor(user.role)}">${user.role}</span>
                            </div>
                            <div class="col-6 mb-3">
                                <strong>First Name:</strong><br>
                                ${user.first_name || '-'}
                            </div>
                            <div class="col-6 mb-3">
                                <strong>Last Name:</strong><br>
                                ${user.last_name || '-'}
                            </div>
                            <div class="col-12 mb-3">
                                <strong>Email:</strong><br>
                                ${user.email}
                            </div>
                            <div class="col-12 mb-3">
                                <strong>Phone:</strong><br>
                                ${user.phone || '-'}
                            </div>
                        </div>
                        ${driverProfileHTML}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('viewUserModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalElement = document.getElementById('viewUserModal');
    const modal = new bootstrap.Modal(modalElement);
    
    modalElement.addEventListener('hidden.bs.modal', function() {
        modalElement.remove();
    });
    
    modal.show();
}

function showEditModal(user) {
    const userRole = localStorage.getItem('user_role');
    const isManager = userRole === 'manager';
    
    const driverProfileFields = user.driver_profile ? `
        <hr>
        <h6>Driver Profile</h6>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label">License Type</label>
                <select class="form-select" name="license_type">
                    <option value="">Select License Type</option>
                    <option value="light" ${user.driver_profile.license_type === 'light' ? 'selected' : ''}>Light</option>
                    <option value="heavy" ${user.driver_profile.license_type === 'heavy' ? 'selected' : ''}>Heavy</option>
                </select>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">License Number</label>
                <input type="text" class="form-control" name="license_number" value="${user.driver_profile.license_number || ''}">
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">License Issue Date</label>
                <input type="date" class="form-control" name="license_issue_date" value="${user.driver_profile.license_issue_date || ''}">
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">License Expiry Date</label>
                <input type="date" class="form-control" name="license_expiry_date" value="${user.driver_profile.license_expiry_date || ''}">
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Vehicle Plate</label>
                <input type="text" class="form-control" name="vehicle_plate" value="${user.driver_profile.vehicle_plate || ''}">
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Plate No</label>
                <input type="text" class="form-control" name="plate_no" value="${user.driver_profile.plate_no || ''}">
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Tablet Number</label>
                <input type="text" class="form-control" name="tablet_number" value="${user.driver_profile.tablet_number || ''}">
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">UAE ID</label>
                <input type="text" class="form-control" name="uae_id" value="${user.driver_profile.uae_id || ''}">
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Registration Date</label>
                <input type="date" class="form-control" name="registration_date" value="${user.driver_profile.registration_date || ''}">
            </div>
        </div>
    ` : '';

    const modalHTML = `
        <div class="modal fade" id="editUserModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit ${isManager ? 'Driver' : 'User'}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editUserForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Username</label>
                                    <input type="text" class="form-control" name="username" value="${user.username}" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Role</label>
                                    ${!isManager ? `
                                    <select class="form-select" name="role" id="edit-role-select" required>
                                        <option value="driver" ${user.role === 'driver' ? 'selected' : ''}>Driver</option>
                                        <option value="accountant" ${user.role === 'accountant' ? 'selected' : ''}>Accountant</option>
                                        <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
                                    </select>
                                    ` : `
                                    <input type="text" class="form-control" value="Driver" readonly>
                                    `}
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">First Name</label>
                                    <input type="text" class="form-control" name="first_name" value="${user.first_name || ''}">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Last Name</label>
                                    <input type="text" class="form-control" name="last_name" value="${user.last_name || ''}">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" name="email" value="${user.email}" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Phone</label>
                                    <input type="tel" class="form-control" name="phone" value="${user.phone || ''}">
                                </div>
                            </div>
                            ${driverProfileFields}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="submitEditUserForm(${user.id})">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('editUserModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalElement = document.getElementById('editUserModal');
    const modal = new bootstrap.Modal(modalElement);
    
    modalElement.addEventListener('shown.bs.modal', function() {
        const firstInput = modalElement.querySelector('input[name="username"]');
        if (firstInput) {
            firstInput.focus();
        }
    });
    
    modalElement.addEventListener('hidden.bs.modal', function() {
        modalElement.remove();
    });
    
    modal.show();
}

window.submitEditUserForm = async function(userId) {
    try {
        const form = document.getElementById('editUserForm');
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());
        
        // Process driver profile data if role is driver
        if (userData.role === 'driver') {
            userData.driver_profile = {
                license_type: userData.license_type,
                license_number: userData.license_number,
                license_issue_date: userData.license_issue_date,
                license_expiry_date: userData.license_expiry_date,
                vehicle_plate: userData.vehicle_plate,
                plate_no: userData.plate_no,
                tablet_number: userData.tablet_number,
                uae_id: userData.uae_id,
                registration_date: userData.registration_date
            };
            
            // Remove the individual driver profile fields from userData
            delete userData.license_type;
            delete userData.license_number;
            delete userData.license_issue_date;
            delete userData.license_expiry_date;
            delete userData.vehicle_plate;
            delete userData.plate_no;
            delete userData.tablet_number;
            delete userData.uae_id;
            delete userData.registration_date;
        } else {
            // Ensure driver_profile is null for non-drivers
            userData.driver_profile = null;
        }
        
        const response = await api_PartialUpdateUser(userId, userData);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to update user');
        }
        
        // Close modal and reload users
        bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
        buildAndLoadQuery();
        
        const userRole = localStorage.getItem('user_role');
        const isManager = userRole === 'manager';
        showToast(`${isManager ? 'Driver' : 'User'} updated successfully`, 'success');
        
    } catch (error) {
        console.error('Error updating user:', error);
        showToast(`Error updating user: ${error.message}`, 'error');
    }
};

// Delete Modal Functions
function showDeleteModal(user) {
    const userRole = localStorage.getItem('user_role');
    const isManager = userRole === 'manager';
    
    const modalHTML = `
        <div class="modal fade" id="deleteUserModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            Confirm Deletion
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-warning">
                            <i class="bi bi-exclamation-circle me-2"></i>
                            This action cannot be undone.
                        </div>
                        <p>Are you sure you want to delete this ${isManager ? 'driver' : 'user'}?</p>
                        <div class="user-delete-info p-3 border rounded">
                            <div class="row">
                                <div class="col-6">
                                    <strong>Username:</strong><br>
                                    ${user.username}
                                </div>
                                <div class="col-6">
                                    <strong>Role:</strong><br>
                                    <span class="badge bg-${getRoleColor(user.role)}">${user.role}</span>
                                </div>
                                <div class="col-12 mt-2">
                                    <strong>Name:</strong><br>
                                    ${user.first_name || '-'} ${user.last_name || '-'}
                                </div>
                                <div class="col-12 mt-2">
                                    <strong>Email:</strong><br>
                                    ${user.email}
                                </div>
                            </div>
                        </div>
                        <div class="mt-3">
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-1"></i>
                                All data associated with this ${isManager ? 'driver' : 'user'} will be permanently removed.
                            </small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" onclick="submitDeleteUser(${user.id})">
                            <i class="bi bi-trash me-1"></i>Delete ${isManager ? 'Driver' : 'User'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('deleteUserModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalElement = document.getElementById('deleteUserModal');
    const modal = new bootstrap.Modal(modalElement);
    
    modalElement.addEventListener('shown.bs.modal', function() {
        const cancelButton = modalElement.querySelector('.btn-secondary');
        if (cancelButton) {
            cancelButton.focus();
        }
    });
    
    modalElement.addEventListener('hidden.bs.modal', function() {
        modalElement.remove();
    });
    
    modal.show();
}

window.submitDeleteUser = async function(userId) {
    try {
        const response = await api_DeleteUser(userId);
        if (!response.ok) {
            throw new Error('Delete failed');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteUserModal'));
        modal.hide();
        
        // Reload users after deletion
        buildAndLoadQuery();
        
        // Show success message
        const userRole = localStorage.getItem('user_role');
        const isManager = userRole === 'manager';
        showToast(`${isManager ? 'Driver' : 'User'} deleted successfully`, 'success');
        
    } catch (error) {
        console.error('Error deleting user:', error);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteUserModal'));
        modal.hide();
        
        showToast('Error deleting user', 'error');
    }
};

// Toast function
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1060';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${getToastColor(type)} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${getToastIcon(type)} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 4000
    });
    toast.show();
    
    // Remove toast from DOM after hide
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function getToastColor(type) {
    switch (type) {
        case 'success': return 'success';
        case 'error': return 'danger';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'primary';
    }
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'bi-check-circle';
        case 'error': return 'bi-exclamation-circle';
        case 'warning': return 'bi-exclamation-triangle';
        case 'info': return 'bi-info-circle';
        default: return 'bi-bell';
    }
}

function getRoleColor(role) {
    switch (role) {
        case 'admin': return 'danger';
        case 'driver': return 'primary';
        case 'accountant': return 'success';
        case 'manager': return 'warning';
        default: return 'secondary';
    }
}

function showLoadingState() {
    const tbody = document.getElementById('users-table');
    const userRole = localStorage.getItem('user_role');
    const isManager = userRole === 'manager';
    
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-muted py-4">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Loading ${isManager ? 'drivers' : 'users'}...
            </td>
        </tr>
    `;
}

function showErrorState() {
    const tbody = document.getElementById('users-table');
    const userRole = localStorage.getItem('user_role');
    const isManager = userRole === 'manager';
    
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-muted py-4">
                <i class="bi bi-exclamation-triangle fs-1 mb-3 d-block text-danger"></i>
                Error loading ${isManager ? 'drivers' : 'users'}. Please try again.
            </td>
        </tr>
    `;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}