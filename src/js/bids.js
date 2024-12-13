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
    
    if (user) {
        // Show user navigation
        guestNav.classList.add('hidden');
        userNav.classList.remove('hidden');
        
        // Update user info
        document.getElementById('userCredits').textContent = user.credits || 1000;
        const userAvatar = document.getElementById('userAvatar');
        const profileLink = document.getElementById('profileLink');
        
        if (userAvatar && profileLink) {
            userAvatar.src = user.avatar?.url || 'https://via.placeholder.com/40';
            userAvatar.alt = `${user.name}'s profile`;
            // Set the correct profile link
            profileLink.href = `/src/pages/profile.html?name=${user.name}`;
        }
    } else {
        // Show guest navigation
        guestNav.classList.remove('hidden');
        userNav.classList.add('hidden');
    }
}

async function loadListings(filters = {}) {
    try {
        const listingsGrid = document.getElementById('listingsGrid');
        listingsGrid.innerHTML = '<div class="col-span-3 text-center text-white">Loading...</div>';

        let listings = await getListings();
        console.log("Fetched listings:", listings);

        // Apply search filter if exists
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

        const listingsHTML = paginatedListings.map(listing => createListingCard(listing)).join('');
        listingsGrid.innerHTML = listingsHTML;

        // Generate pagination buttons
        const totalPages = Math.ceil(listings.length / itemsPerPage);
        generatePaginationButtons(totalPages);
    } catch (error) {
        console.error('Error loading listings:', error);
        document.getElementById('listingsGrid').innerHTML = 
            '<div class="col-span-3 text-center text-red-500">Failed to load listings. Error: ' + error.message + '</div>';
    }
}
function generatePaginationButtons(totalPages) {
    // Get the existing pagination container (if any) and remove it
    const existingPaginationContainer = document.getElementById('paginationContainer');
    if (existingPaginationContainer) {
        existingPaginationContainer.remove();
    }

    // Create a new pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'paginationContainer'; // Give it an ID for easy reference
    paginationContainer.classList.add('flex', 'justify-center', 'mt-8', 'space-x-2');

    // Generate pagination buttons
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('px-4', 'py-2', 'bg-primary', 'text-dark', 'rounded-md', 'transition-colors', 'duration-200');

        // If this is the current page, make it stand out
        if (i === currentPage) {
            button.classList.add(
                'bg-secondary',  // Stronger background color for current page
                'text-white',     // White text for contrast
                'border-2',       // Add a border around the active page
                'border-dark',    // Border color
                'shadow-lg'       // Add shadow for a 3D effect
            );
        }

        button.addEventListener('click', () => {
            currentPage = i;
            loadListings();
        });

        paginationContainer.appendChild(button);
    }

    // Append the new pagination container after the listings grid
    const listingsGrid = document.getElementById('listingsGrid');
    listingsGrid.insertAdjacentElement('afterend', paginationContainer);
}

// Event Handlers
async function handleSearch(e) {
    const searchTerm = e.target.value;
    loadListings({ search: searchTerm });
}

function handleSort(sortType) {
    loadListings({ sort: sortType });
}

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
        loadListings(); // Reload listings to show new bid
    } catch (error) {
        alert(error.message || 'Failed to place bid');
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadListings();
    
    // Add logout handler
    document.getElementById('logoutBtn')?.addEventListener('click', logout);

    // Add search handler
    const searchInput = document.querySelector('input[type="search"]');
    searchInput?.addEventListener('input', handleSearch);

    // Add filter handlers
    const filterButtons = document.querySelectorAll('.flex button');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const sortType = e.target.textContent.toLowerCase();
            handleSort(sortType);
        });
    });
});