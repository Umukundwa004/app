// public/js/customer.js
document.addEventListener('DOMContentLoaded', function() {
    // Favorites state
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
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
    
    // Filter state variables
    let allRestaurantsData = [];
    let selectedCuisines = [];
    let selectedPriceRanges = [];
    let minRating = 0;
    let searchQuery = "";
    const allCuisines = ["Rwandan", "Italian", "Indian", "American", "Asian", "African", "European", "International", "Seafood", "Fusion"];
    const priceRanges = ["$", "$$", "$$$", "$$$$"];
    
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
                    l.classList.remove('text-gray-700');
                    l.classList.add('text-gray-500');
                });
                link.classList.add('text-gray-700');
                link.classList.remove('text-gray-500');
            });
        });
        
        // Desktop navigation
        desktopNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                showSection(section);
                // Update desktop nav active states
                desktopNavLinks.forEach(l => {
                    l.classList.remove('text-gray-900', 'font-bold');
                    l.classList.add('text-gray-700');
                });
                link.classList.add('text-gray-900', 'font-bold');
                link.classList.remove('text-gray-700');
            });
        });
        
        // Search functionality
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
        
        // Restaurant search input (in discover section)
        const restaurantSearchInput = document.getElementById('restaurant-search-input');
        if (restaurantSearchInput) {
            restaurantSearchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase();
                applyFiltersAndRender();
            });
        }
        
        // Filter functionality
        const filterButton = document.getElementById('filter-button');
        const filterSheet = document.getElementById('filter-sheet');
        const filterOverlay = document.getElementById('filter-overlay');
        const closeFilterSheet = document.getElementById('close-filter-sheet');
        const clearFiltersBtn = document.getElementById('clear-filters');
        const ratingSlider = document.getElementById('rating-slider');
        const ratingValue = document.getElementById('rating-value');
        
        if (filterButton) {
            filterButton.addEventListener('click', () => {
                filterSheet.classList.add('open');
                filterOverlay.classList.add('open');
            });
        }
        
        if (closeFilterSheet) {
            closeFilterSheet.addEventListener('click', () => {
                filterSheet.classList.remove('open');
                filterOverlay.classList.remove('open');
            });
        }
        
        if (filterOverlay) {
            filterOverlay.addEventListener('click', () => {
                filterSheet.classList.remove('open');
                filterOverlay.classList.remove('open');
            });
        }
        
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', clearAllFilters);
        }
        
        if (ratingSlider) {
            ratingSlider.addEventListener('input', (e) => {
                minRating = parseFloat(e.target.value);
                ratingValue.textContent = minRating.toFixed(1);
                applyFiltersAndRender();
            });
        }
        
        // Initialize filter badges
        initializeFilterBadges();
        
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
        
        // Add change listener for edit reservation date to reload time slots
        document.getElementById('edit-reservation-date').addEventListener('change', function() {
            const restaurantId = this.dataset.restaurantId;
            const newDate = this.value;
            if (restaurantId && newDate) {
                loadEditTimeSlots(restaurantId, newDate, '');
            }
        });
        
        // Notifications modal
        document.getElementById('notifications-btn').addEventListener('click', openNotifications);
        document.getElementById('close-notifications').addEventListener('click', () => notificationsModal.classList.add('hidden'));
        
        // Success modal
        document.getElementById('close-success').addEventListener('click', () => successModal.classList.add('hidden'));
        
        // Review modal
        const reviewModal = document.getElementById('review-modal');
        document.getElementById('close-review-modal').addEventListener('click', () => reviewModal.classList.add('hidden'));
        document.getElementById('cancel-review').addEventListener('click', () => reviewModal.classList.add('hidden'));
        document.getElementById('review-form').addEventListener('submit', submitReview);
        
        // Star rating setup
        setupStarRating();
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('restaurant-details-modal')) {
                document.getElementById('restaurant-details-modal').classList.add('hidden');
            }
            if (e.target === reservationModal) reservationModal.classList.add('hidden');
            if (e.target === editReservationModal) editReservationModal.classList.add('hidden');
            if (e.target === notificationsModal) notificationsModal.classList.add('hidden');
            if (e.target === successModal) successModal.classList.add('hidden');
            if (e.target === reviewModal) reviewModal.classList.add('hidden');
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
            link.classList.add('text-gray-400');
            if (link.getAttribute('data-section') === sectionName) {
                link.classList.remove('text-gray-400');
                link.classList.add('text-white');
            }
        });
        
        // Update mobile bottom nav active states
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.classList.remove('active', 'text-gray-700');
            link.classList.add('text-gray-500');
            if (link.getAttribute('data-section') === sectionName) {
                link.classList.add('active', 'text-gray-700');
                link.classList.remove('text-gray-500');
            }
        });

        // Update desktop nav active states so big-screen nav reflects current section
        if (typeof desktopNavLinks !== 'undefined' && desktopNavLinks.length) {
            desktopNavLinks.forEach(link => {
                link.classList.remove('text-gray-900', 'font-bold');
                link.classList.add('text-gray-700');
                if (link.getAttribute('data-section') === sectionName) {
                    link.classList.add('text-gray-900', 'font-bold');
                    link.classList.remove('text-gray-700');
                }
            });
        }
    }
    
    // Restaurant Discovery Functions (FR 1, FR 1.1, FR 1.2)
    async function loadFeaturedRestaurants() {
        try {
            const response = await fetch('/api/restaurants');
            const restaurants = await response.json();
            
            // Filter to show only favorited restaurants
            const favoriteRestaurants = restaurants.filter(r => favorites.includes(r.id.toString()));
            displayFeaturedRestaurants(favoriteRestaurants);
        } catch (error) {
            console.error('Error loading featured restaurants:', error);
        }
    }
    
    async function loadAllRestaurants() {
        try {
            const response = await fetch('/api/restaurants');
            const restaurants = await response.json();
            allRestaurantsData = restaurants;
            applyFiltersAndRender();
        } catch (error) {
            console.error('Error loading all restaurants:', error);
        }
    }
    
    // Filter Functions
    function initializeFilterBadges() {
        const cuisineContainer = document.getElementById('cuisine-filter-badges');
        const priceContainer = document.getElementById('price-filter-badges');
        
        if (cuisineContainer) {
            cuisineContainer.innerHTML = '';
            allCuisines.forEach(cuisine => {
                const badge = document.createElement('div');
                badge.className = 'filter-badge';
                badge.textContent = cuisine;
                badge.addEventListener('click', () => toggleCuisineFilter(cuisine, badge));
                cuisineContainer.appendChild(badge);
            });
        }
        
        if (priceContainer) {
            priceContainer.innerHTML = '';
            priceRanges.forEach(price => {
                const badge = document.createElement('div');
                badge.className = 'filter-badge';
                badge.textContent = price;
                badge.addEventListener('click', () => togglePriceFilter(price, badge));
                priceContainer.appendChild(badge);
            });
        }
    }
    
    function toggleCuisineFilter(cuisine, badge) {
        if (selectedCuisines.includes(cuisine)) {
            selectedCuisines = selectedCuisines.filter(c => c !== cuisine);
            badge.classList.remove('active');
        } else {
            selectedCuisines.push(cuisine);
            badge.classList.add('active');
        }
        applyFiltersAndRender();
    }
    
    function togglePriceFilter(price, badge) {
        if (selectedPriceRanges.includes(price)) {
            selectedPriceRanges = selectedPriceRanges.filter(p => p !== price);
            badge.classList.remove('active');
        } else {
            selectedPriceRanges.push(price);
            badge.classList.add('active');
        }
        applyFiltersAndRender();
    }
    
    function clearAllFilters() {
        selectedCuisines = [];
        selectedPriceRanges = [];
        minRating = 0;
        searchQuery = "";
        
        const ratingSlider = document.getElementById('rating-slider');
        const ratingValue = document.getElementById('rating-value');
        const restaurantSearchInput = document.getElementById('restaurant-search-input');
        
        if (ratingSlider) ratingSlider.value = 0;
        if (ratingValue) ratingValue.textContent = '0.0';
        if (restaurantSearchInput) restaurantSearchInput.value = '';
        
        // Reset all badges
        document.querySelectorAll('.filter-badge').forEach(badge => {
            badge.classList.remove('active');
        });
        
        applyFiltersAndRender();
    }
    
    function applyFiltersAndRender() {
        const filteredRestaurants = allRestaurantsData.filter(restaurant => {
            // Search filter
            const query = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery ||
                restaurant.name.toLowerCase().includes(query) ||
                (restaurant.location && restaurant.location.toLowerCase().includes(query)) ||
                (restaurant.cuisine_types && restaurant.cuisine_types.toLowerCase().includes(query));
            
            // Cuisine filter
            const matchesCuisine = selectedCuisines.length === 0 ||
                (restaurant.cuisine_types && selectedCuisines.some(c => 
                    restaurant.cuisine_types.toLowerCase().includes(c.toLowerCase())
                ));
            
            // Price filter
            const matchesPrice = selectedPriceRanges.length === 0 ||
                (restaurant.price_range && selectedPriceRanges.includes(restaurant.price_range));
            
            // Rating filter
            const restaurantRating = parseFloat(restaurant.rating) || 0;
            const matchesRating = restaurantRating >= minRating;
            
            return matchesSearch && matchesCuisine && matchesPrice && matchesRating;
        });
        
        displayAllRestaurants(filteredRestaurants);
    }
    
    function displayFeaturedRestaurants(restaurants) {
        if (restaurants.length === 0) {
            featuredRestaurants.innerHTML = `
                <div class="col-span-full text-center py-12 px-4">
                    <div class="text-6xl mb-4">💙</div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">No Favorite Restaurants Yet</h3>
                    <p class="text-gray-600 mb-4">Start adding restaurants to your favorites by clicking the heart icon!</p>
                    <button id="browse-restaurants-btn" class="bg-brown-600 text-white px-6 py-2 rounded-lg hover:bg-brown-700 transition">
                        <i class="fas fa-search mr-2"></i>Browse Restaurants
                    </button>
                </div>
            `;
            
            // Add event listener for the browse button
            setTimeout(() => {
                const browseBtn = document.getElementById('browse-restaurants-btn');
                if (browseBtn) {
                    browseBtn.addEventListener('click', () => {
                        showSection('restaurants');
                    });
                }
            }, 0);
            
            return;
        }
        
        featuredRestaurants.innerHTML = restaurants.map(restaurant => {
            const rating = parseFloat(restaurant.rating) || 0;
            const cuisineArray = restaurant.cuisine_types ? restaurant.cuisine_types.split(',').map(c => c.trim()) : [];
            // Check if rating display is enabled (default to true if not set)
            const showRating = restaurant.rating_display !== false && rating > 0;
            
            return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all restaurant-card-enhanced">
                <div class="h-32 md:h-48 bg-gray-200 flex items-center justify-center relative">
                    ${restaurant.image_url 
                        ? `<img src="${restaurant.image_url}" alt="${restaurant.name}" class="w-full h-full object-cover">`
                        : `<i class="fas fa-utensils text-3xl md:text-4xl text-gray-400"></i>`
                    }
                    ${showRating ? `
                    <div class="absolute top-2 right-2 restaurant-card-rating">
                        <i class="fas fa-star star-icon"></i>
                        <span>${rating.toFixed(1)}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="p-3 md:p-6">
                    <h3 class="text-base md:text-xl font-bold mb-1 md:mb-2 text-gray-900">${restaurant.name}</h3>
                    <p class="text-gray-700 text-xs md:text-sm mb-2 md:mb-3">
                        <i class="fas fa-map-marker-alt mr-1 md:mr-2 text-gray-500"></i>${restaurant.location || 'Location not specified'}
                    </p>
                    
                    <!-- Show badges only on medium screens and up -->
                    <div class="hidden md:flex restaurant-card-badges mb-3">
                        ${cuisineArray.slice(0, 2).map(cuisine => 
                            `<span class="restaurant-card-badge"><i class="fas fa-utensils mr-1"></i>${cuisine}</span>`
                        ).join('')}
                    </div>
                    
                    <button class="reserve-btn w-full bg-brown-600 text-white py-2 md:py-2.5 rounded-lg hover:bg-brown-700 transition text-xs md:text-sm font-medium" data-id="${restaurant.id}">
                        <i class="fas fa-calendar-plus mr-1 md:mr-2"></i><span class="hidden md:inline">View Details & </span>Reserve
                    </button>
                </div>
            </div>
            `;
        }).join('');
        
        attachReserveButtonListeners();
    }
    
    function displayAllRestaurants(restaurants) {
        if (restaurants.length === 0) {
            allRestaurants.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-gray-600 text-lg">No restaurants found matching your criteria.</p><p class="text-gray-400 text-sm mt-2">Try adjusting your filters</p></div>';
            return;
        }
        
        allRestaurants.innerHTML = restaurants.map(restaurant => {
            const rating = parseFloat(restaurant.rating) || 0;
            const cuisineArray = restaurant.cuisine_types ? restaurant.cuisine_types.split(',').map(c => c.trim()) : [];
            const isFavorite = favorites.includes(restaurant.id.toString());
            // Check if rating display is enabled (default to true if not set)
            const showRating = restaurant.rating_display !== false && rating > 0;
            
            return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all restaurant-card-enhanced">
                <div class="h-32 md:h-48 bg-gray-200 flex items-center justify-center relative">
                    ${restaurant.image_url 
                        ? `<img src="${restaurant.image_url}" alt="${restaurant.name}" class="w-full h-full object-cover">`
                        : `<i class="fas fa-utensils text-3xl md:text-4xl text-gray-400"></i>`
                    }
                    <button class="favorite-heart-btn ${isFavorite ? 'active' : ''}" data-id="${restaurant.id}" onclick="toggleFavorite(event, '${restaurant.id}')">
                        💙
                    </button>
                    ${showRating ? `
                    <div class="absolute top-2 right-2 restaurant-card-rating">
                        <i class="fas fa-star star-icon"></i>
                        <span>${rating.toFixed(1)}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="p-3 md:p-6">
                    <h3 class="text-base md:text-xl font-bold mb-1 md:mb-2 text-gray-900">${restaurant.name}</h3>
                    <p class="text-gray-700 text-xs md:text-sm mb-2 md:mb-3">
                        <i class="fas fa-map-marker-alt mr-1 md:mr-2 text-gray-500"></i>${restaurant.location || 'Location not specified'}
                    </p>
                    
                    <!-- Show badges only on medium screens and up -->
                    <div class="hidden md:flex restaurant-card-badges mb-3">
                        ${cuisineArray.slice(0, 2).map(cuisine => 
                            `<span class="restaurant-card-badge"><i class="fas fa-utensils mr-1"></i>${cuisine}</span>`
                        ).join('')}
                    </div>
                    
                    <!-- Show description only on medium screens and up -->
                    ${restaurant.description ? `<p class="hidden md:block text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">${restaurant.description}</p>` : ''}
                    
                    <button class="reserve-btn w-full bg-brown-600 text-white py-2 md:py-2.5 rounded-lg hover:bg-brown-700 transition text-xs md:text-sm font-medium" data-id="${restaurant.id}">
                        <i class="fas fa-calendar-plus mr-1 md:mr-2"></i><span class="hidden md:inline">View Details & </span>Reserve
                    </button>
                </div>
            </div>
            `;
        }).join('');
        
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
        const search = searchInput.value.trim();
        
        let url = '/api/restaurants';
        const params = new URLSearchParams();
        
        if (search) {
            params.append('search', search);
        }
        
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
            document.getElementById('details-location').textContent = restaurant.location || 'Location not specified';
            document.getElementById('details-hours').textContent = `${formatTime(restaurant.opening_time)} - ${formatTime(restaurant.closing_time)}`;
            document.getElementById('details-description').textContent = restaurant.description || 'Welcome to our restaurant!';
            document.getElementById('details-phone').textContent = restaurant.contact_phone || 'Not available';
            document.getElementById('details-phone').href = `tel:${restaurant.contact_phone}`;
            document.getElementById('details-email').textContent = restaurant.contact_email || 'Not available';
            document.getElementById('details-email').href = `mailto:${restaurant.contact_email}`;
            
            // Initialize Google Map
            initializeRestaurantMap(restaurant);
            
            // Update rating badge - respect rating_display setting
            const ratingBadge = document.getElementById('details-rating-badge');
            const rating = parseFloat(restaurant.rating) || 0;
            // Check if rating display is enabled (default to true if not set)
            if (ratingBadge && restaurant.rating_display !== false && rating > 0) {
                ratingBadge.innerHTML = `
                    <i class="fas fa-star text-yellow-500"></i>
                    <span class="font-semibold text-gray-900">${rating.toFixed(1)}</span>
                `;
            } else if (ratingBadge) {
                ratingBadge.innerHTML = '';
            }
            
            // Populate cuisine badges
            const cuisineBadgesContainer = document.getElementById('details-cuisine-badges');
            const cuisines = restaurant.cuisine_types ? restaurant.cuisine_types.split(',').map(c => c.trim()) : [];
            cuisineBadgesContainer.innerHTML = cuisines.map(cuisine => 
                `<span class="bg-gray-100 text-gray-800 text-xs md:text-sm font-medium px-3 py-1 rounded-full border border-gray-200">
                    <i class="fas fa-utensils mr-1"></i>${cuisine}
                </span>`
            ).join('');
            
            // Price range badge - removed to hide price information
            const priceBadge = document.getElementById('details-price-badge');
            priceBadge.innerHTML = '';
            
            // Handle restaurant image (use primary or fallback to image_url)
            const headerImage = document.getElementById('restaurant-header-image');
            const primaryImage = (images.find ? images.find(img => img.is_primary) : undefined) || images[0];
            
            if (primaryImage || restaurant.image_url) {
                const imageUrl = primaryImage ? primaryImage.image_url : restaurant.image_url;
                headerImage.innerHTML = `<img src="${imageUrl}" alt="${restaurant.name}" class="w-full h-full object-cover">`;
            } else {
                headerImage.innerHTML = `<div class="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-600"><i class="fas fa-utensils text-6xl text-gray-300"></i></div>`;
            }
            
            // Display image gallery (if more than 1 image) and gallery is enabled
            const galleryContainer = document.getElementById('restaurant-gallery-container');
            const galleryElement = document.getElementById('restaurant-gallery');
            
            // Fetch settings to check if gallery is enabled
            try {
                const settingsResponse = await fetch(`/api/restaurants/${restaurant.id}/settings`);
                const settings = settingsResponse.ok ? await settingsResponse.json() : {};
                
                // Show gallery only if enabled and there are multiple images
                if (settings.gallery_enabled !== false && images && images.length > 1) {
                    galleryElement.innerHTML = images
                        .sort((a, b) => a.display_order - b.display_order)
                        .map(img => `
                            <div class="relative cursor-pointer hover:opacity-80 transition rounded-lg overflow-hidden" onclick="document.getElementById('restaurant-header-image').innerHTML = '<img src=\\'${img.image_url}\\' alt=\\'${restaurant.name}\\' class=\\'w-full h-full object-cover\\'>'">
                                <img src="${img.image_url}" alt="${restaurant.name}" class="w-full h-20 md:h-24 object-cover">
                                ${img.is_primary ? '<div class="absolute top-1 left-1 bg-brown-600 text-white text-xs px-2 py-0.5 rounded-full">Primary</div>' : ''}
                            </div>
                        `).join('');
                    galleryContainer.classList.remove('hidden');
                } else {
                    galleryContainer.classList.add('hidden');
                }
            } catch (error) {
                console.error('Error loading gallery settings:', error);
                // Default behavior: show gallery if there are multiple images
                if (images && images.length > 1) {
                    galleryElement.innerHTML = images
                        .sort((a, b) => a.display_order - b.display_order)
                        .map(img => `
                            <div class="relative cursor-pointer hover:opacity-80 transition rounded-lg overflow-hidden" onclick="document.getElementById('restaurant-header-image').innerHTML = '<img src=\\'${img.image_url}\\' alt=\\'${restaurant.name}\\' class=\\'w-full h-full object-cover\\'>'">
                                <img src="${img.image_url}" alt="${restaurant.name}" class="w-full h-20 md:h-24 object-cover">
                                ${img.is_primary ? '<div class="absolute top-1 left-1 bg-brown-600 text-white text-xs px-2 py-0.5 rounded-full">Primary</div>' : ''}
                            </div>
                        `).join('');
                    galleryContainer.classList.remove('hidden');
                } else {
                    galleryContainer.classList.add('hidden');
                }
            }
            
            // Handle amenities - fetch from API
            const amenitiesSection = document.getElementById('amenities-section');
            const amenitiesGrid = document.getElementById('amenities-grid');
            
            try {
                const amenitiesResponse = await fetch(`/api/restaurants/${restaurant.id}/amenities`);
                const amenities = amenitiesResponse.ok ? await amenitiesResponse.json() : [];
                
                if (amenities.length > 0) {
                    const amenityIcons = {
                        'wifi': 'fa-wifi',
                        'parking': 'fa-parking',
                        'outdoor_seating': 'fa-tree',
                        'vegetarian': 'fa-leaf',
                        'halal': 'fa-certificate',
                        'delivery': 'fa-truck',
                        'takeout': 'fa-shopping-bag',
                        'reservation': 'fa-calendar-check',
                        'air_conditioning': 'fa-fan',
                        'live_music': 'fa-music',
                        'pet_friendly': 'fa-paw',
                        'wheelchair_accessible': 'fa-wheelchair'
                    };
                    
                    const amenityLabels = {
                        'wifi': 'WiFi',
                        'parking': 'Parking',
                        'outdoor_seating': 'Outdoor Seating',
                        'vegetarian': 'Vegetarian Options',
                        'halal': 'Halal',
                        'delivery': 'Delivery',
                        'takeout': 'Takeout',
                        'reservation': 'Reservations',
                        'air_conditioning': 'Air Conditioning',
                        'live_music': 'Live Music',
                        'pet_friendly': 'Pet Friendly',
                        'wheelchair_accessible': 'Wheelchair Accessible'
                    };
                    
                    amenitiesGrid.innerHTML = amenities.map(amenity => {
                        const icon = amenityIcons[amenity.amenity_type] || 'fa-check-circle';
                        const label = amenityLabels[amenity.amenity_type] || amenity.amenity_type;
                        return `<div class="amenity-badge">
                            <i class="fas ${icon}"></i>
                            <span>${label}</span>
                        </div>`;
                    }).join('');
                    amenitiesSection.classList.remove('hidden');
                } else {
                    amenitiesSection.classList.add('hidden');
                }
            } catch (error) {
                console.error('Error loading amenities:', error);
                amenitiesSection.classList.add('hidden');
            }
            
            // Handle restaurant video - check if enabled
            const videoContainer = document.getElementById('restaurant-video-container');
            const videoElement = document.getElementById('restaurant-video');
            
            try {
                const settingsResponse = await fetch(`/api/restaurants/${restaurant.id}/settings`);
                const settings = settingsResponse.ok ? await settingsResponse.json() : {};
                
                if (restaurant.video_url && settings.video_enabled !== false) {
                    videoElement.src = restaurant.video_url;
                    videoContainer.classList.remove('hidden');
                } else {
                    videoContainer.classList.add('hidden');
                }
                
                // Hide reviews section if reviews are disabled
                const reviewsSection = document.querySelector('#reviews-list').closest('.bg-white');
                if (settings.reviews_enabled === false) {
                    if (reviewsSection) reviewsSection.classList.add('hidden');
                }
            } catch (error) {
                console.error('Error loading settings:', error);
                if (restaurant.video_url) {
                    videoElement.src = restaurant.video_url;
                    videoContainer.classList.remove('hidden');
                } else {
                    videoContainer.classList.add('hidden');
                }
            }
            
            // Populate menu with categories
            const menuContainer = document.getElementById('restaurant-menu');
            const noMenuMessage = document.getElementById('no-menu-message');
            const menuCategoriesContainer = document.getElementById('menu-categories');
            
            if (menuItems && menuItems.length > 0) {
                // Get unique categories
                const categories = [...new Set(menuItems.map(item => item.category))].filter(Boolean);
                let currentCategory = 'All';
                
                // Render category tabs
                if (categories.length > 0) {
                    menuCategoriesContainer.innerHTML = `
                        <button class="menu-category-tab active" data-category="All">All</button>
                        ${categories.map(cat => 
                            `<button class="menu-category-tab" data-category="${cat}">${cat}</button>`
                        ).join('')}
                    `;
                    
                    // Add click handlers for category tabs
                    menuCategoriesContainer.querySelectorAll('.menu-category-tab').forEach(tab => {
                        tab.addEventListener('click', function() {
                            menuCategoriesContainer.querySelectorAll('.menu-category-tab').forEach(t => t.classList.remove('active'));
                            this.classList.add('active');
                            currentCategory = this.dataset.category;
                            renderMenuItems(menuItems, currentCategory);
                        });
                    });
                }
                
                // Initial render
                renderMenuItems(menuItems, currentCategory);
                noMenuMessage.classList.add('hidden');
            } else {
                menuContainer.innerHTML = '';
                menuCategoriesContainer.innerHTML = '';
                noMenuMessage.classList.remove('hidden');
            }
            
            // Render reviews
            renderReviews(restaurant.id);
            
            // Show modal
            detailsModal.classList.remove('hidden');
            
        } catch (error) {
            console.error('Error loading restaurant details:', error);
            showNotification('Error loading restaurant details', 'error');
        }
    }
    
    // Helper function to render menu items
    function renderMenuItems(menuItems, category) {
        const menuContainer = document.getElementById('restaurant-menu');
        const filteredItems = category === 'All' ? menuItems : menuItems.filter(item => item.category === category);
        
        menuContainer.innerHTML = filteredItems.map(item => `
            <div class="menu-item-card">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-900 text-sm md:text-base mb-1">${item.name}</h4>
                        ${item.category ? `<span class="menu-item-badge">${item.category}</span>` : ''}
                    </div>
                    <span class="text-gray-700 font-bold text-sm md:text-base ml-2">RWF ${parseFloat(item.price).toLocaleString()}</span>
                </div>
                ${item.description ? `<p class="text-gray-600 text-xs md:text-sm mt-2">${item.description}</p>` : ''}
            </div>
        `).join('');
    }
    
    // Helper function to render reviews
    async function renderReviews(restaurantId) {
        const reviewsList = document.getElementById('reviews-list');
        const noReviewsMessage = document.getElementById('no-reviews-message');
        const reviewSummary = document.getElementById('review-summary');
        const reviewsSection = reviewsList.closest('.bg-white');
        
        try {
            // Check if reviews are enabled
            const settingsResponse = await fetch(`/api/restaurants/${restaurantId}/settings`);
            const settings = settingsResponse.ok ? await settingsResponse.json() : {};
            
            if (settings.reviews_enabled === false) {
                if (reviewsSection) reviewsSection.classList.add('hidden');
                return;
            }
            
            // Fetch approved and visible reviews only
            const response = await fetch(`/api/restaurants/${restaurantId}/reviews`);
            
            if (!response.ok) {
                // If endpoint returns error, hide reviews section
                if (reviewsSection) reviewsSection.classList.add('hidden');
                return;
            }
            
            const reviews = await response.json();
            
            if (reviews && reviews.length > 0) {
                const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
                reviewSummary.textContent = `${avgRating} (${reviews.length} review${reviews.length > 1 ? 's' : ''})`;
                
                reviewsList.innerHTML = reviews.slice(0, 5).map(review => `
                    <div class="review-card">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h4 class="font-semibold text-gray-900 text-sm md:text-base">${review.customer_name || 'Anonymous'}</h4>
                                <div class="review-rating">
                                    ${Array.from({length: 5}, (_, i) => 
                                        `<i class="fas fa-star ${i < review.rating ? 'star-filled' : 'star-empty'} text-sm"></i>`
                                    ).join('')}
                                </div>
                            </div>
                            <span class="text-xs text-gray-500">${new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        ${review.comment ? `<p class="text-gray-700 text-xs md:text-sm">${review.comment}</p>` : ''}
                    </div>
                `).join('');
                
                noReviewsMessage.classList.add('hidden');
                if (reviewsSection) reviewsSection.classList.remove('hidden');
            } else {
                reviewsList.innerHTML = '';
                noReviewsMessage.classList.remove('hidden');
                reviewSummary.textContent = '(0 reviews)';
                // Show section even with no reviews to allow customers to add the first review
                if (reviewsSection) reviewsSection.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            // On error, hide the reviews section
            if (reviewsSection) reviewsSection.classList.add('hidden');
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
        
        // Check if selected date is in the past
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showSuccess('Error', 'Cannot make reservations for past dates. Please select a current or future date.', false);
            document.getElementById('reservation-date').value = '';
            return;
        }
        
        fetch(`/api/restaurants/${selectedRestaurantId}/availability?date=${date}`)
            .then(response => response.json())
            .then(availability => {
                const timeSelect = document.getElementById('reservation-time');
                timeSelect.innerHTML = '<option value="">Select time</option>';
                
                const now = new Date();
                const isToday = selectedDate.toDateString() === now.toDateString();
                const twoHoursLater = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now

                if (Array.isArray(availability) && availability.length > 0) {
                    availability.forEach(slot => {
                        const timeString = slot.time_slot;
                        const displayTime = formatTime(timeString);
                        let isAvailable = slot.available_tables > 0;
                        
                        // If today, check if time is at least 2 hours in advance
                        if (isToday) {
                            const [hours, minutes] = timeString.split(':');
                            const slotTime = new Date();
                            slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                            
                            if (slotTime <= twoHoursLater) {
                                isAvailable = false;
                            }
                        }
                        
                        const option = document.createElement('option');
                        option.value = timeString;
                        option.textContent = `${displayTime} ${isAvailable ? `(${slot.available_tables} tables available)` : isToday && slot.available_tables > 0 ? '(Must book 2h in advance)' : '(Fully booked)'}`;
                        option.disabled = !isAvailable;
                        timeSelect.appendChild(option);
                    });
                } else {
                    // Fallback to default business hours if no availability returned
                    for (let hour = 10; hour <= 22; hour++) {
                        for (let minute = 0; minute < 60; minute += 30) {
                            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
                            const displayTime = formatTime(timeString);
                            const option = document.createElement('option');
                            option.value = timeString;
                            option.textContent = `${displayTime} (Fully booked)`;
                            option.disabled = true;
                            timeSelect.appendChild(option);
                        }
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
        
        // Validate that date and time are not in the past
        const selectedDate = new Date(reservation_date);
        const [hours, minutes] = reservation_time.split(':');
        const reservationDateTime = new Date(reservation_date);
        reservationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const now = new Date();
        
        if (reservationDateTime <= now) {
            showSuccess('Error', 'Cannot make reservations for past dates or times. Please select a future date and time.', false);
            return;
        }
        
        // Check if booking for today and require 2-hour advance
        const isToday = selectedDate.toDateString() === now.toDateString();
        const twoHoursLater = new Date(now.getTime() + (2 * 60 * 60 * 1000));
        
        if (isToday && reservationDateTime < twoHoursLater) {
            showSuccess('Error', 'Same-day reservations must be made at least 2 hours in advance. Please select a later time or a different date.', false);
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
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('edit-reservation-date').min = today;
        
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
                    
                    // Store restaurant ID for reloading time slots
                    document.getElementById('edit-reservation-date').dataset.restaurantId = reservation.restaurant_id;
                    
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
        // Check if selected date is in the past
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showSuccess('Error', 'Cannot modify reservation to a past date. Please select a current or future date.', false);
            return;
        }
        
        fetch(`/api/restaurants/${restaurantId}/availability?date=${date}`)
            .then(response => response.json())
            .then(availability => {
                const timeSelect = document.getElementById('edit-reservation-time');
                timeSelect.innerHTML = '<option value="">Select time</option>';
                
                const now = new Date();
                const isToday = selectedDate.toDateString() === now.toDateString();
                const twoHoursLater = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
                
                for (let hour = 10; hour <= 22; hour++) {
                    for (let minute = 0; minute < 60; minute += 30) {
                        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
                        const displayTime = formatTime(timeString);
                        
                        const availableSlot = availability.find(slot => slot.time_slot === timeString);
                        let isAvailable = availableSlot && availableSlot.available_tables > 0;
                        const isCurrentTime = timeString === currentTime;
                        
                        // If today, check if time is at least 2 hours in advance (unless it's the current reservation time)
                        if (isToday && !isCurrentTime) {
                            const [hours, minutes] = timeString.split(':');
                            const slotTime = new Date();
                            slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                            
                            if (slotTime <= twoHoursLater) {
                                isAvailable = false;
                            }
                        }
                        
                        const option = document.createElement('option');
                        option.value = timeString;
                        option.textContent = `${displayTime} ${isAvailable ? `(${availableSlot.available_tables} tables available)` : isCurrentTime ? '(Current reservation)' : isToday && availableSlot && availableSlot.available_tables > 0 ? '(Must book 2h in advance)' : '(Fully booked)'}`;
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
        
        const reservation_date = document.getElementById('edit-reservation-date').value;
        const reservation_time = document.getElementById('edit-reservation-time').value;
        
        // Validate that date and time are not in the past
        const selectedDate = new Date(reservation_date);
        const [hours, minutes] = reservation_time.split(':');
        const reservationDateTime = new Date(reservation_date);
        reservationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const now = new Date();
        
        if (reservationDateTime <= now) {
            showSuccess('Error', 'Cannot update reservation to a past date or time. Please select a future date and time.', false);
            return;
        }
        
        // Check if booking for today and require 2-hour advance
        const isToday = selectedDate.toDateString() === now.toDateString();
        const twoHoursLater = new Date(now.getTime() + (2 * 60 * 60 * 1000));
        
        if (isToday && reservationDateTime < twoHoursLater) {
            showSuccess('Error', 'Same-day reservations must be made at least 2 hours in advance. Please select a later time or a different date.', false);
            return;
        }
        
        const formData = {
            reservation_date: reservation_date,
            reservation_time: reservation_time,
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
                    <i class="fas fa-calendar-times text-5xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl text-gray-500">No ${type} reservations</h3>
                </div>
            `;
            return;
        }
        
        container.innerHTML = reservations.map(reservation => `
            <div class="bg-white border border-gray-200 rounded-lg p-6 mb-4">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="text-lg font-semibold text-gray-900">${reservation.restaurant_name}</h4>
                        <p class="text-gray-600">${reservation.restaurant_location}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm ${getStatusClass(reservation.status)}">
                        ${getStatusText(reservation.status)}
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-gray-700"><i class="fas fa-calendar mr-2"></i>${formatDate(reservation.reservation_date)}</p>
                        <p class="text-gray-700"><i class="fas fa-clock mr-2"></i>${formatTime(reservation.reservation_time)}</p>
                    </div>
                    <div>
                        <p class="text-gray-700"><i class="fas fa-users mr-2"></i>${reservation.party_size} people</p>
                        <p class="text-gray-700"><i class="fas fa-phone mr-2"></i>${reservation.restaurant_phone}</p>
                    </div>
                </div>
                
                ${reservation.occasion ? `<p class="text-gray-600 mb-2"><i class="fas fa-gift mr-2"></i>${reservation.occasion}</p>` : ''}
                ${reservation.special_requests ? `<p class="text-gray-600 mb-4"><i class="fas fa-sticky-note mr-2"></i>${reservation.special_requests}</p>` : ''}
                
                ${type === 'upcoming' && reservation.status === 'confirmed' ? `
                    <div class="flex justify-end space-x-2">
                        <button class="edit-reservation-btn bg-brown-600 text-white px-4 py-2 rounded-lg hover:bg-brown-700 transition" data-id="${reservation.id}">
                            <i class="fas fa-edit mr-2"></i>Modify
                        </button>
                    </div>
                ` : ''}
                
                ${type === 'past' && reservation.status === 'confirmed' && !reservation.has_review ? `
                    <div class="flex justify-end space-x-2">
                        <button class="write-review-btn bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition" 
                                data-reservation-id="${reservation.id}" 
                                data-restaurant-id="${reservation.restaurant_id}"
                                data-restaurant-name="${reservation.restaurant_name}">
                            <i class="fas fa-star mr-2"></i>Write Review
                        </button>
                    </div>
                ` : ''}
                
                ${type === 'past' && reservation.has_review ? `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                        <p class="text-sm text-green-800"><i class="fas fa-check-circle mr-1"></i>You have already reviewed this restaurant</p>
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
        
        // Attach event listeners to review buttons
        document.querySelectorAll('.write-review-btn').forEach(button => {
            button.addEventListener('click', function() {
                const reservationId = this.getAttribute('data-reservation-id');
                const restaurantId = this.getAttribute('data-restaurant-id');
                const restaurantName = this.getAttribute('data-restaurant-name');
                openReviewModal(reservationId, restaurantId, restaurantName);
            });
        });
    }
    
    function switchReservationTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.reservation-tab').forEach(tab => {
            tab.classList.remove('border-brown-600', 'text-gray-900');
            tab.classList.add('border-transparent', 'text-gray-500');
        });
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('border-brown-600', 'text-gray-900');
        document.querySelector(`[data-tab="${tabName}"]`).classList.remove('border-transparent', 'text-gray-500');
        
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
                    <i class="fas fa-bell-slash text-5xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl text-gray-500">No notifications</h3>
                </div>
            `;
            return;
        }
        
        container.innerHTML = notifications.map(notification => `
            <div class="border-l-4 ${notification.is_read ? 'border-brown-300' : 'border-brown-600'} p-4 mb-4 bg-brown-50">
                <h4 class="font-bold text-gray-900">${notification.title}</h4>
                <p class="text-gray-600 mt-1">${notification.message}</p>
                <div class="text-xs text-gray-400 mt-2">${formatDateTime(notification.created_at)}</div>
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
        document.getElementById('success-title').className = `text-xl font-bold mb-2 ${isSuccess ? 'text-gray-900' : 'text-red-600'}`;
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

    // User authentication functions
    async function logoutUser() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            currentUser = null;
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/login';
        }
    }

    // Profile navigation functions
    function navigateToProfile() {
        window.location.href = '/profile';
    }

    function navigateToHome() {
        window.location.href = '/';
    }

    // Google Maps variables
    let map = null;
    let directionsService = null;
    let directionsRenderer = null;
    let currentRestaurantLocation = null;
    let userLocation = null;

    // Initialize Google Maps for restaurant
    function initializeRestaurantMap(restaurant) {
        const mapContainer = document.getElementById('restaurant-map');
        const getDirectionsBtn = document.getElementById('get-directions-btn');
        const mapInfo = document.getElementById('map-info');
        const distanceInfo = document.getElementById('distance-info');
        
        // Default location (Kigali center) if no coordinates
        let restaurantLat = -1.9441;
        let restaurantLng = 30.0619;
        
        // Try to get coordinates from restaurant data
        if (restaurant.latitude && restaurant.longitude) {
            restaurantLat = parseFloat(restaurant.latitude);
            restaurantLng = parseFloat(restaurant.longitude);
        }
        
        currentRestaurantLocation = { lat: restaurantLat, lng: restaurantLng };
        
        // Initialize map
        map = new google.maps.Map(mapContainer, {
            center: currentRestaurantLocation,
            zoom: 15,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "on" }]
                }
            ]
        });
        
        // Add restaurant marker
        const restaurantMarker = new google.maps.Marker({
            position: currentRestaurantLocation,
            map: map,
            title: restaurant.name,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="%23977669" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
                ),
                scaledSize: new google.maps.Size(40, 40)
            },
            animation: google.maps.Animation.DROP
        });
        
        // Add info window for restaurant
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 8px; max-width: 200px;">
                    <h3 style="font-weight: bold; margin-bottom: 4px; color: #977669;">${restaurant.name}</h3>
                    <p style="font-size: 12px; color: #666; margin-bottom: 4px;">
                        <i class="fas fa-map-marker-alt" style="color: #977669;"></i> ${restaurant.location || 'Kigali, Rwanda'}
                    </p>
                    ${restaurant.contact_phone ? `<p style="font-size: 12px; color: #666;">
                        <i class="fas fa-phone" style="color: #977669;"></i> ${restaurant.contact_phone}
                    </p>` : ''}
                </div>
            `
        });
        
        restaurantMarker.addListener('click', () => {
            infoWindow.open(map, restaurantMarker);
        });
        
        // Initialize directions service and renderer
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: false,
            polylineOptions: {
                strokeColor: '#977669',
                strokeWeight: 5,
                strokeOpacity: 0.8
            }
        });
        
        // Get user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    // Calculate distance
                    const distance = google.maps.geometry.spherical.computeDistanceBetween(
                        new google.maps.LatLng(userLocation.lat, userLocation.lng),
                        new google.maps.LatLng(currentRestaurantLocation.lat, currentRestaurantLocation.lng)
                    );
                    
                    const distanceKm = (distance / 1000).toFixed(1);
                    distanceInfo.textContent = `Distance from your location: ${distanceKm} km`;
                    mapInfo.classList.remove('hidden');
                    
                    // Add user location marker
                    new google.maps.Marker({
                        position: userLocation,
                        map: map,
                        title: 'Your Location',
                        icon: {
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="%234285F4" stroke="white" stroke-width="3"/></svg>'
                            ),
                            scaledSize: new google.maps.Size(30, 30)
                        }
                    });
                },
                (error) => {
                    console.log('Geolocation error:', error);
                    getDirectionsBtn.innerHTML = '<i class="fas fa-directions mr-1"></i>Enable Location';
                }
            );
        }
        
        // Get Directions button handler
        getDirectionsBtn.onclick = () => {
            if (!userLocation) {
                if (navigator.geolocation) {
                    getDirectionsBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Getting Location...';
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            userLocation = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };
                            getDirectionsBtn.innerHTML = '<i class="fas fa-directions mr-1"></i>Get Directions';
                            showDirections();
                        },
                        (error) => {
                            alert('Please enable location access to get directions');
                            getDirectionsBtn.innerHTML = '<i class="fas fa-directions mr-1"></i>Enable Location';
                        }
                    );
                } else {
                    alert('Geolocation is not supported by your browser');
                }
            } else {
                showDirections();
            }
        };
    }
    
    // Show directions on map
    function showDirections() {
        if (!userLocation || !currentRestaurantLocation || !directionsService) {
            alert('Unable to calculate directions');
            return;
        }
        
        const request = {
            origin: userLocation,
            destination: currentRestaurantLocation,
            travelMode: google.maps.TravelMode.DRIVING
        };
        
        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
                
                // Update distance and duration info
                const route = result.routes[0].legs[0];
                const distanceInfo = document.getElementById('distance-info');
                distanceInfo.innerHTML = `
                    <strong>Distance:</strong> ${route.distance.text} | 
                    <strong>Duration:</strong> ${route.duration.text}
                `;
                document.getElementById('map-info').classList.remove('hidden');
                
                // Change button text
                document.getElementById('get-directions-btn').innerHTML = '<i class="fas fa-times mr-1"></i>Clear Route';
                document.getElementById('get-directions-btn').onclick = clearDirections;
            } else {
                alert('Could not calculate directions: ' + status);
            }
        });
    }
    
    // Clear directions from map
    function clearDirections() {
        if (directionsRenderer) {
            directionsRenderer.setDirections({ routes: [] });
        }
        
        // Reset map view to restaurant
        if (map && currentRestaurantLocation) {
            map.setCenter(currentRestaurantLocation);
            map.setZoom(15);
        }
        
        // Reset button
        const getDirectionsBtn = document.getElementById('get-directions-btn');
        getDirectionsBtn.innerHTML = '<i class="fas fa-directions mr-1"></i>Get Directions';
        getDirectionsBtn.onclick = () => {
            showDirections();
        };
        
        // Update distance info to show straight-line distance
        if (userLocation && currentRestaurantLocation) {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(userLocation.lat, userLocation.lng),
                new google.maps.LatLng(currentRestaurantLocation.lat, currentRestaurantLocation.lng)
            );
            const distanceKm = (distance / 1000).toFixed(1);
            document.getElementById('distance-info').textContent = `Distance from your location: ${distanceKm} km`;
        }
    }

    // Toggle favorite function
    window.toggleFavorite = function(event, restaurantId) {
        event.stopPropagation();
        event.preventDefault();
        
        const btn = event.currentTarget;
        const id = restaurantId.toString();
        
        if (favorites.includes(id)) {
            favorites = favorites.filter(fav => fav !== id);
            btn.classList.remove('active');
        } else {
            favorites.push(id);
            btn.classList.add('active');
            // Add bounce animation
            btn.style.animation = 'heartBounce 0.4s ease';
            setTimeout(() => {
                btn.style.animation = '';
            }, 400);
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesCount();
    };
    
    // Update favorites count
    // Toggle favorite function
    window.toggleFavorite = function(event, restaurantId) {
        event.stopPropagation();
        event.preventDefault();
        
        const btn = event.currentTarget;
        const id = restaurantId.toString();
        
        if (favorites.includes(id)) {
            favorites = favorites.filter(fav => fav !== id);
            btn.classList.remove('active');
        } else {
            favorites.push(id);
            btn.classList.add('active');
            // Add bounce animation
            btn.style.animation = 'heartBounce 0.4s ease';
            setTimeout(() => {
                btn.style.animation = '';
            }, 400);
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesCount();
        
        // Refresh home page to show/hide favorited restaurants
        loadFeaturedRestaurants();
    };
    
    function updateFavoritesCount() {
        const count = favorites.length;
        const badge = document.getElementById('favorites-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    // Initialize favorites count
    updateFavoritesCount();

    // ===== REVIEW SYSTEM FUNCTIONS =====
    
    let selectedRating = 0;
    
    function setupStarRating() {
        const stars = document.querySelectorAll('.star-rating');
        const ratingInput = document.getElementById('review-rating');
        const ratingText = document.getElementById('rating-text');
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                selectedRating = parseInt(this.getAttribute('data-rating'));
                ratingInput.value = selectedRating;
                updateStarDisplay(selectedRating);
                updateRatingText(selectedRating);
            });
            
            star.addEventListener('mouseenter', function() {
                const hoverRating = parseInt(this.getAttribute('data-rating'));
                updateStarDisplay(hoverRating);
            });
        });
        
        document.getElementById('star-rating').addEventListener('mouseleave', function() {
            updateStarDisplay(selectedRating);
        });
    }
    
    function updateStarDisplay(rating) {
        const stars = document.querySelectorAll('.star-rating');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('text-gray-300');
                star.classList.add('text-yellow-400');
            } else {
                star.classList.remove('text-yellow-400');
                star.classList.add('text-gray-300');
            }
        });
    }
    
    function updateRatingText(rating) {
        const ratingText = document.getElementById('rating-text');
        const texts = {
            1: 'Poor',
            2: 'Fair',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent'
        };
        ratingText.textContent = texts[rating] || '';
    }
    
    function openReviewModal(reservationId, restaurantId, restaurantName) {
        const reviewModal = document.getElementById('review-modal');
        
        // Reset form
        document.getElementById('review-form').reset();
        selectedRating = 0;
        updateStarDisplay(0);
        updateRatingText(0);
        
        // Set data
        document.getElementById('review-reservation-id').value = reservationId;
        document.getElementById('review-restaurant-id').value = restaurantId;
        document.getElementById('review-restaurant-name').textContent = restaurantName;
        
        // Show modal
        reviewModal.classList.remove('hidden');
    }
    
    async function submitReview(e) {
        e.preventDefault();
        
        const restaurantId = document.getElementById('review-restaurant-id').value;
        const rating = document.getElementById('review-rating').value;
        const comment = document.getElementById('review-comment').value.trim();
        
        if (!rating || rating < 1 || rating > 5) {
            showSuccess('Error', 'Please select a rating', false);
            return;
        }
        
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rating: parseInt(rating),
                    comment: comment
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                document.getElementById('review-modal').classList.add('hidden');
                showSuccess('Review Submitted!', 'Your review has been submitted and will be visible after admin approval. Thank you for your feedback!', true);
                
                // Reload past reservations to update the UI
                loadReservations('past');
            } else {
                showSuccess('Error', data.error || 'Failed to submit review', false);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            showSuccess('Error', 'Failed to submit review. Please try again.', false);
        }
    }

    // Make functions globally available for profile page navigation
    window.goToProfile = navigateToProfile;
    window.goToHome = navigateToHome;
    window.logoutUser = logoutUser;
});
