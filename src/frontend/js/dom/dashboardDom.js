import {render_Dashboard} from '../views/dashboardViews.js';
import { api_GetUsers, api_CreateUser, api_UpdateUser, api_DeleteUser } from '../apis.js';

export function render_Dashboard() {
    document.getElementById('content').innerHTML = render_Dashboard();
    loadUsers();
    initEventListeners();
}

async function loadUsers() {
    const response = await api_GetUsers();
    if (response.ok) {
        const users = await response.json();
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';
        users.forEach(user => {
            tbody.innerHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.first_name || ''}</td>
                    <td>${user.last_name || ''}</td>
                    <td>${user.role}</td>
                    <td>${user.phone || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-warning btn-edit" data-id="${user.id}">Edit</button>
                        <button class="btn btn-sm btn-danger btn-delete" data-id="${user.id}">Delete</button>
                    </td>
                </tr>
            `;
        });
    }
}

function initEventListeners() {
    // Save (Add/Edit User)
    document.getElementById('user-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const userId = document.getElementById('user-id').value;
        const userData = {
            username: document.getElementById('username').value,
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            role: document.getElementById('role').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value,
        };

        let response;
        if (userId) {
            response = await api_UpdateUser(userId, userData);
        } else {
            response = await api_CreateUser(userData);
        }

        if (response.ok) {
            loadUsers();
            document.getElementById('user-form').reset();
            document.getElementById('user-id').value = '';
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
        } else {
            console.error('Failed to save user');
        }
    });

    // Delegated Events for Edit/Delete
    document.getElementById('users-table-body').addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-edit')) {
            const id = e.target.dataset.id;
            const response = await fetch(`/api/users/${id}/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (response.ok) {
                const user = await response.json();
                document.getElementById('user-id').value = user.id;
                document.getElementById('username').value = user.username;
                document.getElementById('first_name').value = user.first_name || '';
                document.getElementById('last_name').value = user.last_name || '';
                document.getElementById('role').value = user.role;
                document.getElementById('phone').value = user.phone || '';
                document.getElementById('password').value = '';
                new bootstrap.Modal(document.getElementById('userModal')).show();
            }
        }

        if (e.target.classList.contains('btn-delete')) {
            const id = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this user?')) {
                const response = await api_DeleteUser(id);
                if (response.ok) loadUsers();
            }
        }
    });
}
