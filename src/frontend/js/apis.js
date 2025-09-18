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

// ---------------- Users API ----------------
export async function api_GetUsers() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/users/', {
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

export async function api_DeleteUser(userId) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/users/${userId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}


export async function api_GetCustomers() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/customers/', {
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

export async function api_ExportUsers() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/users/export/', {
        headers: { 'Authorization': `Bearer ${token}` }
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

export async function api_ExportCustomers() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/customers/export/', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_GetDriverOrders() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/driver/orders/', {
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
    formData.append("quantity", quantity);

    return await fetch(`/api/driver/orders/${orderId}/confirm/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
}

export async function api_ReportDriverProblem(orderId, reason) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/driver/orders/${orderId}/problem/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
    });
}

export async function api_GetInvoices() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/invoices/', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_CreateInvoice(data) {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/invoices/', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_GetInvoice(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/invoices/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_UpdateInvoice(id, data) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/invoices/${id}/`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_PartialUpdateInvoice(id, data) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/invoices/${id}/`, {
        method: 'PATCH',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export async function api_DeleteInvoice(id) {
    const token = localStorage.getItem('access_token');
    return await fetch(`/api/invoices/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_ExportInvoicesExcel() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/invoices/export-excel/', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function api_ExportInvoicesPDF() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/invoices/export-pdf/', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}


export async function api_GetOrders() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/orders/', {
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

export async function api_ExportOrders() {
    const token = localStorage.getItem('access_token');
    return await fetch('/api/orders/export/', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

// ===========================================
// SAMPLE DATA FOR DEVELOPMENT/DEMO
// ===========================================

// Sample Users Data
export const sampleUsers = [
    {
        id: 1,
        username: 'john_driver',
        email: 'john.driver@watersupply.com',
        phone: '+1-555-0101',
        role: 'driver',
        status: 'active',
        avatar: 'images/default_user.png',
        created_at: '2024-01-15T08:30:00Z',
        last_login: '2024-01-20T14:22:00Z'
    },
    {
        id: 2,
        username: 'sarah_accountant',
        email: 'sarah.accountant@watersupply.com',
        phone: '+1-555-0102',
        role: 'accountant',
        status: 'active',
        avatar: 'images/default_user.png',
        created_at: '2024-01-10T09:15:00Z',
        last_login: '2024-01-20T16:45:00Z'
    },
    {
        id: 3,
        username: 'mike_driver',
        email: 'mike.driver@watersupply.com',
        phone: '+1-555-0103',
        role: 'driver',
        status: 'inactive',
        avatar: 'images/default_user.png',
        created_at: '2024-01-05T11:20:00Z',
        last_login: '2024-01-18T10:30:00Z'
    },
    {
        id: 4,
        username: 'lisa_admin',
        email: 'lisa.admin@watersupply.com',
        phone: '+1-555-0104',
        role: 'admin',
        status: 'active',
        avatar: 'images/default_user.png',
        created_at: '2024-01-01T07:00:00Z',
        last_login: '2024-01-20T17:30:00Z'
    }
];

// Sample Customers Data
export const sampleCustomers = [
    {
        id: 1,
        name: 'Acme Corporation',
        contact_person: 'John Smith',
        email: 'john.smith@acme.com',
        phone: '+1-555-1001',
        address: '123 Business St, City, State 12345',
        orders_count: 15,
        total_spent: 2500.00,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        last_order: '2024-01-19T14:30:00Z'
    },
    {
        id: 2,
        name: 'Tech Solutions Inc',
        contact_person: 'Sarah Johnson',
        email: 'sarah.j@techsolutions.com',
        phone: '+1-555-1002',
        address: '456 Innovation Ave, City, State 12346',
        orders_count: 8,
        total_spent: 1200.00,
        status: 'active',
        created_at: '2024-01-05T00:00:00Z',
        last_order: '2024-01-18T09:15:00Z'
    },
    {
        id: 3,
        name: 'Green Energy Co',
        contact_person: 'Mike Wilson',
        email: 'mike.w@greenenergy.com',
        phone: '+1-555-1003',
        address: '789 Eco Blvd, City, State 12347',
        orders_count: 3,
        total_spent: 450.00,
        status: 'inactive',
        created_at: '2024-01-10T00:00:00Z',
        last_order: '2024-01-15T16:20:00Z'
    },
    {
        id: 4,
        name: 'Local Restaurant',
        contact_person: 'Lisa Brown',
        email: 'lisa.b@localrestaurant.com',
        phone: '+1-555-1004',
        address: '321 Main St, City, State 12348',
        orders_count: 22,
        total_spent: 3800.00,
        status: 'active',
        created_at: '2023-12-15T00:00:00Z',
        last_order: '2024-01-20T11:45:00Z'
    }
];

// Sample Orders Data
export const sampleOrders = [
    {
        id: 1,
        order_number: 'ORD-2024-001',
        customer_id: 1,
        customer_name: 'Acme Corporation',
        driver_id: 1,
        driver_name: 'John Driver',
        date: '2024-01-20T09:00:00Z',
        delivery_date: '2024-01-20T14:00:00Z',
        status: 'delivered',
        total_amount: 150.00,
        items: [
            { product: 'Water Tank 1000L', quantity: 2, price: 75.00 }
        ],
        delivery_address: '123 Business St, City, State 12345',
        notes: 'Deliver to loading dock'
    },
    {
        id: 2,
        order_number: 'ORD-2024-002',
        customer_id: 2,
        customer_name: 'Tech Solutions Inc',
        driver_id: 1,
        driver_name: 'John Driver',
        date: '2024-01-19T10:30:00Z',
        delivery_date: '2024-01-19T15:30:00Z',
        status: 'delivered',
        total_amount: 200.00,
        items: [
            { product: 'Water Filter System', quantity: 1, price: 200.00 }
        ],
        delivery_address: '456 Innovation Ave, City, State 12346',
        notes: 'Installation required'
    },
    {
        id: 3,
        order_number: 'ORD-2024-003',
        customer_id: 4,
        customer_name: 'Local Restaurant',
        driver_id: 3,
        driver_name: 'Mike Driver',
        date: '2024-01-20T08:00:00Z',
        delivery_date: '2024-01-20T12:00:00Z',
        status: 'pending',
        total_amount: 300.00,
        items: [
            { product: 'Water Tank 500L', quantity: 2, price: 150.00 }
        ],
        delivery_address: '321 Main St, City, State 12348',
        notes: 'Urgent delivery needed'
    },
    {
        id: 4,
        order_number: 'ORD-2024-004',
        customer_id: 1,
        customer_name: 'Acme Corporation',
        driver_id: null,
        driver_name: null,
        date: '2024-01-21T11:00:00Z',
        delivery_date: '2024-01-21T16:00:00Z',
        status: 'cancelled',
        total_amount: 100.00,
        items: [
            { product: 'Water Pump', quantity: 1, price: 100.00 }
        ],
        delivery_address: '123 Business St, City, State 12345',
        notes: 'Customer cancelled'
    }
];

// Sample Invoices Data
export const sampleInvoices = [
    {
        id: 1,
        invoice_number: 'INV-2024-001',
        customer_id: 1,
        customer_name: 'Acme Corporation',
        date: '2024-01-20T00:00:00Z',
        due_date: '2024-02-19T00:00:00Z',
        amount: 150.00,
        tax: 12.00,
        total: 162.00,
        status: 'paid',
        payment_date: '2024-01-20T16:30:00Z',
        items: [
            { description: 'Water Tank 1000L x2', quantity: 2, unit_price: 75.00, total: 150.00 }
        ]
    },
    {
        id: 2,
        invoice_number: 'INV-2024-002',
        customer_id: 2,
        customer_name: 'Tech Solutions Inc',
        date: '2024-01-19T00:00:00Z',
        due_date: '2024-02-18T00:00:00Z',
        amount: 200.00,
        tax: 16.00,
        total: 216.00,
        status: 'paid',
        payment_date: '2024-01-19T18:45:00Z',
        items: [
            { description: 'Water Filter System', quantity: 1, unit_price: 200.00, total: 200.00 }
        ]
    },
    {
        id: 3,
        invoice_number: 'INV-2024-003',
        customer_id: 4,
        customer_name: 'Local Restaurant',
        date: '2024-01-20T00:00:00Z',
        due_date: '2024-02-19T00:00:00Z',
        amount: 300.00,
        tax: 24.00,
        total: 324.00,
        status: 'pending',
        payment_date: null,
        items: [
            { description: 'Water Tank 500L x2', quantity: 2, unit_price: 150.00, total: 300.00 }
        ]
    },
    {
        id: 4,
        invoice_number: 'INV-2024-004',
        customer_id: 3,
        customer_name: 'Green Energy Co',
        date: '2024-01-15T00:00:00Z',
        due_date: '2024-02-14T00:00:00Z',
        amount: 450.00,
        tax: 36.00,
        total: 486.00,
        status: 'overdue',
        payment_date: null,
        items: [
            { description: 'Water Treatment System', quantity: 1, unit_price: 450.00, total: 450.00 }
        ]
    }
];

// Sample Complaints Data
export const sampleComplaints = [
    {
        id: 1,
        customer_id: 1,
        customer_name: 'Acme Corporation',
        order_id: 1,
        order_number: 'ORD-2024-001',
        issue: 'Late delivery - water tank arrived 2 hours late',
        description: 'The delivery was scheduled for 2 PM but arrived at 4 PM, causing delays in our operations.',
        status: 'resolved',
        priority: 'medium',
        created_at: '2024-01-20T16:30:00Z',
        resolved_at: '2024-01-21T10:15:00Z',
        resolution: 'Apologized for delay and provided 10% discount on next order'
    },
    {
        id: 2,
        customer_id: 2,
        customer_name: 'Tech Solutions Inc',
        order_id: 2,
        order_number: 'ORD-2024-002',
        issue: 'Damaged product - water filter system arrived with cracks',
        description: 'The water filter system had visible cracks and was not functioning properly upon installation.',
        status: 'in_progress',
        priority: 'high',
        created_at: '2024-01-19T18:45:00Z',
        resolved_at: null,
        resolution: null
    },
    {
        id: 3,
        customer_id: 4,
        customer_name: 'Local Restaurant',
        order_id: null,
        order_number: null,
        issue: 'Billing discrepancy - incorrect amount charged',
        description: 'The invoice shows $324 but we only ordered $300 worth of products.',
        status: 'new',
        priority: 'low',
        created_at: '2024-01-21T09:20:00Z',
        resolved_at: null,
        resolution: null
    }
];

// Sample Notifications Data
export const sampleNotifications = [
    {
        id: 1,
        type: 'complaint',
        title: 'New complaint received',
        message: 'Acme Corporation submitted a complaint about late delivery',
        is_read: false,
        created_at: '2024-01-20T16:30:00Z',
        action_url: '/complaints/'
    },
    {
        id: 2,
        type: 'order',
        title: 'Order delivered successfully',
        message: 'Order ORD-2024-001 has been delivered to Acme Corporation',
        is_read: false,
        created_at: '2024-01-20T14:30:00Z',
        action_url: '/orders/'
    },
    {
        id: 3,
        type: 'invoice',
        title: 'Payment received',
        message: 'Payment of $216.00 received for invoice INV-2024-002',
        is_read: true,
        created_at: '2024-01-19T18:45:00Z',
        action_url: '/invoices/'
    }
];

// Sample Dashboard Data
export const sampleDashboardData = {
    kpis: {
        total_orders: { value: 124, change: 12, trend: 'up' },
        total_revenue: { value: 18500, change: 8, trend: 'up' },
        active_customers: { value: 89, change: 5, trend: 'up' },
        pending_orders: { value: 7, change: -2, trend: 'down' }
    },
    recent_orders: sampleOrders.slice(0, 5),
    recent_invoices: sampleInvoices.slice(0, 5),
    chart_data: {
        orders_over_time: [
            { date: '2024-01-15', orders: 8, revenue: 1200 },
            { date: '2024-01-16', orders: 12, revenue: 1800 },
            { date: '2024-01-17', orders: 6, revenue: 900 },
            { date: '2024-01-18', orders: 15, revenue: 2250 },
            { date: '2024-01-19', orders: 10, revenue: 1500 },
            { date: '2024-01-20', orders: 18, revenue: 2700 }
        ]
    }
};

// ===========================================
// MOCK API FUNCTIONS FOR DEMO
// ===========================================

// Simulate API delay
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions that return sample data
export async function mockApi_GetUsers() {
    await simulateDelay();
    return {
        ok: true,
        json: async () => sampleUsers
    };
}

export async function mockApi_GetCustomers() {
    await simulateDelay();
    return {
        ok: true,
        json: async () => sampleCustomers
    };
}

export async function mockApi_GetOrders() {
    await simulateDelay();
    return {
        ok: true,
        json: async () => sampleOrders
    };
}

export async function mockApi_GetInvoices() {
    await simulateDelay();
    return {
        ok: true,
        json: async () => sampleInvoices
    };
}

export async function mockApi_GetComplaints() {
    await simulateDelay();
    return {
        ok: true,
        json: async () => sampleComplaints
    };
}

export async function mockApi_GetDashboardData() {
    await simulateDelay();
    return {
        ok: true,
        json: async () => sampleDashboardData
    };
}

export async function mockApi_GetNotifications() {
    await simulateDelay();
    return {
        ok: true,
        json: async () => sampleNotifications
    };
}

// Export functions for CSV generation
export function exportToCSV(data, filename) {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}