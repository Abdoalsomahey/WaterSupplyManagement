import { mockApi_GetUsers, sampleUsers, exportToCSV } from '../apis.js';

let currentUsers = [];
let filteredUsers = [];
let currentPage = 1;
const itemsPerPage = 10;

export function initUsers() {
    loadUsers();
    setupEventListeners();
}

async function loadUsers() {
    try {
        showLoadingState();
        
        const response = await mockApi_GetUsers();
        currentUsers = await response.json();
        filteredUsers = [...currentUsers];
        
        updateUsersTable();
        updatePagination();
        updateUserCounts();
        
    } catch (error) {
        console.error('Error loading users:', error);
        showErrorState();
    }
}

function updateUsersTable() {
    const tbody = document.getElementById('users-table');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageUsers = filteredUsers.slice(startIndex, endIndex);
    
    if (pageUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                    No users found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pageUsers.map(user => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input user-checkbox" value="${user.id}">
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${user.avatar}" alt="User" class="rounded-circle me-2" width="32" height="32">
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
                    <div class="small">${user.email}</div>
                    <div class="small text-muted">${user.phone}</div>
                </div>
            </td>
            <td>
                <span class="status-badge ${user.status}">${user.status}</span>
            </td>
            <td>
                <div class="small">${formatDate(user.last_login)}</div>
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
    
    updateBulkActionsVisibility();
}

function updatePagination() {
    const pagination = document.getElementById('users-pagination');
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    
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
    document.getElementById('users-count').textContent = filteredUsers.length;
    document.getElementById('total-users').textContent = currentUsers.length;
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filter functionality
    const statusFilter = document.getElementById('status-filter');
    const roleFilter = document.getElementById('role-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilter);
    }
    
    if (roleFilter) {
        roleFilter.addEventListener('change', handleFilter);
    }
    
    // Clear filters
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }
    
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }
    
    // Bulk actions
    const bulkActivateBtn = document.getElementById('bulk-activate');
    const bulkDeactivateBtn = document.getElementById('bulk-deactivate');
    
    if (bulkActivateBtn) {
        bulkActivateBtn.addEventListener('click', () => handleBulkAction('activate'));
    }
    
    if (bulkDeactivateBtn) {
        bulkDeactivateBtn.addEventListener('click', () => handleBulkAction('deactivate'));
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
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    filteredUsers = currentUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.phone.includes(searchTerm)
    );
    
    currentPage = 1;
    updateUsersTable();
    updatePagination();
    updateUserCounts();
}

function handleFilter() {
    const statusFilter = document.getElementById('status-filter').value;
    const roleFilter = document.getElementById('role-filter').value;
    
    filteredUsers = currentUsers.filter(user => {
        const statusMatch = !statusFilter || user.status === statusFilter;
        const roleMatch = !roleFilter || user.role === roleFilter;
        return statusMatch && roleMatch;
    });
    
    currentPage = 1;
    updateUsersTable();
    updatePagination();
    updateUserCounts();
}

function clearFilters() {
    document.getElementById('user-search').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('role-filter').value = '';
    
    filteredUsers = [...currentUsers];
    currentPage = 1;
    updateUsersTable();
    updatePagination();
    updateUserCounts();
}

function handleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.user-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
    });
    updateBulkActionsVisibility();
}

function updateBulkActionsVisibility() {
    const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
    const bulkActions = document.getElementById('bulk-actions');
    
    if (checkedBoxes.length > 0) {
        bulkActions.style.display = 'flex';
    } else {
        bulkActions.style.display = 'none';
    }
}

function handleBulkAction(action) {
    const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
    const userIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (userIds.length === 0) {
        showToast('Please select users to perform this action', 'warning');
        return;
    }
    
    const actionText = action === 'activate' ? 'activate' : 'deactivate';
    
    if (confirm(`Are you sure you want to ${actionText} ${userIds.length} user(s)?`)) {
        // Update users in the array
        userIds.forEach(id => {
            const user = currentUsers.find(u => u.id === id);
            if (user) {
                user.status = action === 'activate' ? 'active' : 'inactive';
            }
        });
        
        // Refresh the table
        updateUsersTable();
        updateUserCounts();
        
        showToast(`Successfully ${actionText}d ${userIds.length} user(s)`, 'success');
    }
}

function handleExport() {
    const dataToExport = filteredUsers.map(user => ({
        ID: user.id,
        Username: user.username,
        Email: user.email,
        Phone: user.phone,
        Role: user.role,
        Status: user.status,
        'Created At': formatDate(user.created_at),
        'Last Login': formatDate(user.last_login)
    }));
    
    exportToCSV(dataToExport, 'users');
    showToast('Users exported successfully', 'success');
}

function showAddUserModal() {
    // This would open a modal for adding a new user
    showToast('Add user functionality would be implemented here', 'info');
}

// Global functions for inline event handlers
window.viewUser = function(userId) {
    const user = currentUsers.find(u => u.id === userId);
    if (user) {
        showToast(`Viewing user: ${user.username}`, 'info');
    }
};

window.editUser = function(userId) {
    const user = currentUsers.find(u => u.id === userId);
    if (user) {
        showToast(`Editing user: ${user.username}`, 'info');
    }
};

window.deleteUser = function(userId) {
    const user = currentUsers.find(u => u.id === userId);
    if (user && confirm(`Are you sure you want to delete user: ${user.username}?`)) {
        currentUsers = currentUsers.filter(u => u.id !== userId);
        filteredUsers = filteredUsers.filter(u => u.id !== userId);
        updateUsersTable();
        updatePagination();
        updateUserCounts();
        showToast('User deleted successfully', 'success');
    }
};

window.changePage = function(page) {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateUsersTable();
        updatePagination();
    }
};

function getRoleColor(role) {
    switch (role) {
        case 'admin': return 'danger';
        case 'driver': return 'primary';
        case 'accountant': return 'success';
        default: return 'secondary';
    }
}

function showLoadingState() {
    const tbody = document.getElementById('users-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center text-muted py-4">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Loading users...
            </td>
        </tr>
    `;
}

function showErrorState() {
    const tbody = document.getElementById('users-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center text-muted py-4">
                <i class="bi bi-exclamation-triangle fs-1 mb-3 d-block text-danger"></i>
                Error loading users. Please try again.
            </td>
        </tr>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type === 'success' ? 'bg-success' : type === 'warning' ? 'bg-warning' : type === 'error' ? 'bg-danger' : 'bg-info'} text-white`;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}
