import { getListing, placeBid } from './api/listings.js';

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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
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

            if (bidAmount <= currentBid) {
                alert('Bid must be higher than the current bid');
                return;
            }

            try {
                await placeBid(listingId, bidAmount);
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
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
        document.getElementById('userCredits').textContent = user.credits || 1000;
    } else {
        window.location.href = '/src/pages/login.html';
        return;
    }

    // Add logout handler
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/index.html';
    });

    loadListingDetail();
});