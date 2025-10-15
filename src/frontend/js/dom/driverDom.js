import { 
    api_GetDriverOrders, 
    api_ConfirmDriverOrder,
    api_ReportDriverFailed 
} from '../apis.js';

let currentFilter = 'pending';
let currentPage = 1;
let currentOrdering = '-created_at';

export function initDriver() {
    loadDriverOrders();
    setupEventListeners();
}

function setupEventListeners() {
    // Filter buttons event delegation
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-btn')) {
            const filter = e.target.dataset.filter;
            if (filter !== currentFilter) {
                currentFilter = filter;
                currentPage = 1;
                updateActiveFilter();
                loadDriverOrders();
            }
        }
    });

    // Modal event listeners
    const confirmModal = document.getElementById('confirmOrderModal');
    const failedModal = document.getElementById('reportFailedModal');
    
    if (confirmModal) {
        confirmModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const orderId = button.getAttribute('data-order-id');
            const orderGallons = button.getAttribute('data-order-gallons');
            const customerName = button.getAttribute('data-customer-name');
            
            const modal = this;
            modal.querySelector('#confirmOrderId').value = orderId;
            modal.querySelector('#maxGallons').textContent = orderGallons;
            modal.querySelector('#customerName').textContent = customerName;
            modal.querySelector('#filledAmount').max = orderGallons;
            modal.querySelector('#filledAmount').value = '';
            modal.querySelector('#proofImage').value = '';
        });
    }

    if (failedModal) {
        failedModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const orderId = button.getAttribute('data-order-id');
            const customerName = button.getAttribute('data-customer-name');
            
            const modal = this;
            modal.querySelector('#failedOrderId').value = orderId;
            modal.querySelector('#failedCustomerName').textContent = customerName;
            modal.querySelector('#failureReason').value = '';
        });
    }
}

function updateActiveFilter() {
    // Update active state of filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update filter display
    const filterDisplay = document.getElementById('currentFilter');
    if (filterDisplay) {
        const filterLabels = {
            'pending': 'Pending',
            'completed': 'Completed',
            'failed': 'Failed',
            '': 'All'
        };
        filterDisplay.textContent = filterLabels[currentFilter] || 'All';
    }
}

