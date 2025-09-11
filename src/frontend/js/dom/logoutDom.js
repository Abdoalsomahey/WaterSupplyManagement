import { api_Logout } from '../apis.js';

export async function logout() {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (accessToken) {
        try {
            // Try to call the logout API
            await api_Logout(accessToken, refreshToken);
        } catch (error) {
            console.log('Logout API call failed, but continuing with client-side logout');
        }
    }
    
    // Always clear local storage and redirect
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
}