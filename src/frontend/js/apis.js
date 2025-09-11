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
