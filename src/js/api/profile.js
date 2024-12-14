const BASE_URL = 'https://v2.api.noroff.dev/auction/profiles';
const API_KEY = "fd8ac414-9690-48cf-9579-f5ef44e495d2";

export async function getProfile(name) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${BASE_URL}/${name}`, {
            headers: {
                "X-Noroff-API-Key": API_KEY,
                "Authorization": `Bearer ${token}` // Added authorization header
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || 'Failed to fetch profile');
        }
        
        return data.data;
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        throw error;
    }
}

export async function updateProfile(profileData) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('Must be logged in to update profile');
    }
    
    try {
        const response = await fetch(`${BASE_URL}/${profileData.name}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Noroff-API-Key': API_KEY
            },
            body: JSON.stringify({
                avatar: profileData.avatar
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || 'Failed to update profile');
        }
        
        return data.data;
    } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
    }
}