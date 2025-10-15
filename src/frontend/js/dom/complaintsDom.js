// complaintsDom.js
import { 
    api_GetComplaints, 
    api_CreateComplaint, 
    api_GetComplaint, 
    api_PartialUpdateComplaint, 
    api_DeleteComplaint,
    api_ResolveComplaint,
    api_ExportComplaints,
    api_GetNotifications,
    api_MarkNotificationAsRead,
    api_MarkAllNotificationsAsRead,
    api_DeleteNotification,
    api_GetCustomers,
    api_GetOrders
} from '../apis.js';

let currentComplaints = [];
let currentNotifications = [];
let currentCustomers = [];
let currentOrders = [];
let currentPage = 1;
const itemsPerPage = 10;

// Query parameters state
let currentQueryParams = {
    search: '',
    status: '',
    priority: '',
    ordering: '-created_at',
    page: 1
};

export function initComplaints() {
    loadComplaints();
    loadNotifications();
    loadCustomers();
    loadOrders();
    setupEventListeners();
}

// تعريف loadComplaints كدالة عامة
function loadComplaints() {
    return _loadComplaints();
}

// الدالة الفعلية
async function _loadComplaints() {
    try {
        showLoadingState();
        
        const queryString = buildQueryString();
        const response = await api_GetComplaints(queryString);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentComplaints = data.results;
        
        updateComplaintsTable();
        updatePagination(data);
        updateComplaintCounts(data.count);
        
    } catch (error) {
        console.error('Error loading complaints:', error);
        showErrorState();
    }
}

async function loadCustomers() {
    try {
        const response = await api_GetCustomers();
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentCustomers = data.results || [];
        
    } catch (error) {
        console.error('Error loading customers:', error);
        showToast('Error loading customers data', 'error');
    }
}

async function loadOrders() {
    try {
        const response = await api_GetOrders();
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentOrders = data.results || [];
        
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Error loading orders data', 'error');
    }
}

function buildQueryString() {
    const params = new URLSearchParams();
    
    if (currentQueryParams.search) params.append('search', currentQueryParams.search);
    if (currentQueryParams.status) params.append('status', currentQueryParams.status);
    if (currentQueryParams.priority) params.append('priority', currentQueryParams.priority);
    if (currentQueryParams.ordering) params.append('ordering', currentQueryParams.ordering);
    if (currentQueryParams.page) params.append('page', currentQueryParams.page);
    
    return params.toString() ? `?${params.toString()}` : '';
}

async function loadNotifications() {
    try {
        const response = await api_GetNotifications();
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentNotifications = data.results || [];
        
        updateNotificationsList();
        updateNotificationBadges();
        
    } catch (error) {
        console.error('Error loading notifications:', error);
        showNotificationsErrorState();
    }
}

