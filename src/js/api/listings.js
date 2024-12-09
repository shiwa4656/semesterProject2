const BASE_URL = 'https://v2.api.noroff.dev/auction/listings';

/**
 * Get all listings
 */
export async function getListings() {
    try {
        const response = await fetch(`${BASE_URL}?_seller=true&_bids=true`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || 'Failed to fetch listings');
        }

        return data.data;
    } catch (error) {
        console.error('Failed to fetch listings:', error);
        throw error;
    }
}

/**
 * Get a single listing by ID
 */
export async function getListing(id) {
    try {
        const response = await fetch(`${BASE_URL}/${id}?_seller=true&_bids=true`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || 'Failed to fetch listing');
        }

        return data.data;
    } catch (error) {
        console.error('Failed to fetch listing:', error);
        throw error;
    }
}

/**
 * Create a new listing
 */
export async function createListing(listingData) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('You must be logged in to create a listing');
    }

    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(listingData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || 'Failed to create listing');
        }

        return data;
    } catch (error) {
        console.error('Failed to create listing:', error);
        throw error;
    }
}

/**
 * Place a bid on a listing
 */
export async function placeBid(listingId, amount) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('You must be logged in to place a bid');
    }

    try {
        const response = await fetch(`${BASE_URL}/${listingId}/bids`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || 'Failed to place bid');
        }

        return data;
    } catch (error) {
        console.error('Failed to place bid:', error);
        throw error;
    }
}

/**
 * Delete a listing
 */
export async function deleteListing(id) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('You must be logged in to delete a listing');
    }

    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.errors?.[0]?.message || 'Failed to delete listing');
        }

        return true;
    } catch (error) {
        console.error('Failed to delete listing:', error);
        throw error;
    }
}

/**
 * Update a listing
 */
export async function updateListing(id, listingData) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('You must be logged in to update a listing');
    }

    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(listingData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || 'Failed to update listing');
        }

        return data;
    } catch (error) {
        console.error('Failed to update listing:', error);
        throw error;
    }
}