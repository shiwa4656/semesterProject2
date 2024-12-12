const BASE_URL = 'https://v2.api.noroff.dev/auction/listings';
const API_KEY = "fd8ac414-9690-48cf-9579-f5ef44e495d2";

export async function getListings() {
    try {
        const response = await fetch(`${BASE_URL}?_seller=true&_bids=true&sort=created&sortOrder=desc`, {
            headers: {
                "X-Noroff-API-Key": API_KEY
            }
        });
        
        const data = await response.json();
        console.log('Fetched listings:', data);

        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || 'Failed to fetch listings');
        }

        return data.data;
    } catch (error) {
        console.error('Failed to fetch listings:', error);
        throw error;
    }
}

export async function getListing(id) {
    try {
        const response = await fetch(`${BASE_URL}/${id}?_seller=true&_bids=true`, {
            headers: {
                "X-Noroff-API-Key": API_KEY
            }
        });

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

export async function createListing(listingData) {
    const token = localStorage.getItem('token');
    console.log('Token retrieved for Authorization:', token);
    
    if (!token) {
        throw new Error('You must be logged in to create a listing');
    }

    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                "X-Noroff-API-Key": API_KEY
            },
            body: JSON.stringify(listingData)
        });

        const data = await response.json();
        console.log('API Response:', data);

        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || 'Failed to create listing');
        }

        return data;
    } catch (error) {
        console.error('Failed to create listing:', error);
        throw error;
    }
}

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
                'Authorization': `Bearer ${token}`,
                "X-Noroff-API-Key": API_KEY
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

export async function deleteListing(id) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('You must be logged in to delete a listing');
    }

    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                "X-Noroff-API-Key": API_KEY
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
                'Authorization': `Bearer ${token}`,
                "X-Noroff-API-Key": API_KEY
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