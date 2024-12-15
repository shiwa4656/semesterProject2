import { getListing, placeBid } from './api/listings.js';

const API_KEY = "fd8ac414-9690-48cf-9579-f5ef44e495d2";

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getTimeLeft(endsAt) {
    const now = new Date();
    const endDate = new Date(endsAt);
    const diffTime = endDate - now;
    
    if (diffTime < 0) return 'Auction ended';
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
}

function showError(message) {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('listingDetail').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
    
    const errorMessage = document.querySelector('#errorState p');
    errorMessage.textContent = message;
}

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

function renderBidHistory(bids) {
    const bidHistoryContainer = document.getElementById('bidHistory');
    
    if (!bids || bids.length === 0) {
        bidHistoryContainer.innerHTML = '<p class="text-gray-400">No bids yet</p>';
        return;
    }

    const bidItems = bids
        .sort((a, b) => new Date(b.created) - new Date(a.created))
        .map(bid => `
            <div class="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                <div class="flex items-center gap-3">
                    <img src="${bid.bidder.avatar?.url || 'https://via.placeholder.com/32'}" 
                         alt="${bid.bidder.name}" 
                         class="w-8 h-8 rounded-full">
                    <div>
                        <a href="/src/pages/profile.html?name=${bid.bidder.name}" 
                           class="text-primary hover:text-secondary">
                            ${bid.bidder.name}
                        </a>
                        <p class="text-sm text-gray-400">${formatDate(bid.created)}</p>
                    </div>
                </div>
                <span class="text-white font-bold">${bid.amount} credits</span>
            </div>
        `).join('');

    bidHistoryContainer.innerHTML = bidItems;
}

async function loadListingDetail() {
    try {
        const params = new URLSearchParams(window.location.search);
        const listingId = params.get('id');
        
        if (!listingId) {
            throw new Error('No listing ID provided');
        }

        const listing = await getListing(listingId);
        
        // Update DOM with listing details
        document.title = `${listing.title} - Auction Site`;
        document.getElementById('mainImage').src = listing.media[0]?.url || 'https://via.placeholder.com/800/600';
        document.getElementById('listingTitle').textContent = listing.title;
        document.getElementById('sellerAvatar').src = listing.seller.avatar?.url || 'https://via.placeholder.com/40';
        document.getElementById('sellerLink').href = `/src/pages/profile.html?name=${listing.seller.name}`;
        document.getElementById('sellerLink').textContent = listing.seller.name;
        document.getElementById('currentBid').textContent = `${listing._count.bids > 0 ? Math.max(...listing.bids.map(b => b.amount)) : 0} credits`;
        document.getElementById('timeLeft').textContent = getTimeLeft(listing.endsAt);
        document.getElementById('totalBids').textContent = listing._count.bids;
        document.getElementById('description').textContent = listing.description;

        // Render bid history
        renderBidHistory(listing.bids);

        // Show the listing detail
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('listingDetail').classList.remove('hidden');

        // Setup bid form
        const bidForm = document.getElementById('bidForm');
        bidForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const bidAmount = Number(e.target.bidAmount.value);
            const currentBid = Math.max(0, ...listing.bids.map(b => b.amount));
            const user = JSON.parse(localStorage.getItem('user'));

            if (bidAmount <= currentBid) {
                alert('Bid must be higher than the current bid');
                return;
            }

            if (user.credits < bidAmount) {
                alert('You do not have enough credits for this bid');
                return;
            }

            try {
                // First place the bid
                await placeBid(listingId, bidAmount);
                
                // Then update credits in API and locally
                const newCredits = user.credits - bidAmount;
                await updateCreditsInAPI(user.name, newCredits);
                
                // Update local storage and UI
                user.credits = newCredits;
                localStorage.setItem('user', JSON.stringify(user));
                document.getElementById('userCredits').textContent = newCredits;
                
                window.location.reload();
            } catch (error) {
                alert(error.message);
            }
        });

    } catch (error) {
        console.error('Error loading listing:', error);
        showError(error.message);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
        try {
            // Fetch current user profile and credits from API
            const profile = await getUserProfile(user.name);
            
            // Initialize credits if needed
            if (profile.credits === undefined || profile.credits === null) {
                await updateCreditsInAPI(user.name, 1000);
                profile.credits = 1000;
            }
            
            // Update local storage and UI
            user.credits = profile.credits;
            localStorage.setItem('user', JSON.stringify(user));
            document.getElementById('userCredits').textContent = profile.credits;
        } catch (error) {
            console.error('Error initializing user profile:', error);
        }
    } else {
        window.location.href = '/src/pages/login.html';
        return;
    }

    // Add logout handler
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/index.html';
    });

   
});


// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    // Redirect if not authenticated
    if (!user || !token) {
        window.location.href = '/src/pages/login.html';
        return;
    }

    try {
        // Fetch current user profile and credits from API
        const profile = await getUserProfile(user.name);
        
        // Initialize credits if needed
        if (profile.credits === undefined || profile.credits === null) {
            await updateCreditsInAPI(user.name, 1000);
            profile.credits = 1000;
        }
        
        // Update local storage and UI
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

    // Load listing details
    loadListingDetail();
});