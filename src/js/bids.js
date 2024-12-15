import { getListings, placeBid } from './api/listings.js';
import { createListingCard } from './utils/listingRenderer.js';

let currentPage = 1;
const itemsPerPage = 12;

function logout() {
    localStorage.clear();
    checkAuth();
}

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    const mobileMenuContent = document.getElementById('mobileMenuContent');
    
    // Desktop navigation
    if (user) {
        guestNav?.classList.add('hidden');
        userNav?.classList.remove('hidden');
        
        // Update user info
        document.getElementById('userCredits').textContent = user.credits || 1000;
        const userAvatar = document.getElementById('userAvatar');
        const profileLink = document.getElementById('profileLink');
        
        if (userAvatar && profileLink) {
            userAvatar.src = user.avatar?.url || 'https://via.placeholder.com/40';
            userAvatar.alt = `${user.name}'s profile`;
            profileLink.href = `/src/pages/profile.html?name=${user.name}`;
        }

        // Update mobile menu content for logged-in user
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
                    <a href="../../index.html" class="block text-orange-500">Home</a>
                    <a href="/src/pages/create.html" class="block text-orange-500">Create</a>
                    <a href="/src/pages/profile.html?name=${user.name}" class="block text-orange-500">Profile</a>
                    <button id="mobileLogoutBtn" class="block w-full text-left text-orange-500">Logout</button>
                </div>
            `;
            
            // Add event listener for mobile logout
            document.getElementById('mobileLogoutBtn')?.addEventListener('click', logout);
        }
    } else {
        guestNav?.classList.remove('hidden');
        userNav?.classList.add('hidden');

        // Update mobile menu content for guest
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

async function loadListings(filters = {}) {
    try {
        const listingsGrid = document.getElementById('listingsGrid');
        listingsGrid.innerHTML = '<div class="col-span-3 text-center text-white">Loading...</div>';

        let listings = await getListings();
        
        // Apply search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            listings = listings.filter(listing =>
                (listing.title?.toLowerCase().includes(searchTerm) || 
                 listing.description?.toLowerCase().includes(searchTerm))
            );
        }

        // Apply sort
        if (filters.sort === 'newest') {
            listings.sort((a, b) => new Date(b.created) - new Date(a.created));
        } else if (filters.sort === 'oldest') {
            listings.sort((a, b) => new Date(a.created) - new Date(b.created));
        }

        if (!listings || listings.length === 0) {
            listingsGrid.innerHTML = '<div class="col-span-3 text-center text-white">No listings found</div>';
            return;
        }

        // Pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedListings = listings.slice(startIndex, endIndex);

        listingsGrid.innerHTML = paginatedListings.map(listing => createListingCard(listing)).join('');

        // Generate pagination
        const totalPages = Math.ceil(listings.length / itemsPerPage);
        generatePaginationButtons(totalPages);
    } catch (error) {
        console.error('Error loading listings:', error);
        listingsGrid.innerHTML = 
            '<div class="col-span-3 text-center text-red-500">Failed to load listings. Error: ' + error.message + '</div>';
    }
}

function generatePaginationButtons(totalPages) {
    const existingPagination = document.getElementById('paginationContainer');
    if (existingPagination) {
        existingPagination.remove();
    }

    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'paginationContainer';
    paginationContainer.classList.add('flex', 'justify-center', 'mt-8', 'space-x-2');

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('px-4', 'py-2', 'bg-primary', 'text-dark', 'rounded-md', 'transition-colors', 'duration-200');

        if (i === currentPage) {
            button.classList.add('bg-secondary', 'text-black', 'border-2', 'border-dark', 'shadow-lg');
        }

        button.addEventListener('click', () => {
            currentPage = i;
            loadListings();
        });

        paginationContainer.appendChild(button);
    }

    document.getElementById('listingsGrid').insertAdjacentElement('afterend', paginationContainer);
}

// Event Handlers
function handleSearch(e) {
    currentPage = 1; // Reset to first page on new search
    const searchTerm = e.target.value;
    loadListings({ search: searchTerm });
}

function handleSort(sortType) {
    currentPage = 1; // Reset to first page on new sort
    loadListings({ sort: sortType });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadListings();
    
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

    // Add logout handler
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    // Add search handler with debounce
    const searchInput = document.querySelector('input[type="search"]');
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => handleSearch(e), 300);
    });

    // Add filter handlers
    const filterButtons = document.querySelectorAll('.flex button');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const sortType = e.target.textContent.toLowerCase();
            handleSort(sortType);
        });
    });
});

// Global bid handler
window.placeBid = async (listingId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Please log in to place a bid');
        return;
    }

    const amount = prompt('Enter your bid amount:');
    if (!amount) return;

    try {
        await placeBid(listingId, Number(amount));
        alert('Bid placed successfully!');
        loadListings();
    } catch (error) {
        alert(error.message || 'Failed to place bid');
    }
};