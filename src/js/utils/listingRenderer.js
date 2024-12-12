// src/js/utils/listingRenderer.js

export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

export function getTimeLeft(endsAt) {
    const now = new Date();
    const endDate = new Date(endsAt);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Ended';
    if (diffDays === 0) return 'Ends today';
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`;
}

export function getHighestBid(bids) {
    if (!bids || bids.length === 0) return 0;
    return Math.max(...bids.map(bid => bid.amount));
}



export function createListingCard(listing) {
    const highestBid = getHighestBid(listing.bids);
    const timeLeft = getTimeLeft(listing.endsAt);
    const sellerName = listing.seller?.name || 'Unknown Seller';
    const sellerAvatar = listing.seller?.avatar?.url || 'https://via.placeholder.com/40';
    const listingImage = listing.media?.[0]?.url || 'https://via.placeholder.com/400/300';

    return `
        <div class="bg-cardBg rounded-lg overflow-hidden">
            <div class="p-4 flex items-center gap-3">
                <a href="/src/pages/profile.html?name=${sellerName}" class="flex items-center gap-3 hover:opacity-80">
                    <img src="${sellerAvatar}" 
                         alt="${sellerName}'s avatar" 
                         class="w-10 h-10 rounded-full object-cover">
                    <span class="text-white">${sellerName}</span>
                </a>
            </div>

            <div class="px-4 flex justify-between mb-2">
                <a href="/src/pages/listing-detail.html?id=${listing.id}" class="text-primary hover:text-secondary">
                    ${listing.title}
                </a>
                <span class="bg-primary text-dark px-3 py-1 rounded-full">
                    Highest bid: ${highestBid}
                </span>
            </div>

            <a href="/src/pages/listing-detail.html?id=${listing.id}" class="block px-4 hover:opacity-90">
                <img src="${listingImage}" 
                     alt="${listing.title}"
                     class="w-full h-48 object-cover rounded-lg">
            </a>

            <p class="px-4 py-2 text-sm text-gray-300">
                ${listing.description || 'No description provided'}
            </p>

            <div class="p-4 flex justify-between items-center text-sm text-gray-400">
                <span>Time left: ${timeLeft}</span>
                <span>created: ${formatDate(listing.created)}</span>
            </div>

            <button class="w-full bg-primary hover:bg-secondary text-dark py-3 font-medium transition-colors"
                    onclick="window.location.href='/src/pages/listing-detail.html?id=${listing.id}'">
                Place Bid
            </button>
        </div>
    `;
}
