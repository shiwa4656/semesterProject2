import { register } from './api/auth.js';

function validateEmail(email) {
    const regex = /^[\w\-.]+@stud\.noroff\.no$/;
    return regex.test(email);
}

function showMessage(message, isError = false) {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.getElementById('message');
    
    messageElement.textContent = message;
    messageElement.className = isError 
        ? 'px-4 py-2 rounded bg-red-500 text-white'
        : 'px-4 py-2 rounded bg-green-500 text-white';
    
    messageContainer.classList.remove('hidden');
}

document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        avatar: {
            url: formData.get('avatar'),
            alt: `${formData.get('name')}'s profile picture`
        }
    };
    const confirmPassword = formData.get('confirmPassword');

    try {
        // Validation
        if (!validateEmail(userData.email)) {
            throw new Error('Please use a valid @stud.noroff.no email');
        }

        if (userData.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        if (userData.password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        // Remove avatar if no URL is provided
        if (!userData.avatar.url) {
            delete userData.avatar;
        }

        // Attempt registration
        const response = await register(userData);
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Show success message
        showMessage('Registration successful! Redirecting to the login page...', false);
        
        // Clear form
        form.reset();
        
        // Redirect to home page after a delay
        setTimeout(() => {
            window.location.href = '../pages/login.html';
        }, 2000);

    } catch (error) {
        showMessage(error.message, true);
    }
});