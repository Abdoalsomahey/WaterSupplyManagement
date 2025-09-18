export function render_Dashboard() {
    return `
        <div class="dashboard-container">
            <!-- Page Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 mb-1">Dashboard</h1>
                    <p class="text-muted mb-0">Welcome back! Here's what's happening with your water supply business.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary" id="refresh-dashboard">
                        <i class="bi bi-arrow-clockwise me-1"></i>Refresh
                    </button>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="stats-grid mb-4">
                <div class="card kpi-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="kpi-label">Total Orders</div>
                                <div class="kpi-value" id="total-orders">-</div>
                                <div class="kpi-change" id="orders-change">
                                    <i class="bi bi-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                            <div class="kpi-icon">
                                <i class="bi bi-cart-check fs-1 opacity-25"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card kpi-card" style="background: linear-gradient(135deg, #198754 0%, #146c43 100%);">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="kpi-label">Total Revenue</div>
                                <div class="kpi-value" id="total-revenue">-</div>
                                <div class="kpi-change" id="revenue-change">
                                    <i class="bi bi-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                            <div class="kpi-icon">
                                <i class="bi bi-currency-dollar fs-1 opacity-25"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card kpi-card" style="background: linear-gradient(135deg, #fd7e14 0%, #e8590c 100%);">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="kpi-label">Active Customers</div>
                                <div class="kpi-value" id="active-customers">-</div>
                                <div class="kpi-change" id="customers-change">
                                    <i class="bi bi-arrow-up"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                            <div class="kpi-icon">
                                <i class="bi bi-people fs-1 opacity-25"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card kpi-card" style="background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%);">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="kpi-label">Pending Orders</div>
                                <div class="kpi-value" id="pending-orders">-</div>
                                <div class="kpi-change" id="pending-change">
                                    <i class="bi bi-arrow-down"></i>
                                    <span>Loading...</span>
                                </div>
                            </div>
                            <div class="kpi-icon">
                                <i class="bi bi-clock fs-1 opacity-25"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts and Tables Row -->
            <div class="row">
                <!-- Orders Chart -->
                <div class="col-lg-8 mb-4">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Orders & Revenue Trend</h5>
                            <div class="btn-group btn-group-sm" role="group">
                                <input type="radio" class="btn-check" name="chart-period" id="chart-7d" value="7d" checked>
                                <label class="btn btn-outline-primary" for="chart-7d">7 Days</label>
                                
                                <input type="radio" class="btn-check" name="chart-period" id="chart-30d" value="30d">
                                <label class="btn btn-outline-primary" for="chart-30d">30 Days</label>
                                
                                <input type="radio" class="btn-check" name="chart-period" id="chart-90d" value="90d">
                                <label class="btn btn-outline-primary" for="chart-90d">90 Days</label>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="chart-container" id="orders-chart">
                                <div class="text-center text-muted">
                                    <i class="bi bi-bar-chart fs-1 mb-3"></i>
                                    <p>Loading chart data...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="col-lg-4 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Quick Stats</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <div class="fw-semibold">Today's Orders</div>
                                    <div class="text-muted small">Orders placed today</div>
                                </div>
                                <div class="text-primary fw-bold fs-4" id="today-orders">-</div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <div class="fw-semibold">Today's Revenue</div>
                                    <div class="text-muted small">Revenue generated today</div>
                                </div>
                                <div class="text-success fw-bold fs-4" id="today-revenue">-</div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <div class="fw-semibold">Avg Order Value</div>
                                    <div class="text-muted small">Average order amount</div>
                                </div>
                                <div class="text-info fw-bold fs-4" id="avg-order-value">-</div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-semibold">Conversion Rate</div>
                                    <div class="text-muted small">Orders per customer</div>
                                </div>
                                <div class="text-warning fw-bold fs-4" id="conversion-rate">-</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity Tables -->
            <div class="row">
                <!-- Recent Orders -->
                <div class="col-lg-6 mb-4">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Recent Orders</h5>
                            <a href="#" class="btn btn-sm btn-outline-primary" data-route="/orders/">View All</a>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-container">
                                <table class="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Customer</th>
                                            <th>Status</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody id="recent-orders-table">
                                        <tr>
                                            <td colspan="5" class="text-center text-muted py-4">
                                                <div class="spinner-border spinner-border-sm me-2"></div>
                                                Loading recent orders...
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Invoices -->
                <div class="col-lg-6 mb-4">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Recent Invoices</h5>
                            <a href="#" class="btn btn-sm btn-outline-primary" data-route="/invoices/">View All</a>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-container">
                                <table class="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Customer</th>
                                            <th>Status</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody id="recent-invoices-table">
                                        <tr>
                                            <td colspan="5" class="text-center text-muted py-4">
                                                <div class="spinner-border spinner-border-sm me-2"></div>
                                                Loading recent invoices...
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Alerts and Notifications -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Alerts & Notifications</h5>
                        </div>
                        <div class="card-body">
                            <div class="row" id="alerts-container">
                                <div class="col-md-4 mb-3">
                                    <div class="alert alert-warning d-flex align-items-center" role="alert">
                                        <i class="bi bi-exclamation-triangle me-2"></i>
                                        <div>
                                            <strong>3 Orders Pending</strong><br>
                                            <small>Orders need driver assignment</small>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="alert alert-danger d-flex align-items-center" role="alert">
                                        <i class="bi bi-credit-card me-2"></i>
                                        <div>
                                            <strong>2 Overdue Invoices</strong><br>
                                            <small>Total: $486.00</small>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="alert alert-info d-flex align-items-center" role="alert">
                                        <i class="bi bi-chat-dots me-2"></i>
                                        <div>
                                            <strong>1 New Complaint</strong><br>
                                            <small>Requires immediate attention</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
