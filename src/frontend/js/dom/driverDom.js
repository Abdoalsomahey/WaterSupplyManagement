import { 
    api_GetDriverOrders, 
    api_ConfirmDriverOrder,
    api_ReportDriverProblem 
} from '../apis.js';

export function initDriver() {
    loadDriverOrders();
}

async function loadDriverOrders() {
    const tbody = document.getElementById('driverOrdersBody');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Loading...</td></tr>`;

    try {
        const res = await api_GetDriverOrders();
        const orders = await res.json();

        if (!res.ok) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-danger">Error: ${orders.detail || 'Failed to load orders'}</td></tr>`;
            return;
        }

        if (orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-muted text-center">No orders found</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        orders.forEach(order => {
            tbody.innerHTML += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customer.full_name || '-'}</td>
                    <td>${order.description || '-'}</td>
                    <td><span class="status-badge ${order.status}">${order.status}</span></td>
                    <td>${new Date(order.created_at).toLocaleString()}</td>
                    <td>
                        ${order.status === "pending" ? `
                            <input type="number" id="qty-${order.id}" placeholder="Quantity" class="form-control mb-2"/>
                            <input type="file" id="file-${order.id}" accept="image/*" class="form-control mb-2"/>
                            <button class="btn btn-sm btn-success mb-1" onclick="confirmOrder(${order.id})">Confirm</button>
                            <select id="problem-${order.id}" class="form-select form-select-sm mb-1">
                                <option value="">-- Select Problem --</option>
                                <option value="customer_not_found">Customer not found</option>
                                <option value="wrong_address">Wrong address</option>
                                <option value="refused">Customer refused</option>
                            </select>
                            <button class="btn btn-sm btn-danger" onclick="reportProblem(${order.id})">Report Problem</button>
                        ` : `<span class="text-muted">—</span>`}
                    </td>
                </tr>
            `;
        });

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-danger">Error loading orders</td></tr>`;
    }
}

// ✅ تأكيد الطلب مع صورة + كمية
window.confirmOrder = async function(orderId) {
    const fileInput = document.getElementById(`file-${orderId}`);
    const qtyInput = document.getElementById(`qty-${orderId}`);

    if (!fileInput || fileInput.files.length === 0) {
        alert("⚠️ Please select an image before confirming.");
        return;
    }
    if (!qtyInput || !qtyInput.value) {
        alert("⚠️ Please enter quantity.");
        return;
    }

    const file = fileInput.files[0];
    const quantity = qtyInput.value;

    try {
        const res = await api_ConfirmDriverOrder(orderId, file, quantity);
        const data = await res.json();

        if (!res.ok) {
            alert("❌ Error: " + (data.error || "Failed to confirm order"));
            return;
        }

        alert("✅ Order confirmed successfully");
        loadDriverOrders();
    } catch (err) {
        alert("❌ Error confirming order");
    }
}

// ❌ الإبلاغ عن مشكلة
window.reportProblem = async function(orderId) {
    const select = document.getElementById(`problem-${orderId}`);
    const reason = select.value;

    if (!reason) {
        alert("⚠️ Please select a problem reason.");
        return;
    }

    try {
        const res = await api_ReportDriverProblem(orderId, reason);
        const data = await res.json();

        if (!res.ok) {
            alert("❌ Error: " + (data.error || "Failed to report problem"));
            return;
        }

        alert("⚠️ Problem reported successfully");
        loadDriverOrders();
    } catch (err) {
        alert("❌ Error reporting problem");
    }
}
