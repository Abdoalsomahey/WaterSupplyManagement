import { api_Login } from "../apis.js";

export function dom_Btn_Login() {
    document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;
		console.log(username, password)
        const response = await api_Login(username, password);
		
        if (response.ok) {
            const tokens = await response.json();
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);
			localStorage.setItem('user_role', tokens.role);
            window.location.href = '/';
        } else {
            alert('Login failed');
        }
    });
}