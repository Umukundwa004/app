// public/js/restaurant-admin.js - UPDATED WITH PROPER CONNECTIONS
class RestaurantAdmin {
    constructor() {
        this.currentUser = null;
        this.currentRestaurantId = null;
        this.currentTab = 'dashboard';
        this.reservations = [];
        this.restaurants = [];
        this.menuItems = [];
        this.notificationsModal = null;
        this.notificationBadgeDesktop = null;
        this.notificationBadgeMobile = null;
        this.statusChart = null;
        this.dailyChart = null;
        
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.setupEventListeners();
        this.setupNotifications();
        this.loadDashboardData();
        this.loadMyRestaurants();
        this.updateNotificationBadge();
        
        // Poll for new notifications every 30 seconds
        setInterval(() => this.updateNotificationBadge(), 30000);
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/user');
            if (!response.ok) throw new Error('Not authenticated');
            
            const data = await response.json();
            
            if (data.loggedIn && data.user.user_type === 'restaurant_admin') {
                this.currentUser = data.user;
                document.getElementById('admin-name').textContent = data.user.name;
            } else {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/login';
        }
    }

    setupEventListeners() {
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

        // Details management modal
        const detailsModal = document.getElementById('details-modal');
        if (detailsModal) {
            document.getElementById('close-details-modal').addEventListener('click', () => {
                detailsModal.classList.add('hidden');
            });

            // Details tab buttons
            document.querySelectorAll('.details-tab-button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tab = e.target.closest('.details-tab-button').dataset.tab;
                    this.switchDetailsTab(tab);
                });
            });

            // Restaurant selector in details
            const selectRestaurantDetails = document.getElementById('select-restaurant-details');
            if (selectRestaurantDetails) {
                selectRestaurantDetails.addEventListener('change', (e) => {
                    this.currentRestaurantId = e.target.value;
                    this.loadRestaurantStats(this.currentRestaurantId);
                });
            }

            // Add amenity button
            const addAmenityBtn = document.getElementById('add-amenity-btn');
            if (addAmenityBtn) {
                addAmenityBtn.addEventListener('click', () => this.openAddAmenityModal());
            }

            // Upload image button
            const uploadImageBtn = document.getElementById('upload-image-btn');
            if (uploadImageBtn) {
                uploadImageBtn.addEventListener('click', () => this.openImageUploadModal());
            }
        }

        // Notifications
        const notificationsBtnDesktop = document.getElementById('notifications-btn-desktop');
        if (notificationsBtnDesktop) {
            notificationsBtnDesktop.addEventListener('click', () => this.openNotifications());
        }
        
        const notificationsBtnMobile = document.getElementById('notifications-btn-mobile');
        if (notificationsBtnMobile) {
            notificationsBtnMobile.addEventListener('click', () => this.openNotifications());
        }
        
        const closeNotifications = document.getElementById('close-notifications');
        if (closeNotifications) {
            closeNotifications.addEventListener('click', () => {
                this.notificationsModal.classList.add('hidden');
            });
        }

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
        
        // Mobile logout button
        const mobileLogoutBtn = document.getElementById('logout-btn-mobile');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Restaurant management
        document.getElementById('add-restaurant-btn').addEventListener('click', () => {
            this.openRestaurantModal();
        });

        document.getElementById('restaurant-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRestaurant();
        });

        document.getElementById('cancel-restaurant').addEventListener('click', () => {
            this.closeRestaurantModal();
        });

        document.getElementById('close-restaurant-modal').addEventListener('click', () => {
            this.closeRestaurantModal();
        });

        // Reservation details modal close button
        const closeReservationDetailsBtn = document.getElementById('close-reservation-details');
        if (closeReservationDetailsBtn) {
            closeReservationDetailsBtn.addEventListener('click', () => {
                this.closeReservationDetailsModal();
            });
        }

        // File upload previews - Multiple images
        document.getElementById('restaurant-images').addEventListener('change', (e) => {
            this.previewMultipleImages(e.target.files);
        });

        document.getElementById('restaurant-video').addEventListener('change', (e) => {
            this.previewVideo(e.target.files[0]);
        });

        // Menu source toggle (editor vs file)
        const menuSourceRadios = document.querySelectorAll('input[name="menu-source"]');
        if (menuSourceRadios) {
            menuSourceRadios.forEach(r => {
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
        }

        const removeVideoBtn = document.getElementById('remove-video');
        if (removeVideoBtn) {
            removeVideoBtn.addEventListener('click', () => {
                document.getElementById('restaurant-video').value = '';
                document.getElementById('video-preview').classList.add('hidden');
            });
        }

        // Menu management
        document.getElementById('add-menu-item-btn').addEventListener('click', () => {
            this.openMenuItemModal();
        });

        document.getElementById('menu-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Menu item form submitted');
            this.saveMenuItem();
        });

        document.getElementById('cancel-menu-item').addEventListener('click', () => {
            this.closeMenuItemModal();
        });

        document.getElementById('close-menu-item-modal').addEventListener('click', () => {
            this.closeMenuItemModal();
        });

        // Restaurant filter for menu
        document.getElementById('menu-restaurant-select').addEventListener('change', (e) => {
            this.loadMenuItems(e.target.value);
        });

        // Availability management
        document.getElementById('availability-restaurant').addEventListener('change', (e) => {
            this.currentRestaurantId = e.target.value;
            this.loadAvailability();
        });

        document.getElementById('availability-date').addEventListener('change', () => {
            this.loadAvailability();
        });

        const saveAvailabilityBtn = document.getElementById('save-availability-btn');
        if (saveAvailabilityBtn) {
            saveAvailabilityBtn.addEventListener('click', () => {
                this.saveAvailability();
            });
        }

        // Reservation filters
        document.getElementById('reservation-filter').addEventListener('change', () => {
            this.loadReservations();
        });

        document.getElementById('restaurant-filter').addEventListener('change', () => {
            this.loadReservations();
        });

        // Report generation
        document.getElementById('generate-report-btn').addEventListener('click', () => {
            this.generateReport();
        });
        
        // Report downloads
        const downloadCsvBtn = document.getElementById('download-csv-btn');
        if (downloadCsvBtn) {
            downloadCsvBtn.addEventListener('click', () => {
                this.downloadReport('csv');
            });
        }
        
        const downloadPdfBtn = document.getElementById('download-pdf-btn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => {
                this.downloadReport('pdf');
            });
        }

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('reservation-details-modal')) {
                this.closeReservationDetailsModal();
            }
            if (e.target === document.getElementById('restaurant-modal')) {
                this.closeRestaurantModal();
            }
            if (e.target === document.getElementById('menu-item-modal')) {
                this.closeMenuItemModal();
            }
        });

        // Quick Actions
        const quickActions = {
            'add-restaurant': () => this.openRestaurantModal(),
            'manage-menu': () => {
                this.switchTab('menu');
                // Optionally open add menu item modal
                // this.openMenuItemModal();
            },
            'update-availability': () => this.switchTab('availability'),
            'view-reports': () => this.switchTab('reports')
        };

        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                if (quickActions[action]) quickActions[action]();
            });
        });
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
            case 'reservations':
                this.loadReservations();
                break;
            case 'restaurants':
                this.loadMyRestaurants();
                break;
            case 'menu':
                this.loadRestaurantsForMenu();
                break;
            case 'availability':
                this.loadRestaurantsForAvailability();
                break;
            case 'reports':
                this.loadRestaurantsForReports();
                break;
            case 'details':
                this.loadDetailsTab();
                break;
        }
    }

    async loadDashboardData() {
        try {
            // Load dashboard statistics
            const statsResponse = await fetch('/api/restaurant-admin/dashboard-stats');
            if (!statsResponse.ok) throw new Error('Failed to load stats');
            
            const stats = await statsResponse.json();

            document.getElementById('pending-reservations-count').textContent = stats.pendingReservations || 0;
            document.getElementById('confirmed-reservations-count').textContent = stats.confirmedToday || 0;
            document.getElementById('total-restaurants-count').textContent = stats.totalRestaurants || 0;
            document.getElementById('occupancy-rate').textContent = `${stats.occupancyRate || 0}%`;

            // Load recent reservations
            const reservationsResponse = await fetch('/api/restaurant-admin/reservations?limit=5');
            if (reservationsResponse.ok) {
                const reservations = await reservationsResponse.json();
                this.displayRecentReservations(reservations);
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        }
    }

    displayRecentReservations(reservations) {
        const container = document.getElementById('recent-reservations');
        
        if (!reservations || reservations.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">No recent reservations</p>';
            return;
        }

        container.innerHTML = reservations.map(reservation => `
            <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <div>
                    <div class="font-medium text-gray-900">${reservation.customer_name}</div>
                    <div class="text-sm text-gray-600">${reservation.restaurant_name}</div>
                    <div class="text-xs text-gray-500">${this.formatDate(reservation.reservation_date)} at ${this.formatTime(reservation.reservation_time)}</div>
                </div>
                <span class="px-2 py-1 rounded-full text-xs ${this.getStatusClass(reservation.status)}">
                    ${this.getStatusText(reservation.status)}
                </span>
            </div>
        `).join('');
    }

    async loadReservations() {
        try {
            const filter = document.getElementById('reservation-filter').value;
            const restaurantFilter = document.getElementById('restaurant-filter').value;
            
            let url = '/api/restaurant-admin/reservations';
            const params = new URLSearchParams();
            
            // Handle status filters (but not "today" which is a date filter)
            if (filter !== 'all' && filter !== 'today') {
                params.append('status', filter);
            }
            if (restaurantFilter !== 'all') {
                params.append('restaurant_id', restaurantFilter);
            }
            
            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to load reservations');
            
            let reservations = await response.json();
            
            // Handle "today" filter on the client side
            if (filter === 'today') {
                // Get today's date in local timezone
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const todayStr = `${year}-${month}-${day}`;
                
                console.log('📅 Filtering for TODAY:', todayStr);
                console.log('📅 Current time:', today.toString());
                
                // Show all reservation dates for debugging
                if (reservations.length > 0) {
                    console.log('📋 All reservations:');
                    reservations.forEach((r, idx) => {
                        let resDate = r.reservation_date;
                        if (typeof resDate === 'string') {
                            // Handle various string formats
                            resDate = resDate.split('T')[0]; // Get YYYY-MM-DD part
                        } else if (resDate instanceof Date) {
                            const y = resDate.getFullYear();
                            const m = String(resDate.getMonth() + 1).padStart(2, '0');
                            const d = String(resDate.getDate()).padStart(2, '0');
                            resDate = `${y}-${m}-${d}`;
                        }
                        const isToday = resDate === todayStr ? '✅ TODAY' : '';
                        console.log(`  ${idx + 1}. Date: ${resDate} ${isToday} | Restaurant: ${r.restaurant_name} | Customer: ${r.customer_name}`);
                    });
                }
                
                reservations = reservations.filter(r => {
                    let reservationDate = r.reservation_date;
                    if (typeof reservationDate === 'string') {
                        reservationDate = reservationDate.split('T')[0];
                    } else if (reservationDate instanceof Date) {
                        const y = reservationDate.getFullYear();
                        const m = String(reservationDate.getMonth() + 1).padStart(2, '0');
                        const d = String(reservationDate.getDate()).padStart(2, '0');
                        reservationDate = `${y}-${m}-${d}`;
                    }
                    return reservationDate === todayStr;
                });
                
                console.log(`✅ Found ${reservations.length} reservation(s) for today (${todayStr})`);
            }
            
            this.reservations = reservations;
            this.displayReservations();
        } catch (error) {
            console.error('Error loading reservations:', error);
            this.showNotification('Error loading reservations', 'error');
        }
    }

    displayReservations() {
        const container = document.getElementById('reservations-table');
        const mobileContainer = document.getElementById('reservations-cards-mobile');
        const noReservations = document.getElementById('no-reservations');

        if (!this.reservations || this.reservations.length === 0) {
            container.innerHTML = '';
            if (mobileContainer) mobileContainer.innerHTML = '';
            noReservations.classList.remove('hidden');
            return;
        }

        noReservations.classList.add('hidden');
        
        // Desktop table view
        container.innerHTML = this.reservations.map(reservation => `
            <tr class="border-b border-gray-200 hover:bg-brown-50" data-reservation-id="${reservation.id}">
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
                        <button class="view-reservation-btn text-blue-600 hover:text-blue-800" data-id="${reservation.id}">
                            <i class="fas fa-eye"></i>
                        </button>
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
        
        // Mobile card view
        if (mobileContainer) {
            mobileContainer.innerHTML = this.reservations.map(reservation => `
                <div class="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex-1">
                            <div class="font-semibold text-gray-900 text-sm">ID: ${reservation.id}</div>
                            <div class="font-medium text-gray-700 text-sm">${reservation.customer_name}</div>
                            <div class="text-xs text-gray-500">${reservation.customer_email}</div>
                        </div>
                        <span class="px-2 py-1 rounded-full text-xs ${this.getStatusClass(reservation.status)}">
                            ${this.getStatusText(reservation.status)}
                        </span>
                    </div>
                    
                    <div class="space-y-1 mb-3 text-xs text-gray-600">
                        <div><i class="fas fa-store w-4"></i> ${reservation.restaurant_name}</div>
                        <div><i class="fas fa-calendar w-4"></i> ${this.formatDate(reservation.reservation_date)}</div>
                        <div><i class="fas fa-clock w-4"></i> ${this.formatTime(reservation.reservation_time)}</div>
                        <div><i class="fas fa-users w-4"></i> ${reservation.party_size} people</div>
                    </div>
                    
                    <div class="flex gap-2">
                        <button class="view-reservation-btn flex-1 bg-blue-50 text-blue-700 py-1.5 px-3 rounded text-xs font-medium hover:bg-blue-100" data-id="${reservation.id}">
                            <i class="fas fa-eye mr-1"></i>View
                        </button>
                        ${reservation.status === 'pending' ? `
                            <button class="confirm-reservation-btn flex-1 bg-green-50 text-green-700 py-1.5 px-3 rounded text-xs font-medium hover:bg-green-100" data-id="${reservation.id}">
                                <i class="fas fa-check mr-1"></i>Confirm
                            </button>
                            <button class="reject-reservation-btn flex-1 bg-red-50 text-red-700 py-1.5 px-3 rounded text-xs font-medium hover:bg-red-100" data-id="${reservation.id}">
                                <i class="fas fa-times mr-1"></i>Reject
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }

        // Add event listeners to action buttons
        this.attachReservationEventListeners();
    }

    attachReservationEventListeners() {
        document.querySelectorAll('.view-reservation-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const reservationId = e.target.closest('button').getAttribute('data-id');
                this.viewReservationDetails(reservationId);
            });
        });

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

    async viewReservationDetails(reservationId) {
        try {
            const reservation = this.reservations.find(r => r.id == reservationId);
            if (!reservation) return;

            const detailsContent = document.getElementById('reservation-details-content');
            detailsContent.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-bold text-gray-900 mb-2">Customer Information</h4>
                        <p><span class="font-medium">Name:</span> ${reservation.customer_name}</p>
                        <p><span class="font-medium">Email:</span> ${reservation.customer_email}</p>
                        <p><span class="font-medium">Phone:</span> ${reservation.customer_phone || 'Not provided'}</p>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900 mb-2">Reservation Details</h4>
                        <p><span class="font-medium">Restaurant:</span> ${reservation.restaurant_name}</p>
                        <p><span class="font-medium">Date:</span> ${this.formatDate(reservation.reservation_date)}</p>
                        <p><span class="font-medium">Time:</span> ${this.formatTime(reservation.reservation_time)}</p>
                        <p><span class="font-medium">Party Size:</span> ${reservation.party_size} people</p>
                    </div>
                </div>
                ${reservation.occasion ? `
                    <div>
                        <h4 class="font-bold text-gray-900 mb-2">Occasion</h4>
                        <p>${reservation.occasion}</p>
                    </div>
                ` : ''}
                ${reservation.special_requests ? `
                    <div>
                        <h4 class="font-bold text-gray-900 mb-2">Special Requests</h4>
                        <p>${reservation.special_requests}</p>
                    </div>
                ` : ''}
                <div>
                    <h4 class="font-bold text-gray-900 mb-2">Status</h4>
                    <span class="px-3 py-1 rounded-full text-sm ${this.getStatusClass(reservation.status)}">
                        ${this.getStatusText(reservation.status)}
                    </span>
                </div>
                ${reservation.status === 'pending' ? `
                    <div class="flex space-x-2 pt-4 border-t border-gray-200">
                        <button class="confirm-reservation-detail-btn bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition" data-id="${reservation.id}">
                            Confirm Reservation
                        </button>
                        <button class="reject-reservation-detail-btn bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition" data-id="${reservation.id}">
                            Reject Reservation
                        </button>
                    </div>
                ` : ''}
            `;

            // Add event listeners for action buttons in modal
            document.querySelector('.confirm-reservation-detail-btn')?.addEventListener('click', () => {
                this.updateReservationStatus(reservationId, 'confirmed');
                this.closeReservationDetailsModal();
            });
            
            document.querySelector('.reject-reservation-detail-btn')?.addEventListener('click', () => {
                this.updateReservationStatus(reservationId, 'rejected');
                this.closeReservationDetailsModal();
            });

            document.getElementById('reservation-details-modal').classList.remove('hidden');
        } catch (error) {
            console.error('Error loading reservation details:', error);
            this.showNotification('Error loading reservation details', 'error');
        }
    }

    closeReservationDetailsModal() {
        document.getElementById('reservation-details-modal').classList.add('hidden');
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
                this.loadReservations();
                if (this.currentTab === 'dashboard') {
                    this.loadDashboardData();
                }
            } else {
                const error = await response.json();
                this.showNotification(error.error, 'error');
            }
        } catch (error) {
            console.error('Error updating reservation status:', error);
            this.showNotification('Error updating reservation status', 'error');
        }
    }

    async loadMyRestaurants() {
        try {
            const response = await fetch('/api/restaurant-admin/restaurants');
            if (!response.ok) throw new Error('Failed to load restaurants');
            
            this.restaurants = await response.json();
            this.displayRestaurants();
            this.populateRestaurantFilters();
        } catch (error) {
            console.error('Error loading restaurants:', error);
            this.showNotification('Error loading restaurants', 'error');
        }
    }

    displayRestaurants() {
        const container = document.getElementById('my-restaurants-container');
        
        if (!this.restaurants || this.restaurants.length === 0) {
            container.innerHTML = `
                <div class="col-span-3 text-center py-12">
                    <i class="fas fa-store text-5xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl text-gray-500 mb-2">No restaurants found</h3>
                    <p class="text-gray-400">Add your first restaurant to get started</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.restaurants.map(restaurant => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div class="h-40 bg-brown-200 flex items-center justify-center relative overflow-hidden">
                    ${restaurant.image_url 
                        ? `<img src="${restaurant.image_url}" alt="${restaurant.name}" class="w-full h-full object-cover">`
                        : `<i class="fas fa-utensils text-4xl text-gray-400"></i>`
                    }
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-2 text-gray-900">${restaurant.name}</h3>
                    <p class="text-gray-600 mb-4 line-clamp-2">${restaurant.description}</p>
                    <div class="mb-4 space-y-2 text-sm">
                        <p class="text-gray-700"><i class="fas fa-map-marker-alt mr-2"></i>${restaurant.location}</p>
                        <p class="text-gray-700"><i class="fas fa-clock mr-2"></i>${this.formatTime(restaurant.opening_time)} - ${this.formatTime(restaurant.closing_time)}</p>
                        <p class="text-gray-700"><i class="fas fa-phone mr-2"></i>${restaurant.contact_phone}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="edit-restaurant-btn flex-1 bg-brown-600 text-white py-2 rounded-lg hover:bg-brown-700 transition" data-id="${restaurant.id}">
                            <i class="fas fa-edit mr-2"></i>Edit
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.edit-restaurant-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const restaurantId = e.target.closest('button').getAttribute('data-id');
                this.editRestaurant(restaurantId);
            });
        });
    }

    populateRestaurantFilters() {
        const menuSelect = document.getElementById('menu-restaurant-select');
        const availabilitySelect = document.getElementById('availability-restaurant');
        const reservationFilter = document.getElementById('restaurant-filter');
        const reportSelect = document.getElementById('report-restaurant');

        // For availability select, don't include "All Restaurants" option
        if (availabilitySelect) {
            availabilitySelect.innerHTML = this.restaurants.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
            // Set first restaurant as selected
            if (this.restaurants.length > 0) {
                availabilitySelect.value = this.restaurants[0].id;
            }
        }

        // For other selects, include "All Restaurants" option
        [menuSelect, reservationFilter, reportSelect].forEach(select => {
            if (select) {
                select.innerHTML = '<option value="all">All Restaurants</option>' +
                    this.restaurants.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
            }
        });
    }

    openRestaurantModal(restaurant = null) {
        const modal = document.getElementById('restaurant-modal');
        const title = document.getElementById('restaurant-modal-title');
        
        // Reset previews
        document.getElementById('new-images-preview').classList.add('hidden');
        document.getElementById('existing-images-gallery').classList.add('hidden');
        document.getElementById('new-images-container').innerHTML = '';
        
        if (restaurant) {
            title.textContent = 'Edit Restaurant';
            this.populateRestaurantForm(restaurant);
            // Load existing images
            this.loadRestaurantImages(restaurant.id);
        } else {
            title.textContent = 'Add Restaurant';
            document.getElementById('restaurant-form').reset();
            document.getElementById('restaurant-id').value = '';
        }
        
        modal.classList.remove('hidden');
    }

    closeRestaurantModal() {
        document.getElementById('restaurant-modal').classList.add('hidden');
        // Clear file inputs
        document.getElementById('restaurant-images').value = '';
        document.getElementById('restaurant-video').value = '';
        document.getElementById('new-images-preview').classList.add('hidden');
        document.getElementById('existing-images-gallery').classList.add('hidden');
        document.getElementById('video-preview').classList.add('hidden');
    }

    populateRestaurantForm(restaurant) {
        document.getElementById('restaurant-id').value = restaurant.id;
        document.getElementById('restaurant-name').value = restaurant.name;
        document.getElementById('restaurant-location').value = restaurant.location;
        document.getElementById('restaurant-phone').value = restaurant.contact_phone;
        document.getElementById('restaurant-email').value = restaurant.contact_email;
        document.getElementById('restaurant-opening').value = restaurant.opening_time;
        document.getElementById('restaurant-closing').value = restaurant.closing_time;
        document.getElementById('restaurant-cuisine').value = restaurant.cuisine_type || '';
        document.getElementById('restaurant-price').value = restaurant.price_range || '2';
        document.getElementById('restaurant-description').value = restaurant.description;
        document.getElementById('restaurant-tables').value = restaurant.tables_count || 10;
    }

    async saveRestaurant() {
        const formData = new FormData();
        formData.append('name', document.getElementById('restaurant-name').value);
        formData.append('location', document.getElementById('restaurant-location').value);
        formData.append('contact_phone', document.getElementById('restaurant-phone').value);
        formData.append('contact_email', document.getElementById('restaurant-email').value);
        formData.append('opening_time', document.getElementById('restaurant-opening').value);
        formData.append('closing_time', document.getElementById('restaurant-closing').value);
        // Try to include operating hours per day if present
        try {
            const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
            const oh = {};
            days.forEach(d => {
                const openEl = document.getElementById(`hours-${d}-open`);
                const closeEl = document.getElementById(`hours-${d}-close`);
                const closedEl = document.getElementById(`hours-${d}-closed`);
                if (openEl && closeEl && closedEl) {
                    oh[d] = { open: openEl.value || '', close: closeEl.value || '', closed: !!closedEl.checked };
                }
            });
            formData.append('operating_hours', JSON.stringify(oh));
        } catch (e) {}
        formData.append('cuisine_type', document.getElementById('restaurant-cuisine').value);
        formData.append('price_range', document.getElementById('restaurant-price').value);
        formData.append('description', document.getElementById('restaurant-description').value);
        formData.append('tables_count', document.getElementById('restaurant-tables').value);
        // Menu editor or PDF
        try {
            const menuVal = document.getElementById('restaurant-menu') ? document.getElementById('restaurant-menu').value : '';
            if (menuVal) formData.append('menu', menuVal);
            const menuFileEl = document.getElementById('restaurant-menu-file');
            if (menuFileEl && menuFileEl.files && menuFileEl.files.length > 0) {
                formData.append('menu_pdf', menuFileEl.files[0]);
            }
        } catch (e) {}

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

        const restaurantId = document.getElementById('restaurant-id').value;
        const url = restaurantId ? `/api/restaurants/${restaurantId}` : '/api/restaurant-admin/restaurants';
        const method = restaurantId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                body: formData  // No Content-Type header - browser sets it automatically with boundary
            });

            if (response.ok) {
                this.showNotification('Restaurant saved successfully', 'success');
                this.closeRestaurantModal();
                this.loadMyRestaurants();
                // Also attempt to register the restaurant in the system-admin namespace so system admins can manage it
                try {
                    const created = await response.json();
                    // build minimal payload for system-admin
                    const sysPayload = {
                        name: created.name || document.getElementById('restaurant-name').value,
                        location: created.location || document.getElementById('restaurant-location').value,
                        contact_email: created.contact_email || document.getElementById('restaurant-email').value,
                        contact_phone: created.contact_phone || document.getElementById('restaurant-phone').value,
                        cuisine_type: created.cuisine_type || document.getElementById('restaurant-cuisine').value,
                        price_range: created.price_range || document.getElementById('restaurant-price').value,
                        description: created.description || document.getElementById('restaurant-description').value,
                        external_id: created.id || null
                    };
                    // best-effort POST; ignore failures
                    await fetch('/api/system-admin/restaurants', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(sysPayload)
                    });
                } catch (e) {
                    // ignore system-admin sync errors
                }
            } else {
                const error = await response.json();
                this.showNotification(error.error, 'error');
            }
        } catch (error) {
            console.error('Error saving restaurant:', error);
            this.showNotification('Error saving restaurant', 'error');
        }
    }

    async editRestaurant(restaurantId) {
        const restaurant = this.restaurants.find(r => r.id == restaurantId);
        if (restaurant) {
            this.openRestaurantModal(restaurant);
        }
    }

    async loadRestaurantsForMenu() {
        await this.loadMyRestaurants();
        if (this.restaurants.length > 0) {
            this.loadMenuItems(this.restaurants[0].id);
        }
    }

    async loadMenuItems(restaurantId) {
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/menu`);
            if (!response.ok) throw new Error('Failed to load menu items');
            
            this.menuItems = await response.json();
            this.displayMenuItems();
        } catch (error) {
            console.error('Error loading menu items:', error);
            this.showNotification('Error loading menu items', 'error');
        }
    }

    displayMenuItems() {
        const container = document.getElementById('menu-items-container');
        
        if (!this.menuItems || this.menuItems.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8 md:py-12">
                    <i class="fas fa-utensils text-4xl md:text-5xl text-gray-300 mb-3 md:mb-4"></i>
                    <h3 class="text-lg md:text-xl text-gray-500 mb-2">No menu items found</h3>
                    <p class="text-gray-400 text-xs md:text-sm">Add your first menu item</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.menuItems.map(item => `
            <div class="bg-white rounded-lg shadow-md border border-gray-200 p-3 md:p-6 hover:shadow-lg transition">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="text-sm md:text-lg font-bold text-gray-900 flex-1 pr-2">${item.name}</h4>
                    <span class="px-2 py-0.5 md:py-1 bg-gray-100 text-gray-700 rounded text-[0.65rem] md:text-xs whitespace-nowrap">${item.category}</span>
                </div>
                <p class="text-gray-600 mb-2 md:mb-3 text-xs md:text-sm line-clamp-2">${item.description}</p>
                <div class="mb-2 md:mb-3">
                    <span class="text-gray-700 font-bold text-sm md:text-lg">RWF ${parseFloat(item.price).toLocaleString()}</span>
                </div>
                <div class="flex gap-2">
                    <button class="edit-menu-item-btn flex-1 bg-brown-600 text-white py-1.5 md:py-2 rounded hover:bg-brown-700 transition text-xs md:text-sm" data-id="${item.id}">
                        <i class="fas fa-edit mr-1"></i><span class="hidden sm:inline">Edit</span><span class="sm:hidden">Edit</span>
                    </button>
                    <button class="delete-menu-item-btn flex-1 bg-red-600 text-white py-1.5 md:py-2 rounded hover:bg-red-700 transition text-xs md:text-sm" data-id="${item.id}">
                        <i class="fas fa-trash mr-1"></i><span class="hidden sm:inline">Delete</span><span class="sm:hidden">Delete</span>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.edit-menu-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.closest('button').getAttribute('data-id');
                this.editMenuItem(itemId);
            });
        });

        document.querySelectorAll('.delete-menu-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.closest('button').getAttribute('data-id');
                this.deleteMenuItem(itemId);
            });
        });
    }

    openMenuItemModal(menuItem = null) {
        const restaurantId = document.getElementById('menu-restaurant-select').value;
        if (!restaurantId || restaurantId === 'all') {
            this.showNotification('Please select a restaurant first', 'error');
            return;
        }

        console.log('Opening menu item modal for restaurant:', restaurantId);

        const modal = document.getElementById('menu-item-modal');
        const title = document.getElementById('menu-item-modal-title');
        
        if (menuItem) {
            title.textContent = 'Edit Menu Item';
            this.populateMenuItemForm(menuItem);
        } else {
            title.textContent = 'Add Menu Item';
            document.getElementById('menu-item-form').reset();
            document.getElementById('menu-item-id').value = '';
            document.getElementById('menu-item-restaurant-id').value = restaurantId;
            console.log('Restaurant ID set to:', restaurantId);
        }
        
        modal.classList.remove('hidden');
    }

    closeMenuItemModal() {
        document.getElementById('menu-item-modal').classList.add('hidden');
    }

    populateMenuItemForm(menuItem) {
        document.getElementById('menu-item-id').value = menuItem.id;
        document.getElementById('menu-item-restaurant-id').value = menuItem.restaurant_id;
        document.getElementById('menu-item-name').value = menuItem.name;
        document.getElementById('menu-item-description').value = menuItem.description;
        document.getElementById('menu-item-price').value = menuItem.price;
        document.getElementById('menu-item-category').value = menuItem.category || '';
        document.getElementById('menu-item-cuisine').value = menuItem.cuisine || '';
    }

    async saveMenuItem() {
        const formData = {
            name: document.getElementById('menu-item-name').value,
            description: document.getElementById('menu-item-description').value,
            price: document.getElementById('menu-item-price').value,
            category: document.getElementById('menu-item-category').value,
            cuisine: document.getElementById('menu-item-cuisine').value,
            restaurant_id: document.getElementById('menu-item-restaurant-id').value
        };

        console.log('Saving menu item with data:', formData);

        const menuItemId = document.getElementById('menu-item-id').value;
        const url = menuItemId ? `/api/menu-items/${menuItemId}` : '/api/menu-items';
        const method = menuItemId ? 'PUT' : 'POST';

        console.log(`Sending ${method} request to ${url}`);

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                this.showNotification('Menu item saved successfully', 'success');
                this.closeMenuItemModal();
                this.loadMenuItems(formData.restaurant_id);
            } else {
                const error = await response.json();
                console.error('Server error response:', error);
                console.error('Response status:', response.status);
                if (response.status === 403) {
                    console.error('Authentication issue - checking current user session');
                    const userCheck = await fetch('/api/user');
                    const userData = await userCheck.json();
                    console.error('Current user data:', userData);
                }
                this.showNotification(error.error || 'Failed to save menu item', 'error');
            }
        } catch (error) {
            console.error('Error saving menu item:', error);
            this.showNotification('Error saving menu item', 'error');
        }
    }

    async editMenuItem(menuItemId) {
        const menuItem = this.menuItems.find(item => item.id == menuItemId);
        if (menuItem) {
            this.openMenuItemModal(menuItem);
        }
    }

    async deleteMenuItem(menuItemId) {
        if (!confirm('Are you sure you want to delete this menu item?')) {
            return;
        }

        try {
            const response = await fetch(`/api/menu-items/${menuItemId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showNotification('Menu item deleted successfully', 'success');
                const restaurantId = document.getElementById('menu-restaurant-select').value;
                this.loadMenuItems(restaurantId);
            } else {
                const error = await response.json();
                this.showNotification(error.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting menu item:', error);
            this.showNotification('Error deleting menu item', 'error');
        }
    }

    async loadRestaurantsForAvailability() {
        await this.loadMyRestaurants();
        if (this.restaurants.length > 0) {
            this.currentRestaurantId = this.restaurants[0].id;
            document.getElementById('availability-date').value = new Date().toISOString().split('T')[0];
            this.loadAvailability();
        }
    }

    async loadAvailability() {
        if (!this.currentRestaurantId) return;

        const date = document.getElementById('availability-date').value;
        if (!date) return;

        try {
            const response = await fetch(`/api/restaurants/${this.currentRestaurantId}/availability?date=${date}`);
            if (!response.ok) throw new Error('Failed to load availability');
            
            const availability = await response.json();
            this.displayAvailability(availability);
        } catch (error) {
            console.error('Error loading availability:', error);
            this.showNotification('Error loading availability', 'error');
        }
    }

    displayAvailability(availability) {
        const container = document.getElementById('availability-container');
        
        // Generate time slots from opening to closing time
        const restaurant = this.restaurants.find(r => r.id == this.currentRestaurantId);
        if (!restaurant) return;

        const timeSlots = this.generateTimeSlots(restaurant.opening_time, restaurant.closing_time);
        
        container.innerHTML = `
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Table Availability for ${document.getElementById('availability-date').value}</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                ${timeSlots.map(timeSlot => {
                    const availableSlot = availability.find(slot => slot.time_slot === timeSlot);
                    const availableTables = availableSlot ? availableSlot.available_tables : restaurant.tables_count;
                    
                    return `
                        <div class="bg-white p-4 rounded-lg border border-gray-200 text-center">
                            <div class="font-medium text-gray-900 mb-2">${this.formatTime(timeSlot)}</div>
                            <input type="number" 
                                   class="w-full px-2 py-1 border border-brown-300 rounded text-center availability-input"
                                   data-time="${timeSlot}"
                                   value="${availableTables}"
                                   min="0" 
                                   max="${restaurant.tables_count}">
                            <div class="text-xs text-gray-500 mt-1">of ${restaurant.tables_count}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // Add auto-save functionality with debouncing
        this.setupAutoSaveForAvailability();
    }

    setupAutoSaveForAvailability() {
        const inputs = document.querySelectorAll('.availability-input');
        let autoSaveTimeout;
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                // Clear existing timeout
                clearTimeout(autoSaveTimeout);
                
                // Set new timeout for auto-save (1 second after last change)
                autoSaveTimeout = setTimeout(() => {
                    this.saveAvailability(true);
                }, 1000);
            });
        });
    }

    async saveAvailability(isAutoSave = false) {
        if (!this.currentRestaurantId) {
            if (!isAutoSave) {
                this.showNotification('Please select a restaurant', 'error');
            }
            return;
        }

        const date = document.getElementById('availability-date').value;
        if (!date) {
            if (!isAutoSave) {
                this.showNotification('Please select a date', 'error');
            }
            return;
        }

        const inputs = document.querySelectorAll('.availability-input');
        const availabilityData = [];

        inputs.forEach(input => {
            availabilityData.push({
                time_slot: input.getAttribute('data-time'),
                available_tables: parseInt(input.value) || 0
            });
        });

        try {
            const response = await fetch('/api/table-availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    restaurant_id: this.currentRestaurantId,
                    date: date,
                    availability: availabilityData
                })
            });

            if (response.ok) {
                if (!isAutoSave) {
                    this.showNotification('Table availability saved successfully', 'success');
                } else {
                    // Show subtle indicator for auto-save
                    this.showNotification('Auto-saved', 'success', 1000);
                }
            } else {
                const error = await response.json();
                this.showNotification(error.error, 'error');
            }
        } catch (error) {
            console.error('Error saving availability:', error);
            if (!isAutoSave) {
                this.showNotification('Error saving table availability', 'error');
            }
        }
    }

    async loadRestaurantsForReports() {
        await this.loadMyRestaurants();
    }

    async generateReport() {
        const restaurantId = document.getElementById('report-restaurant').value;
        const startDate = document.getElementById('report-start-date').value;
        const endDate = document.getElementById('report-end-date').value;

        if (!startDate || !endDate) {
            this.showNotification('Please select start and end dates', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/restaurant-admin/reports?restaurant_id=${restaurantId}&start_date=${startDate}&end_date=${endDate}`);
            if (!response.ok) throw new Error('Failed to generate report');
            
            const reportData = await response.json();
            this.currentReportData = reportData; // Store for download
            this.currentReportFilters = { restaurantId, startDate, endDate }; // Store filters
            this.displayReport(reportData);
            
            // Show download buttons
            document.getElementById('download-buttons').classList.remove('hidden');
        } catch (error) {
            console.error('Error generating report:', error);
            this.showNotification('Error generating report', 'error');
        }
    }

    downloadReport(format) {
        if (!this.currentReportData) {
            this.showNotification('Please generate a report first', 'error');
            return;
        }

        if (format === 'csv') {
            this.downloadCSV();
        } else if (format === 'pdf') {
            this.downloadPDF();
        }
    }

    downloadCSV() {
        const { dailyData, statusSummary } = this.currentReportData;
        const { startDate, endDate } = this.currentReportFilters;
        
        // Create CSV content
        let csv = 'Restaurant Reservations Report\n';
        csv += `Period: ${startDate} to ${endDate}\n\n`;
        
        // Summary section
        csv += 'Summary\n';
        csv += `Total Reservations,${statusSummary.total || 0}\n`;
        csv += `Confirmed,${statusSummary.confirmed || 0}\n`;
        csv += `Pending,${statusSummary.pending || 0}\n`;
        csv += `Rejected,${statusSummary.rejected || 0}\n`;
        csv += `Cancelled,${statusSummary.cancelled || 0}\n\n`;
        
        // Daily data header
        csv += 'Date,Total Reservations,Confirmed,Pending,Cancelled,Occupancy Rate\n';
        
        // Daily data rows
        if (dailyData && dailyData.length > 0) {
            dailyData.forEach(day => {
                csv += `${day.date},${day.total_reservations},${day.confirmed},${day.pending},${day.cancelled},${day.occupancy_rate}%\n`;
            });
        }
        
        // Create download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `restaurant-report-${startDate}-to-${endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('CSV report downloaded successfully', 'success');
    }

    downloadPDF() {
        const { dailyData, statusSummary } = this.currentReportData;
        const { startDate, endDate } = this.currentReportFilters;
        
        try {
            // Create new PDF document
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(18);
            doc.setTextColor(151, 118, 105); // Brown color
            doc.text('Restaurant Reservations Report', 14, 20);
            
            // Add metadata
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);
            
            // Add summary section
            doc.setFontSize(14);
            doc.setTextColor(151, 118, 105);
            doc.text('Summary', 14, 48);
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            let yPos = 56;
            doc.text(`Total Reservations: ${statusSummary.total || 0}`, 14, yPos);
            yPos += 6;
            doc.text(`Confirmed: ${statusSummary.confirmed || 0}`, 14, yPos);
            yPos += 6;
            doc.text(`Pending: ${statusSummary.pending || 0}`, 14, yPos);
            yPos += 6;
            doc.text(`Rejected: ${statusSummary.rejected || 0}`, 14, yPos);
            yPos += 6;
            doc.text(`Cancelled: ${statusSummary.cancelled || 0}`, 14, yPos);
            
            // Add daily breakdown table
            yPos += 12;
            doc.setFontSize(14);
            doc.setTextColor(151, 118, 105);
            doc.text('Daily Breakdown', 14, yPos);
            
            // Prepare table data
            const tableData = dailyData && dailyData.length > 0 
                ? dailyData.map(day => [
                    day.date,
                    day.total_reservations,
                    day.confirmed,
                    day.pending,
                    day.cancelled,
                    `${day.occupancy_rate}%`
                  ])
                : [];
            
            // Add table using autoTable plugin
            doc.autoTable({
                startY: yPos + 6,
                head: [['Date', 'Total', 'Confirmed', 'Pending', 'Cancelled', 'Occupancy']],
                body: tableData.length > 0 ? tableData : [['No data available', '', '', '', '', '']],
                theme: 'grid',
                headStyles: {
                    fillColor: [151, 118, 105],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 9,
                    cellPadding: 3
                },
                alternateRowStyles: {
                    fillColor: [249, 249, 249]
                }
            });
            
            // Add footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(128, 128, 128);
                doc.text(
                    'Rwanda Eats Reserve - Restaurant Management System',
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.getWidth() - 20,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'right' }
                );
            }
            
            // Save the PDF
            doc.save(`restaurant-report-${startDate}-to-${endDate}.pdf`);
            
            this.showNotification('PDF report downloaded successfully', 'success');
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showNotification('Error generating PDF. Please try CSV download instead.', 'error');
        }
    }

    displayReport(reportData) {
        // Display report data in tables and charts
        const tableBody = document.getElementById('reports-table');
        
        if (reportData.dailyData && reportData.dailyData.length > 0) {
            tableBody.innerHTML = reportData.dailyData.map(day => `
                <tr class="border-b border-gray-200">
                    <td class="py-3 px-4">${this.formatDate(day.date)}</td>
                    <td class="py-3 px-4">${day.total_reservations}</td>
                    <td class="py-3 px-4">${day.confirmed}</td>
                    <td class="py-3 px-4">${day.pending}</td>
                    <td class="py-3 px-4">${day.cancelled}</td>
                    <td class="py-3 px-4">${day.occupancy_rate}%</td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="py-8 text-center text-gray-500">
                        No data available for the selected period
                    </td>
                </tr>
            `;
        }

        // Update charts with Chart.js
        this.renderStatusChart(reportData.statusSummary || {});
        this.renderDailyChart(reportData.dailyData || []);
    }

    renderStatusChart(statusSummary) {
        const ctx = document.getElementById('status-chart');
        
        // Destroy previous chart if exists
        if (this.statusChart) {
            this.statusChart.destroy();
        }
        
        this.statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Confirmed', 'Pending', 'Cancelled', 'Rejected'],
                datasets: [{
                    data: [
                        statusSummary.confirmed || 0,
                        statusSummary.pending || 0,
                        statusSummary.cancelled || 0,
                        statusSummary.rejected || 0
                    ],
                    backgroundColor: [
                        '#10b981', // green for confirmed
                        '#f59e0b', // yellow for pending
                        '#6b7280', // gray for cancelled
                        '#ef4444'  // red for rejected
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 14
                            },
                            boxWidth: 20,
                            boxHeight: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderDailyChart(dailyData) {
        const ctx = document.getElementById('daily-chart');
        
        // Destroy previous chart if exists
        if (this.dailyChart) {
            this.dailyChart.destroy();
        }
        
        // Prepare data
        const dates = dailyData.map(day => this.formatDate(day.date));
        const confirmed = dailyData.map(day => day.confirmed || 0);
        const pending = dailyData.map(day => day.pending || 0);
        const cancelled = dailyData.map(day => day.cancelled || 0);
        
        this.dailyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Confirmed',
                        data: confirmed,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Pending',
                        data: pending,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Cancelled',
                        data: cancelled,
                        borderColor: '#6b7280',
                        backgroundColor: 'rgba(107, 114, 128, 0.1)',
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 14
                            },
                            usePointStyle: true,
                            boxWidth: 15,
                            boxHeight: 15
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Utility methods
    generateTimeSlots(startTime, endTime) {
        const slots = [];
        let current = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);

        while (current < end) {
            slots.push(current.toTimeString().slice(0, 8));
            current.setMinutes(current.getMinutes() + 30);
        }

        return slots;
    }

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
        const date = new Date(dateTimeString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return date.toLocaleDateString(undefined, options);
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

    showNotification(message, type = 'info', duration = 5000) {
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
        }, duration);
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

    previewMultipleImages(files) {
        if (!files || files.length === 0) return;
        
        const container = document.getElementById('new-images-container');
        const preview = document.getElementById('new-images-preview');
        
        // Clear previous previews
        container.innerHTML = '';
        
        // Preview each file
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageCard = document.createElement('div');
                imageCard.className = 'relative group';
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

    async loadRestaurantImages(restaurantId) {
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/images`);
            if (!response.ok) throw new Error('Failed to load images');
            
            const images = await response.json();
            this.displayExistingImages(images, restaurantId);
        } catch (error) {
            console.error('Error loading restaurant images:', error);
        }
    }

    displayExistingImages(images, restaurantId) {
        if (!images || images.length === 0) {
            document.getElementById('existing-images-gallery').classList.add('hidden');
            return;
        }
        
        const container = document.getElementById('existing-images-container');
        const gallery = document.getElementById('existing-images-gallery');
        
        container.innerHTML = '';
        
        // Sort by display order
        images.sort((a, b) => a.display_order - b.display_order);
        
        images.forEach((image, index) => {
            const imageCard = document.createElement('div');
            imageCard.className = 'relative group';
            imageCard.innerHTML = `
                <img src="${image.image_url}" class="w-full h-24 object-cover rounded-lg" alt="Restaurant image">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition rounded-lg flex items-center justify-center">
                    <button onclick="restaurantAdmin.deleteRestaurantImage(${restaurantId}, ${image.id})" 
                            class="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
                ${image.is_primary ? `
                    <div class="absolute top-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
                        Primary
                    </div>
                ` : `
                    <button onclick="restaurantAdmin.setPrimaryImage(${restaurantId}, ${image.id})" 
                            class="absolute top-1 left-1 bg-brown-600 text-white text-xs px-2 py-1 rounded hover:bg-brown-700 opacity-0 group-hover:opacity-100 transition">
                        Set Primary
                    </button>
                `}
            `;
            container.appendChild(imageCard);
        });
        
        gallery.classList.remove('hidden');
    }

    async deleteRestaurantImage(restaurantId, imageId) {
        if (!confirm('Are you sure you want to delete this image?')) return;
        
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/images/${imageId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.showNotification('Image deleted successfully', 'success');
                this.loadRestaurantImages(restaurantId);
            } else {
                const error = await response.json();
                this.showNotification(error.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            this.showNotification('Error deleting image', 'error');
        }
    }

    async setPrimaryImage(restaurantId, imageId) {
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/images/${imageId}/primary`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                this.showNotification('Primary image updated', 'success');
                this.loadRestaurantImages(restaurantId);
                this.loadMyRestaurants(); // Refresh restaurant list
            } else {
                const error = await response.json();
                this.showNotification(error.error, 'error');
            }
        } catch (error) {
            console.error('Error setting primary image:', error);
            this.showNotification('Error setting primary image', 'error');
        }
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

    // ===== RESTAURANT DETAILS MANAGEMENT =====

    async loadDetailsTab() {
        // Populate restaurant selector
        const selectRestaurant = document.getElementById('select-restaurant-details');
        if (!selectRestaurant) return;

        if (!this.restaurants || this.restaurants.length === 0) {
            await this.loadMyRestaurants();
        }

        selectRestaurant.innerHTML = '<option value="">-- Select a restaurant --</option>' +
            this.restaurants.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
        
        // If there's a previously selected restaurant, keep it selected
        if (this.currentRestaurantId && this.restaurants.find(r => r.id == this.currentRestaurantId)) {
            selectRestaurant.value = this.currentRestaurantId;
            this.loadRestaurantStats(this.currentRestaurantId);
        }
    }

    switchDetailsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.details-tab-button').forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.remove('border-transparent', 'text-gray-500');
                btn.classList.add('border-brown-600', 'text-gray-900');
            } else {
                btn.classList.add('border-transparent', 'text-gray-500');
                btn.classList.remove('border-brown-600', 'text-gray-900');
            }
        });

        // Show/hide content
        document.querySelectorAll('.details-tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`details-${tabName}-tab`).classList.remove('hidden');

        // Load data based on tab
        if (this.currentRestaurantId) {
            switch(tabName) {
                case 'reviews':
                    this.loadReviews(this.currentRestaurantId, 'all');
                    break;
                case 'amenities':
                    this.loadAmenities(this.currentRestaurantId);
                    break;
                case 'images':
                    this.loadImages(this.currentRestaurantId);
                    break;
                case 'settings':
                    this.loadSettings(this.currentRestaurantId);
                    break;
            }
        }
    }

    async loadRestaurantStats(restaurantId) {
        if (!restaurantId) return;

        try {
            const [reviewsRes, amenitiesRes, imagesRes] = await Promise.all([
                fetch(`/api/admin/restaurants/${restaurantId}/reviews`),
                fetch(`/api/admin/restaurants/${restaurantId}/amenities`),
                fetch(`/api/restaurants/${restaurantId}/images`)
            ]);

            if (reviewsRes.ok) {
                const reviews = await reviewsRes.json();
                document.getElementById('reviews-count-card').textContent = reviews.length;
                const pendingCount = reviews.filter(r => r.status === 'pending').length;
                document.getElementById('pending-reviews-count').textContent = `${pendingCount} pending approval`;
            }

            if (amenitiesRes.ok) {
                const amenities = await amenitiesRes.json();
                document.getElementById('amenities-count-card').textContent = amenities.length;
                const visibleCount = amenities.filter(a => a.is_visible).length;
                document.getElementById('visible-amenities-count').textContent = `${visibleCount} visible`;
            }

            if (imagesRes.ok) {
                const images = await imagesRes.json();
                document.getElementById('images-count-card').textContent = images.length;
                const visibleCount = images.filter(i => i.is_visible).length;
                document.getElementById('visible-images-count').textContent = `${visibleCount} visible`;
            }
        } catch (error) {
            console.error('Error loading restaurant stats:', error);
        }
    }

    async loadReviews(restaurantId, status = 'all') {
        try {
            const response = await fetch(`/api/admin/restaurants/${restaurantId}/reviews`);
            if (!response.ok) throw new Error('Failed to load reviews');

            const reviews = await response.json();
            const filteredReviews = status === 'all' ? reviews : reviews.filter(r => r.status === status);

            const reviewsList = document.getElementById('reviews-list-admin');
            if (filteredReviews.length === 0) {
                reviewsList.innerHTML = '<p class="text-gray-500 text-center py-8">No reviews found</p>';
                return;
            }

            reviewsList.innerHTML = filteredReviews.map(review => `
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h5 class="font-semibold text-gray-900">${review.customer_name || 'Anonymous'}</h5>
                            <div class="flex items-center gap-2 mt-1">
                                <div class="flex">
                                    ${Array.from({length: 5}, (_, i) => 
                                        `<i class="fas fa-star text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}"></i>`
                                    ).join('')}
                                </div>
                                <span class="text-xs px-2 py-1 rounded ${
                                    review.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }">${review.status}</span>
                            </div>
                        </div>
                        <span class="text-xs text-gray-500">${new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    ${review.comment ? `<p class="text-gray-700 text-sm mb-3">${review.comment}</p>` : ''}
                    ${review.admin_notes ? `<p class="text-xs text-gray-500 italic mb-2">Admin note: ${review.admin_notes}</p>` : ''}
                    <div class="flex gap-2">
                        ${review.status === 'pending' ? `
                            <button onclick="restaurantAdmin.approveReview(${review.id})" class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                                <i class="fas fa-check mr-1"></i>Approve
                            </button>
                            <button onclick="restaurantAdmin.rejectReview(${review.id})" class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                                <i class="fas fa-times mr-1"></i>Reject
                            </button>
                        ` : ''}
                        <button onclick="restaurantAdmin.deleteReview(${review.id})" class="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700">
                            <i class="fas fa-trash mr-1"></i>Delete
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading reviews:', error);
            this.showNotification('Error loading reviews', 'error');
        }
    }

    async approveReview(reviewId) {
        try {
            const response = await fetch(`/api/reviews/${reviewId}/approve`, {
                method: 'PATCH'
            });

            if (response.ok) {
                this.showNotification('Review approved successfully', 'success');
                this.loadReviews(this.currentRestaurantId, 'all');
                this.loadRestaurantStats(this.currentRestaurantId);
            }
        } catch (error) {
            console.error('Error approving review:', error);
            this.showNotification('Error approving review', 'error');
        }
    }

    async rejectReview(reviewId) {
        const notes = prompt('Enter rejection reason (optional):');
        try {
            const response = await fetch(`/api/reviews/${reviewId}/reject`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admin_notes: notes || '' })
            });

            if (response.ok) {
                this.showNotification('Review rejected', 'success');
                this.loadReviews(this.currentRestaurantId, 'all');
                this.loadRestaurantStats(this.currentRestaurantId);
            }
        } catch (error) {
            console.error('Error rejecting review:', error);
            this.showNotification('Error rejecting review', 'error');
        }
    }

    async deleteReview(reviewId) {
        if (!confirm('Delete this review permanently?')) return;

        try {
            const response = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });

            if (response.ok) {
                this.showNotification('Review deleted', 'success');
                this.loadReviews(this.currentRestaurantId, 'all');
                this.loadRestaurantStats(this.currentRestaurantId);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            this.showNotification('Error deleting review', 'error');
        }
    }

    async loadAmenities(restaurantId) {
        try {
            const response = await fetch(`/api/admin/restaurants/${restaurantId}/amenities`);
            if (!response.ok) throw new Error('Failed to load amenities');

            const amenities = await response.json();
            const amenitiesList = document.getElementById('amenities-list-admin');

            const amenityLabels = {
                'wifi': 'WiFi', 'parking': 'Parking', 'outdoor_seating': 'Outdoor Seating',
                'vegetarian': 'Vegetarian', 'halal': 'Halal', 'delivery': 'Delivery',
                'takeout': 'Takeout', 'reservation': 'Reservations', 
                'air_conditioning': 'Air Conditioning', 'live_music': 'Live Music',
                'pet_friendly': 'Pet Friendly', 'wheelchair_accessible': 'Wheelchair Accessible'
            };

            amenitiesList.innerHTML = amenities.map(amenity => `
                <div class="border border-gray-200 rounded-lg p-3">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-900">${amenityLabels[amenity.amenity_type] || amenity.amenity_type}</span>
                        <input type="checkbox" ${amenity.is_visible ? 'checked' : ''} 
                            onchange="restaurantAdmin.toggleAmenityVisibility(${amenity.id}, this.checked)">
                    </div>
                    <button onclick="restaurantAdmin.deleteAmenity(${amenity.id})" 
                        class="text-xs text-red-600 hover:text-red-800">
                        <i class="fas fa-trash mr-1"></i>Remove
                    </button>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading amenities:', error);
        }
    }

    openAddAmenityModal() {
        if (!this.currentRestaurantId) {
            alert('Please select a restaurant first');
            return;
        }

        const amenityTypes = [
            {value: 'wifi', label: 'WiFi'},
            {value: 'parking', label: 'Parking'},
            {value: 'outdoor_seating', label: 'Outdoor Seating'},
            {value: 'vegetarian', label: 'Vegetarian Options'},
            {value: 'halal', label: 'Halal'},
            {value: 'delivery', label: 'Delivery'},
            {value: 'takeout', label: 'Takeout'},
            {value: 'reservation', label: 'Reservations'},
            {value: 'air_conditioning', label: 'Air Conditioning'},
            {value: 'live_music', label: 'Live Music'},
            {value: 'pet_friendly', label: 'Pet Friendly'},
            {value: 'wheelchair_accessible', label: 'Wheelchair Accessible'}
        ];

        const options = amenityTypes.map(a => `<option value="${a.value}">${a.label}</option>`).join('');
        
        const amenity = prompt(`Select amenity to add:\n\n${amenityTypes.map((a, i) => `${i+1}. ${a.label}`).join('\n')}\n\nEnter number (1-${amenityTypes.length}):`);
        
        if (amenity) {
            const index = parseInt(amenity) - 1;
            if (index >= 0 && index < amenityTypes.length) {
                this.addAmenity(amenityTypes[index].value);
            } else {
                alert('Invalid selection');
            }
        }
    }

    async addAmenity(amenityType) {
        try {
            const response = await fetch(`/api/restaurants/${this.currentRestaurantId}/amenities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amenity_type: amenityType, is_visible: true })
            });

            if (response.ok) {
                this.showNotification('Amenity added successfully', 'success');
                this.loadAmenities(this.currentRestaurantId);
                this.loadRestaurantStats(this.currentRestaurantId);
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add amenity');
            }
        } catch (error) {
            console.error('Error adding amenity:', error);
            this.showNotification(error.message || 'Error adding amenity', 'error');
        }
    }

    async toggleAmenityVisibility(amenityId, isVisible) {
        try {
            await fetch(`/api/amenities/${amenityId}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_visible: isVisible })
            });
            this.loadRestaurantStats(this.currentRestaurantId);
        } catch (error) {
            console.error('Error updating amenity:', error);
        }
    }

    async deleteAmenity(amenityId) {
        if (!confirm('Remove this amenity?')) return;

        try {
            await fetch(`/api/amenities/${amenityId}`, { method: 'DELETE' });
            this.loadAmenities(this.currentRestaurantId);
            this.loadRestaurantStats(this.currentRestaurantId);
        } catch (error) {
            console.error('Error deleting amenity:', error);
        }
    }

    async loadImages(restaurantId) {
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/images`);
            const images = response.ok ? await response.json() : [];
            const imagesList = document.getElementById('images-list-admin');

            if (images.length === 0) {
                imagesList.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-3">No images uploaded</p>';
                return;
            }

            imagesList.innerHTML = images.map(image => `
                <div class="border border-gray-200 rounded-lg overflow-hidden">
                    <img src="${image.image_url}" alt="Restaurant" class="w-full h-32 object-cover">
                    <div class="p-2">
                        <label class="flex items-center text-sm">
                            <input type="checkbox" ${image.is_visible ? 'checked' : ''}
                                onchange="restaurantAdmin.toggleImageVisibility(${image.id}, this.checked)">
                            <span class="ml-2">Visible</span>
                        </label>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading images:', error);
        }
    }

    async toggleImageVisibility(imageId, isVisible) {
        try {
            await fetch(`/api/restaurants/${this.currentRestaurantId}/images/${imageId}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_visible: isVisible })
            });
            this.loadRestaurantStats(this.currentRestaurantId);
        } catch (error) {
            console.error('Error updating image:', error);
        }
    }

    openImageUploadModal() {
        if (!this.currentRestaurantId) {
            this.showNotification('Please select a restaurant first', 'error');
            return;
        }

        // Create a file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        
        input.onchange = async (e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                await this.uploadImages(files);
            }
        };
        
        input.click();
    }

    async uploadImages(files) {
        try {
            const formData = new FormData();
            
            // Add all selected files to FormData
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }
            
            this.showNotification(`Uploading ${files.length} image(s)...`, 'info');
            
            const response = await fetch(`/api/restaurants/${this.currentRestaurantId}/images`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                this.showNotification(`${result.count} image(s) uploaded successfully`, 'success');
                this.loadImages(this.currentRestaurantId);
                this.loadRestaurantStats(this.currentRestaurantId);
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to upload images');
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            this.showNotification(error.message || 'Error uploading images', 'error');
        }
    }

    async loadSettings(restaurantId) {
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/settings`);
            const settings = response.ok ? await response.json() : {};
            
            document.getElementById('setting-rating-display').checked = settings.rating_display !== false;
            document.getElementById('setting-reviews-enabled').checked = settings.reviews_enabled !== false;
            document.getElementById('setting-video-enabled').checked = settings.video_enabled !== false;
            document.getElementById('setting-gallery-enabled').checked = settings.gallery_enabled !== false;

            // Display current files if they exist
            const currentMenuPdf = document.getElementById('current-menu-pdf');
            const currentCertificate = document.getElementById('current-certificate');
            
            if (settings.menu_pdf_url) {
                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(settings.menu_pdf_url);
                if (isImage) {
                    currentMenuPdf.innerHTML = `
                        <div class="mt-2">
                            <a href="${settings.menu_pdf_url}" target="_blank" class="text-brown-600 hover:text-brown-700">
                                <i class="fas fa-image mr-1"></i>View current menu image
                            </a>
                            <img src="${settings.menu_pdf_url}" alt="Menu" class="mt-2 max-w-full h-32 object-contain border border-gray-200 rounded">
                        </div>`;
                } else {
                    currentMenuPdf.innerHTML = `<a href="${settings.menu_pdf_url}" target="_blank" class="text-brown-600 hover:text-brown-700"><i class="fas fa-file-pdf mr-1"></i>View current menu PDF</a>`;
                }
            } else {
                currentMenuPdf.innerHTML = '<span class="text-gray-400">No menu file uploaded</span>';
            }
            
            if (settings.certificate_url) {
                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(settings.certificate_url);
                if (isImage) {
                    currentCertificate.innerHTML = `
                        <div class="mt-2">
                            <a href="${settings.certificate_url}" target="_blank" class="text-brown-600 hover:text-brown-700">
                                <i class="fas fa-image mr-1"></i>View current certificate
                            </a>
                            <img src="${settings.certificate_url}" alt="Certificate" class="mt-2 max-w-full h-32 object-contain border border-gray-200 rounded">
                        </div>`;
                } else {
                    currentCertificate.innerHTML = `<a href="${settings.certificate_url}" target="_blank" class="text-brown-600 hover:text-brown-700"><i class="fas fa-file mr-1"></i>View current certificate</a>`;
                }
            } else {
                currentCertificate.innerHTML = '<span class="text-gray-400">No certificate uploaded</span>';
            }

            document.getElementById('save-settings-btn').onclick = () => this.saveSettings(restaurantId);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveSettings(restaurantId) {
        try {
            const formData = new FormData();
            
            // Add settings
            formData.append('rating_display', document.getElementById('setting-rating-display').checked);
            formData.append('reviews_enabled', document.getElementById('setting-reviews-enabled').checked);
            formData.append('video_enabled', document.getElementById('setting-video-enabled').checked);
            formData.append('gallery_enabled', document.getElementById('setting-gallery-enabled').checked);

            // Add file uploads if present
            const menuPdfFile = document.getElementById('setting-menu-pdf').files[0];
            if (menuPdfFile) {
                formData.append('menu_pdf', menuPdfFile);
            }
            
            const certificateFile = document.getElementById('setting-certificate').files[0];
            if (certificateFile) {
                formData.append('certificate', certificateFile);
            }

            await fetch(`/api/restaurants/${restaurantId}/settings`, {
                method: 'PATCH',
                body: formData
            });

            this.showNotification('Settings saved successfully', 'success');
            
            // Clear file inputs
            document.getElementById('setting-menu-pdf').value = '';
            document.getElementById('setting-certificate').value = '';
            
            // Reload settings to show updated files
            this.loadSettings(restaurantId);
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Error saving settings', 'error');
        }
    }

    // Notification Functions
    setupNotifications() {
        this.notificationsModal = document.getElementById('notifications-modal');
        this.notificationBadgeDesktop = document.getElementById('notification-badge-desktop');
        this.notificationBadgeMobile = document.getElementById('notification-badge-mobile');
        
        // Close modal when clicking outside
        if (this.notificationsModal) {
            this.notificationsModal.addEventListener('click', (e) => {
                if (e.target === this.notificationsModal) {
                    this.notificationsModal.classList.add('hidden');
                }
            });
        }
    }

    async openNotifications() {
        if (!this.currentUser) return;
        
        try {
            const response = await fetch('/api/notifications');
            const notifications = await response.json();
            
            this.displayNotifications(notifications);
            this.notificationsModal.classList.remove('hidden');
            
            // Mark all as read
            for (const notification of notifications) {
                if (!notification.is_read) {
                    await fetch(`/api/notifications/${notification.id}/read`, { method: 'PUT' });
                }
            }
            
            this.updateNotificationBadge(0);
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.showNotification('Error loading notifications', 'error');
        }
    }

    displayNotifications(notifications) {
        const container = document.getElementById('notifications-container');
        
        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-bell-slash text-5xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl text-gray-500">No notifications</h3>
                </div>
            `;
            return;
        }
        
        container.innerHTML = notifications.map(notification => {
            const isUnread = !notification.is_read;
            const isReservation = notification.type === 'new_reservation';
            const borderColor = isUnread ? 'border-brown-600' : 'border-brown-300';
            const bgColor = isReservation ? 'bg-yellow-50' : 'bg-brown-50';
            
            return `
                <div class="border-l-4 ${borderColor} p-4 mb-4 ${bgColor}">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-900">
                                ${isReservation ? '<i class="fas fa-calendar-check text-yellow-600 mr-2"></i>' : ''}
                                ${notification.title}
                                ${isUnread ? '<span class="ml-2 text-xs bg-brown-600 text-white px-2 py-1 rounded">NEW</span>' : ''}
                            </h4>
                            <p class="text-gray-600 mt-1">${notification.message}</p>
                            <div class="text-xs text-gray-400 mt-2">
                                <i class="far fa-clock mr-1"></i>${this.formatDateTime(notification.created_at)}
                            </div>
                        </div>
                        ${notification.related_reservation_id && isUnread ? `
                            <button onclick="restaurantAdmin.viewReservationFromNotification(${notification.related_reservation_id})" 
                                    class="ml-4 bg-brown-600 text-white px-3 py-1 rounded text-sm hover:bg-brown-700 transition">
                                View
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    async updateNotificationBadge(count = null) {
        if (count === null) {
            try {
                const response = await fetch('/api/notifications');
                const notifications = await response.json();
                count = notifications.filter(n => !n.is_read).length;
            } catch (error) {
                console.error('Error fetching notifications:', error);
                return;
            }
        }
        
        // Update desktop badge
        if (this.notificationBadgeDesktop) {
            if (count > 0) {
                this.notificationBadgeDesktop.textContent = count > 99 ? '99+' : count;
                this.notificationBadgeDesktop.classList.remove('hidden');
            } else {
                this.notificationBadgeDesktop.classList.add('hidden');
            }
        }
        
        // Update mobile badge
        if (this.notificationBadgeMobile) {
            if (count > 0) {
                this.notificationBadgeMobile.textContent = count > 99 ? '99+' : count;
                this.notificationBadgeMobile.classList.remove('hidden');
            } else {
                this.notificationBadgeMobile.classList.add('hidden');
            }
        }
    }

    async viewReservationFromNotification(reservationId) {
        // Close notifications modal
        this.notificationsModal.classList.add('hidden');
        
        // Switch to reservations tab
        this.switchTab('reservations');
        
        // Wait a moment for the tab to load
        setTimeout(() => {
            // Find and highlight the reservation
            const reservationRow = document.querySelector(`tr[data-reservation-id="${reservationId}"]`);
            if (reservationRow) {
                reservationRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                reservationRow.classList.add('bg-yellow-100');
                setTimeout(() => {
                    reservationRow.classList.remove('bg-yellow-100');
                }, 2000);
            }
            
            // Or open the reservation details
            this.viewReservationDetails(reservationId);
        }, 300);
    }
}

// Global instance for onclick handlers
let restaurantAdmin;

// Initialize the restaurant admin when the page loads
document.addEventListener('DOMContentLoaded', () => {
    restaurantAdmin = new RestaurantAdmin();
});

// Global function for opening details section from cards
function openDetailsSection(section) {
    const modal = document.getElementById('details-modal');
    if (modal && restaurantAdmin.currentRestaurantId) {
        modal.classList.remove('hidden');
        restaurantAdmin.switchDetailsTab(section);
    } else {
        alert('Please select a restaurant first');
    }
}
