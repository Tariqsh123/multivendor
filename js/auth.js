// auth.js - Authentication Functions

// Initialize auth functionality
document.addEventListener('DOMContentLoaded', function() {
    // This file will be included in account.html
    // Main auth logic is now in account.html itself
});

// Function to check if user is logged in (can be used in other pages)
function isUserLoggedIn() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser !== null;
}

// Function to get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Function to logout user
function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'account.html';
}

// Function to require login (redirect to account if not logged in)
function requireLogin() {
    if (!isUserLoggedIn()) {
        window.location.href = 'account.html';
        return false;
    }
    return true;
}