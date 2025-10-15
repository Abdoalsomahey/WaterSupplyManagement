export async function api_CheckAuth() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/check-auth/', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_Login(username, password) {
    const response = await fetch('/api/log_in/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    return await response;
}

export async function api_Logout(accessToken, refreshToken) {
    const response = await fetch('/api/log_out/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ refresh: refreshToken })
    });
    return await response;
}

export async function api_RefreshToken(refreshToken) {
    const response = await fetch('/api/token/refresh/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken })
    });
    return await response;
}

// ==================== USERS ====================
export async function api_GetUsers(query = "") {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/users/${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_GetUser(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/users/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_CreateUser(userData) {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/users/', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });
}

export async function api_UpdateUser(userId, userData) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/users/${userId}/`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });
}

export async function api_PartialUpdateUser(userId, userData) {
	const token = localStorage.getItem('access_token');
	return await fetch(`/api/users/${userId}/`, {
		method: 'PATCH',
		headers: { 
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(userData)
	});
}

export async function api_DeleteUser(userId) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/users/${userId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_ExportUsers(query = "") {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/users/export_excel/${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

// ==================== CUSTOMERS ====================
export async function api_GetCustomers(query = "") {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/customers/${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_CreateCustomer(data) {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/customers/', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_GetCustomer(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/customers/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_UpdateCustomer(id, data) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/customers/${id}/`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_PartialUpdateCustomer(id, data) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/customers/${id}/`, {
        method: 'PATCH',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_DeleteCustomer(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/customers/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_ExportCustomers(query = "") {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/customers/export_excel/${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

// ==================== RECHECK INVOICES (Admin) ====================
export async function api_GetRechecks(query = "") {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/rechecks/${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_CreateRecheck(data) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/rechecks/`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_GetRecheck(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/rechecks/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_UpdateRecheck(id, data) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/rechecks/${id}/`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_PatchRecheck(id, data) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/rechecks/${id}/`, {
        method: 'PATCH',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_DeleteRecheck(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/rechecks/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_SendRecheckToAccountant(id, accountant_username) {
    const token = localStorage.getItem('access_token');

    return await fetch(`/api/rechecks/${id}/send_to_accountant/`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accountant_username })
    });
}

export async function api_ExportRechecksExcel(query = "") {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/rechecks/export_excel/${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

// ==================== FINAL INVOICES (Accountant) ====================
export async function api_GetFinalInvoices(query = "") {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/accountant/invoices/${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_GetFinalInvoice(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/accountant/invoices/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_CreateFinalInvoice(data) {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/accountant/invoices/', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_UpdateFinalInvoice(id, data) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/accountant/invoices/${id}/`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_PatchFinalInvoice(id, data) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/accountant/invoices/${id}/`, {
        method: 'PATCH',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_DeleteFinalInvoice(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/accountant/invoices/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}


export async function api_ApproveFinalInvoice(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/accountant/invoices/${id}/approve/`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
}

export async function api_MarkPaidFinalInvoice(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/accountant/invoices/${id}/mark_paid/`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
}

export async function api_ExportFinalInvoiceExcel(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/accountant/invoices/${id}/export_excel/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_ExportFinalInvoicePDF(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/accountant/invoices/${id}/export_pdf/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

// ==================== ORDERS ====================
export async function api_GetOrders(query = "") {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/orders/${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_CreateOrder(data) {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/orders/', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_GetOrder(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/orders/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_UpdateOrder(id, data) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/orders/${id}/`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_PartialUpdateOrder(id, data) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/orders/${id}/`, {
        method: 'PATCH',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_DeleteOrder(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/orders/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_ExportOrders(query = "") {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/orders/export_excel/${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}
// ==================== DRIVERS ====================

export async function api_GetDriverOrders(query = "") {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/driver/orders/${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_GetDriverOrder(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/driver/orders/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_ConfirmDriverOrder(orderId, file, quantity) {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('proof_image', file);
    formData.append("filled_amount", quantity);

    return await fetch(`/api/driver/orders/${orderId}/confirm/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
}

export async function api_ReportDriverFailed(orderId, reason) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/driver/orders/${orderId}/failed/`, { 
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
    });
}


// =================== COMPLAINTS ====================
export async function api_GetComplaints(query = "") {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/complaints/${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_CreateComplaint(data) {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/complaints/', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_GetComplaint(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/complaints/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_UpdateComplaint(id, data) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/complaints/${id}/`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_PartialUpdateComplaint(id, data) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/complaints/${id}/`, {
        method: 'PATCH',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_DeleteComplaint(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/complaints/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_ResolveComplaint(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/complaints/${id}/resolve/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_ExportComplaints(query = "") {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/complaints/export_excel/${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}


// ==================== DASHBOARD ====================

export async function api_RefreshDashboard() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/dashboard/summary/', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_ExportDashboardExcel() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/dashboard/export_excel/', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_GetDashboardChartData(period = "7d") {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/dashboard/chart/?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_GetDashboardRecentOrders() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/dashboard/recent_orders/', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_GetDashboardRecentInvoices() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/dashboard/recent_invoices/', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_GetDashboardAlerts() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/dashboard/alerts/', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

// ==================== NOTIFICATIONS ====================
export async function api_GetNotifications() {
	const token = localStorage.getItem('access_token');
	return await fetch(`/api/notifications/`, {
		headers: { 'Authorization': `Bearer ${token}` }
	});
}
export async function api_MarkNotificationAsRead(id) {
	const token = localStorage.getItem('access_token');
	return await fetch(`/api/notifications/${id}/mark_read/`, {
		method: 'POST',
		headers: { 'Authorization': `Bearer ${token}` }
	});
}
export async function api_MarkAllNotificationsAsRead() {
	const token = localStorage.getItem('access_token');
	return await fetch('/api/notifications/mark_all_read/', {
		method: 'POST',
		headers: { 'Authorization': `Bearer ${token}` }
	});
}
export async function api_DeleteNotification(id) {
	const token = localStorage.getItem('access_token');
	return await fetch(`/api/notifications/${id}/`, {
		method: 'DELETE',
		headers: { 'Authorization': `Bearer ${token}` }
	});
}
