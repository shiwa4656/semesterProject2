import { login } from './api/auth.js';

function showMessage(message, isError = false) {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.getElementById('message');
    
    messageElement.textContent = message;
    messageElement.className = isError 
        ? 'px-4 py-2 rounded bg-red-500 text-white'
        : 'px-4 py-2 rounded bg-green-500 text-white';
    
    messageContainer.classList.remove('hidden');
}

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const userData = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await login(userData);
        
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', response.data.accessToken);
        
        // Show success message
        showMessage('Login successful! Redirecting...', false);
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);

    } catch (error) {
        showMessage(error.message, true);
    }
});