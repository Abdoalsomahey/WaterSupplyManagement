import { mockApi_GetComplaints, mockApi_GetNotifications, sampleComplaints, sampleNotifications } from '../apis.js';

let currentComplaints = [];
let filteredComplaints = [];
let currentNotifications = [];
let currentPage = 1;
const itemsPerPage = 10;

export function initComplaints() {
    loadComplaints();
    loadNotifications();
    setupEventListeners();
}

async function loadComplaints() {
    try {
        showLoadingState();
        
        const response = await mockApi_GetComplaints();
        currentComplaints = await response.json();
        filteredComplaints = [...currentComplaints];
        
        updateComplaintsTable();
        updatePagination();
        updateComplaintCounts();
        updateComplaintStats();
        
    } catch (error) {
        console.error('Error loading complaints:', error);
        showErrorState();
    }
}

async function loadNotifications() {
    try {
        const response = await mockApi_GetNotifications();
        currentNotifications = await response.json();
        
        updateNotificationsList();
        updateNotificationBadges();
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function updateComplaintsTable() {
    const tbody = document.getElementById('complaints-table');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageComplaints = filteredComplaints.slice(startIndex, endIndex);
    
    if (pageComplaints.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
                    No complaints found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pageComplaints.map(complaint => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input complaint-checkbox" value="${complaint.id}">
            </td>
            <td>
                <div class="fw-semibold">#${complaint.id}</div>
            </td>
            <td>
                <div>${complaint.customer_name}</div>
            </td>
            <td>
                <div class="small" title="${complaint.description}">${complaint.issue}</div>
            </td>
            <td>
                <span class="badge bg-${getPriorityColor(complaint.priority)}">${complaint.priority}</span>
            </td>
            <td>
                <span class="status-badge ${complaint.status}">${complaint.status}</span>
            </td>
            <td>
                <div class="small">${formatDate(complaint.created_at)}</div>
            </td>
            <td>
                <div class="small">${complaint.order_number || 'N/A'}</div>
            </td>
            <td>
                <div class="data-table-actions">
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="viewComplaint(${complaint.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning btn-action" onclick="editComplaint(${complaint.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success btn-action" onclick="resolveComplaint(${complaint.id})" title="Resolve">
                        <i class="bi bi-check-circle"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    updateBulkActionsVisibility();
}

function updateNotificationsList() {
    const container = document.getElementById('notifications-list');
    
    if (!currentNotifications || currentNotifications.length === 0) {
        container.innerHTML = `
            <div class="list-group-item text-center text-muted py-4">
                <i class="bi bi-bell-slash fs-1 mb-3 d-block"></i>
                No notifications found
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentNotifications.map(notification => `
        <div class="list-group-item ${notification.is_read ? '' : 'bg-light'}">
            <div class="d-flex align-items-start">
                <div class="flex-shrink-0 me-3">
                    <i class="bi bi-${getNotificationIcon(notification.type)} text-${getNotificationColor(notification.type)}"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1 ${notification.is_read ? '' : 'fw-bold'}">${notification.title}</h6>
                            <p class="mb-1">${notification.message}</p>
                            <small class="text-muted">${formatDate(notification.created_at)}</small>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="markAsRead(${notification.id})">
                                    <i class="bi bi-check me-2"></i>Mark as Read
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="deleteNotification(${notification.id})">
                                    <i class="bi bi-trash me-2"></i>Delete
                                </a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function updatePagination() {
    const pagination = document.getElementById('complaints-pagination');
    const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
    
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

function updateComplaintCounts() {
    document.getElementById('complaints-count').textContent = filteredComplaints.length;
    document.getElementById('total-complaints').textContent = currentComplaints.length;
}

function updateComplaintStats() {
    const totalComplaints = currentComplaints.length;
    const newComplaints = currentComplaints.filter(c => c.status === 'new').length;
    const inProgressComplaints = currentComplaints.filter(c => c.status === 'in_progress').length;
    const resolvedComplaints = currentComplaints.filter(c => c.status === 'resolved').length;
    
    document.getElementById('total-complaints-count').textContent = totalComplaints;
    document.getElementById('new-complaints-count').textContent = newComplaints;
    document.getElementById('in-progress-count').textContent = inProgressComplaints;
    document.getElementById('resolved-count').textContent = resolvedComplaints;
}

function updateNotificationBadges() {
    const unreadCount = currentNotifications.filter(n => !n.is_read).length;
    const complaintsBadge = document.getElementById('complaints-badge');
    const notificationsBadge = document.getElementById('notifications-badge');
    
    if (complaintsBadge) {
        complaintsBadge.textContent = currentComplaints.length;
    }
    
    if (notificationsBadge) {
        notificationsBadge.textContent = unreadCount;
    }
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('complaint-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filter functionality
    const statusFilter = document.getElementById('status-filter');
    const priorityFilter = document.getElementById('priority-filter');
    const customerFilter = document.getElementById('customer-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilter);
    }
    
    if (priorityFilter) {
        priorityFilter.addEventListener('change', handleFilter);
    }
    
    if (customerFilter) {
        customerFilter.addEventListener('change', handleFilter);
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
    const bulkAssignBtn = document.getElementById('bulk-assign');
    const bulkUpdateStatusBtn = document.getElementById('bulk-update-status');
    
    if (bulkAssignBtn) {
        bulkAssignBtn.addEventListener('click', handleBulkAssign);
    }
    
    if (bulkUpdateStatusBtn) {
        bulkUpdateStatusBtn.addEventListener('click', handleBulkUpdateStatus);
    }
    
    // Mark all read button
    const markAllReadBtn = document.getElementById('mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', handleMarkAllRead);
    }
    
    // Add complaint button
    const addComplaintBtn = document.getElementById('add-complaint');
    if (addComplaintBtn) {
        addComplaintBtn.addEventListener('click', showAddComplaintModal);
    }
    
    // Refresh notifications button
    const refreshNotificationsBtn = document.getElementById('refresh-notifications');
    if (refreshNotificationsBtn) {
        refreshNotificationsBtn.addEventListener('click', loadNotifications);
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    filteredComplaints = currentComplaints.filter(complaint => 
        complaint.customer_name.toLowerCase().includes(searchTerm) ||
        complaint.issue.toLowerCase().includes(searchTerm) ||
        complaint.description.toLowerCase().includes(searchTerm) ||
        (complaint.order_number && complaint.order_number.toLowerCase().includes(searchTerm))
    );
    
    currentPage = 1;
    updateComplaintsTable();
    updatePagination();
    updateComplaintCounts();
}

function handleFilter() {
    const statusFilter = document.getElementById('status-filter').value;
    const priorityFilter = document.getElementById('priority-filter').value;
    const customerFilter = document.getElementById('customer-filter').value;
    
    filteredComplaints = currentComplaints.filter(complaint => {
        const statusMatch = !statusFilter || complaint.status === statusFilter;
        const priorityMatch = !priorityFilter || complaint.priority === priorityFilter;
        const customerMatch = !customerFilter || complaint.customer_name === customerFilter;
        
        return statusMatch && priorityMatch && customerMatch;
    });
    
    currentPage = 1;
    updateComplaintsTable();
    updatePagination();
    updateComplaintCounts();
}

function clearFilters() {
    document.getElementById('complaint-search').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('priority-filter').value = '';
    document.getElementById('customer-filter').value = '';
    
    filteredComplaints = [...currentComplaints];
    currentPage = 1;
    updateComplaintsTable();
    updatePagination();
    updateComplaintCounts();
}

function handleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.complaint-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
    });
    updateBulkActionsVisibility();
}

function updateBulkActionsVisibility() {
    const checkedBoxes = document.querySelectorAll('.complaint-checkbox:checked');
    const bulkActions = document.getElementById('bulk-actions');
    
    if (checkedBoxes.length > 0) {
        bulkActions.style.display = 'flex';
    } else {
        bulkActions.style.display = 'none';
    }
}

function handleBulkAssign() {
    const checkedBoxes = document.querySelectorAll('.complaint-checkbox:checked');
    const complaintIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (complaintIds.length === 0) {
        showToast('Please select complaints to assign', 'warning');
        return;
    }
    
    showToast(`Assignment functionality for ${complaintIds.length} complaint(s) would be implemented here`, 'info');
}

function handleBulkUpdateStatus() {
    const checkedBoxes = document.querySelectorAll('.complaint-checkbox:checked');
    const complaintIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    if (complaintIds.length === 0) {
        showToast('Please select complaints to update status', 'warning');
        return;
    }
    
    showToast(`Status update functionality for ${complaintIds.length} complaint(s) would be implemented here`, 'info');
}

function handleMarkAllRead() {
    currentNotifications.forEach(notification => {
        notification.is_read = true;
    });
    
    updateNotificationsList();
    updateNotificationBadges();
    showToast('All notifications marked as read', 'success');
}

function showAddComplaintModal() {
    showToast('Add complaint functionality would be implemented here', 'info');
}

// Global functions for inline event handlers
window.viewComplaint = function(complaintId) {
    const complaint = currentComplaints.find(c => c.id === complaintId);
    if (complaint) {
        showToast(`Viewing complaint #${complaint.id}`, 'info');
    }
};

window.editComplaint = function(complaintId) {
    const complaint = currentComplaints.find(c => c.id === complaintId);
    if (complaint) {
        showToast(`Editing complaint #${complaint.id}`, 'info');
    }
};

window.resolveComplaint = function(complaintId) {
    const complaint = currentComplaints.find(c => c.id === complaintId);
    if (complaint && confirm(`Are you sure you want to resolve complaint #${complaint.id}?`)) {
        complaint.status = 'resolved';
        complaint.resolved_at = new Date().toISOString();
        
        updateComplaintsTable();
        updateComplaintCounts();
        updateComplaintStats();
        showToast('Complaint resolved successfully', 'success');
    }
};

window.changePage = function(page) {
    const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateComplaintsTable();
        updatePagination();
    }
};

window.markAsRead = function(notificationId) {
    const notification = currentNotifications.find(n => n.id === notificationId);
    if (notification) {
        notification.is_read = true;
        updateNotificationsList();
        updateNotificationBadges();
        showToast('Notification marked as read', 'success');
    }
};

window.deleteNotification = function(notificationId) {
    const notification = currentNotifications.find(n => n.id === notificationId);
    if (notification && confirm('Are you sure you want to delete this notification?')) {
        currentNotifications = currentNotifications.filter(n => n.id !== notificationId);
        updateNotificationsList();
        updateNotificationBadges();
        showToast('Notification deleted successfully', 'success');
    }
};

function getPriorityColor(priority) {
    switch (priority) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'secondary';
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'complaint': return 'exclamation-triangle';
        case 'order': return 'cart-check';
        case 'invoice': return 'receipt';
        default: return 'bell';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'complaint': return 'warning';
        case 'order': return 'success';
        case 'invoice': return 'info';
        default: return 'primary';
    }
}

function showLoadingState() {
    const tbody = document.getElementById('complaints-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="9" class="text-center text-muted py-4">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Loading complaints...
            </td>
        </tr>
    `;
}

function showErrorState() {
    const tbody = document.getElementById('complaints-table');
    tbody.innerHTML = `
        <tr>
            <td colspan="9" class="text-center text-muted py-4">
                <i class="bi bi-exclamation-triangle fs-1 mb-3 d-block text-danger"></i>
                Error loading complaints. Please try again.
            </td>
        </tr>
    `;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
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
