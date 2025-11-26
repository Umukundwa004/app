// public/js/system-admin.js - UPDATED WITH PROPER CONNECTIONS
class SystemAdmin {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'dashboard';
        this.users = [];
        this.restaurants = [];
        this.reservations = [];
        this.auditLogs = [];
        
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/user');
            if (!response.ok) throw new Error('Not authenticated');
            
            const data = await response.json();
            
            if (data.loggedIn && data.user.user_type === 'system_admin') {
                this.currentUser = data.user;
                const adminNameEl = document.getElementById('admin-name');
                if (adminNameEl) adminNameEl.textContent = data.user.name;
            } else {
                // During development on localhost avoid forced redirect so debugging is easier
                const hostname = window && window.location && window.location.hostname;
                if (hostname === 'localhost' || hostname === '127.0.0.1') {
                    console.warn('checkAuth: not system_admin but running on localhost — skipping redirect for dev');
                } else {
                    window.location.href = '/login';
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // If running locally, don't force a redirect (helps debugging); otherwise redirect to login
            const hostname = window && window.location && window.location.hostname;
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                console.warn('Auth check failed but running on localhost — continuing for developer testing');
            } else {
                window.location.href = '/login';
            }
        }
    }

    setupEventListeners() {
        console.debug('SystemAdmin: setupEventListeners start');
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.closest('.tab-button').id.replace('-tab', '');
                this.switchTab(tabName);
            });
        });

        // Mobile bottom navigation
        document.querySelectorAll('.mobile-admin-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.getAttribute('data-tab');
                this.switchTab(tab);
                // Update active states
                document.querySelectorAll('.mobile-admin-nav-link').forEach(l => {
                    l.classList.remove('active', 'text-gray-600');
                    l.classList.add('text-gray-400');
                });
                link.classList.add('active', 'text-gray-600');
                link.classList.remove('text-gray-400');
            });
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // User management
        document.getElementById('add-user-btn').addEventListener('click', () => {
            this.openUserModal();
        });

        document.getElementById('user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });

        // Explicit click handler for Save User button (delegates to form submit)
        const saveUserBtn = document.getElementById('save-user-btn');
        if (saveUserBtn) {
            saveUserBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const form = document.getElementById('user-form');
                if (form && typeof form.requestSubmit === 'function') {
                    form.requestSubmit();
                } else if (form) {
                    // Fallback: trigger submit event
                    form.dispatchEvent(new Event('submit', { cancelable: true }));
                }
            });
        }

        document.getElementById('cancel-user').addEventListener('click', () => {
            this.closeUserModal();
        });

        document.getElementById('close-user-modal').addEventListener('click', () => {
            this.closeUserModal();
        });

        // Password visibility toggle
        const togglePasswordBtn = document.getElementById('toggle-password-visibility');
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', () => {
                const passwordInput = document.getElementById('user-password');
                const eyeIcon = document.getElementById('password-eye-icon');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    eyeIcon.classList.remove('fa-eye');
                    eyeIcon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    eyeIcon.classList.remove('fa-eye-slash');
                    eyeIcon.classList.add('fa-eye');
                }
            });
        }

        // Restaurant management
        const addRestaurantBtn = document.getElementById('add-restaurant-btn');
        if (addRestaurantBtn) {
            addRestaurantBtn.addEventListener('click', () => {
                this.openRestaurantModal();
            });
        }

        const restaurantForm = document.getElementById('restaurant-form');
        if (restaurantForm) {
            restaurantForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveRestaurant();
            });
        }

        // Toggle admin sections based on radio selection
        const adminRadios = document.querySelectorAll('input[name="admin-option"]');
        adminRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const existingSection = document.getElementById('existing-admin-section');
                const newSection = document.getElementById('new-admin-section');
                
                if (e.target.value === 'create') {
                    if (existingSection) existingSection.classList.add('hidden');
                    if (newSection) newSection.classList.remove('hidden');
                } else {
                    if (existingSection) existingSection.classList.remove('hidden');
                    if (newSection) newSection.classList.add('hidden');
                }
            });
        });

        // Note: Save/Cancel buttons for the restaurant modal were removed from the DOM
        // so explicit event listeners for those IDs were removed to avoid unused handlers.

        const closeRestaurantModalBtn = document.getElementById('close-restaurant-modal');
        if (closeRestaurantModalBtn) {
            closeRestaurantModalBtn.addEventListener('click', () => {
                this.closeRestaurantModal();
            });
        }

        // Details modal close buttons
        const closeDetails = document.getElementById('close-restaurant-details');
        if (closeDetails) closeDetails.addEventListener('click', () => this.closeRestaurantDetails());
        const closeDetails2 = document.getElementById('close-restaurant-details-2');
        if (closeDetails2) closeDetails2.addEventListener('click', () => this.closeRestaurantDetails());

        // File upload previews - Multiple images
        const imagesInput = document.getElementById('restaurant-images');
        if (imagesInput) {
            imagesInput.addEventListener('change', (e) => {
                this.previewMultipleImages(e.target.files);
            });
        }

        // Menu source toggle (editor vs file)
        document.querySelectorAll('input[name="menu-source"]').forEach(r => {
            r.addEventListener('change', (e) => {
                const val = e.target.value;
                const editor = document.getElementById('menu-editor');
                const file = document.getElementById('menu-file');
                if (val === 'file') {
                    if (editor) editor.classList.add('hidden');
                    if (file) file.classList.remove('hidden');
                } else {
                    if (editor) editor.classList.remove('hidden');
                    if (file) file.classList.add('hidden');
                }
            });
        });

        const videoInput = document.getElementById('restaurant-video');
        if (videoInput) {
            videoInput.addEventListener('change', (e) => {
                this.previewVideo(e.target.files[0]);
            });
        }

        const removeVideoBtn = document.getElementById('remove-video');
        if (removeVideoBtn) {
            removeVideoBtn.addEventListener('click', () => {
                document.getElementById('restaurant-video').value = '';
                document.getElementById('video-preview').classList.add('hidden');
            });
        }

        // Admin option radio buttons
        const adminOptionRadios = document.querySelectorAll('input[name="admin-option"]');
        if (adminOptionRadios) {
            adminOptionRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    const existingSection = document.getElementById('existing-admin-section');
                    const newSection = document.getElementById('new-admin-section');
                    
                    if (e.target.value === 'existing') {
                        existingSection.classList.remove('hidden');
                        newSection.classList.add('hidden');
                        // Clear new admin fields
                        document.getElementById('new-admin-name').value = '';
                        document.getElementById('new-admin-email').value = '';
                        document.getElementById('new-admin-phone').value = '';
                        document.getElementById('new-admin-password').value = '';
                    } else {
                        existingSection.classList.add('hidden');
                        newSection.classList.remove('hidden');
                        // Clear existing admin selection
                        document.getElementById('restaurant-admin-select').value = '';
                    }
                });
            });
        }

        // Search functionality
        document.getElementById('search-users-btn').addEventListener('click', () => {
            this.loadUsers();
        });

        document.getElementById('search-restaurants-btn').addEventListener('click', () => {
            this.loadRestaurants();
        });

        document.getElementById('search-reservations-btn').addEventListener('click', () => {
            this.loadAllReservations();
        });

        document.getElementById('search-audit-btn').addEventListener('click', () => {
            this.loadAuditLogs();
        });

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('user-modal')) {
                this.closeUserModal();
            }
            if (e.target === document.getElementById('restaurant-modal')) {
                this.closeRestaurantModal();
            }
        });

        // Close modals on Escape key and handle other global key actions
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close either modal if open
                const userModal = document.getElementById('user-modal');
                const restModal = document.getElementById('restaurant-modal');
                const detailsModal = document.getElementById('restaurant-details-modal');
                if (userModal && !userModal.classList.contains('hidden')) this.closeUserModal();
                if (restModal && !restModal.classList.contains('hidden')) this.closeRestaurantModal();
                if (detailsModal && !detailsModal.classList.contains('hidden')) this.closeRestaurantDetails();
            }
        });

        // Delegated click handlers as a resilient fallback in case buttons are re-rendered
        document.addEventListener('click', (e) => {
            // Save restaurant button (delegated)
            const saveBtn = e.target.closest && e.target.closest('#save-restaurant-btn');
            if (saveBtn) {
                e.preventDefault();
                const form = document.getElementById('restaurant-form');
                if (form && typeof form.requestSubmit === 'function') {
                    form.requestSubmit();
                } else if (form) {
                    form.dispatchEvent(new Event('submit', { cancelable: true }));
                }
                return;
            }

            // Add restaurant quick action fallback
            const addBtn = e.target.closest && e.target.closest('#add-restaurant-btn');
            if (addBtn) {
                e.preventDefault();
                // Use existing method to open modal
                try { this.openRestaurantModal(); } catch (err) { console.error('openRestaurantModal error', err); }
                return;
            }
        });

        console.debug('SystemAdmin: setupEventListeners complete');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('border-brown-600', 'text-gray-600');
            button.classList.add('border-transparent', 'text-gray-500');
        });

        document.getElementById(`${tabName}-tab`).classList.add('border-brown-600', 'text-gray-600');
        document.getElementById(`${tabName}-tab`).classList.remove('border-transparent', 'text-gray-500');

        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Show selected tab content
        document.getElementById(`${tabName}-content`).classList.remove('hidden');

        // Load tab-specific data
        this.currentTab = tabName;
        switch(tabName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'restaurants':
                this.loadRestaurants();
                break;
            case 'reservations':
                // Ensure no media upload controls are present in this tab
                try { this.removeReservationMediaControls(); } catch (e) {}
                this.loadAllReservations();
                break;
            case 'system':
                // Settings are static for now
                break;
            case 'audit':
                this.loadAuditLogs();
                break;
        }
    }

    // Remove any media upload controls or previews that might appear inside the Reservations tab
    // This is intentionally defensive: the reservations UI shouldn't have uploads, but if any exist
    // remove them so the tab contains no image/video upload controls.
    removeReservationMediaControls() {
        try {
            const reservationsEl = document.getElementById('reservations-content');
            if (!reservationsEl) return;

            // Remove any file inputs inside the reservations area
            reservationsEl.querySelectorAll('input[type="file"]').forEach(el => el.remove());

            // Remove any common preview containers that might be accidentally placed there
            const previewIds = ['video-preview', 'preview-video', 'image-preview', 'preview-img', 'preview-images-container', 'preview-images'];
            previewIds.forEach(id => {
                const el = reservationsEl.querySelector('#' + id);
                if (el) el.remove();
            });

            // Remove any elements with a class indicating media-preview inside the reservations area
            reservationsEl.querySelectorAll('.reservation-media, .media-preview').forEach(el => el.remove());
        } catch (e) {
            console.debug('removeReservationMediaControls error', e);
        }
    }

    async loadDashboardData() {
        try {
            // Load system statistics
            const statsResponse = await fetch('/api/system-admin/stats');
            if (!statsResponse.ok) throw new Error('Failed to load stats');
            
            const stats = await statsResponse.json();

            // Update main stats
            document.getElementById('total-users').textContent = stats.totalUsers || 0;
            document.getElementById('total-restaurants').textContent = stats.totalRestaurants || 0;
            document.getElementById('total-reservations').textContent = stats.totalReservations || 0;
            document.getElementById('pending-reservations').textContent = stats.pendingReservations || 0;
            document.getElementById('total-menu-items').textContent = stats.totalMenuItems || 0;
            document.getElementById('active-restaurants').textContent = stats.activeRestaurants || 0;

            // Display user distribution chart
            this.displayUserChart(stats.usersByType || {});
            
            // Display reservation trends chart
            this.displayReservationChart(stats.reservationsByStatus || {});

            // Load recent users
            const usersResponse = await fetch('/api/system-admin/users?limit=5');
            if (usersResponse.ok) {
                const users = await usersResponse.json();
                this.displayRecentUsers(users);
            }

            // Display recent reservations in system alerts area
            if (stats.recentReservations && stats.recentReservations.length > 0) {
                this.displayRecentReservations(stats.recentReservations);
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        }
    }

    displayUserChart(usersByType) {
        const container = document.getElementById('user-chart');
        if (!usersByType || Object.keys(usersByType).length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">No user data available</p>';
            return;
        }

        const total = Object.values(usersByType).reduce((sum, count) => sum + count, 0);
        const colors = {
            'customer': 'bg-blue-500',
            'restaurant_admin': 'bg-green-500',
            'system_admin': 'bg-purple-500'
        };
        const labels = {
            'customer': 'Customers',
            'restaurant_admin': 'Restaurant Admins',
            'system_admin': 'System Admins'
        };

        let html = '<div class="space-y-3">';
        for (const [type, count] of Object.entries(usersByType)) {
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            const colorClass = colors[type] || 'bg-gray-500';
            const label = labels[type] || type;
            
            html += `
                <div>
                    <div class="flex justify-between mb-1">
                        <span class="text-sm font-medium text-gray-700">${label}</span>
                        <span class="text-sm text-gray-600">${count} (${percentage}%)</span>
                    </div>
                    <div class="w-full bg-brown-200 rounded-full h-2.5">
                        <div class="${colorClass} h-2.5 rounded-full transition-all" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
    }

    displayReservationChart(reservationsByStatus) {
        const container = document.getElementById('reservation-chart');
        if (!reservationsByStatus || Object.keys(reservationsByStatus).length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">No reservation data available</p>';
            return;
        }

        const total = Object.values(reservationsByStatus).reduce((sum, count) => sum + count, 0);
        const colors = {
            'pending': 'bg-yellow-500',
            'confirmed': 'bg-green-500',
            'completed': 'bg-blue-500',
            'cancelled': 'bg-red-500'
        };
        const labels = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };

        let html = '<div class="space-y-3">';
        for (const [status, count] of Object.entries(reservationsByStatus)) {
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            const colorClass = colors[status] || 'bg-gray-500';
            const label = labels[status] || status;
            
            html += `
                <div>
                    <div class="flex justify-between mb-1">
                        <span class="text-sm font-medium text-gray-700">${label}</span>
                        <span class="text-sm text-gray-600">${count} (${percentage}%)</span>
                    </div>
                    <div class="w-full bg-brown-200 rounded-full h-2.5">
                        <div class="${colorClass} h-2.5 rounded-full transition-all" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
    }

    displayRecentReservations(reservations) {
        const container = document.getElementById('system-alerts');
        if (!reservations || reservations.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">No recent reservations</p>';
            return;
        }

        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-green-100 text-green-800',
            'completed': 'bg-blue-100 text-blue-800',
            'cancelled': 'bg-red-100 text-red-800'
        };

        const html = reservations.map(reservation => {
            const date = new Date(reservation.reservation_date).toLocaleDateString();
            const time = reservation.reservation_time;
            const statusClass = statusColors[reservation.status] || 'bg-gray-100 text-gray-800';
            
            return `
                <div class="flex items-start space-x-3 p-3 bg-white rounded border border-gray-200">
                    <div class="flex-shrink-0">
                        <i class="fas fa-calendar-check text-gray-600"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900">${reservation.customer_name}</p>
                        <p class="text-xs text-gray-600">${reservation.restaurant_name}</p>
                        <p class="text-xs text-gray-500">${date} at ${time} • ${reservation.party_size} guests</p>
                    </div>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                        ${reservation.status}
                    </span>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    displayRecentUsers(users) {
        const container = document.getElementById('recent-users');
        
        if (!users || users.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">No recent users</p>';
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <div>
                    <div class="font-medium text-gray-900">${user.name}</div>
                    <div class="text-sm text-gray-600">${user.email}</div>
                    <div class="text-xs text-gray-500 capitalize">${user.user_type.replace('_', ' ')}</div>
                </div>
                <span class="px-2 py-1 rounded-full text-xs ${this.getUserStatusClass(user)}">
                    ${this.getUserStatusText(user)}
                </span>
            </div>
        `).join('');
    }

    loadSystemAlerts() {
        const container = document.getElementById('system-alerts');
        
        // Mock system alerts - in real implementation, these would come from the server
        const alerts = [
            { type: 'info', message: 'System running normally', timestamp: new Date() },
            { type: 'warning', message: '5 pending reservations need attention', timestamp: new Date(Date.now() - 3600000) },
            { type: 'success', message: 'Backup completed successfully', timestamp: new Date(Date.now() - 86400000) }
        ];

        container.innerHTML = alerts.map(alert => `
            <div class="flex items-start p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex-shrink-0 mt-1">
                    <i class="fas fa-${this.getAlertIcon(alert.type)} text-${this.getAlertColor(alert.type)}"></i>
                </div>
                <div class="ml-3 flex-1">
                    <div class="text-sm text-gray-900">${alert.message}</div>
                    <div class="text-xs text-gray-500 mt-1">${this.formatDateTime(alert.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    getAlertIcon(type) {
        switch(type) {
            case 'info': return 'info-circle';
            case 'warning': return 'exclamation-triangle';
            case 'success': return 'check-circle';
            default: return 'info-circle';
        }
    }

    getAlertColor(type) {
        switch(type) {
            case 'info': return 'blue-500';
            case 'warning': return 'yellow-500';
            case 'success': return 'green-500';
            default: return 'gray-500';
        }
    }

    async loadUsers() {
        try {
            const typeFilter = document.getElementById('user-type-filter').value;
            const statusFilter = document.getElementById('user-status-filter').value;
            
            let url = '/api/system-admin/users';
            const params = new URLSearchParams();
            
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            
            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await fetch(url);
            
            if (response.status === 403) {
                this.showNotification('Session expired. Please log in again.', 'error');
                setTimeout(() => window.location.href = '/login', 2000);
                return;
            }
            
            if (!response.ok) throw new Error('Failed to load users');
            
            this.users = await response.json();
            this.displayUsers();
        } catch (error) {
            console.error('Error loading users:', error);
            this.showNotification('Error loading users', 'error');
        }
    }

    displayUsers() {
        const container = document.getElementById('users-table');
        
        if (!this.users || this.users.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="py-8 text-center text-gray-500">
                        No users found matching your criteria
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = this.users.map(user => `
            <tr class="border-b border-gray-200 hover:bg-brown-50">
                <td class="py-3 px-4">${user.id}</td>
                <td class="py-3 px-4">
                    <div class="font-medium">${user.name}</div>
                </td>
                <td class="py-3 px-4">${user.email}</td>
                <td class="py-3 px-4">${user.phone || 'N/A'}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs capitalize ${this.getUserTypeClass(user.user_type)}">
                        ${user.user_type.replace('_', ' ')}
                    </span>
                </td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs ${this.getUserStatusClass(user)}">
                        ${this.getUserStatusText(user)}
                    </span>
                </td>
                <td class="py-3 px-4">${this.formatDate(user.created_at)}</td>
                <td class="py-3 px-4">
                    <div class="flex space-x-2">
                        <button class="edit-user-btn text-blue-600 hover:text-blue-800" data-id="${user.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-user-btn text-red-600 hover:text-red-800" data-id="${user.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                        ${user.account_locked ? `
                            <button class="unlock-user-btn text-green-600 hover:text-green-800" data-id="${user.id}">
                                <i class="fas fa-unlock"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners
        this.attachUserEventListeners();
    }

    attachUserEventListeners() {
        document.querySelectorAll('.edit-user-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = e.target.closest('button').getAttribute('data-id');
                this.editUser(userId);
            });
        });

        document.querySelectorAll('.delete-user-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = e.target.closest('button').getAttribute('data-id');
                this.deleteUser(userId);
            });
        });

        document.querySelectorAll('.unlock-user-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = e.target.closest('button').getAttribute('data-id');
                this.unlockUser(userId);
            });
        });
    }

    async loadRestaurants() {
        try {
            const statusFilter = document.getElementById('restaurant-status-filter').value;
            const cuisineFilter = document.getElementById('restaurant-cuisine-filter').value;
            
            let url = '/api/system-admin/restaurants';
            const params = new URLSearchParams();
            
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (cuisineFilter !== 'all') params.append('cuisine', cuisineFilter);
            
            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to load restaurants');
            
            this.restaurants = await response.json();
            this.displayRestaurants();
            this.populateCuisineFilter();
        } catch (error) {
            console.error('Error loading restaurants:', error);
            this.showNotification('Error loading restaurants', 'error');
        }
    }

    displayRestaurants() {
        const container = document.getElementById('restaurants-table');
        
        if (!this.restaurants || this.restaurants.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="py-8 text-center text-gray-500">
                        No restaurants found matching your criteria
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = this.restaurants.map(restaurant => `
            <tr class="border-b border-gray-200 hover:bg-brown-50">
                <td class="py-3 px-4">${restaurant.id}</td>
                <td class="py-3 px-4">
                    <div class="w-16 h-16 rounded-lg overflow-hidden bg-brown-200 flex items-center justify-center">
                        ${restaurant.image_url 
                            ? `<img src="${restaurant.image_url}" alt="${restaurant.name}" class="w-full h-full object-cover">`
                            : `<i class="fas fa-utensils text-gray-400"></i>`
                        }
                    </div>
                </td>
                <td class="py-3 px-4">
                    <div class="font-medium">${restaurant.name}</div>
                </td>
                <td class="py-3 px-4">${restaurant.location}</td>
                <td class="py-3 px-4">${restaurant.cuisine_type || 'N/A'}</td>
                <td class="py-3 px-4">${restaurant.admin_name || 'N/A'}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs ${restaurant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${restaurant.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="py-3 px-4">
                    <div class="flex space-x-2">
                            <button class="view-restaurant-btn text-gray-600 hover:text-gray-800 text-sm" data-id="${restaurant.id}" title="View details">View</button>
                        <button class="edit-restaurant-btn text-blue-600 hover:text-blue-800" data-id="${restaurant.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-restaurant-btn text-red-600 hover:text-red-800" data-id="${restaurant.id}" data-admin-id="${restaurant.restaurant_admin_id || ''}">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="reset-admin-pass-btn text-indigo-600 hover:text-indigo-800" data-admin-id="${restaurant.restaurant_admin_id || ''}">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="toggle-restaurant-btn ${restaurant.is_active ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}" data-id="${restaurant.id}" data-active="${restaurant.is_active}">
                            <i class="fas ${restaurant.is_active ? 'fa-pause' : 'fa-play'}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners
        // Edit
        document.querySelectorAll('.edit-restaurant-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const restaurantId = e.target.closest('button').getAttribute('data-id');
                const restaurant = this.restaurants.find(r => r.id == restaurantId);
                if (restaurant) this.openRestaurantModal(restaurant);
            });
        });

        // Delete
        document.querySelectorAll('.delete-restaurant-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const restaurantId = e.target.closest('button').getAttribute('data-id');
                this.deleteRestaurant(restaurantId);
            });
        });

        // Reset Admin Password
        document.querySelectorAll('.reset-admin-pass-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const adminId = e.target.closest('button').getAttribute('data-admin-id');
                this.resetAdminPassword(adminId);
            });
        });

        // Toggle active status
        document.querySelectorAll('.toggle-restaurant-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const restaurantId = e.target.closest('button').getAttribute('data-id');
                const isActive = e.target.closest('button').getAttribute('data-active') === 'true';
                this.toggleRestaurant(restaurantId, !isActive);
            });
        });

        // View details
        document.querySelectorAll('.view-restaurant-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const restaurantId = e.target.closest('button').getAttribute('data-id');
                const restaurant = this.restaurants.find(r => r.id == restaurantId);
                if (restaurant) this.openRestaurantDetails(restaurant);
            });
        });
    }

    async deleteRestaurant(restaurantId) {
        if (!confirm('Permanently delete this restaurant and its associated data? This action cannot be undone.')) return;

        try {
            const response = await fetch(`/api/system-admin/restaurants/${restaurantId}`, { method: 'DELETE' });
            if (response.ok) {
                this.showNotification('Restaurant deleted successfully', 'success');
                this.loadRestaurants();
            } else {
                const err = await response.json();
                this.showNotification(err.error || 'Error deleting restaurant', 'error');
            }
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            this.showNotification('Error deleting restaurant', 'error');
        }
    }

    async resetAdminPassword(adminId) {
        if (!adminId) {
            alert('No admin is assigned to this restaurant. Create or assign an admin first.');
            return;
        }

        const newPassword = prompt('Enter a new password for the restaurant admin (min 6 chars):');
        if (!newPassword || newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        try {
            const response = await fetch(`/api/system-admin/users/${adminId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword })
            });

            if (response.ok) {
                this.showNotification('Admin password updated successfully', 'success');
                this.loadUsers();
            } else {
                const err = await response.json();
                this.showNotification(err.error || 'Error updating password', 'error');
            }
        } catch (error) {
            console.error('Error resetting admin password:', error);
            this.showNotification('Error updating password', 'error');
        }
    }

    populateCuisineFilter() {
        const cuisineFilter = document.getElementById('restaurant-cuisine-filter');
        const cuisines = [...new Set(this.restaurants.map(r => r.cuisine_type).filter(Boolean))];
        
        cuisineFilter.innerHTML = '<option value="all">All Cuisines</option>' +
            cuisines.map(cuisine => `<option value="${cuisine}">${cuisine}</option>`).join('');
    }

    async loadAllReservations() {
        try {
            const statusFilter = document.getElementById('reservation-status-filter').value;
            const restaurantFilter = document.getElementById('reservation-restaurant-filter').value;
            const dateFilter = document.getElementById('reservation-date-filter').value;
            
            let url = '/api/system-admin/reservations';
            const params = new URLSearchParams();
            
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (restaurantFilter !== 'all') params.append('restaurant_id', restaurantFilter);
            if (dateFilter) params.append('date', dateFilter);
            
            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to load reservations');
            
            this.reservations = await response.json();
            this.displayAllReservations();
            this.populateRestaurantFilters();
        } catch (error) {
            console.error('Error loading reservations:', error);
            this.showNotification('Error loading reservations', 'error');
        }
    }

    displayAllReservations() {
        const container = document.getElementById('all-reservations-table');
        
        if (!this.reservations || this.reservations.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="py-8 text-center text-gray-500">
                        No reservations found matching your criteria
                    </td>
                </tr>
            `;
            return;
        }

        // Safety: remove any media controls that might have slipped into reservations area
        try { this.removeReservationMediaControls(); } catch (e) {}

        container.innerHTML = this.reservations.map(reservation => `
            <tr class="border-b border-gray-200 hover:bg-brown-50">
                <td class="py-3 px-4">${reservation.id}</td>
                <td class="py-3 px-4">
                    <div class="font-medium">${reservation.customer_name}</div>
                    <div class="text-sm text-gray-500">${reservation.customer_email}</div>
                </td>
                <td class="py-3 px-4">${reservation.restaurant_name}</td>
                <td class="py-3 px-4">
                    <div>${this.formatDate(reservation.reservation_date)}</div>
                    <div class="text-sm text-gray-500">${this.formatTime(reservation.reservation_time)}</div>
                </td>
                <td class="py-3 px-4">${reservation.party_size} people</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs ${this.getStatusClass(reservation.status)}">
                        ${this.getStatusText(reservation.status)}
                    </span>
                </td>
                <td class="py-3 px-4">
                    <div class="flex space-x-2">
                        ${reservation.status === 'pending' ? `
                            <button class="confirm-reservation-btn text-green-600 hover:text-green-800" data-id="${reservation.id}">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="reject-reservation-btn text-red-600 hover:text-red-800" data-id="${reservation.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners
        this.attachReservationEventListeners();
    }

    populateRestaurantFilters() {
        const reservationFilter = document.getElementById('reservation-restaurant-filter');
        const auditFilter = document.getElementById('audit-user-filter');
        
        const restaurants = [...new Set(this.reservations.map(r => ({ id: r.restaurant_id, name: r.restaurant_name })))];
        const users = [...new Set(this.reservations.map(r => ({ id: r.customer_id, name: r.customer_name })))];
        
        if (reservationFilter) {
            reservationFilter.innerHTML = '<option value="all">All Restaurants</option>' +
                restaurants.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
        }
        
        if (auditFilter) {
            auditFilter.innerHTML = '<option value="all">All Users</option>' +
                users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
        }
    }

    attachReservationEventListeners() {
        document.querySelectorAll('.confirm-reservation-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const reservationId = e.target.closest('button').getAttribute('data-id');
                this.updateReservationStatus(reservationId, 'confirmed');
            });
        });

        document.querySelectorAll('.reject-reservation-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const reservationId = e.target.closest('button').getAttribute('data-id');
                this.updateReservationStatus(reservationId, 'rejected');
            });
        });
    }

    async loadAuditLogs() {
        try {
            const actionFilter = document.getElementById('audit-action-filter').value;
            const userFilter = document.getElementById('audit-user-filter').value;
            const dateFilter = document.getElementById('audit-date-filter').value;
            
            let url = '/api/system-admin/audit-logs';
            const params = new URLSearchParams();
            
            if (actionFilter !== 'all') params.append('action', actionFilter);
            if (userFilter !== 'all') params.append('user_id', userFilter);
            if (dateFilter) params.append('date', dateFilter);
            
            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to load audit logs');
            
            this.auditLogs = await response.json();
            this.displayAuditLogs();
        } catch (error) {
            console.error('Error loading audit logs:', error);
            this.showNotification('Error loading audit logs', 'error');
        }
    }

    displayAuditLogs() {
        const container = document.getElementById('audit-logs-table');
        
        if (!this.auditLogs || this.auditLogs.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="py-8 text-center text-gray-500">
                        No audit logs found matching your criteria
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = this.auditLogs.map(log => `
            <tr class="border-b border-gray-200 hover:bg-brown-50">
                <td class="py-3 px-4">${this.formatDateTime(log.created_at)}</td>
                <td class="py-3 px-4">
                    <div class="font-medium">${log.user_name || 'System'}</div>
                    <div class="text-sm text-gray-500">${log.user_email || 'N/A'}</div>
                </td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-900 capitalize">
                        ${log.action.replace(/_/g, ' ')}
                    </span>
                </td>
                <td class="py-3 px-4">
                    ${log.resource_type ? `
                        <div class="text-sm">${log.resource_type}</div>
                        <div class="text-xs text-gray-500">ID: ${log.resource_id}</div>
                    ` : 'N/A'}
                </td>
                <td class="py-3 px-4">${log.ip_address || 'N/A'}</td>
                <td class="py-3 px-4">
                    ${log.details ? `
                        <button class="view-details-btn text-blue-600 hover:text-blue-800 text-sm" data-details='${JSON.stringify(log.details)}'>
                            Details
                        </button>
                    ` : 'N/A'}
                </td>
            </tr>
        `).join('');

        // Add event listeners for details buttons
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const details = JSON.parse(e.target.closest('button').getAttribute('data-details'));
                this.viewAuditDetails(details);
            });
        });
    }

    viewAuditDetails(details) {
        alert('Audit Details:\n' + JSON.stringify(details, null, 2));
    }

    // User management methods
    openUserModal(user = null) {
        const modal = document.getElementById('user-modal');
        const title = document.getElementById('user-modal-title');
        const passwordInput = document.getElementById('user-password');
        const requiredIndicator = document.getElementById('password-required-indicator');
        const optionalText = document.getElementById('password-optional-text');
        
        if (user) {
            title.textContent = 'Edit User';
            this.populateUserForm(user);
            // Password is optional when editing
            if (passwordInput) passwordInput.removeAttribute('required');
            if (requiredIndicator) requiredIndicator.classList.add('hidden');
            if (optionalText) optionalText.classList.remove('hidden');
        } else {
            title.textContent = 'Add User';
            document.getElementById('user-form').reset();
            document.getElementById('user-id').value = '';
            // Password is required when creating
            if (passwordInput) passwordInput.setAttribute('required', 'required');
            if (requiredIndicator) requiredIndicator.classList.remove('hidden');
            if (optionalText) optionalText.classList.add('hidden');
        }
        
        modal.classList.remove('hidden');
        // Prevent background scroll while modal is open and focus first input for accessibility
        try { document.body.style.overflow = 'hidden'; } catch (e) {}
        const firstInput = document.getElementById('user-name');
        if (firstInput) setTimeout(() => firstInput.focus(), 50);
    }

    closeUserModal() {
        document.getElementById('user-modal').classList.add('hidden');
        try { document.body.style.overflow = ''; } catch (e) {}
    }

    populateUserForm(user) {
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-phone').value = user.phone || '';
        document.getElementById('user-type').value = user.user_type;
        document.getElementById('user-password').value = '';
    }

    async saveUser() {
        const saveBtn = document.getElementById('save-user-btn');
        const feedback = document.getElementById('user-form-feedback');
        if (feedback) feedback.textContent = '';
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.dataset.origHtml = saveBtn.innerHTML;
            saveBtn.innerHTML = 'Saving...';
        }

        const formData = {
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            phone: document.getElementById('user-phone').value,
            user_type: document.getElementById('user-type').value
        };

        const password = document.getElementById('user-password').value;
        const userId = document.getElementById('user-id').value;
        
        // Password is required when creating new user
        if (!userId && !password) {
            const errMsg = 'Password is required when creating a new user';
            if (feedback) feedback.textContent = errMsg;
            this.showNotification(errMsg, 'error');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = saveBtn.dataset.origHtml || 'Save User';
            }
            return;
        }
        
        if (password) {
            formData.password = password;
        }
        const url = userId ? `/api/system-admin/users/${userId}` : '/api/system-admin/users';
        const method = userId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showNotification('User saved successfully', 'success');
                this.closeUserModal();
                this.loadUsers();
            } else {
                let errMsg = 'Error saving user';
                try { const error = await response.json(); errMsg = error.error || errMsg; } catch(e){}
                if (feedback) feedback.textContent = errMsg;
                this.showNotification(errMsg, 'error');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            const errMsg = 'Error saving user';
            if (feedback) feedback.textContent = errMsg;
            this.showNotification(errMsg, 'error');
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = saveBtn.dataset.origHtml || 'Save User';
            }
        }
    }

    async editUser(userId) {
        try {
            const response = await fetch(`/api/system-admin/users/${userId}`);
            if (response.status === 403) {
                this.showNotification('Access denied. Please log in as system admin.', 'error');
                setTimeout(() => window.location.href = '/login', 2000);
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to load user data');
            }
            const user = await response.json();
            this.openUserModal(user);
        } catch (error) {
            console.error('Error loading user:', error);
            this.showNotification('Error loading user data', 'error');
        }
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/system-admin/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showNotification('User deleted successfully', 'success');
                this.loadUsers();
            } else {
                const error = await response.json();
                this.showNotification(error.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showNotification('Error deleting user', 'error');
        }
    }

    async unlockUser(userId) {
        try {
            const response = await fetch(`/api/system-admin/users/${userId}/unlock`, {
                method: 'PUT'
            });

            if (response.ok) {
                this.showNotification('User unlocked successfully', 'success');
                this.loadUsers();
            } else {
                const error = await response.json();
                this.showNotification(error.error, 'error');
            }
        } catch (error) {
            console.error('Error unlocking user:', error);
            this.showNotification('Error unlocking user', 'error');
        }
    }

    async toggleRestaurant(restaurantId, activate) {
        try {
            const response = await fetch(`/api/system-admin/restaurants/${restaurantId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ active: activate })
            });

            if (response.ok) {
                this.showNotification(`Restaurant ${activate ? 'activated' : 'deactivated'} successfully`, 'success');
                this.loadRestaurants();
            } else {
                const error = await response.json();
                this.showNotification(error.error, 'error');
            }
        } catch (error) {
            console.error('Error toggling restaurant:', error);
            this.showNotification('Error updating restaurant status', 'error');
        }
    }

    async updateReservationStatus(reservationId, status) {
        if (!confirm(`Are you sure you want to ${status} this reservation?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/reservations/${reservationId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                this.showNotification(`Reservation ${status} successfully`, 'success');
                this.loadAllReservations();
            } else {
                const error = await response.json();
                this.showNotification(error.error, 'error');
            }
        } catch (error) {
            console.error('Error updating reservation status:', error);
            this.showNotification('Error updating reservation status', 'error');
        }
    }

    // Utility methods
    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    formatDateTime(dateTimeString) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateTimeString).toLocaleDateString(undefined, options);
    }

    getStatusClass(status) {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    getStatusText(status) {
        switch(status) {
            case 'pending': return 'Pending';
            case 'confirmed': return 'Confirmed';
            case 'rejected': return 'Rejected';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    }

    getUserTypeClass(userType) {
        switch(userType) {
            case 'system_admin': return 'bg-purple-100 text-purple-800';
            case 'restaurant_admin': return 'bg-blue-100 text-blue-800';
            case 'customer': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    getUserStatusClass(user) {
        if (user.account_locked) return 'bg-red-100 text-red-800';
        if (!user.email_verified) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    }

    getUserStatusText(user) {
        if (user.account_locked) return 'Locked';
        if (!user.email_verified) return 'Unverified';
        return 'Active';
    }

    showNotification(message, type = 'info') {
        // Create a simple notification system
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Restaurant management methods
    openRestaurantModal(restaurant = null) {
        console.debug('openRestaurantModal called, restaurant:', restaurant);
        const modal = document.getElementById('restaurant-modal');
        const title = document.getElementById('restaurant-modal-title');
        
        if (restaurant) {
            title.textContent = 'Edit Restaurant';
            this.populateRestaurantForm(restaurant);
        } else {
            title.textContent = 'Add Restaurant';
            document.getElementById('restaurant-form').reset();
            document.getElementById('restaurant-id').value = '';
            document.getElementById('image-preview').classList.add('hidden');
            document.getElementById('video-preview').classList.add('hidden');
            this.loadRestaurantAdmins();
            // Reset operating hours controls
            try {
                const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                days.forEach(d => {
                    const open = document.getElementById(`hours-${d}-open`);
                    const close = document.getElementById(`hours-${d}-close`);
                    const closed = document.getElementById(`hours-${d}-closed`);
                    if (open) open.value = '';
                    if (close) close.value = '';
                    if (closed) closed.checked = false;
                });
            } catch (e) {}
            // Reset menu UI to editor
            try {
                const editorRadio = document.querySelector('input[name="menu-source"][value="editor"]');
                if (editorRadio) editorRadio.checked = true;
                const editor = document.getElementById('menu-editor');
                const file = document.getElementById('menu-file');
                if (editor) editor.classList.remove('hidden');
                if (file) file.classList.add('hidden');
                const menuFileEl = document.getElementById('restaurant-menu-file');
                if (menuFileEl) menuFileEl.value = '';
            } catch (e) {}
        }
        
        modal.classList.remove('hidden');
        // Prevent background scroll while modal is open and focus first input for accessibility
        try { document.body.style.overflow = 'hidden'; } catch (e) {}
        const firstInput = document.getElementById('restaurant-name');
        if (firstInput) setTimeout(() => firstInput.focus(), 50);
    }

    closeRestaurantModal() {
        document.getElementById('restaurant-modal').classList.add('hidden');
        try { document.body.style.overflow = ''; } catch (e) {}
    }

    // Details modal for viewing restaurant info
    openRestaurantDetails(restaurant) {
        const modal = document.getElementById('restaurant-details-modal');
        const body = document.getElementById('restaurant-details-body');
        if (!modal || !body) return;

        // Build details HTML
        const menu = restaurant.menu || restaurant.menu_items || '';
        let menuHtml = '';
        try {
            // Try parse as JSON
            const parsed = JSON.parse(menu);
            if (Array.isArray(parsed)) {
                menuHtml = '<ul class="list-disc pl-5">' + parsed.map(i => `<li>${i}</li>`).join('') + '</ul>';
            } else if (typeof parsed === 'object') {
                menuHtml = '<pre class="text-sm bg-gray-50 p-2 rounded">' + JSON.stringify(parsed, null, 2) + '</pre>';
            } else {
                menuHtml = `<pre class="text-sm bg-gray-50 p-2 rounded">${parsed}</pre>`;
            }
        } catch (e) {
            // treat as plain text
            if (menu) {
                const lines = menu.split(/\r?\n/).filter(Boolean);
                menuHtml = '<ul class="list-disc pl-5">' + lines.map(l => `<li>${l}</li>`).join('') + '</ul>';
            } else {
                menuHtml = '<p class="text-gray-500">No menu provided</p>';
            }
        }

        const adminInfo = restaurant.admin_name || restaurant.restaurant_admin_email || restaurant.admin_email || 'N/A';
        const adminEmail = restaurant.restaurant_admin_email || restaurant.admin_email || 'N/A';

        // Build operating hours display
        let hoursHtml = '<div class="text-sm">';
        try {
            const oh = restaurant.operating_hours ? (typeof restaurant.operating_hours === 'string' ? JSON.parse(restaurant.operating_hours) : restaurant.operating_hours) : null;
            if (oh) {
                const daysOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                daysOrder.forEach(d => {
                    const val = oh[d];
                    if (val) {
                        hoursHtml += `<div><strong>${d[0].toUpperCase() + d.slice(1)}:</strong> ${val.closed ? 'Closed' : (val.open || 'N/A') + ' - ' + (val.close || 'N/A')}</div>`;
                    }
                });
            } else {
                hoursHtml += '<div>No operating hours provided</div>';
            }
        } catch (e) {
            hoursHtml += '<div>No operating hours provided</div>';
        }
        hoursHtml += '</div>';

        body.innerHTML = `
            <div class="grid grid-cols-1 gap-3">
                <div><strong>Name:</strong> ${restaurant.name}</div>
                <div><strong>Location:</strong> ${restaurant.location || 'N/A'}</div>
                <div><strong>Contact Email:</strong> ${restaurant.contact_email || 'N/A'}</div>
                <div><strong>Admin:</strong> ${adminInfo} (${adminEmail})</div>
                <div><strong>Operating Hours:</strong> ${hoursHtml}</div>
                <div><strong>Tables:</strong> ${restaurant.tables_count || 'N/A'}</div>
                <div><strong>Cuisine:</strong> ${restaurant.cuisine_type || 'N/A'}</div>
                <div><strong>Price Range:</strong> ${restaurant.price_range || 'N/A'}</div>
                <div><strong>Description:</strong> <div class="mt-1 text-sm text-gray-700">${restaurant.description || 'N/A'}</div></div>
                <div><strong>Menu:</strong> <div class="mt-1">${menuHtml}</div></div>
            </div>
        `;

        modal.classList.remove('hidden');
        try { document.body.style.overflow = 'hidden'; } catch (e) {}
    }

    closeRestaurantDetails() {
        const modal = document.getElementById('restaurant-details-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        try { document.body.style.overflow = ''; } catch (e) {}
    }

    async loadRestaurantAdmins() {
        try {
            const response = await fetch('/api/system-admin/users?type=restaurant_admin');
            if (response.ok) {
                const admins = await response.json();
                const select = document.getElementById('restaurant-admin-select');
                select.innerHTML = '<option value="">Select Admin (Optional)</option>';
                admins.forEach(admin => {
                    select.innerHTML += `<option value="${admin.id}">${admin.name} (${admin.email})</option>`;
                });
            }
        } catch (error) {
            console.error('Error loading admins:', error);
        }
    }

    populateRestaurantForm(restaurant) {
        document.getElementById('restaurant-id').value = restaurant.id;
        document.getElementById('restaurant-name').value = restaurant.name;
        document.getElementById('restaurant-location').value = restaurant.location;
        document.getElementById('restaurant-phone').value = restaurant.contact_phone;
        document.getElementById('restaurant-email').value = restaurant.contact_email;
        // populate operating hours if provided (expected as JSON string or object)
        try {
            const oh = restaurant.operating_hours ? (typeof restaurant.operating_hours === 'string' ? JSON.parse(restaurant.operating_hours) : restaurant.operating_hours) : null;
            if (oh) this.setOperatingHoursToForm(oh);
        } catch (e) {
            // ignore
        }
        document.getElementById('restaurant-cuisine').value = restaurant.cuisine_type || '';
        document.getElementById('restaurant-price').value = restaurant.price_range || '2';
        document.getElementById('restaurant-description').value = restaurant.description;
        // menu handling
        try {
            document.getElementById('restaurant-menu').value = restaurant.menu || restaurant.menu_items || '';
        } catch (e) {}
        document.getElementById('restaurant-tables').value = restaurant.tables_count || 10;
        if (restaurant.restaurant_admin_id) {
            document.getElementById('restaurant-admin-select').value = restaurant.restaurant_admin_id;
        }
        this.loadRestaurantAdmins();
    }

    setOperatingHoursToForm(oh) {
        const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
        days.forEach(day => {
            try {
                const openEl = document.getElementById(`hours-${day}-open`);
                const closeEl = document.getElementById(`hours-${day}-close`);
                const closedEl = document.getElementById(`hours-${day}-closed`);
                if (!openEl || !closeEl || !closedEl) return;
                const dayVal = oh[day];
                if (!dayVal) {
                    openEl.value = '';
                    closeEl.value = '';
                    closedEl.checked = false;
                } else {
                    openEl.value = dayVal.open || '';
                    closeEl.value = dayVal.close || '';
                    closedEl.checked = !!dayVal.closed;
                }
            } catch (e) {}
        });
    }

    getOperatingHoursFromForm() {
        const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
        const out = {};
        days.forEach(day => {
            const openEl = document.getElementById(`hours-${day}-open`);
            const closeEl = document.getElementById(`hours-${day}-close`);
            const closedEl = document.getElementById(`hours-${day}-closed`);
            if (!openEl || !closeEl || !closedEl) return;
            out[day] = {
                open: openEl.value || '',
                close: closeEl.value || '',
                closed: !!closedEl.checked
            };
        });
        return out;
    }

    async saveRestaurant() {
        const saveBtn = document.getElementById('save-restaurant-btn');
        const feedback = document.getElementById('restaurant-form-feedback');
        if (feedback) feedback.textContent = '';
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.dataset.origHtml = saveBtn.innerHTML;
            saveBtn.innerHTML = 'Saving...';
        }

        const formData = new FormData();
        formData.append('name', document.getElementById('restaurant-name').value);
        formData.append('location', document.getElementById('restaurant-location').value);
        formData.append('contact_phone', document.getElementById('restaurant-phone').value);
        formData.append('contact_email', document.getElementById('restaurant-email').value);
        // append operating hours as JSON
        try {
            const operatingHours = this.getOperatingHoursFromForm();
            formData.append('operating_hours', JSON.stringify(operatingHours));
        } catch (e) {}
        formData.append('cuisine_type', document.getElementById('restaurant-cuisine').value);
        formData.append('price_range', document.getElementById('restaurant-price').value);
        formData.append('description', document.getElementById('restaurant-description').value);
        formData.append('tables_count', document.getElementById('restaurant-tables').value);
        
        // Check if creating new admin or using existing
        const adminOptionElement = document.querySelector('input[name="admin-option"]:checked');
        
        if (!adminOptionElement) {
            const msg = 'Please select an admin option (Create New or Use Existing)';
            if (feedback) feedback.textContent = msg;
            if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = saveBtn.dataset.origHtml || 'Save Restaurant'; }
            return;
        }
        
        const adminOption = adminOptionElement.value;
        
        if (adminOption === 'create') {
            const adminName = document.getElementById('new-admin-name').value;
            const adminEmail = document.getElementById('new-admin-email').value;
            const adminPhone = document.getElementById('new-admin-phone') ? document.getElementById('new-admin-phone').value : '';
            const adminPassword = document.getElementById('new-admin-password') ? document.getElementById('new-admin-password').value : '';
            
            if (!adminName || !adminEmail || !adminPassword) {
                const msg = 'Please fill in all required admin fields (Name, Email, Password)';
                if (feedback) feedback.textContent = msg;
                if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = saveBtn.dataset.origHtml || 'Save Restaurant'; }
                return;
            }
            
            formData.append('create_new_admin', 'true');
            formData.append('admin_name', adminName);
            formData.append('admin_email', adminEmail);
            if (adminPhone) formData.append('admin_phone', adminPhone);
            formData.append('admin_password', adminPassword);
        } else {
            formData.append('restaurant_admin_id', document.getElementById('restaurant-admin-select').value);
        }

        // Handle multiple image uploads
        const imageFiles = document.getElementById('restaurant-images').files;
        if (imageFiles && imageFiles.length > 0) {
            for (let i = 0; i < imageFiles.length; i++) {
                formData.append('images', imageFiles[i]);
            }
        }
        
        // Handle video upload
        const videoFile = document.getElementById('restaurant-video').files[0];
        if (videoFile) {
            formData.append('video', videoFile);
        }

        // Handle menu PDF upload (if provided)
        const menuFileEl = document.getElementById('restaurant-menu-file');
        if (menuFileEl && menuFileEl.files && menuFileEl.files.length > 0) {
            formData.append('menu_pdf', menuFileEl.files[0]);
        }

        // Append menu if present
        const menuVal = document.getElementById('restaurant-menu') ? document.getElementById('restaurant-menu').value : '';
        if (menuVal) formData.append('menu', menuVal);

        const restaurantId = document.getElementById('restaurant-id').value;
        const url = restaurantId ? `/api/system-admin/restaurants/${restaurantId}` : '/api/system-admin/restaurants';
        const method = restaurantId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                body: formData
            });

            if (response.ok) {
                this.showNotification(`Restaurant ${restaurantId ? 'updated' : 'created'} successfully`, 'success');
                this.closeRestaurantModal();
                this.loadRestaurants();
            } else {
                let errMsg = 'Error saving restaurant';
                try { const error = await response.json(); errMsg = error.error || errMsg; } catch(e){}
                if (feedback) feedback.textContent = errMsg;
                this.showNotification(errMsg, 'error');
            }
        } catch (error) {
            console.error('Error saving restaurant:', error);
            this.showNotification('Error saving restaurant', 'error');
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = saveBtn.dataset.origHtml || 'Save Restaurant';
            }
        }
    }

    previewMultipleImages(files) {
        if (!files || files.length === 0) return;
        
        const container = document.getElementById('preview-images-container');
        const preview = document.getElementById('images-preview');
        
        // Clear previous previews
        container.innerHTML = '';
        
        // Preview each file
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageCard = document.createElement('div');
                imageCard.className = 'relative';
                imageCard.innerHTML = `
                    <img src="${e.target.result}" class="w-full h-24 object-cover rounded-lg" alt="Preview ${index + 1}">
                    <div class="absolute top-1 right-1 bg-brown-600 text-white text-xs px-2 py-1 rounded">
                        ${index === 0 ? 'Primary' : `#${index + 1}`}
                    </div>
                `;
                container.appendChild(imageCard);
            };
            reader.readAsDataURL(file);
        });
        
        preview.classList.remove('hidden');
    }

    previewImage(file) {
        if (!file) return;
        
        const preview = document.getElementById('image-preview');
        const img = document.getElementById('preview-img');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    previewVideo(file) {
        if (!file) return;
        
        const preview = document.getElementById('video-preview');
        const video = document.getElementById('preview-video');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            video.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/login';
        }
    }
}

// Initialize the system admin when the page loads (robust to script load timing)
function startSystemAdmin() {
    try {
        // small console hint to help debugging initialization issues
        console.debug('SystemAdmin: initializing');
        new SystemAdmin();
    } catch (e) {
        console.error('Failed to initialize SystemAdmin', e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSystemAdmin);
} else {
    // DOM already ready
    startSystemAdmin();
}
