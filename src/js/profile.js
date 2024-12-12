import { getListings } from './api/listings.js';
import { createListingCard } from './utils/listingRenderer.js';

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    // If no user or token, redirect to login
    if (!user || !token) {
        window.location.href = '/src/pages/login.html';
        return;
    }

    // Update credits display
    document.getElementById('userCredits').textContent = user.credits || 1000;
}
async function loadProfileData() {
    try {
        // Get profile name from URL
        const params = new URLSearchParams(window.location.search);
        const profileName = params.get('name');
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        if (!profileName) {
            throw new Error('No profile name provided');
        }

        // Get all listings and filter for this user
        const listings = await getListings();
        console.log('Fetched listings:', listings);
        
        const userListings = listings.filter(listing => listing.seller.name === profileName);
        console.log('User listings:', userListings);
        
        // Get user's current avatar from their listings
        const userAvatar = userListings[0]?.seller?.avatar?.url || 'https://via.placeholder.com/128';

        // Update the profile header with avatar and edit button
        document.getElementById('profileHeader').innerHTML = `
            <!-- Banner background -->
            <div class="w-full h-48 bg-cardBg mb-16">
                <!-- Profile picture and edit button container -->
                <div class="relative w-32 h-32 mx-auto transform translate-y-32">
                    <img 
                        src="${userAvatar}" 
                        alt="${profileName}'s profile picture"
                        class="w-full h-full rounded-full object-cover border-4 border-cardBg"
                    >
                    ${profileName === currentUser?.name ? `
                        <button
                            onclick="editProfile()"
                            class="absolute bottom-0 right-0 bg-primary text-dark px-3 py-1 rounded-full text-sm hover:bg-secondary"
                        >
                            Edit
                        </button>
                    ` : ''}
                </div>
            </div>

            <h2 class="text-2xl text-white font-bold text-center mt-20">Posted bids</h2>
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

// Edit profile function
window.editProfile = async function() {
    const user = JSON.parse(localStorage.getItem('user'));
    const newAvatarUrl = prompt('Enter new avatar URL:', user.avatar?.url || '');
    
    if (newAvatarUrl) {
        try {
            const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${user.name}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-Noroff-API-Key': 'fd8ac414-9690-48cf-9579-f5ef44e495d2'
                },
                body: JSON.stringify({
                    avatar: {
                        url: newAvatarUrl,
                        alt: `${user.name}'s profile picture`
                    }
                })
            });

            if (response.ok) {
                // Update localStorage
                user.avatar = { url: newAvatarUrl, alt: `${user.name}'s profile picture` };
                localStorage.setItem('user', JSON.stringify(user));
                
                // Reload the page to show changes
                window.location.reload();
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            alert('Failed to update profile: ' + error.message);
        }
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Profile page loaded');
    checkAuth();
    loadProfileData();
});