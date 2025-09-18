import render_Login from './views/loginViews.js';
import { dom_Btn_Login } from './dom/loginDom.js';
import { logout } from './dom/logoutDom.js';
import { render_Dashboard } from './views/dashboardViews.js';
import { render_Customers } from './views/customersViews.js';
import { render_Orders } from './views/ordersViews.js';
import { render_Complaints } from './views/complaintsViews.js';
import { render_Invoices } from './views/invoicesViews.js';
import { render_Users } from './views/usersViews.js';
import { render_driver } from './views/driverViews.js';
import { render_NotFound} from './views/errorViews.js';
import { initDashboard } from './dom/dashboardDom.js';
import { initUsers } from './dom/usersDom.js';
import { initCustomers } from './dom/customersDom.js';
import { initOrders } from './dom/ordersDom.js';
import { initInvoices } from './dom/invoicesDom.js';
import { initComplaints } from './dom/complaintsDom.js';
import { initDriver } from './dom/driverDom.js';
import { init_NotFound } from './dom/errorDom.js';

const routes = {
	'/login/': {
		template: render_Login(),
		init: () => {
			dom_Btn_Login();
			console.log('Login loaded');
		}
	},
	'/logout/': {
		template: '',
		init: () => {
			logout();
		}
	},
	'/dashboard/': {
		template: render_Dashboard(),
		init: () => {
			initDashboard();
			console.log('Dashboard loaded');
		}
	},
	'/customers/': {
		template: render_Customers(),
		init: () => {
			initCustomers();
			console.log('Customers loaded');
		}
	},
	'/orders/': {
		template: render_Orders(),
		init: () => {
			initOrders();
			console.log('Orders loaded');
		}
	},
	'/driver-orders/': {
		template: render_driver(),
		init: () => {
			initDriver();
			console.log('Driver Orders loaded');
		}
	},
	'/complaints/': {
		template: render_Complaints(),
		init: () => {
			initComplaints();
			console.log('Complaints loaded');
		}
	},
	'/invoices/': {
		template: render_Invoices(),
		init: () => {
			initInvoices();
			console.log('Invoices loaded');
		}
	},
	'/users/': {
		template: render_Users(),
		init: () => {
			initUsers();
			console.log('Users loaded');
		}
	},
    '/not-found/': {
        template: render_NotFound(),
        init: () => {
            init_NotFound();
        }
    },
};

export default routes;