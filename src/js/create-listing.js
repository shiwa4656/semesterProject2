import { createListing } from './api/listings.js';

function showMessage(message, isError = false) {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.getElementById('message');
    
    messageElement.textContent = message;
    messageElement.className = `px-4 py-2 rounded ${isError ? 'bg-red-500' : 'bg-green-500'} text-white text-lg font-semibold`;
    
    messageContainer.classList.remove('hidden');
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Set minimum date for endsAt
    const dateInput = document.querySelector('input[type="datetime-local"]');
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    dateInput.min = localISOTime;
    dateInput.value = localISOTime;
});

document.getElementById('createListingForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
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

    try {
        const response = await createListing(listingData);
        console.log('Listing created:', response);
        showMessage('Listing created successfully!', false);
        
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 2000);

    } catch (error) {
        console.error('Error creating listing:', error);
        showMessage(error.message || 'Failed to create listing', true);
    }
});