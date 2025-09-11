export function render_Dashboard() {
    return `
        <div class="mt-4 container">
            <!-- Header -->
            <div class="row text-light mx-4 d-flex align-items-center mt-4 justify-content-center">
                <div class="align-items-center col-sm-8 col-md-7 text-center col-lg-12 shadow col-xs-7 rounded d-flex justify-content-center background-dashboard">
                    <h4 class="mt-2">Dashboard - Manage Users</h4>
                </div>
            </div>

            <!-- User Actions -->
            <div class="row mt-4 justify-content-center">
                <div class="col-lg-10">
                    <button id="btn-add-user" class="btn btn-success mb-3" data-bs-toggle="modal" data-bs-target="#userModal">+ Add User</button>

                    <!-- Users Table -->
                    <table class="table table-striped table-dark table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Role</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal for Add/Edit User -->
        <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content bg-dark text-light">
              <div class="modal-header">
                <h5 class="modal-title" id="userModalLabel">Add User</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form id="user-form">
                  <input type="hidden" id="user-id" />
                  <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" id="username" class="form-control" required />
                  </div>
                  <div class="mb-3">
                    <label for="first_name" class="form-label">First Name</label>
                    <input type="text" id="first_name" class="form-control" />
                  </div>
                  <div class="mb-3">
                    <label for="last_name" class="form-label">Last Name</label>
                    <input type="text" id="last_name" class="form-control" />
                  </div>
                  <div class="mb-3">
                    <label for="role" class="form-label">Role</label>
                    <select id="role" class="form-control">
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="accountant">Accountant</option>
                      <option value="driver">Driver</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="phone" class="form-label">Phone</label>
                    <input type="text" id="phone" class="form-control" />
                  </div>
                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" id="password" class="form-control" />
                  </div>
                  <button type="submit" class="btn btn-primary w-100">Save</button>
                </form>
              </div>
            </div>
          </div>
        </div>
    `;
}