function updateComplaintsTable() {
    const tbody = document.getElementById('complaints-table');
    
    if (!currentComplaints || currentComplaints.length === 0) {
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
    
    tbody.innerHTML = currentComplaints.map(complaint => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input complaint-checkbox" value="${complaint.id}">
            </td>
            <td>
                <div class="fw-semibold">#${complaint.id}</div>
            </td>
            <td>
                <div>${complaint.customer || 'N/A'}</div>
            </td>
            <td>
                <div class="small text-truncate" style="max-width: 200px;" title="${complaint.issue || ''}">
                    ${complaint.issue || 'No issue description'}
                </div>
            </td>
            <td>
                <span class="badge bg-${getPriorityColor(complaint.priority)}">${complaint.priority || 'N/A'}</span>
            </td>
            <td>
                <span class="badge bg-${getStatusColor(complaint.status)}">${complaint.status || 'new'}</span>
            </td>
            <td>
                <div class="small">${formatDate(complaint.created_at)}</div>
            </td>
            <td>
                <div class="small">${complaint.order || 'N/A'}</div>
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="viewComplaint(${complaint.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="editComplaint(${complaint.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="resolveComplaint(${complaint.id})" title="Resolve">
                        <i class="bi bi-check-circle"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteComplaint(${complaint.id})" title="Delete">
                        <i class="bi bi-trash"></i>
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
                    <i class="bi ${getNotificationIcon(notification.message)} text-${getNotificationColor(notification.message)}"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1 ${notification.is_read ? '' : 'fw-bold'}">${getNotificationTitle(notification.message)}</h6>
                            <p class="mb-1">${notification.message}</p>
                            <small class="text-muted">${formatDate(notification.created_at)}</small>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu">
                                ${!notification.is_read ? `
                                <li><a class="dropdown-item" href="#" onclick="markNotificationAsRead(${notification.id})">
                                    <i class="bi bi-check me-2"></i>Mark as Read
                                </a></li>
                                ` : ''}
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
    
    // تحديث العدادات في الـ footer
    updateNotificationsFooter();
}

function updateNotificationsFooter() {
    const notificationsCount = document.getElementById('notifications-count');
    const unreadCount = document.getElementById('unread-count');
    
    if (notificationsCount) {
        notificationsCount.textContent = currentNotifications.length;
    }
    
    if (unreadCount) {
        const unread = currentNotifications.filter(n => !n.is_read).length;
        unreadCount.textContent = unread;
    }
}

function updatePagination(data) {
    const pagination = document.getElementById('complaints-pagination');
    const totalPages = Math.ceil(data.count / itemsPerPage);
    
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

function updateComplaintCounts(totalCount) {
    document.getElementById('complaints-count').textContent = currentComplaints.length;
    document.getElementById('total-complaints').textContent = totalCount;
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
    const orderingFilter = document.getElementById('ordering-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilter);
    }
    
    if (priorityFilter) {
        priorityFilter.addEventListener('change', handleFilter);
    }
    
    if (orderingFilter) {
        orderingFilter.addEventListener('change', handleOrdering);
    }
    
    // Clear filters
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }
    
    // Export button
    const exportBtn = document.getElementById('export-complaints');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
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
    currentQueryParams.search = e.target.value;
    currentQueryParams.page = 1;
    currentPage = 1;
    loadComplaints();
}

function handleFilter() {
    const statusFilter = document.getElementById('status-filter').value;
    const priorityFilter = document.getElementById('priority-filter').value;
    
    currentQueryParams.status = statusFilter;
    currentQueryParams.priority = priorityFilter;
    currentQueryParams.page = 1;
    currentPage = 1;
    
    loadComplaints();
}

function handleOrdering() {
    const orderingFilter = document.getElementById('ordering-filter').value;
    currentQueryParams.ordering = orderingFilter;
    loadComplaints();
}

function clearFilters() {
    document.getElementById('complaint-search').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('priority-filter').value = '';
    document.getElementById('ordering-filter').value = '-created_at';
    
    currentQueryParams = {
        search: '',
        status: '',
        priority: '',
        ordering: '-created_at',
        page: 1
    };
    currentPage = 1;
    
    loadComplaints();
}

async function handleExport() {
    try {
        const queryString = buildQueryString();
        const response = await api_ExportComplaints(queryString);
        
        if (!response.ok) {
            throw new Error('Failed to export complaints');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `complaints_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showToast('Complaints exported successfully!', 'success');
        
    } catch (error) {
        console.error('Error exporting complaints:', error);
        showToast('Error exporting complaints', 'error');
    }
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

// تحديث دالة Mark All Read لاستخدام API الحقيقي
async function handleMarkAllRead() {
    try {
        const response = await api_MarkAllNotificationsAsRead();
        
        if (!response.ok) {
            throw new Error('Failed to mark all notifications as read');
        }
        
        // تحديث الحالة المحلية
        currentNotifications.forEach(notification => {
            notification.is_read = true;
        });
        
        updateNotificationsList();
        updateNotificationBadges();
        
        // إظهار رسالة نجاح
        showToast('All notifications marked as read', 'success');
        
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        showToast('Error marking notifications as read', 'error');
    }
}

async function showAddComplaintModal() {
    try {
        // التأكد من تحميل العملاء والطلبات
        if (currentCustomers.length === 0) await loadCustomers();
        if (currentOrders.length === 0) await loadOrders();

        const customerOptions = currentCustomers.map(customer => 
            `<option value="${customer.id}">${customer.full_name} - ${customer.phone || 'No Phone'}</option>`
        ).join('');

        const orderOptions = currentOrders.map(order => 
            `<option value="${order.id}">Order #${order.id} - ${order.customer.full_name || 'Unknown Customer'}</option>`
        ).join('');

        const modalHTML = `
            <div class="modal fade" id="addComplaintModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Add New Complaint</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="add-complaint-form">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="customer" class="form-label">Customer *</label>
                                            <select class="form-select" id="customer" required>
                                                <option value="">Select a customer</option>
                                                ${customerOptions}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="order" class="form-label">Order (Optional)</label>
                                            <select class="form-select" id="order">
                                                <option value="">Select an order (optional)</option>
                                                ${orderOptions}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="issue" class="form-label">Issue Description *</label>
                                    <textarea class="form-control" id="issue" rows="4" required placeholder="Describe the issue in detail..."></textarea>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="priority" class="form-label">Priority *</label>
                                            <select class="form-select" id="priority" required>
                                                <option value="low">Low</option>
                                                <option value="medium" selected>Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="status" class="form-label">Status *</label>
                                            <select class="form-select" id="status" required>
                                                <option value="new" selected>New</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="submitNewComplaint()">
                                <i class="bi bi-plus-circle me-1"></i>Create Complaint
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('addComplaintModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body and show it
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('addComplaintModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error showing add complaint modal:', error);
        showToast('Error loading complaint form data', 'error');
    }
}

// Global functions for inline event handlers
function viewComplaint(complaintId) {
    return _viewComplaint(complaintId);
}

async function _viewComplaint(complaintId) {
    try {
        const response = await api_GetComplaint(complaintId);
        if (!response.ok) {
            throw new Error('Failed to fetch complaint');
        }
        const complaint = await response.json();
        
        // Show complaint details in modal
        const modalHTML = `
            <div class="modal fade" id="viewComplaintModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Complaint Details #${complaint.id}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Customer</label>
                                        <p class="form-control-plaintext">${complaint.customer || 'N/A'}</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Order ID</label>
                                        <p class="form-control-plaintext">${complaint.order || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-semibold">Issue Description</label>
                                <div class="border rounded p-3 bg-light">
                                    ${complaint.issue || 'No description provided'}
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Priority</label>
                                        <p><span class="badge bg-${getPriorityColor(complaint.priority)}">${complaint.priority || 'N/A'}</span></p>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Status</label>
                                        <p><span class="badge bg-${getStatusColor(complaint.status)}">${complaint.status || 'new'}</span></p>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">Created Date</label>
                                        <p class="form-control-plaintext">${formatDate(complaint.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-warning" onclick="editComplaint(${complaint.id})" data-bs-dismiss="modal">
                                <i class="bi bi-pencil me-1"></i>Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('viewComplaintModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body and show it
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('viewComplaintModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error viewing complaint:', error);
        showToast('Error loading complaint details', 'error');
    }
}

function editComplaint(complaintId) {
    return _editComplaint(complaintId);
}

async function _editComplaint(complaintId) {
    try {
        const response = await api_GetComplaint(complaintId);
        if (!response.ok) {
            throw new Error('Failed to fetch complaint');
        }
        const complaint = await response.json();

        // التأكد من تحميل العملاء والطلبات
        if (currentCustomers.length === 0) await loadCustomers();
        if (currentOrders.length === 0) await loadOrders();

        const customerOptions = currentCustomers.map(customer => 
            `<option value="${customer.id}" ${complaint.customer === customer.id ? 'selected' : ''}>${customer.name} - ${customer.phone || 'No Phone'}</option>`
        ).join('');

        const orderOptions = currentOrders.map(order => 
            `<option value="${order.id}" ${complaint.order === order.id ? 'selected' : ''}>Order #${order.id} - ${order.customer_name || 'Unknown Customer'}</option>`
        ).join('');
        
        // Create edit modal
        const modalHTML = `
            <div class="modal fade" id="editComplaintModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Complaint #${complaint.id}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="edit-complaint-form">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="edit-customer" class="form-label">Customer *</label>
                                            <select class="form-select" id="edit-customer" required>
                                                <option value="">Select a customer</option>
                                                ${customerOptions}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="edit-order" class="form-label">Order (Optional)</label>
                                            <select class="form-select" id="edit-order">
                                                <option value="">Select an order (optional)</option>
                                                ${orderOptions}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="edit-issue" class="form-label">Issue Description *</label>
                                    <textarea class="form-control" id="edit-issue" rows="4" required>${complaint.issue || ''}</textarea>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="edit-priority" class="form-label">Priority *</label>
                                            <select class="form-select" id="edit-priority" required>
                                                <option value="low" ${complaint.priority === 'low' ? 'selected' : ''}>Low</option>
                                                <option value="medium" ${complaint.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                                <option value="high" ${complaint.priority === 'high' ? 'selected' : ''}>High</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="edit-status" class="form-label">Status *</label>
                                            <select class="form-select" id="edit-status" required>
                                                <option value="new" ${complaint.status === 'new' ? 'selected' : ''}>New</option>
                                                <option value="in_progress" ${complaint.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                                <option value="resolved" ${complaint.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="submitEditComplaint(${complaint.id})">
                                <i class="bi bi-check-circle me-1"></i>Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('editComplaintModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body and show it
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('editComplaintModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error editing complaint:', error);
        showToast('Error loading complaint for editing', 'error');
    }
}

function submitEditComplaint(complaintId) {
    return _submitEditComplaint(complaintId);
}

async function _submitEditComplaint(complaintId) {
    try {
        const customerSelect = document.getElementById('edit-customer');
        const orderSelect = document.getElementById('edit-order');

        if (!customerSelect.value) {
            showToast('Please select a customer', 'warning');
            return;
        }

        const formData = {
            customer: parseInt(customerSelect.value),
            order: orderSelect.value ? parseInt(orderSelect.value) : null,
            issue: document.getElementById('edit-issue').value,
            priority: document.getElementById('edit-priority').value,
            status: document.getElementById('edit-status').value
        };
        
        const response = await api_PartialUpdateComplaint(complaintId, formData);
        
        if (!response.ok) {
            throw new Error('Failed to update complaint');
        }
        
        // Close modal and refresh complaints
        bootstrap.Modal.getInstance(document.getElementById('editComplaintModal')).hide();
        loadComplaints();
        showToast('Complaint updated successfully', 'success');
        
    } catch (error) {
        console.error('Error updating complaint:', error);
        showToast('Error updating complaint', 'error');
    }
}

function resolveComplaint(complaintId) {
    return _resolveComplaint(complaintId);
}

async function _resolveComplaint(complaintId) {
    // استخدام confirm مع toast للرسائل
    const confirmed = await showConfirmModal(
        'Resolve Complaint',
        `Are you sure you want to resolve complaint #${complaintId}?`,
        'question'
    );
    
    if (confirmed) {
        try {
            const response = await api_ResolveComplaint(complaintId);
            
            if (!response.ok) {
                throw new Error('Failed to resolve complaint');
            }
            
            loadComplaints();
            showToast('Complaint resolved successfully', 'success');
            
        } catch (error) {
            console.error('Error resolving complaint:', error);
            showToast('Error resolving complaint', 'error');
        }
    }
}

function deleteComplaint(complaintId) {
    return _deleteComplaint(complaintId);
}

async function _deleteComplaint(complaintId) {
    // استخدام confirm مع toast للرسائل
    const confirmed = await showConfirmModal(
        'Delete Complaint',
        `Are you sure you want to delete complaint #${complaintId}? This action cannot be undone.`,
        'warning'
    );
    
    if (confirmed) {
        try {
            const response = await api_DeleteComplaint(complaintId);
            
            if (!response.ok) {
                throw new Error('Failed to delete complaint');
            }
            
            loadComplaints();
            showToast('Complaint deleted successfully', 'success');
            
        } catch (error) {
            console.error('Error deleting complaint:', error);
            showToast('Error deleting complaint', 'error');
        }
    }
}

function submitNewComplaint() {
    return _submitNewComplaint();
}

async function _submitNewComplaint() {
    try {
        const customerSelect = document.getElementById('customer');
        const orderSelect = document.getElementById('order');

        if (!customerSelect.value) {
            showToast('Please select a customer', 'warning');
            return;
        }

        const formData = {
            customer: parseInt(customerSelect.value),
            order: orderSelect.value ? parseInt(orderSelect.value) : null,
            issue: document.getElementById('issue').value,
            priority: document.getElementById('priority').value,
            status: document.getElementById('status').value
        };
        
        const response = await api_CreateComplaint(formData);
        
        if (!response.ok) {
            throw new Error('Failed to create complaint');
        }
        
        // Close modal and refresh complaints
        bootstrap.Modal.getInstance(document.getElementById('addComplaintModal')).hide();
        loadComplaints();
        showToast('Complaint created successfully', 'success');
        
    } catch (error) {
        console.error('Error creating complaint:', error);
        showToast('Error creating complaint', 'error');
    }
}

function changePage(page) {
    currentQueryParams.page = page;
    currentPage = page;
    loadComplaints();
}

// دوال الإشعارات الجديدة مع الـ API الحقيقي
function markNotificationAsRead(notificationId) {
    return _markNotificationAsRead(notificationId);
}

async function _markNotificationAsRead(notificationId) {
    try {
        const response = await api_MarkNotificationAsRead(notificationId);
        
        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }
        
        // تحديث الحالة المحلية
        const notification = currentNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.is_read = true;
        }
        
        updateNotificationsList();
        updateNotificationBadges();
        
        showToast('Notification marked as read', 'success');
        
    } catch (error) {
        console.error('Error marking notification as read:', error);
        showToast('Error marking notification as read', 'error');
    }
}

function deleteNotification(notificationId) {
    return _deleteNotification(notificationId);
}

async function _deleteNotification(notificationId) {
    // استخدام confirm مع toast للرسائل
    const confirmed = await showConfirmModal(
        'Delete Notification',
        'Are you sure you want to delete this notification?',
        'warning'
    );
    
    if (confirmed) {
        try {
            const response = await api_DeleteNotification(notificationId);
            
            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }
            
            // تحديث الحالة المحلية
            currentNotifications = currentNotifications.filter(n => n.id !== notificationId);
            
            updateNotificationsList();
            updateNotificationBadges();
            
            showToast('Notification deleted successfully', 'success');
            
        } catch (error) {
            console.error('Error deleting notification:', error);
            showToast('Error deleting notification', 'error');
        }
    }
}

// دوال مساعدة
function getPriorityColor(priority) {
    switch (priority) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'secondary';
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'new': return 'primary';
        case 'in_progress': return 'warning';
        case 'resolved': return 'success';
        default: return 'secondary';
    }
}

// دوال مساعدة جديدة للإشعارات
function getNotificationIcon(message) {
    if (!message) return 'bell';
    
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('complaint')) {
        return 'exclamation-triangle';
    } else if (lowerMessage.includes('order')) {
        return 'cart-check';
    } else if (lowerMessage.includes('invoice')) {
        return 'receipt';
    } else if (lowerMessage.includes('user')) {
        return 'person';
    }
    return 'bell';
}

function getNotificationColor(message) {
    if (!message) return 'primary';
    
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('complaint')) {
        return 'warning';
    } else if (lowerMessage.includes('order')) {
        return 'success';
    } else if (lowerMessage.includes('invoice')) {
        return 'info';
    } else if (lowerMessage.includes('user')) {
        return 'primary';
    }
    return 'secondary';
}

function getNotificationTitle(message) {
    if (!message) return 'Notification';
    
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('complaint')) {
        return 'New Complaint';
    } else if (lowerMessage.includes('order')) {
        return 'Order Update';
    } else if (lowerMessage.includes('invoice')) {
        return 'Invoice Alert';
    } else if (lowerMessage.includes('user')) {
        return 'User Activity';
    }
    return 'System Notification';
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

function showNotificationsErrorState() {
    const container = document.getElementById('notifications-list');
    if (container) {
        container.innerHTML = `
            <div class="list-group-item text-center text-muted py-4">
                <i class="bi bi-exclamation-triangle fs-1 mb-3 d-block text-danger"></i>
                Error loading notifications. Please try again.
                <br>
                <button class="btn btn-sm btn-outline-primary mt-2" onclick="loadNotifications()">
                    <i class="bi bi-arrow-clockwise me-1"></i>Retry
                </button>
            </div>
        `;
    }
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

// دالة لعرض Toast messages بدلاً من alert
function showToast(message, type = 'info') {
    // إنشاء عنصر toast ديناميكيًا
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-bg-${type === 'error' ? 'danger' : type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    // إضافة toast إلى container
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    // عرض toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // إزالة toast بعد اختفائه
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// دالة لعرض تأكيد مخصص بدلاً من confirm
function showConfirmModal(title, message, icon = 'question') {
    return new Promise((resolve) => {
        const modalId = 'confirm-modal-' + Date.now();
        const iconClass = {
            'question': 'bi-question-circle',
            'warning': 'bi-exclamation-triangle',
            'danger': 'bi-exclamation-circle'
        }[icon] || 'bi-question-circle';

        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="bi ${iconClass} text-${icon} me-2"></i>${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="${modalId}-cancel">Cancel</button>
                            <button type="button" class="btn btn-${icon === 'warning' || icon === 'danger' ? 'danger' : 'primary'}" id="${modalId}-confirm">Confirm</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body and show it
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modalElement = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        // Setup event listeners
        document.getElementById(`${modalId}-confirm`).addEventListener('click', () => {
            modal.hide();
            resolve(true);
        });

        document.getElementById(`${modalId}-cancel`).addEventListener('click', () => {
            modal.hide();
            resolve(false);
        });

        modalElement.addEventListener('hidden.bs.modal', () => {
            modalElement.remove();
            resolve(false);
        });
    });
}


window.loadComplaints = loadComplaints;
window.viewComplaint = viewComplaint;
window.editComplaint = editComplaint;
window.resolveComplaint = resolveComplaint;
window.deleteComplaint = deleteComplaint;
window.submitNewComplaint = submitNewComplaint;
window.submitEditComplaint = submitEditComplaint;
window.changePage = changePage;
window.markNotificationAsRead = markNotificationAsRead;
window.deleteNotification = deleteNotification;