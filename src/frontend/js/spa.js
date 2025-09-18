import routes from './routes.js';
import { api_RefreshToken, api_CheckAuth } from './apis.js';

export let accessToken = null;
export let refreshToken = null;

function check_And_Store_Tokens() {
	accessToken = localStorage.getItem('access_token');
	refreshToken = localStorage.getItem('refresh_token');
}

export async function checkAuth() {
	accessToken = localStorage.getItem('access_token');
	refreshToken = localStorage.getItem('refresh_token');

	if (!accessToken) return false;

	try {
		const response = await api_CheckAuth();

		if (response.status === 401 && refreshToken) {
			const refreshResponse = await api_RefreshToken(refreshToken);
			if (refreshResponse.ok) {
				const data = await refreshResponse.json();
				localStorage.setItem('access_token', data.access);
				accessToken = data.access;
				return true;
			} else {
				localStorage.clear();
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
	const route_config = routes[route] || routes['/not-found/'];
	document.getElementById('content').innerHTML = route_config.template;
	if (route_config.init) {
		route_config.init(params);
	}
}

function handleRouteChange() {
	const path = window.location.pathname;
	if (path === '/') {
        const role = localStorage.getItem('user_role');
        if (role === 'admin') {
            navigateTo('/dashboard/');
            return;
        } else if (role === 'accountant') {
            navigateTo('/invoices/');
            return;
        } else if (role === 'driver') {
            navigateTo('/driver-orders/');
            return;
        } else {
            // If no role (not logged in), redirect to login
            navigateTo('/login/');
            return;
        }
    }
	// Check if route exists
    if (!routes[path]) {
        // Route not found, show 404 page
        navigateTo('/not-found/');
        return;
    }
	PageLoading(path);
}

function applyRoleBasedUI() {
    const role = localStorage.getItem('user_role');
    document.querySelectorAll('.nav-item').forEach(item => {
        item.style.display = 'none';
    });

    if (role === 'admin') {
        document.querySelectorAll('.nav-item').forEach(item => item.style.display = 'block');
		document.querySelector('[href="/driver-orders/"]').parentElement.style.display = 'none';
    }
    if (role === 'accountant') {
        document.querySelector('[href="/invoices/"]').parentElement.style.display = 'block';
		document.getElementById('notification').style.display = 'none';
    }
    if (role === 'driver') {
        document.querySelector('[href="/driver-orders/"]').parentElement.style.display = 'block';
		document.getElementById('notification').style.display = 'none';


    }

    const userName = localStorage.getItem('user_name');
    if (userName) {
        document.getElementById('user-name').textContent = userName;
        document.getElementById('user-section').style.display = 'flex';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
	check_And_Store_Tokens();
	const isAuthenticated = await checkAuth();
	if (isAuthenticated) {
		console.log('User is authenticated');
		document.getElementById('navs').style.display = 'block';
        applyRoleBasedUI();
		handleRouteChange();
	} else {
		console.log('User is not authenticated');
		navigateTo('/login/');
	}

	window.addEventListener('popstate', handleRouteChange);

	document.querySelectorAll('.menu-link').forEach(link => {
		link.addEventListener('click', event => {
			event.preventDefault();
			const targetRoute = link.getAttribute('href');
			navigateTo(targetRoute);
		});
	});
});

function navigateTo(router, parameter = {}) {
	window.history.pushState(parameter, '', router);
	PageLoading(router, parameter);
}

export { navigateTo };
