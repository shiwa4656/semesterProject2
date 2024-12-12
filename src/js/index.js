import { getListings, placeBid } from './api/listings.js';
import { createListingCard } from './utils/listingRenderer.js';

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
                listing.title.toLowerCase().includes(searchTerm) ||
                listing.description.toLowerCase().includes(searchTerm)
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

        const listingsHTML = listings.map(listing => createListingCard(listing)).join('');
        listingsGrid.innerHTML = listingsHTML;
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