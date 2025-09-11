import render_Login from './views/loginViews.js';
import { dom_Btn_Login} from './dom/loginDom.js';
import { logout } from './dom/logoutDom.js';
import {render_Dashboard} from './views/dashboardViews.js';

const routes = {
    '/log_in/': {
        template: render_Login(),
        init: () => {
            dom_Btn_Login();
            console.log('Login loaded');
        }
    },
    '/log_out/': {
        template: '',
        init: () => {
            logout();
        }
    },
    '/': {
        template: render_Dashboard(),
        init: async () => {
			console.log('Dashboard loaded');
        }
    }
};

export default routes;