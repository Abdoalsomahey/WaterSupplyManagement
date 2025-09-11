import routes from './routes.js';
import { api_RefreshToken } from './apis.js';

function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

export let accessToken = null;
export let refreshToken = null;

function check_And_Store_Tokens() {
    accessToken = getQueryParameter('access');
    refreshToken = getQueryParameter('refresh');
    if (accessToken && refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        // clean up query params after storing
        window.history.replaceState({}, '', '/');
    }
}

export async function checkAuth() {
    accessToken = localStorage.getItem('access_token');
    refreshToken = localStorage.getItem('refresh_token');
    
    if (!accessToken) return false;

    try {
        const response = await fetch('/api/check-auth/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status === 401 && refreshToken) {
            // Try to refresh access token
            const refreshResponse = await api_RefreshToken(refreshToken);
            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                localStorage.setItem('access_token', data.access);
                accessToken = data.access;
                return true;
            } else {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                return false;
            }
        }

        return response.ok;
    } catch (err) {
        console.error('Error during auth check', err);
        return false;
    }
}

function PageLoading(route, params = {}) {
    const route_config = routes[route] || routes['/'];
    document.getElementById('content').innerHTML = route_config.template;
    if (route_config.init) {
        route_config.init(params);
    }
}

function handleRouteChange() {
    const path = window.location.pathname;
    PageLoading(path);
}

document.addEventListener('DOMContentLoaded', async () => {
    check_And_Store_Tokens();
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        console.log('User is authenticated');
        document.getElementById('buttons-navs').style.display = 'block';
        handleRouteChange();
    } else {
        console.log('User is not authenticated');
        navigateTo('/log_in/');
    }

    window.addEventListener('popstate', handleRouteChange);

    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', handle_Button_Click);
    });
});

function handle_Button_Click(events) {
    events.preventDefault();
    const routing = events.target.getAttribute('data-route');
    navigateTo(routing);
}

function navigateTo(router, parameter = {}) {
    window.history.pushState(parameter, '', router);
    PageLoading(router, parameter);
}

export { navigateTo };