async function loadDriverOrders() {
    const tbody = document.getElementById('driverOrdersBody');
    
    // Show loading state
    tbody.innerHTML = `
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
    `;

    try {
        // Build query string with filters
        const queryParams = new URLSearchParams();
        
        if (currentFilter) {
            queryParams.append('status', currentFilter);
        }
        
        if (currentOrdering) {
            queryParams.append('ordering', currentOrdering);
        }
        
        if (currentPage > 1) {
            queryParams.append('page', currentPage);
        }

        const queryString = queryParams.toString();
        const res = await api_GetDriverOrders(queryString ? `?${queryString}` : '');
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || Object.values(errorData).flat().join(', ') || 'Failed to load orders');
        }

        const data = await res.json();
        const orders = data.results || [];

        // Update pagination info
        updatePaginationInfo(data);

        if (orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <div class="empty-state">
                            <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                            <h5>No orders found</h5>
                            <p class="text-muted">
                                ${currentFilter ? `No ${currentFilter} orders available.` : 'No orders available.'}
                            </p>
                            ${currentFilter ? `
                                <button class="btn btn-outline-primary btn-sm" onclick="clearFilters()">
                                    Clear filters
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Render orders
        tbody.innerHTML = "";
        orders.forEach(order => {
            const deliveryTime = new Date(order.delivery_time).toLocaleString();
            const createdTime = new Date(order.created_at).toLocaleString();
            const isPending = order.status === "pending";
            
            tbody.innerHTML += `
                <tr class="fade-in-up">
                    <td><strong>#${order.id}</strong></td>
                    <td>
                        <div>
                            <div class="fw-semibold">${order.customer || 'N/A'}</div>
                        </div>
                    </td>
                    <td>
                        <div>
                            <div class="fw-medium">${order.required_gallons} gallons</div>
                            <small class="text-muted">Required amount</small>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${order.status}">
                            ${getStatusDisplayText(order.status)}
                        </span>
                    </td>
                    <td>
                        <div>
                            <div class="small fw-medium">Created: ${createdTime}</div>
                            <div class="small text-muted">Delivery: ${deliveryTime}</div>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex flex-column gap-2">
                            ${order.customer_location && order.customer_location !== 'https://www.google.com/maps/dir//' ? 
                                `<a href="${order.customer_location}" target="_blank" class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-map-marker-alt me-1"></i> View Location
                                </a>` : 
                                '<span class="text-muted small">No location available</span>'
                            }
                            
                            ${isPending ? `
                                <div class="d-flex gap-2">
                                    <button class="btn btn-sm btn-success flex-fill" 
                                            data-bs-toggle="modal" 
                                            data-bs-target="#confirmOrderModal"
                                            data-order-id="${order.id}"
                                            data-order-gallons="${order.required_gallons}"
                                            data-customer-name="${order.customer || 'Customer'}">
                                        <i class="fas fa-check me-1"></i> Confirm
                                    </button>
                                    <button class="btn btn-sm btn-danger flex-fill" 
                                            data-bs-toggle="modal" 
                                            data-bs-target="#reportFailedModal"
                                            data-order-id="${order.id}"
                                            data-customer-name="${order.customer || 'Customer'}">
                                        <i class="fas fa-exclamation-triangle me-1"></i> Failed
                                    </button>
                                </div>
                            ` : `
                                <div class="text-center">
                                    ${order.status === "completed" ? `
                                        <div class="text-success">
                                            <i class="fas fa-check-circle me-1"></i>
                                            <div class="small">Completed</div>
                                            ${order.filled_amount ? `
                                                <div class="text-muted small">${order.filled_amount} gallons</div>
                                            ` : ''}
                                        </div>
                                    ` : order.status === "failed" ? `
                                        <div class="text-danger">
                                            <i class="fas fa-times-circle me-1"></i>
                                            <div class="small">Failed</div>
                                            ${order.failure_reason ? `
                                                <div class="text-muted small">${getFailureReasonText(order.failure_reason)}</div>
                                            ` : ''}
                                        </div>
                                    ` : ''}
                                </div>
                            `}
                        </div>
                    </td>
                </tr>
            `;
        });

    } catch (err) {
        console.error("Error fetching driver orders:", err);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle"></i>
                        <div>Error loading orders: ${err.message}</div>
                        <button class="btn btn-sm btn-outline-danger mt-2" onclick="loadDriverOrders()">
                            <i class="fas fa-redo"></i> Try Again
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

function updatePaginationInfo(data) {
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationControls = document.getElementById('paginationControls');
    
    if (paginationInfo) {
        const start = ((currentPage - 1) * 10) + 1;
        const end = Math.min(currentPage * 10, data.count);
        paginationInfo.innerHTML = `Showing ${start}-${end} of ${data.count} orders`;
    }
    
    if (paginationControls) {
        let paginationHTML = '';
        
        // Previous button
        if (data.previous) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
                </li>
            `;
        } else {
            paginationHTML += `
                <li class="page-item disabled">
                    <span class="page-link">Previous</span>
                </li>
            `;
        }
        
        // Page numbers (simplified - you can make this more sophisticated)
        const totalPages = Math.ceil(data.count / 10);
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                paginationHTML += `
                    <li class="page-item active">
                        <span class="page-link">${i}</span>
                    </li>
                `;
            } else {
                paginationHTML += `
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                    </li>
                `;
            }
        }
        
        // Next button
        if (data.next) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
                </li>
            `;
        } else {
            paginationHTML += `
                <li class="page-item disabled">
                    <span class="page-link">Next</span>
                </li>
            `;
        }
        
        paginationControls.innerHTML = paginationHTML;
    }
}

function getStatusDisplayText(status) {
    const statusMap = {
        'pending': 'Pending',
        'completed': 'Completed',
        'failed': 'Failed'
    };
    return statusMap[status] || status;
}

function getFailureReasonText(reason) {
    const reasonMap = {
        'customer_not_found': 'Customer not found',
        'wrong_address': 'Wrong address',
        'refused': 'Customer refused',
        'location_issue': 'Location issue',
        'vehicle_issue': 'Vehicle issue',
        'other': 'Other issue'
    };
    return reasonMap[reason] || reason;
}

// Clear all filters
window.clearFilters = function() {
    currentFilter = 'pending';
    currentPage = 1;
    updateActiveFilter();
    loadDriverOrders();
}

// Change page
window.changePage = function(page) {
    currentPage = page;
    loadDriverOrders();
}

// ✅ Confirm order with image + quantity
window.confirmOrder = async function() {
    const orderId = document.getElementById('confirmOrderId').value;
    const fileInput = document.getElementById('proofImage');
    const qtyInput = document.getElementById('filledAmount');
    const button = document.querySelector('#confirmOrderModal .btn-success');

    // Validation
    if (!fileInput || fileInput.files.length === 0) {
        showToast('⚠️ Please select a proof image before confirming.', 'warning');
        fileInput.focus();
        return;
    }
    
    if (!qtyInput || !qtyInput.value || parseInt(qtyInput.value) <= 0) {
        showToast('⚠️ Please enter a valid quantity (actual gallons delivered).', 'warning');
        qtyInput.focus();
        return;
    }

    const file = fileInput.files[0];
    const filled_amount = parseInt(qtyInput.value);

    // Show loading state
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    button.disabled = true;

    try {
        const res = await api_ConfirmDriverOrder(orderId, file, filled_amount);
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || Object.values(errorData).flat().join(', ') || 'Failed to confirm order');
        }

        showToast('✅ Order completed successfully!', 'success');
        
        // Close modal and refresh data
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmOrderModal'));
        modal.hide();
        await loadDriverOrders();
        
    } catch (err) {
        console.error('Confirm order error:', err);
        showToast(`❌ Error: ${err.message}`, 'error');
    } finally {
        // Restore button state
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// ❌ Report failed delivery
window.reportFailed = async function() {
    const orderId = document.getElementById('failedOrderId').value;
    const select = document.getElementById('failureReason');
    const button = document.querySelector('#reportFailedModal .btn-danger');
    const reason = select.value;

    if (!reason) {
        showToast('⚠️ Please select a failure reason.', 'warning');
        select.focus();
        return;
    }

    // Show loading state
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reporting...';
    button.disabled = true;

    try {
        const res = await api_ReportDriverFailed(orderId, reason);
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || Object.values(errorData).flat().join(', ') || 'Failed to report failed delivery');
        }

        showToast('⚠️ Delivery failure reported successfully.', 'warning');
        
        // Close modal and refresh data
        const modal = bootstrap.Modal.getInstance(document.getElementById('reportFailedModal'));
        modal.hide();
        await loadDriverOrders();
        
    } catch (err) {
        console.error('Report failed error:', err);
        showToast(`❌ Error: ${err.message}`, 'error');
    } finally {
        // Restore button state
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Utility function to show toast notifications
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelector('.toast-container');
    if (existingToasts) {
        existingToasts.remove();
    }

    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '1080';

    const bgClass = type === 'success' ? 'bg-success' : 
                   type === 'error' ? 'bg-danger' : 
                   type === 'warning' ? 'bg-warning' : 'bg-info';

    toastContainer.innerHTML = `
        <div class="toast align-items-center text-white ${bgClass} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    document.body.appendChild(toastContainer);
    
    const toast = new bootstrap.Toast(toastContainer.querySelector('.toast'));
    toast.show();
    
    // Auto remove after hide
    toastContainer.querySelector('.toast').addEventListener('hidden.bs.toast', () => {
        toastContainer.remove();
    });
}