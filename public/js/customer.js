// public/js/customer.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sections = {
        home: document.getElementById('home-section'),
        restaurants: document.getElementById('restaurants-section'),
        reservations: document.getElementById('reservations-section'),
        profile: document.getElementById('profile-section')
    };
    
    const navLinks = document.querySelectorAll('.nav-link');
    const featuredRestaurants = document.getElementById('featured-restaurants');
    const allRestaurants = document.getElementById('all-restaurants');
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const locationInput = document.getElementById('location-input');
    const reservationModal = document.getElementById('reservation-modal');
    const editReservationModal = document.getElementById('edit-reservation-modal');
    const notificationsModal = document.getElementById('notifications-modal');
    const successModal = document.getElementById('success-modal');
    const desktopNavLinks = document.querySelectorAll('.desktop-nav-link');
    const notificationsBtnDesktop = document.getElementById('notifications-btn-desktop');
    const notificationBadgeDesktop = document.getElementById('notification-badge-desktop');
    const authLinkDesktop = document.getElementById('auth-link-desktop');
    const authLinkIconDesktop = document.getElementById('auth-link-icon-desktop');
    
    let currentUser = null;
    let selectedRestaurantId = null;
    let selectedReservationId = null;
    
    // Initialize application
    initApp();
    
    function initApp() {
        setupEventListeners();
        checkUserAuth();
        loadFeaturedRestaurants();
        setupNavigation();
    }
    
    function setupEventListeners() {
        // Navigation (desktop and mobile bottom nav)
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                showSection(section);
            });
        });
        
        // Mobile bottom navigation
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                showSection(section);
                
                // Update mobile nav active states
                document.querySelectorAll('.mobile-nav-link').forEach(l => {
                    l.classList.remove('active', 'text-brown-600');
                    l.classList.add('text-brown-400');
                });
                link.classList.add('active', 'text-brown-600');
                link.classList.remove('text-brown-400');
            });
        });
        
        // Search functionality
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
            desktopNavLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = link.getAttribute('data-section');
                    showSection(section);
                    // Update desktop nav active states
                    desktopNavLinks.forEach(l => {
                        l.classList.remove('text-brown-800', 'font-bold');
                        l.classList.add('text-brown-600');
                    });
                    link.classList.add('text-brown-800', 'font-bold');
                    link.classList.remove('text-brown-600');
                });
            });
        
        // Reservation tabs
        document.querySelectorAll('.reservation-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                switchReservationTab(tabName);
            });
        });
        
        // Profile management
        document.getElementById('edit-profile-btn').addEventListener('click', showEditProfileForm);
        document.getElementById('cancel-edit-btn').addEventListener('click', hideEditProfileForm);
        document.getElementById('profile-form').addEventListener('submit', updateProfile);
        
        // Modal controls
        setupModalControls();
    }
        
            // Desktop notifications button
            if (notificationsBtnDesktop) {
                notificationsBtnDesktop.addEventListener('click', openNotifications);
            }
        
            // Desktop auth link (login/logout)
            if (authLinkDesktop) {
                authLinkDesktop.addEventListener('click', function(e) {
                    if (currentUser) {
                        e.preventDefault();
                        logoutUser();
                    }
                });
            }
    
    function setupModalControls() {
        // Restaurant details modal
        const detailsModal = document.getElementById('restaurant-details-modal');
        document.getElementById('close-details-modal').addEventListener('click', () => detailsModal.classList.add('hidden'));
        document.getElementById('cancel-details').addEventListener('click', () => detailsModal.classList.add('hidden'));
        document.getElementById('proceed-to-reserve').addEventListener('click', () => {
            detailsModal.classList.add('hidden');
            openReservationModal();
        });

        // Reservation modal
        document.getElementById('close-modal').addEventListener('click', () => reservationModal.classList.add('hidden'));
        document.getElementById('cancel-reservation').addEventListener('click', () => reservationModal.classList.add('hidden'));
        document.getElementById('reservation-form').addEventListener('submit', createReservation);
        document.getElementById('reservation-date').addEventListener('change', loadAvailableTimeSlots);
        
            // Desktop auth link
            if (authLinkDesktop && authLinkIconDesktop) {
                if (currentUser) {
                    authLinkDesktop.href = '#';
                    authLinkIconDesktop.className = 'fas fa-sign-out-alt text-lg';
                } else {
                    authLinkDesktop.href = '/login';
                    authLinkIconDesktop.className = 'fas fa-sign-in-alt text-lg';
                }
            }
        // Edit reservation modal
        document.getElementById('close-edit-modal').addEventListener('click', () => editReservationModal.classList.add('hidden'));
        document.getElementById('cancel-edit-reservation').addEventListener('click', () => editReservationModal.classList.add('hidden'));
        document.getElementById('edit-reservation-form').addEventListener('submit', updateReservation);
        document.getElementById('cancel-reservation-btn').addEventListener('click', cancelReservation);
        
        // Notifications modal
        document.getElementById('notifications-btn').addEventListener('click', openNotifications);
        document.getElementById('close-notifications').addEventListener('click', () => notificationsModal.classList.add('hidden'));
        
        // Success modal
        document.getElementById('close-success').addEventListener('click', () => successModal.classList.add('hidden'));
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('restaurant-details-modal')) {
                document.getElementById('restaurant-details-modal').classList.add('hidden');
            }
            if (e.target === reservationModal) reservationModal.classList.add('hidden');
            if (e.target === editReservationModal) editReservationModal.classList.add('hidden');
            if (e.target === notificationsModal) notificationsModal.classList.add('hidden');
            if (e.target === successModal) successModal.classList.add('hidden');
        });
    }
    
    // Navigation Functions
    function setupNavigation() {
        // Handle hash changes for direct navigation
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
    }
    
    function handleHashChange() {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
    }
    
    function showSection(sectionName) {
        // Hide all sections
        Object.values(sections).forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
        
        // Show selected section
        if (sections[sectionName]) {
            sections[sectionName].classList.remove('hidden');
            sections[sectionName].classList.add('active');
            
            // Load section-specific content
            switch(sectionName) {
                case 'restaurants':
                    loadAllRestaurants();
                    break;
                case 'reservations':
                    loadReservations('upcoming');
                    break;
                case 'profile':
                    if (!currentUser) {
                        window.location.href = '/login';
                        return;
                    }
                    loadProfile();
                    break;
            }
        }
        
        // Update active nav link
        navLinks.forEach(link => {
            link.classList.remove('text-white');
            link.classList.add('text-brown-200');
            if (link.getAttribute('data-section') === sectionName) {
                link.classList.remove('text-brown-200');
                link.classList.add('text-white');
            }
        });
        
        // Update mobile bottom nav active states
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.classList.remove('active', 'text-brown-600');
            link.classList.add('text-brown-400');
            if (link.getAttribute('data-section') === sectionName) {
                link.classList.add('active', 'text-brown-600');
                link.classList.remove('text-brown-400');
            }
        });

        // Update desktop nav active states so big-screen nav reflects current section
        if (typeof desktopNavLinks !== 'undefined' && desktopNavLinks.length) {
            desktopNavLinks.forEach(link => {
                link.classList.remove('text-brown-800', 'font-bold');
                link.classList.add('text-brown-600');
                if (link.getAttribute('data-section') === sectionName) {
                    link.classList.add('text-brown-800', 'font-bold');
                    link.classList.remove('text-brown-600');
                }
            });
        }
    }
    
    // Restaurant Discovery Functions (FR 1, FR 1.1, FR 1.2)
    async function loadFeaturedRestaurants() {
        try {
            const response = await fetch('/api/restaurants?limit=6');
            const restaurants = await response.json();
            displayFeaturedRestaurants(restaurants);
        } catch (error) {
            console.error('Error loading featured restaurants:', error);
        }
    }
    
    async function loadAllRestaurants() {
        try {
            const response = await fetch('/api/restaurants');
            const restaurants = await response.json();
            displayAllRestaurants(restaurants);
        } catch (error) {
            console.error('Error loading all restaurants:', error);
        }
    }
    
    function displayFeaturedRestaurants(restaurants) {
        if (restaurants.length === 0) {
            featuredRestaurants.innerHTML = '<p class="col-span-full text-center text-brown-500">No restaurants available.</p>';
            return;
        }
        
        featuredRestaurants.innerHTML = restaurants.map(restaurant => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div class="h-32 md:h-48 bg-brown-200 flex items-center justify-center relative">
                    ${restaurant.image_url 
                        ? `<img src="${restaurant.image_url}" alt="${restaurant.name}" class="w-full h-full object-cover">`
                        : `<i class="fas fa-utensils text-3xl md:text-4xl text-brown-400"></i>`
                    }
                </div>
                <div class="p-3 md:p-6">
                    <h3 class="text-base md:text-xl font-bold mb-1 md:mb-2 text-brown-800 line-clamp-1">${restaurant.name}</h3>
                    <p class="text-brown-700 text-xs md:text-sm line-clamp-1"><i class="fas fa-map-marker-alt mr-1 md:mr-2 text-brown-500"></i>${restaurant.location}</p>
                    <button class="reserve-btn w-full bg-brown-600 text-white py-1.5 md:py-2 rounded-lg hover:bg-brown-700 transition text-xs md:text-sm" data-id="${restaurant.id}">
                        <i class="fas fa-calendar-plus mr-1 md:mr-2"></i>Reserve Table
                    </button>
                </div>
            </div>
        `).join('');
        
        attachReserveButtonListeners();
    }
    
    function displayAllRestaurants(restaurants) {
        if (restaurants.length === 0) {
            allRestaurants.innerHTML = '<p class="col-span-full text-center text-brown-500">No restaurants found.</p>';
            return;
        }
        
        allRestaurants.innerHTML = restaurants.map(restaurant => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div class="h-32 md:h-48 bg-brown-200 flex items-center justify-center relative">
                    ${restaurant.image_url 
                        ? `<img src="${restaurant.image_url}" alt="${restaurant.name}" class="w-full h-full object-cover">`
                        : `<i class="fas fa-utensils text-3xl md:text-4xl text-brown-400"></i>`
                    }
                </div>
                <div class="p-3 md:p-6">
                    <h3 class="text-base md:text-xl font-bold mb-1 md:mb-2 text-brown-800 line-clamp-1">${restaurant.name}</h3>
                    <p class="text-brown-700 text-xs md:text-sm line-clamp-1"><i class="fas fa-map-marker-alt mr-1 md:mr-2 text-brown-500"></i>${restaurant.location}</p>
                    <button class="reserve-btn w-full bg-brown-600 text-white py-1.5 md:py-2 rounded-lg hover:bg-brown-700 transition text-xs md:text-sm" data-id="${restaurant.id}">
                        <i class="fas fa-calendar-plus mr-1 md:mr-2"></i>Reserve Table
                    </button>
                </div>
            </div>
        `).join('');
        
        attachReserveButtonListeners();
    }
    
    function attachReserveButtonListeners() {
        document.querySelectorAll('.reserve-btn').forEach(button => {
            button.addEventListener('click', function() {
                selectedRestaurantId = this.getAttribute('data-id');
                openRestaurantDetailsModal(selectedRestaurantId);
            });
        });
    }
    
    function performSearch() {
        const search = searchInput.value;
        const location = locationInput.value;
        
        let url = '/api/restaurants';
        const params = new URLSearchParams();
        
        if (search) params.append('search', search);
        if (location) params.append('location', location);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        fetch(url)
            .then(response => response.json())
            .then(restaurants => {
                // Show restaurants section with results
                showSection('restaurants');
                displayAllRestaurants(restaurants);
            })
            .catch(error => {
                console.error('Error searching restaurants:', error);
            });
    }
    
    // Reservation Functions (FR 2, FR 2.1, FR 2.2, FR 2.3)
    async function openRestaurantDetailsModal(restaurantId) {
        const detailsModal = document.getElementById('restaurant-details-modal');
        
        try {
            // Fetch restaurant details
            const restaurantResponse = await fetch(`/api/restaurants/${restaurantId}`);
            const restaurant = await restaurantResponse.json();
            
            // Fetch menu items
            const menuResponse = await fetch(`/api/menu-items?restaurant_id=${restaurantId}`);
            const menuItems = await menuResponse.json();
            
            // Load restaurant images
            const imagesResponse = await fetch(`/api/restaurants/${restaurantId}/images`);
            let images = await imagesResponse.json();
            // Defensive: ensure images is an array
            if (!Array.isArray(images)) {
                console.error('Expected images array but received:', images);
                images = [];
            }
            
            // Populate restaurant info
            document.getElementById('details-restaurant-name').textContent = restaurant.name;
            document.getElementById('details-cuisine').innerHTML = `<i class="fas fa-utensils mr-2"></i>${restaurant.cuisine_type || 'Various'}`;
            document.getElementById('details-location').innerHTML = `<i class="fas fa-map-marker-alt mr-2"></i>${restaurant.location}`;
            document.getElementById('details-price').innerHTML = `<i class="fas fa-dollar-sign mr-2"></i>${'$'.repeat(parseInt(restaurant.price_range))}`;
            document.getElementById('details-hours').innerHTML = `<i class="fas fa-clock mr-2"></i>${formatTime(restaurant.opening_time)} - ${formatTime(restaurant.closing_time)}`;
            document.getElementById('details-description').textContent = restaurant.description || 'Welcome to our restaurant!';
            document.getElementById('details-phone').innerHTML = `<i class="fas fa-phone mr-2"></i>${restaurant.contact_phone}`;
            document.getElementById('details-phone').href = `tel:${restaurant.contact_phone}`;
            document.getElementById('details-email').innerHTML = `<i class="fas fa-envelope mr-2"></i>${restaurant.contact_email}`;
            document.getElementById('details-email').href = `mailto:${restaurant.contact_email}`;
            
            // Handle restaurant image (use primary or fallback to image_url)
            const headerImage = document.getElementById('restaurant-header-image');
            const primaryImage = (images.find ? images.find(img => img.is_primary) : undefined) || images[0];
            
            if (primaryImage || restaurant.image_url) {
                const imageUrl = primaryImage ? primaryImage.image_url : restaurant.image_url;
                headerImage.innerHTML = `<img src="${imageUrl}" alt="${restaurant.name}" class="w-full h-full object-cover">`;
            } else {
                headerImage.innerHTML = `<div class="flex items-center justify-center h-full bg-gradient-to-br from-brown-900 to-brown-700"><i class="fas fa-utensils text-6xl text-brown-200"></i></div>`;
            }
            
            // Display image gallery (if more than 1 image)
            const galleryContainer = document.getElementById('restaurant-gallery-container');
            const galleryElement = document.getElementById('restaurant-gallery');
            
            if (images && images.length > 1) {
                galleryElement.innerHTML = images
                    .sort((a, b) => a.display_order - b.display_order)
                    .map(img => `
                        <div class="relative cursor-pointer hover:opacity-80 transition" onclick="document.getElementById('restaurant-header-image').innerHTML = '<img src=\\'${img.image_url}\\' alt=\\'${restaurant.name}\\' class=\\'w-full h-full object-cover\\'>'">
                            <img src="${img.image_url}" alt="${restaurant.name}" class="w-full h-20 md:h-24 object-cover rounded-lg">
                            ${img.is_primary ? '<div class="absolute top-1 left-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">Primary</div>' : ''}
                        </div>
                    `).join('');
                galleryContainer.classList.remove('hidden');
            } else {
                galleryContainer.classList.add('hidden');
            }
            
            // Handle restaurant video
            const videoContainer = document.getElementById('restaurant-video-container');
            const videoElement = document.getElementById('restaurant-video');
            if (restaurant.video_url) {
                videoElement.src = restaurant.video_url;
                videoContainer.classList.remove('hidden');
            } else {
                videoContainer.classList.add('hidden');
            }
            
            // Populate menu
            const menuContainer = document.getElementById('restaurant-menu');
            const noMenuMessage = document.getElementById('no-menu-message');
            
            if (menuItems && menuItems.length > 0) {
                menuContainer.innerHTML = menuItems.map(item => `
                    <div class="bg-brown-50 p-4 rounded-lg border border-brown-200 hover:shadow-md transition">
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="font-bold text-brown-800">${item.name}</h4>
                            <span class="text-brown-700 font-semibold">RWF ${parseFloat(item.price).toLocaleString()}</span>
                        </div>
                        <p class="text-brown-600 text-sm mb-2">${item.description || ''}</p>
                        <span class="inline-block px-2 py-1 bg-brown-200 text-brown-700 rounded text-xs">${item.category}</span>
                    </div>
                `).join('');
                noMenuMessage.classList.add('hidden');
            } else {
                menuContainer.innerHTML = '';
                noMenuMessage.classList.remove('hidden');
            }
            
            // Show modal
            detailsModal.classList.remove('hidden');
            
        } catch (error) {
            console.error('Error loading restaurant details:', error);
            showNotification('Error loading restaurant details', 'error');
        }
    }

    function openReservationModal() {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('reservation-date').min = today;
        document.getElementById('reservation-date').value = today;

        // Set restaurant ID
        document.getElementById('restaurant-id').value = selectedRestaurantId;

        // Show restaurant summary in modal
        fetch(`/api/restaurants/${selectedRestaurantId}`)
            .then(res => res.json())
            .then(restaurant => {
                document.getElementById('reservation-restaurant-name').textContent = restaurant.name || '';
                document.getElementById('reservation-restaurant-location').textContent = restaurant.location || '';
                document.getElementById('reservation-restaurant-image').src = restaurant.image_url || '/views/images/logo.jpeg';
            })
            .catch(() => {
                document.getElementById('reservation-restaurant-name').textContent = '';
                document.getElementById('reservation-restaurant-location').textContent = '';
                document.getElementById('reservation-restaurant-image').src = '/views/images/logo.jpeg';
            });

        // Pre-fill user info if logged in
        if (currentUser) {
            document.getElementById('customer-name').value = currentUser.name;
            document.getElementById('customer-email').value = currentUser.email;
            document.getElementById('customer-phone').value = currentUser.phone || '';
        }

        // Load available time slots
        loadAvailableTimeSlots();

        reservationModal.classList.remove('hidden');
    }
    
    function loadAvailableTimeSlots() {
        const date = document.getElementById('reservation-date').value;
        if (!date || !selectedRestaurantId) return;
        
        fetch(`/api/restaurants/${selectedRestaurantId}/availability?date=${date}`)
            .then(response => response.json())
            .then(availability => {
                const timeSelect = document.getElementById('reservation-time');
                timeSelect.innerHTML = '<option value="">Select time</option>';
                
                // Generate time slots
                for (let hour = 10; hour <= 22; hour++) {
                    for (let minute = 0; minute < 60; minute += 30) {
                        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
                        const displayTime = formatTime(timeString);
                        
                        const availableSlot = availability.find(slot => slot.time_slot === timeString);
                        const isAvailable = availableSlot && availableSlot.available_tables > 0;
                        
                        const option = document.createElement('option');
                        option.value = timeString;
                        option.textContent = `${displayTime} ${isAvailable ? `(${availableSlot.available_tables} tables available)` : '(Fully booked)'}`;
                        option.disabled = !isAvailable;
                        
                        timeSelect.appendChild(option);
                    }
                }
            })
            .catch(error => {
                console.error('Error loading availability:', error);
            });
    }
    
    function createReservation(e) {
        e.preventDefault();
        // Basic client-side validation
        const customer_name = document.getElementById('customer-name').value.trim();
        const customer_email = document.getElementById('customer-email').value.trim();
        const customer_phone = document.getElementById('customer-phone').value.trim();
        const reservation_date = document.getElementById('reservation-date').value;
        const reservation_time = document.getElementById('reservation-time').value;
        const party_size = (document.getElementById('party-size') ? document.getElementById('party-size').value : '') || '';

        if (!customer_name || !customer_email || !reservation_date || !reservation_time || !party_size) {
            showSuccess('Error', 'Please fill in all required fields (name, email, date, time, party size).', false);
            return;
        }

        const submitBtn = document.querySelector('#reservation-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.dataset._origText = submitBtn.textContent;
            submitBtn.textContent = 'Booking...';
        }

        const formData = {
            customer_name,
            customer_email,
            customer_phone,
            restaurant_id: selectedRestaurantId,
            reservation_date,
            reservation_time,
            party_size: party_size || 1,
            occasion: document.getElementById('occasion') ? document.getElementById('occasion').value : null,
            special_requests: document.getElementById('special-requests') ? document.getElementById('special-requests').value : null
        };

        fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(response => response.json().then(body => ({ status: response.status, body })))
        .then(({ status, body }) => {
            if (status >= 400) {
                showSuccess('Error', body.error || 'Failed to create reservation', false);
                return;
            }

            reservationModal.classList.add('hidden');
            showSuccess('Reservation Created', 'Your reservation has been created successfully.');
            loadReservations('upcoming');
        })
        .catch(error => {
            console.error('Error creating reservation:', error);
            showSuccess('Error', 'An error occurred while creating your reservation. Please try again.', false);
        })
        .finally(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = submitBtn.dataset._origText || 'Book Reservation';
                delete submitBtn.dataset._origText;
            }
        });
    }
    
    function openEditReservation(reservationId) {
        selectedReservationId = reservationId;
        
        // Load reservation details
        fetch('/api/user/reservations')
            .then(response => response.json())
            .then(reservations => {
                const reservation = reservations.find(r => r.id == reservationId);
                if (reservation) {
                    document.getElementById('edit-reservation-id').value = reservation.id;
                    document.getElementById('edit-reservation-date').value = reservation.reservation_date;
                    document.getElementById('edit-party-size').value = reservation.party_size;
                    document.getElementById('edit-occasion').value = reservation.occasion || '';
                    document.getElementById('edit-special-requests').value = reservation.special_requests || '';
                    
                    // Load time slots
                    loadEditTimeSlots(reservation.restaurant_id, reservation.reservation_date, reservation.reservation_time);
                    
                    editReservationModal.classList.remove('hidden');
                }
            })
            .catch(error => {
                console.error('Error loading reservation details:', error);
            });
    }
    
    function loadEditTimeSlots(restaurantId, date, currentTime) {
        fetch(`/api/restaurants/${restaurantId}/availability?date=${date}`)
            .then(response => response.json())
            .then(availability => {
                const timeSelect = document.getElementById('edit-reservation-time');
                timeSelect.innerHTML = '<option value="">Select time</option>';
                
                for (let hour = 10; hour <= 22; hour++) {
                    for (let minute = 0; minute < 60; minute += 30) {
                        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
                        const displayTime = formatTime(timeString);
                        
                        const availableSlot = availability.find(slot => slot.time_slot === timeString);
                        const isAvailable = availableSlot && availableSlot.available_tables > 0;
                        const isCurrentTime = timeString === currentTime;
                        
                        const option = document.createElement('option');
                        option.value = timeString;
                        option.textContent = `${displayTime} ${isAvailable ? `(${availableSlot.available_tables} tables available)` : '(Fully booked)'}`;
                        option.disabled = !isAvailable && !isCurrentTime;
                        if (isCurrentTime) option.selected = true;
                        
                        timeSelect.appendChild(option);
                    }
                }
            })
            .catch(error => {
                console.error('Error loading availability:', error);
            });
    }
    
    function updateReservation(e) {
        e.preventDefault();
        
        const formData = {
            reservation_date: document.getElementById('edit-reservation-date').value,
            reservation_time: document.getElementById('edit-reservation-time').value,
            party_size: document.getElementById('edit-party-size').value,
            occasion: document.getElementById('edit-occasion').value,
            special_requests: document.getElementById('edit-special-requests').value
        };
        
        fetch(`/api/reservations/${selectedReservationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showSuccess('Error', data.error, false);
            } else {
                editReservationModal.classList.add('hidden');
                showSuccess('Reservation Updated', 'Your reservation has been updated successfully.');
                loadReservations('upcoming');
            }
        })
        .catch(error => {
            console.error('Error updating reservation:', error);
            showSuccess('Error', 'An error occurred while updating your reservation. Please try again.', false);
        });
    }
    
    function cancelReservation() {
        if (!confirm('Are you sure you want to cancel this reservation?')) {
            return;
        }
        
        fetch(`/api/reservations/${selectedReservationId}/cancel`, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showSuccess('Error', data.error, false);
            } else {
                editReservationModal.classList.add('hidden');
                showSuccess('Reservation Cancelled', 'Your reservation has been cancelled successfully.');
                loadReservations('upcoming');
            }
        })
        .catch(error => {
            console.error('Error cancelling reservation:', error);
            showSuccess('Error', 'An error occurred while cancelling your reservation. Please try again.', false);
        });
    }
    
    // Profile Functions (FR 3, FR 3.1, FR 3.2)
    function loadProfile() {
        if (!currentUser) return;
        // Prefer session user (currentUser) for immediate display, fall back to server profile
        try {
            const profilePromise = fetch('/api/user/profile').then(r => r.json()).catch(() => null);

            // Use currentUser values to populate UI immediately
            document.getElementById('profile-name').textContent = currentUser.name || '—';
            document.getElementById('profile-email').textContent = currentUser.email || '—';
            document.getElementById('profile-phone').textContent = currentUser.phone || 'Not provided';
            document.getElementById('profile-joined').textContent = 'Loading...';

            // Set form values from session user
            document.getElementById('edit-name').value = currentUser.name || '';
            document.getElementById('edit-email').value = currentUser.email || '';
            document.getElementById('edit-phone').value = currentUser.phone || '';

            // Update with freshest server profile when available (created_at etc.)
            profilePromise.then(profile => {
                if (!profile) return;
                document.getElementById('profile-name').textContent = profile.name || currentUser.name || '—';
                document.getElementById('profile-email').textContent = profile.email || currentUser.email || '—';
                document.getElementById('profile-phone').textContent = profile.phone || currentUser.phone || 'Not provided';
                if (profile.created_at) {
                    document.getElementById('profile-joined').textContent = new Date(profile.created_at).toLocaleDateString();
                }

                // Ensure form values reflect server state
                document.getElementById('edit-name').value = profile.name || currentUser.name || '';
                document.getElementById('edit-email').value = profile.email || currentUser.email || '';
                document.getElementById('edit-phone').value = profile.phone || currentUser.phone || '';
            }).catch(error => console.error('Error loading profile:', error));
        } catch (error) {
            console.error('Error preparing profile UI:', error);
        }
        
        // Load statistics
        fetch('/api/user/reservation-stats')
            .then(response => response.json())
            .then(stats => {
                document.getElementById('total-reservations-count').textContent = stats.totalReservations;
                document.getElementById('upcoming-reservations-count').textContent = stats.upcomingReservations;
                document.getElementById('favorite-restaurants-count').textContent = stats.restaurantsVisited;
            })
            .catch(error => {
                console.error('Error loading statistics:', error);
            });
    }
    
    function showEditProfileForm() {
        document.getElementById('profile-info').classList.add('hidden');
        document.getElementById('edit-profile-form').classList.remove('hidden');
    }
    
    function hideEditProfileForm() {
        document.getElementById('profile-info').classList.remove('hidden');
        document.getElementById('edit-profile-form').classList.add('hidden');
    }
    
    function updateProfile(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('edit-name').value,
            email: document.getElementById('edit-email').value,
            phone: document.getElementById('edit-phone').value
        };
        
        fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showSuccess('Error', data.error, false);
            } else {
                hideEditProfileForm();
                showSuccess('Profile Updated', 'Your profile has been updated successfully.');
                loadProfile();
                
                // Update current user data
                if (currentUser) {
                    currentUser.name = formData.name;
                    currentUser.email = formData.email;
                    currentUser.phone = formData.phone;
                }
            }
        })
        .catch(error => {
            console.error('Error updating profile:', error);
            showSuccess('Error', 'An error occurred while updating your profile. Please try again.', false);
        });
    }
    
    // Reservation Management Functions
    function loadReservations(type = 'upcoming') {
        if (!currentUser) return;
        
        fetch(`/api/user/reservations?type=${type}`)
            .then(response => response.json())
            .then(reservations => {
                displayReservations(reservations, type);
            })
            .catch(error => {
                console.error('Error loading reservations:', error);
            });
    }
    
    function displayReservations(reservations, type) {
        const container = document.getElementById(`${type}-reservations`);
        
        if (reservations.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-calendar-times text-5xl text-brown-300 mb-4"></i>
                    <h3 class="text-xl text-brown-500">No ${type} reservations</h3>
                </div>
            `;
            return;
        }
        
        container.innerHTML = reservations.map(reservation => `
            <div class="bg-white border border-brown-200 rounded-lg p-6 mb-4">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="text-lg font-semibold text-brown-800">${reservation.restaurant_name}</h4>
                        <p class="text-brown-600">${reservation.restaurant_location}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm ${getStatusClass(reservation.status)}">
                        ${getStatusText(reservation.status)}
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-brown-700"><i class="fas fa-calendar mr-2"></i>${formatDate(reservation.reservation_date)}</p>
                        <p class="text-brown-700"><i class="fas fa-clock mr-2"></i>${formatTime(reservation.reservation_time)}</p>
                    </div>
                    <div>
                        <p class="text-brown-700"><i class="fas fa-users mr-2"></i>${reservation.party_size} people</p>
                        <p class="text-brown-700"><i class="fas fa-phone mr-2"></i>${reservation.restaurant_phone}</p>
                    </div>
                </div>
                
                ${reservation.occasion ? `<p class="text-brown-600 mb-2"><i class="fas fa-gift mr-2"></i>${reservation.occasion}</p>` : ''}
                ${reservation.special_requests ? `<p class="text-brown-600 mb-4"><i class="fas fa-sticky-note mr-2"></i>${reservation.special_requests}</p>` : ''}
                
                ${type === 'upcoming' && reservation.status === 'confirmed' ? `
                    <div class="flex justify-end space-x-2">
                        <button class="edit-reservation-btn bg-brown-600 text-white px-4 py-2 rounded-lg hover:bg-brown-700 transition" data-id="${reservation.id}">
                            <i class="fas fa-edit mr-2"></i>Modify
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
        
        // Attach event listeners to edit buttons
        document.querySelectorAll('.edit-reservation-btn').forEach(button => {
            button.addEventListener('click', function() {
                const reservationId = this.getAttribute('data-id');
                openEditReservation(reservationId);
            });
        });
    }
    
    function switchReservationTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.reservation-tab').forEach(tab => {
            tab.classList.remove('border-brown-600', 'text-brown-600');
            tab.classList.add('border-transparent', 'text-brown-500');
        });
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('border-brown-600', 'text-brown-600');
        document.querySelector(`[data-tab="${tabName}"]`).classList.remove('border-transparent', 'text-brown-500');
        
        // Show selected tab content
        document.querySelectorAll('.reservation-tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`${tabName}-reservations`).classList.remove('hidden');
        
        // Load reservations for this tab
        loadReservations(tabName);
    }
    
    // Notification Functions
    function openNotifications() {
        if (!currentUser) return;
        
        fetch('/api/notifications')
            .then(response => response.json())
            .then(notifications => {
                displayNotifications(notifications);
                notificationsModal.classList.remove('hidden');
                
                // Mark all as read
                notifications.forEach(notification => {
                    if (!notification.is_read) {
                        fetch(`/api/notifications/${notification.id}/read`, { method: 'PUT' });
                    }
                });
                
                updateNotificationBadge(0);
            })
            .catch(error => {
                console.error('Error loading notifications:', error);
            });
    }
    
    function displayNotifications(notifications) {
        const container = document.getElementById('notifications-container');
        
        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-bell-slash text-5xl text-brown-300 mb-4"></i>
                    <h3 class="text-xl text-brown-500">No notifications</h3>
                </div>
            `;
            return;
        }
        
        container.innerHTML = notifications.map(notification => `
            <div class="border-l-4 ${notification.is_read ? 'border-brown-300' : 'border-brown-600'} p-4 mb-4 bg-brown-50">
                <h4 class="font-bold text-brown-800">${notification.title}</h4>
                <p class="text-brown-600 mt-1">${notification.message}</p>
                <div class="text-xs text-brown-400 mt-2">${formatDateTime(notification.created_at)}</div>
            </div>
        `).join('');
    }
    
    function updateNotificationBadge(count) {
        const badge = document.getElementById('notification-badge');
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
    
    // Utility Functions
    function checkUserAuth() {
        fetch('/api/user')
            .then(response => response.json())
            .then(data => {
                if (data.loggedIn) {
                    currentUser = data.user;
                    // Update header auth link to point to profile
                    const authLink = document.getElementById('auth-link');
                    const authIcon = document.getElementById('auth-link-icon');
                    if (authLink && authIcon) {
                        authLink.href = '#profile';
                        authIcon.className = 'fas fa-user text-lg';
                        authLink.title = 'My Profile';
                    }
                    // Load unread notifications count
                    fetch('/api/notifications')
                        .then(response => response.json())
                        .then(notifications => {
                            const unreadCount = notifications.filter(n => !n.is_read).length;
                            updateNotificationBadge(unreadCount);
                        });
                } else {
                    // Not logged in: ensure header shows login link
                    const authLink = document.getElementById('auth-link');
                    const authIcon = document.getElementById('auth-link-icon');
                    if (authLink && authIcon) {
                        authLink.href = '/login';
                        authIcon.className = 'fas fa-sign-in-alt text-lg';
                        authLink.title = 'Login';
                    }
                }
            })
            .catch(error => {
                console.error('Error checking user auth:', error);
            });
    }
    
    function showSuccess(title, message, isSuccess = true) {
        document.getElementById('success-title').textContent = title;
        document.getElementById('success-message').textContent = message;
        document.getElementById('success-title').className = `text-xl font-bold mb-2 ${isSuccess ? 'text-brown-800' : 'text-red-600'}`;
        successModal.classList.remove('hidden');
    }
    
    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    function formatDateTime(dateTimeString) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateTimeString).toLocaleDateString(undefined, options);
    }
    
    function getStatusClass(status) {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    
    function getStatusText(status) {
        switch(status) {
            case 'pending': return 'Pending Confirmation';
            case 'confirmed': return 'Confirmed';
            case 'rejected': return 'Rejected';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    }

    // Email change modal controls (attach once)
    (function attachEmailChangeControls(){
        const emailChangeModal = document.getElementById('email-change-modal');
        if (!emailChangeModal) return;

        document.getElementById('close-email-change').addEventListener('click', () => emailChangeModal.classList.add('hidden'));
        document.getElementById('cancel-email-change').addEventListener('click', () => emailChangeModal.classList.add('hidden'));
        document.getElementById('confirm-email-change').addEventListener('click', async () => {
            const code = document.getElementById('email-change-code').value.trim();
            if (!code) { showSuccess('Error', 'Enter verification code', false); return; }

            try {
                const resp = await fetch('/api/user/confirm-email-change', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });
                const data = await resp.json();
                if (!resp.ok) return showSuccess('Error', data.error || 'Invalid code', false);

                // Update UI and session user
                if (currentUser) currentUser.email = data.email || currentUser.email;
                document.getElementById('profile-email').textContent = data.email || document.getElementById('profile-email').textContent;
                emailChangeModal.classList.add('hidden');
                showSuccess('Email Updated', 'Your email has been updated successfully.');
            } catch (err) {
                console.error('Error confirming email change:', err);
                showSuccess('Error', 'Failed to confirm email change', false);
            }
        });
    })();

    function showNotification(message, type = 'info') {
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
});