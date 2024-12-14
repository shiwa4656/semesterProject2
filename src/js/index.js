// src/js/index.js

import { getListings, placeBid } from './api/listings.js';
import { createListingCard } from './utils/listingRenderer.js';


// Carousel state
let currentSlide = 0;
let totalSlides = 0;

function logout() {
    localStorage.clear();
    window.location.reload();
}
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    const mobileMenuContent = document.getElementById('mobileMenuContent');
    
    // Keep your existing desktop nav logic
    if (user) {
        guestNav?.classList.add('hidden');
        userNav?.classList.remove('hidden');
        
        // Update user info (keep your existing code)
        document.getElementById('userCredits').textContent = user.credits || 1000;
        const userAvatar = document.getElementById('userAvatar');
        const profileLink = document.getElementById('profileLink');
        
        if (userAvatar && profileLink) {
            userAvatar.src = user.avatar?.url || 'https://via.placeholder.com/40';
            userAvatar.alt = `${user.name}'s profile`;
            profileLink.href = `/src/pages/profile.html?name=${user.name}`;
        }

        // Update only mobile menu content
        if (mobileMenuContent) {
            mobileMenuContent.innerHTML = `
                <div class="mb-6">
                    <div class="flex items-center gap-3 mb-2">
                        <img src="${user.avatar?.url || 'https://via.placeholder.com/40'}" 
                             alt="Profile" 
                             class="w-10 h-10 rounded-full">
                        <span class="text-white">${user.name}</span>
                    </div>
                    <div class="text-gray-400">
                        Credits: ${user.credits || 1000}
                    </div>
                </div>
                <div class="space-y-4">
                    <a href="/src/pages/bids.html" class="block text-orange-500">Bids</a>
                    <a href="/src/pages/create.html" class="block text-orange-500">Create</a>
                    <a href="/src/pages/profile.html?name=${user.name}" class="block text-orange-500">Profile</a>
                    <button id="mobileLogoutBtn" class="block w-full text-left text-orange-500">Logout</button>
                </div>
            `;
        }
    } else {
        guestNav?.classList.remove('hidden');
        userNav?.classList.add('hidden');

        // Update only mobile menu content
        if (mobileMenuContent) {
            mobileMenuContent.innerHTML = `
                <div class="space-y-4">
                    <a href="/src/pages/bids.html" class="block text-orange-500">Bids</a>
                    <a href="/src/pages/login.html" class="block text-orange-500">Log in</a>
                    <a href="/src/pages/register.html" class="block text-orange-500">Get Started</a>
                </div>
            `;
        }
    }
}

function updateCarousel() {
    const carousel = document.getElementById('carousel');
    const slideWidth = carousel.firstElementChild?.offsetWidth || 0;
    carousel.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
}

function nextSlide() {
    if (totalSlides <= 1) return;
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

function prevSlide() {
    if (totalSlides <= 1) return;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
}

async function loadListings(filters = {}) {
    try {
        const listings = await getListings();
        console.log("Fetched listings:", listings);

        // Populate ending soon carousel
        const endingSoon = [...listings]
            .sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt))
            .slice(0, 3);

        const carousel = document.getElementById('carousel');
        carousel.innerHTML = endingSoon.map(listing => `
            <div class="w-full flex-shrink-0 px-4">
                <div class="bg-cardBg rounded-lg overflow-hidden">
                    <img src="${listing.media[0]?.url || 'https://via.placeholder.com/800/400'}" 
                         alt="${listing.title}"
                         class="w-full h-64 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-white mb-2">${listing.title}</h3>
                        <p class="text-gray-300 mb-4 line-clamp-2">${listing.description}</p>
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="text-primary">Highest bid</p>
                                <p class="text-xl font-bold text-white">${Math.max(0, ...listing.bids.map(b => b.amount))} credits</p>
                            </div>
                            <a href="/src/pages/listing-detail.html?id=${listing.id}" 
                               class="bg-primary text-dark px-6 py-2 rounded-full hover:bg-secondary transition-colors">
                                View Details
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        totalSlides = endingSoon.length;
        
        // Filter and sort listings for grid
        let gridListings = [...listings];
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            gridListings = gridListings.filter(listing =>
                listing.title?.toLowerCase().includes(searchTerm) || 
                listing.description?.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filters.sort === 'newest') {
            gridListings.sort((a, b) => new Date(b.created) - new Date(a.created));
        } else if (filters.sort === 'oldest') {
            gridListings.sort((a, b) => new Date(a.created) - new Date(b.created));
        }

        // Take only the first 12 listings for the grid
        gridListings = gridListings.slice(0, 12);

        const listingsGrid = document.getElementById('listingsGrid');
        if (gridListings.length === 0) {
            listingsGrid.innerHTML = '<div class="col-span-3 text-center text-white">No listings found</div>';
            return;
        }

        listingsGrid.innerHTML = gridListings.map(listing => createListingCard(listing)).join('');

    } catch (error) {
        console.error('Error loading listings:', error);
        document.getElementById('listingsGrid').innerHTML = 
            '<div class="col-span-3 text-center text-red-500">Failed to load listings. Error: ' + error.message + '</div>';
    }
}

// Event Handlers
async function handleSearch(e) {
    const searchTerm = e.target.value;
    loadListings({ search: searchTerm });
}

function handleSort(sortType) {
    loadListings({ sort: sortType });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadListings();
    
    // Add logout handler
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('mobileLogoutBtn')?.addEventListener('click', logout);

    // Mobile menu handlers
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
        const mobileMenu = document.getElementById('mobileMenu');
        const menuPanel = mobileMenu.querySelector('.transform');
        mobileMenu.classList.remove('hidden');
        setTimeout(() => {
            menuPanel.classList.add('translate-x-0');
        }, 10);
    });

    document.getElementById('closeMobileMenu')?.addEventListener('click', () => {
        const mobileMenu = document.getElementById('mobileMenu');
        const menuPanel = mobileMenu.querySelector('.transform');
        menuPanel.classList.remove('translate-x-0');
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
        }, 300);
    });

    // Carousel controls
    document.getElementById('prevBtn')?.addEventListener('click', prevSlide);
    document.getElementById('nextBtn')?.addEventListener('click', nextSlide);
    setInterval(nextSlide, 5000); // Auto-advance every 5 seconds

    // Search handler
    const searchInput = document.querySelector('input[type="search"]');
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => handleSearch(e), 300); // Debounce search
    });

    // Filter handlers
    const filterButtons = document.querySelectorAll('.flex button');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const sortType = e.target.textContent.toLowerCase();
            handleSort(sortType);
        });
    });
});

