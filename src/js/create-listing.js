import { createListing } from './api/listings.js';

function showMessage(message, isError = false) {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.getElementById('message');
    
    messageElement.textContent = message;
    messageElement.className = `px-4 py-2 rounded ${isError ? 'bg-red-500' : 'bg-green-500'} text-white text-lg font-semibold`;
    
    messageContainer.classList.remove('hidden');
}

function validateForm(formData) {
    const title = formData.get('title');
    const media = formData.get('media');
    const description = formData.get('description');
    const endsAt = formData.get('endsAt');

    if (!title || title.length < 3) {
        throw new Error('Title must be at least 3 characters long');
    }

    try {
        new URL(media);
    } catch {
        throw new Error('Please enter a valid media URL');
    }

    if (!description || description.length < 10) {
        throw new Error('Description must be at least 10 characters long');
    }

    const endDate = new Date(endsAt);
    if (endDate <= new Date()) {
        throw new Error('End date must be in the future');
    }

    return true;
}

// Check authentication and setup form
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = '/src/pages/login.html';
        return;
    }

    // Update credits display
    document.getElementById('userCredits').textContent = user.credits || 1000;
    document.querySelectorAll('.mobile-credits').forEach(el => {
        el.textContent = user.credits || 1000;
    });

    // Update avatar and username displays
    const avatarSrc = user.avatar?.url || 'https://via.placeholder.com/36';
    document.getElementById('userAvatar').src = avatarSrc;
    document.getElementById('mobileUserAvatar').src = avatarSrc;
    document.getElementById('mobileUsername').textContent = user.name;
    document.getElementById('profileLink').href = `/src/pages/profile.html?name=${user.name}`;

    // Set minimum date for endsAt
    const dateInput = document.querySelector('input[type="datetime-local"]');
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    dateInput.min = localISOTime;
    dateInput.value = localISOTime;

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
});

// Handle form submission
document.getElementById('createListingForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        validateForm(formData);

        const listingData = {
            title: formData.get('title'),
            description: formData.get('description'),
            media: [{
                url: formData.get('media'),
                alt: formData.get('title')
            }],
            endsAt: new Date(formData.get('endsAt')).toISOString(),
            tags: []
        };

        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Creating...';

        const response = await createListing(listingData);
        console.log('Listing created:', response);
        
        showMessage('Listing created successfully! Redirecting...', false);
        
        setTimeout(() => {
            window.location.replace('/index.html');
        }, 2000);

    } catch (error) {
        console.error('Error creating listing:', error);
        showMessage(error.message || 'Failed to create listing', true);
        
        // Reset button state
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
    }
});