import { getListings } from './api/listings.js';
import { createListingCard } from './utils/listingRenderer.js';
import { getProfile, updateProfile } from './api/profile.js';

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        window.location.href = '/src/pages/login.html';
        return;
    }

    document.getElementById('userCredits').textContent = user.credits || 1000;
}

async function loadProfileData() {
    try {
        // Get profile name from URL or use current user's name if not specified
        const params = new URLSearchParams(window.location.search);
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const profileName = params.get('name') || currentUser.name;
        
        if (!profileName) {
            throw new Error('No profile name available');
        }

        // Fetch profile data using the API
        const profileData = await getProfile(profileName);
        
        // Fetch all listings
        const listings = await getListings();
        console.log('Fetched listings:', listings);
        
        // Filter listings for this user
        const userListings = listings.filter(listing => listing.seller.name === profileName);
        console.log('User listings:', userListings);
        
        // Get user's avatar from profile data or listings
        const userAvatar = profileData?.avatar?.url || 
                          userListings[0]?.seller?.avatar?.url || 
                          'https://via.placeholder.com/128';

        // Update the profile header
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

window.editProfile = async function() {
    const user = JSON.parse(localStorage.getItem('user'));
    const newAvatarUrl = prompt('Enter new avatar URL:', user.avatar?.url || '');
    
    if (newAvatarUrl) {
        try {
            // Use the updateProfile function from your API
            const result = await updateProfile({
                name: user.name,
                avatar: {
                    url: newAvatarUrl,
                    alt: `${user.name}'s profile picture`
                }
            });

            // Update localStorage with new avatar
            user.avatar = result.avatar;
            localStorage.setItem('user', JSON.stringify(user));
            
            // Reload the page to show changes
            window.location.reload();
        } catch (error) {
            alert('Failed to update profile: ' + error.message);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Profile page loaded');
    checkAuth();
    loadProfileData();
});