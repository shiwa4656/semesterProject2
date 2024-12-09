import { getListings } from './api/listings.js';
import { createListingCard } from './utils/listingRenderer.js';

async function loadProfileData() {
    try {
        // Get profile name from URL
        const params = new URLSearchParams(window.location.search);
        const profileName = params.get('name');
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        if (!profileName) {
            throw new Error('No profile name provided');
        }

        // Add the profile header with banner and avatar
        document.getElementById('profileHeader').innerHTML = `
            <!-- Banner background -->
            <div class="w-full h-48 bg-cardBg mb-16">
                <!-- Profile picture and edit button container -->
                <div class="relative w-32 h-32 mx-auto transform translate-y-32">
                    <img 
                        src="${currentUser?.avatar?.url || 'https://via.placeholder.com/128'}" 
                        alt="Profile picture" 
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

        // Get and display listings
        const listings = await getListings();
        const userListings = listings.filter(listing => listing.seller.name === profileName);

        const listingsGrid = document.getElementById('listingsGrid');
        if (userListings.length === 0) {
            listingsGrid.innerHTML = '<p class="text-white text-center col-span-3">No listings found</p>';
        } else {
            listingsGrid.innerHTML = userListings.map(listing => createListingCard(listing)).join('');
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
    
    // Create a simple form for updating profile
    const newAvatarUrl = prompt('Enter new avatar URL:', user.avatar?.url || '');
    if (newAvatarUrl) {
        try {
            const updatedProfile = {
                avatar: {
                    url: newAvatarUrl,
                    alt: `${user.name}'s profile picture`
                }
            };

            // You'll need to implement the updateProfile API call
            // await updateProfile(updatedProfile);
            
            // Temporarily just update localStorage
            user.avatar = updatedProfile.avatar;
            localStorage.setItem('user', JSON.stringify(user));
            
            // Reload the page to show changes
            window.location.reload();
        } catch (error) {
            alert('Failed to update profile: ' + error.message);
        }
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProfileData();
});

// Check authentication
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
        document.getElementById('userCredits').textContent = `Credits = ${user.credits || 1000}`;
    } else {
        window.location.href = '/src/pages/login.html';
    }
}