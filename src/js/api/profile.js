/ src/js/profile.js

import { getListings } from './api/listings.js';
import { createListingCard } from './utils/listingRenderer.js';


function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    
    if (user) {
        // Show user navigation
        guestNav?.classList.add('hidden');
        userNav?.classList.remove('hidden');
        
        // Update user info
        document.getElementById('userCredits').textContent = user.credits || 1000;
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.src = user.avatar?.url || 'https://via.placeholder.com/40';
            userAvatar.alt = `${user.name}'s profile`;
        }
    } else {
        // Show guest navigation
        guestNav?.classList.remove('hidden');
        userNav?.classList.add('hidden');
    }
}

async function loadProfileData() {
    try {
        // Get profile name from URL
        const params = new URLSearchParams(window.location.search);
        const profileName = params.get('name');
        
        if (!profileName) {
            throw new Error('No profile name provided');
        }

        // Get all listings and filter for this user
        const listings = await getListings();
        console.log('Fetched listings:', listings);
        
        const userListings = listings.filter(listing => listing.seller.name === profileName);
        console.log('User listings:', userListings);

        // Update the profile header
        document.getElementById('profileHeader').innerHTML = `
            <h2 class="text-2xl text-white font-bold text-center">Posted bids</h2>
        `;

        // Render the listings
        const listingsGrid = document.getElementById('listingsGrid');
        if (listingsGrid) {
            if (userListings.length === 0) {
                listingsGrid.innerHTML = '<p class="text-white text-center">No listings found</p>';
            } else {
                listingsGrid.innerHTML = userListings.map(listing => createListingCard(listing)).join('');
            }
        }

    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('profileHeader').innerHTML = `
            <p class="text-red-500 text-center">Error loading profile: ${error.message}</p>
        `;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Profile page loaded');
    checkAuth();
    loadProfileData();
});