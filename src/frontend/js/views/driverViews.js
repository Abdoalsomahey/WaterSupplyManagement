export function render_driver() {
    return `
    <div class="content-wrapper">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">My Orders</h5>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="table" id="driverOrdersTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="driverOrdersBody">
                            <tr><td colspan="6" class="text-center text-muted">Loading...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    `;
}
