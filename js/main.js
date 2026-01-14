// main.js - Fixed Version

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Initialize cart count
    updateCartCount();
    
    // Check user login for dashboard link
    checkUserLogin();
    
    // Load featured products if on homepage
    if (document.getElementById('featuredProducts')) {
        loadFeaturedProducts();
    }
});

// Add product to cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.id == product.id);
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += product.quantity || 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: product.image,
            quantity: product.quantity || 1
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
    });
}

// Load featured products
function loadFeaturedProducts() {
    const storeProducts = JSON.parse(localStorage.getItem('storeProducts')) || getSampleProducts();
    const warehouseProducts = JSON.parse(localStorage.getItem('warehouseProducts')) || [];
    
    // Combine products
    const allProducts = [...storeProducts, ...warehouseProducts.map(p => ({
        ...p, 
        fromWarehouse: true,
        store: p.shipperName || 'Warehouse'
    }))];
    
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Take first 4 products
    allProducts.slice(0, 4).forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <div class="product-image">
                <img src="${product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}" alt="${product.name}">
                ${product.fromWarehouse ? '<div class="warehouse-badge">Warehouse</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-store">Sold by: ${product.store || 'GlobalMart'}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn btn-small add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">Add to Cart</button>
                <a href="product-detail.html?id=${product.id}" class="btn btn-outline btn-small view-details">View Details</a>
            </div>
        `;
        container.appendChild(productElement);
    });
    
    // Add event listeners
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const product = {
                id: this.dataset.id,
                name: this.dataset.name,
                price: parseFloat(this.dataset.price),
                image: this.dataset.image,
                quantity: 1
            };
            addToCart(product);
        });
    });
}

// Sample products
function getSampleProducts() {
    return [
        {
            id: 1,
            name: "Wireless Earbuds",
            price: 49.99,
            image: "https://images.unsplash.com/photo-1590658165737-15a047b8b5e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            store: "TechZone",
            category: "electronics",
            description: "High-quality wireless earbuds with noise cancellation",
            rating: 5
        },
        {
            id: 2,
            name: "Smart Watch",
            price: 129.99,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            store: "GadgetStore",
            category: "electronics",
            description: "Smart watch with fitness tracking and notifications",
            rating: 5
        },
        {
            id: 3,
            name: "Premium Backpack",
            price: 59.99,
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            store: "TravelGear",
            category: "sports",
            description: "Durable waterproof backpack for travel and everyday use",
            rating: 5
        },
        {
            id: 4,
            name: "LED Desk Lamp",
            price: 34.99,
            image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            store: "HomeEssentials",
            category: "home",
            description: "Adjustable LED desk lamp with multiple brightness settings",
            rating: 5
        }
    ];
}

// Check user login
function checkUserLogin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const dashboardLink = document.querySelector('.dashboard-link');
    
    if (currentUser && dashboardLink) {
        dashboardLink.style.display = 'block';
    }
}

// main.js - Add this function at the top

function checkUserLoginOnPageLoad() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const dashboardLink = document.querySelector('.dashboard-link');
    
    if (currentUser && dashboardLink) {
        dashboardLink.style.display = 'block';
    }
    
    // On pages that require login, redirect if not logged in
    const protectedPages = ['dashboard.html', 'checkout.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !currentUser) {
        window.location.href = 'account.html';
    }
}

// Call this in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    checkUserLoginOnPageLoad();
    // ... existing code ...
});