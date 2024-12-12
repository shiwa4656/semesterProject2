const BASE_URL = 'https://v2.api.noroff.dev';

export async function register(userData) {
    try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || 'Registration failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

export async function login(userData) {
    try {
       

        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || 'Login failed');
        }

        // Store token separately without any prefixes
        if (data.data && data.data.accessToken) {
            // Store only the token, nothing else in this key
            localStorage.setItem('token', data.data.accessToken);
            
            // Store user data separately, excluding the token
            const userData = {
                name: data.data.name,
                email: data.data.email,
                avatar: data.data.avatar,
                banner: data.data.banner,
                bio: data.data.bio
            };
            localStorage.setItem('user', JSON.stringify(userData));
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

export function logout() {
    clearAllStorage();
    window.location.href = '/index.html';
}

export function getAuthToken() {
    const token = localStorage.getItem('token');
    // Verify token format
    if (token && token.split('.').length === 3) {
        return token;
    }
    return null;
}

export function getCurrentUser() {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    } catch {
        return null;
    }
}