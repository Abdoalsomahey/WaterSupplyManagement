// notifications.js
import { api_GetNotifications, api_MarkNotificationAsRead, api_MarkAllNotificationsAsRead, api_DeleteNotification } from './apis.js';

class NotificationsWebSocket {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.isAuthenticated = false;
    }

    connect() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error('No access token found for WebSocket connection');
            this.handleReconnect();
            return;
        }

        const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${scheme}//${window.location.host}/ws/notifications/?token=${encodeURIComponent(token)}`;
        
        console.log('Connecting to WebSocket:', wsUrl);
        
        try {
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('WebSocket connected successfully');
                this.reconnectAttempts = 0;
                this.isAuthenticated = true;
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.socket.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                this.isAuthenticated = false;
                
                if (event.code === 4001 || event.code === 403) {
                    this.handleTokenExpired();
                } else {
                    this.handleReconnect();
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.handleReconnect();
        }
    }

    async handleTokenExpired() {
        console.log('Token might be expired, attempting to refresh...');
        try {
            await this.refreshTokenAndReconnect();
        } catch (error) {
            console.error('Failed to refresh token:', error);
            this.handleReconnect();
        }
    }

    async refreshTokenAndReconnect() {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch('/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh: refreshToken
            })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            console.log('Token refreshed successfully');
            
            this.disconnect();
            setTimeout(() => this.connect(), 1000);
        } else {
            throw new Error('Token refresh failed');
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'new_notification':
                this.handleNewNotification(data.notification);
                break;
            case 'notification_read':
                this.handleNotificationRead(data.notification_id);
                break;
            case 'notification_deleted':
                this.handleNotificationDeleted(data.notification_id);
                break;
            case 'unread_count_update':
                this.updateUnreadCount(data.unread_count);
                break;
            default:
                console.log('Unknown WebSocket message type:', data.type);
        }
    }

    handleNewNotification(notification) {
        this.addNotificationToDropdown(notification);
        this.incrementUnreadCount();
        this.showBrowserNotification(notification);
    }

    handleNotificationRead(notificationId) {
        // إزالة الإشعار من الواجهة عند القراءة
        this.removeNotificationFromUI(notificationId);
    }

    handleNotificationDeleted(notificationId) {
        this.removeNotificationFromUI(notificationId);
    }

    removeNotificationFromUI(notificationId) {
        const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notificationElement) {
            // إضافة تأثير اختفاء سلس
            notificationElement.style.opacity = '0';
            notificationElement.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                notificationElement.remove();
                this.checkAndShowEmptyMessage();
            }, 300);
        }
    }

    checkAndShowEmptyMessage() {
        const notificationsList = document.querySelector('.notification-dropdown');
        if (!notificationsList) return;

        const notifications = notificationsList.querySelectorAll('li[data-notification-id]');
        const emptyMessage = notificationsList.querySelector('.no-notifications-message');
        
        if (notifications.length === 0 && !emptyMessage) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'no-notifications-message';
            emptyItem.innerHTML = '<a class="dropdown-item text-muted text-center">No notifications</a>';
            
            const divider = notificationsList.querySelector('.dropdown-divider');
            if (divider) {
                notificationsList.insertBefore(emptyItem, divider);
            } else {
                notificationsList.appendChild(emptyItem);
            }
        }
    }

    addNotificationToDropdown(notification) {
        const notificationsList = document.querySelector('.notification-dropdown');
        if (!notificationsList) return;

        // إزالة رسالة "No notifications" إذا كانت موجودة
        const emptyMessage = notificationsList.querySelector('.no-notifications-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }

        const notificationItem = this.createNotificationElement(notification);
        const header = notificationsList.querySelector('.dropdown-header');
        
        const loadingItem = notificationsList.querySelector('.text-muted.text-center');
        if (loadingItem) {
            loadingItem.remove();
        }
        
        if (header && header.nextElementSibling) {
            notificationsList.insertBefore(notificationItem, header.nextElementSibling);
        } else {
            notificationsList.appendChild(notificationItem);
        }
    }

    createNotificationElement(notification) {
        const li = document.createElement('li');
        li.setAttribute('data-notification-id', notification.id);
        
        const iconClass = this.getNotificationIcon(notification);
        const timeAgo = this.getTimeAgo(notification.created_at);

        li.innerHTML = `
            <div class="dropdown-item notification-item" data-notification-id="${notification.id}">
                <div class="d-flex align-items-start mb-2">
                    <div class="flex-shrink-0 mt-1">
                        <i class="bi ${iconClass} text-warning"></i>
                    </div>
                    <div class="flex-grow-1 ms-2">
                        <div class="fw-semibold text-primary">${this.escapeHtml(notification.message)}</div>
                        <small class="text-muted">${timeAgo}</small>
                    </div>
                    <span class="unread-indicator bg-primary rounded-circle ms-2 mt-1" style="width: 8px; height: 8px;"></span>
                </div>
                <div class="d-flex justify-content-between mt-2">
                    <button class="btn btn-sm btn-outline-primary mark-read-btn" data-notification-id="${notification.id}">
                        <i class="bi bi-check-circle me-1"></i>Mark as Read
                    </button>
                    <button class="btn btn-sm btn-outline-secondary view-btn" data-notification-id="${notification.id}">
                        <i class="bi bi-eye me-1"></i>View
                    </button>
                </div>
            </div>
        `;

        // إضافة event listeners للأزرار
        const markReadBtn = li.querySelector('.mark-read-btn');
        const viewBtn = li.querySelector('.view-btn');

        markReadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.markAsRead(notification.id);
        });

        viewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleViewNotification(notification);
        });

        return li;
    }

    getNotificationIcon(notification) {
        if (notification.message.toLowerCase().includes('complaint')) {
            return 'bi-exclamation-triangle';
        } else if (notification.message.toLowerCase().includes('order')) {
            return 'bi-cart-check';
        } else if (notification.message.toLowerCase().includes('invoice')) {
            return 'bi-receipt';
        }
        return 'bi-bell';
    }

    getTimeAgo(createdAt) {
        const created = new Date(createdAt);
        const now = new Date();
        const diffInSeconds = Math.floor((now - created) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    incrementUnreadCount() {
        const countElement = document.getElementById('notification-count');
        if (countElement) {
            let currentCount = parseInt(countElement.textContent) || 0;
            currentCount++;
            countElement.textContent = currentCount;
            countElement.style.display = 'block';
        }
    }

    updateUnreadCount(count) {
        const countElement = document.getElementById('notification-count');
        if (countElement) {
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'block' : 'none';
        }
    }

    async markAsRead(notificationId) {
        try {
            const response = await api_MarkNotificationAsRead(notificationId);
            if (response.ok) {
                console.log('Notification marked as read via WebSocket');
                
                // إزالة الإشعار من الواجهة مع تأثير
                this.removeNotificationFromUI(notificationId);
                this.decrementUnreadCount();
            } else {
                console.error('Failed to mark notification as read:', response.status);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    handleViewNotification(notification) {
        // تحديد الصفحة المناسبة بناءً على نوع الإشعار
        let targetPage = '/notifications/';
        
        if (notification.message.toLowerCase().includes('complaint')) {
            targetPage = '/complaints/';
        } else if (notification.message.toLowerCase().includes('order')) {
            targetPage = '/orders/';
        } else if (notification.message.toLowerCase().includes('invoice')) {
            targetPage = '/invoices/';
        } else if (notification.message.toLowerCase().includes('user')) {
            targetPage = '/users/';
        }

        // إغلاق dropdown الإشعارات
        const dropdownElement = document.getElementById('notification-dropdown');
        const bsDropdown = bootstrap.Dropdown.getInstance(dropdownElement);
        if (bsDropdown) {
            bsDropdown.hide();
        }

        // التنقل إلى الصفحة المطلوبة
        if (window.navigateTo) {
            window.navigateTo(targetPage);
        } else {
            window.location.href = targetPage;
        }
    }

    showBrowserNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Water Supply Management', {
                body: notification.message,
                icon: '/images/xtra-link-icon.png',
                tag: 'notification'
            });
        }
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectInterval * this.reconnectAttempts;
            console.log(`Attempting to reconnect in ${delay}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            console.log('Max reconnection attempts reached. Stopping WebSocket.');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close(1000, 'Normal closure');
            this.socket = null;
            this.isAuthenticated = false;
        }
    }
}

class NotificationsManager {
    constructor() {
        this.notificationsWebSocket = null;
        this.isInitialized = false;
        this.fallbackToPolling = false;
        this.pollingInterval = null;
    }

    // دالة للتحقق من صلاحية المستخدم
    isUserAuthorized() {
        const role = localStorage.getItem('user_role');
        return role === 'admin' || role === 'manager';
    }

    async initialize() {
        if (this.isInitialized) return;

        // التحقق من صلاحية المستخدم قبل التهيئة
        if (!this.isUserAuthorized()) {
            console.log('User not authorized for notifications. Role:', localStorage.getItem('user_role'));
            this.hideNotificationIcon();
            return;
        }

        try {
            await this.loadInitialNotifications();
            
            try {
                await this.initializeWebSocket();
            } catch (wsError) {
                console.warn('WebSocket failed, falling back to polling:', wsError);
                this.startPollingFallback();
            }
            
            this.requestNotificationPermission();
            this.isInitialized = true;
            console.log('Notifications system initialized successfully');
        } catch (error) {
            console.error('Error initializing notifications system:', error);
            this.startPollingFallback();
        }
    }

    async initializeWebSocket() {
        return new Promise((resolve, reject) => {
            this.notificationsWebSocket = new NotificationsWebSocket();
            
            const checkConnection = setInterval(() => {
                if (this.notificationsWebSocket.socket) {
                    if (this.notificationsWebSocket.socket.readyState === WebSocket.OPEN) {
                        clearInterval(checkConnection);
                        resolve();
                    } else if (this.notificationsWebSocket.socket.readyState === WebSocket.CLOSED) {
                        clearInterval(checkConnection);
                        reject(new Error('WebSocket connection failed'));
                    }
                }
            }, 100);
            
            setTimeout(() => {
                clearInterval(checkConnection);
                if (!this.notificationsWebSocket.isAuthenticated) {
                    reject(new Error('WebSocket connection timeout'));
                }
            }, 10000);
            
            this.notificationsWebSocket.connect();
        });
    }

    async loadInitialNotifications() {
        // تحقق مرة أخرى من الصلاحية قبل تحميل الإشعارات
        if (!this.isUserAuthorized()) {
            throw new Error('User not authorized to load notifications');
        }

        try {
            const response = await api_GetNotifications();

            if (response.ok) {
                const data = await response.json();
                this.renderNotifications(data.results);
                this.updateNotificationCount(data.results);
                console.log('Initial notifications loaded:', data.results.length);
            } else {
                console.error('Failed to load notifications:', response.status);
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error loading initial notifications:', error);
            throw error;
        }
    }

    renderNotifications(notifications) {
        const notificationsList = document.querySelector('.notification-dropdown');
        if (!notificationsList) {
            console.warn('Notifications dropdown not found in DOM');
            return;
        }

        const header = notificationsList.querySelector('.dropdown-header');
        const existingItems = notificationsList.querySelectorAll('li:not(.dropdown-header):not(:last-child)');
        existingItems.forEach(item => item.remove());

        if (notifications.length === 0) {
            this.showEmptyMessage();
        } else {
            notifications.forEach(notification => {
                const notificationElement = this.createNotificationElement(notification);
                notificationsList.insertBefore(notificationElement, notificationsList.querySelector('.dropdown-divider'));
            });
        }
    }

    showEmptyMessage() {
        const notificationsList = document.querySelector('.notification-dropdown');
        if (!notificationsList) return;

        const emptyItem = document.createElement('li');
        emptyItem.className = 'no-notifications-message';
        emptyItem.innerHTML = '<a class="dropdown-item text-muted text-center">No notifications</a>';
        notificationsList.insertBefore(emptyItem, notificationsList.querySelector('.dropdown-divider'));
    }

    createNotificationElement(notification) {
        const li = document.createElement('li');
        li.setAttribute('data-notification-id', notification.id);
        
        const iconClass = this.getNotificationIcon(notification);
        const timeAgo = this.getTimeAgo(notification.created_at);

        li.innerHTML = `
            <div class="dropdown-item notification-item" data-notification-id="${notification.id}">
                <div class="d-flex align-items-start mb-2">
                    <div class="flex-shrink-0 mt-1">
                        <i class="bi ${iconClass} ${notification.is_read ? 'text-muted' : 'text-warning'}"></i>
                    </div>
                    <div class="flex-grow-1 ms-2">
                        <div class="fw-semibold ${notification.is_read ? '' : 'text-primary'}">${this.escapeHtml(notification.message)}</div>
                        <small class="text-muted">${timeAgo}</small>
                    </div>
                    ${!notification.is_read ? '<span class="unread-indicator bg-primary rounded-circle ms-2 mt-1" style="width: 8px; height: 8px;"></span>' : ''}
                </div>
                <div class="d-flex justify-content-between mt-2">
                    ${!notification.is_read ? 
                        `<button class="btn btn-sm btn-outline-primary mark-read-btn" data-notification-id="${notification.id}">
                            <i class="bi bi-check-circle me-1"></i>Mark as Read
                        </button>` : 
                        '<div></div>'
                    }
                    <button class="btn btn-sm btn-outline-secondary view-btn" data-notification-id="${notification.id}">
                        <i class="bi bi-eye me-1"></i>View
                    </button>
                </div>
            </div>
        `;

        // إضافة event listeners للأزرار
        const markReadBtn = li.querySelector('.mark-read-btn');
        const viewBtn = li.querySelector('.view-btn');

        if (markReadBtn) {
            markReadBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await this.markNotificationAsRead(notification.id);
            });
        }

        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleViewNotification(notification);
            });
        }

        return li;
    }

    getNotificationIcon(notification) {
        if (notification.message.toLowerCase().includes('complaint')) {
            return 'bi-exclamation-triangle';
        } else if (notification.message.toLowerCase().includes('order')) {
            return 'bi-cart-check';
        } else if (notification.message.toLowerCase().includes('invoice')) {
            return 'bi-receipt';
        } else if (notification.message.toLowerCase().includes('user')) {
            return 'bi-person';
        }
        return 'bi-bell';
    }

    getTimeAgo(createdAt) {
        const created = new Date(createdAt);
        const now = new Date();
        const diffInSeconds = Math.floor((now - created) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    updateNotificationCount(notifications) {
        const countElement = document.getElementById('notification-count');
        if (countElement) {
            const unreadCount = notifications.filter(n => !n.is_read).length;
            countElement.textContent = unreadCount;
            countElement.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    async markNotificationAsRead(notificationId) {
        try {
            const response = await api_MarkNotificationAsRead(notificationId);
            if (response.ok) {
                // إزالة الإشعار من الواجهة مع تأثير
                this.removeNotificationFromUI(notificationId);
                this.decrementUnreadCount();
            } else {
                console.error('Failed to mark notification as read:', response.status);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    removeNotificationFromUI(notificationId) {
        const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notificationElement) {
            // إضافة تأثير اختفاء سلس
            notificationElement.style.opacity = '0';
            notificationElement.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                notificationElement.remove();
                this.checkAndShowEmptyMessage();
            }, 300);
        }
    }

    checkAndShowEmptyMessage() {
        const notificationsList = document.querySelector('.notification-dropdown');
        if (!notificationsList) return;

        const notifications = notificationsList.querySelectorAll('li[data-notification-id]');
        const emptyMessage = notificationsList.querySelector('.no-notifications-message');
        
        if (notifications.length === 0 && !emptyMessage) {
            this.showEmptyMessage();
        }
    }

    decrementUnreadCount() {
        const countElement = document.getElementById('notification-count');
        if (countElement) {
            let currentCount = parseInt(countElement.textContent) || 0;
            if (currentCount > 0) {
                currentCount--;
                countElement.textContent = currentCount;
                countElement.style.display = currentCount > 0 ? 'block' : 'none';
            }
        }
    }

    handleViewNotification(notification) {
        let targetPage = '/notifications/';
        
        if (notification.message.toLowerCase().includes('complaint')) {
            targetPage = '/complaints/';
        } else if (notification.message.toLowerCase().includes('order')) {
            targetPage = '/orders/';
        } else if (notification.message.toLowerCase().includes('invoice')) {
            targetPage = '/invoices/';
        } else if (notification.message.toLowerCase().includes('user')) {
            targetPage = '/users/';
        }

        // إغلاق dropdown الإشعارات
        const dropdownElement = document.getElementById('notification-dropdown');
        const bsDropdown = bootstrap.Dropdown.getInstance(dropdownElement);
        if (bsDropdown) {
            bsDropdown.hide();
        }

        // التنقل إلى الصفحة المطلوبة
        if (window.navigateTo) {
            window.navigateTo(targetPage);
        } else {
            window.location.href = targetPage;
        }
    }

    startPollingFallback() {
        console.log('Starting polling fallback for notifications (30 second intervals)');
        this.fallbackToPolling = true;
        
        this.pollingInterval = setInterval(async () => {
            try {
                await this.loadInitialNotifications();
            } catch (error) {
                console.error('Error in polling fallback:', error);
            }
        }, 30000);
    }

    stopPollingFallback() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            this.fallbackToPolling = false;
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('Notification permission:', permission);
            });
        }
    }

    // دالة جديدة لإخفاء أيقونة الإشعارات
    hideNotificationIcon() {
        const notificationElement = document.getElementById('notification');
        if (notificationElement) {
            notificationElement.style.display = 'none';
        }
    }

    disconnect() {
        if (this.notificationsWebSocket) {
            this.notificationsWebSocket.disconnect();
        }
        this.stopPollingFallback();
        this.isInitialized = false;
    }
}

const notificationsManager = new NotificationsManager();

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    
    // التحقق من أن المستخدم مصادق وله صلاحية admin أو manager
    if (token && (role === 'admin' || role === 'manager')) {
        setTimeout(() => {
            notificationsManager.initialize().catch(error => {
                console.error('Failed to initialize notifications system:', error);
            });
        }, 1000);
    } else {
        // إذا لم يكن المستخدم مؤهلاً، نخفي أيقونة الإشعارات
        notificationsManager.hideNotificationIcon();
        console.log('Notifications disabled for user role:', role);
    }
});

export default notificationsManager;