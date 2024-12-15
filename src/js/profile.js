import { getListings } from './api/listings.js';
import { createListingCard } from './utils/listingRenderer.js';
import { getProfile, updateProfile } from './api/profile.js';

const API_KEY = "fd8ac414-9690-48cf-9579-f5ef44e495d2";

async function updateCreditsInAPI(username, newAmount) {
    try {
        const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'X-Noroff-API-Key': API_KEY
            },
            body: JSON.stringify({
                credits: newAmount
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.errors?.[0]?.message || 'Failed to update credits in API');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating credits:', error);
        throw error;
    }
}

async function getUserProfile(username) {
    try {
        const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${username}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'X-Noroff-API-Key': API_KEY
            }
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.errors?.[0]?.message || 'Failed to fetch user profile');
        }
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

async function loadProfileData() {
    try {
        const params = new URLSearchParams(window.location.search);
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const profileName = params.get('name') || currentUser.name;
        
        if (!profileName) {
            throw new Error('No profile name available');
        }

        const profileData = await getProfile(profileName);
        const listings = await getListings();
        const userListings = listings.filter(listing => listing.seller.name === profileName);
        
        const userAvatar = profileData?.avatar?.url || 
                          userListings[0]?.seller?.avatar?.url || 
                          'https://via.placeholder.com/128';

        // Update profile header
        document.getElementById('profileHeader').innerHTML = `
            <div class="w-full h-48 bg-cardBg mb-16">
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

            <div class="text-center mt-20 mb-8">
                <h2 class="text-2xl text-white font-bold">${profileName}'s Profile</h2>
                <p class="text-gray-400 mt-2">Credits: ${profileData.credits || 0}</p>
            </div>

            <h3 class="text-xl text-white font-bold mt-12 mb-6">Posted Listings</h3>
        `;

        // Render listings
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
            const response = await fetch(`https://v2.api.noroff.dev/auction/profiles/${user.name}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-Noroff-API-Key': API_KEY
                },
                body: JSON.stringify({
                    avatar: {
                        url: newAvatarUrl,
                        alt: `${user.name}'s profile picture`
                    }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.errors?.[0]?.message || 'Failed to update profile');
            }

            const result = await response.json();
            user.avatar = result.data.avatar;
            localStorage.setItem('user', JSON.stringify(user));
            window.location.reload();
        } catch (error) {
            alert('Failed to update profile: ' + error.message);
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        window.location.href = '/src/pages/login.html';
        return;
    }

    try {
        const profile = await getUserProfile(user.name);
        
        if (profile.credits === undefined || profile.credits === null) {
            await updateCreditsInAPI(user.name, 1000);
            profile.credits = 1000;
        }
        
        user.credits = profile.credits;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update all credit displays
        document.getElementById('userCredits').textContent = profile.credits;
        document.querySelectorAll('.mobile-credits').forEach(el => {
            el.textContent = profile.credits;
        });

        // Update avatar and username
        const avatarSrc = user.avatar?.url || 'https://via.placeholder.com/36';
        document.getElementById('userAvatar').src = avatarSrc;
        document.getElementById('mobileUserAvatar').src = avatarSrc;
        document.getElementById('mobileUsername').textContent = user.name;
        document.getElementById('profileLink').href = `/src/pages/profile.html?name=${user.name}`;
        
    } catch (error) {
        console.error('Error initializing user profile:', error);
    }

    // Mobile menu handlers
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
        const mobileMenu = document.getElementById('mobileMenu');
        const menuPanel = mobileMenu.querySelector('.transform');
        mobileMenu.classList.remove('hidden');
        setTimeout(() => {
            menuPanel.classList.remove('translate-x-full');
        }, 10);
    });

    document.getElementById('closeMobileMenu')?.addEventListener('click', () => {
        const mobileMenu = document.getElementById('mobileMenu');
        const menuPanel = mobileMenu.querySelector('.transform');
        menuPanel.classList.add('translate-x-full');
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
        }, 300);
    });

    // Logout handlers
    const logoutHandler = () => {
        localStorage.clear();
        window.location.href = '/index.html';
    };

    document.getElementById('logoutBtn')?.addEventListener('click', logoutHandler);
    document.getElementById('mobileLogoutBtn')?.addEventListener('click', logoutHandler);

    loadProfileData();
})