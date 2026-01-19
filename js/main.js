// main.js - Fixed Version with Mobile Cart & Wishlist

// ===================== MOBILE MENU TOGGLE =====================
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

    // Initialize cart & wishlist
    updateCartCount();
    updateWishlistCount();

    // Check user login
    checkUserLoginOnPageLoad();

    // Load featured products if on homepage
    if (document.getElementById('featuredProducts')) {
        loadFeaturedProducts();
    }

    // Setup mobile buttons
    setupMobileCartListener();
    setupMobileWishlistListener();
});

// ===================== CART FUNCTIONS =====================
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(product) {
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
    renderCartSidebar();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id != id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartSidebar();
}

function updateCartCount() {
    const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
    });
}

function renderCartSidebar() {
    const container = document.getElementById('cartItems');
    const totalEl = document.querySelector('.total-price');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart"><i class="fas fa-shopping-cart"></i><p>Your cart is empty</p></div>`;
        if (totalEl) totalEl.textContent = '$0.00';
        return;
    }

    container.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-image"><img src="${item.image}" alt="${item.name}"></div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                <button class="remove-cart-item" data-id="${item.id}">&times;</button>
            </div>
        `;
        container.appendChild(div);
    });

    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);

    document.querySelectorAll('.remove-cart-item').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });
}

// ===================== WISHLIST FUNCTIONS =====================
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function toggleWishlist(id) {
    const idx = wishlist.findIndex(item => item.id == id);
    const productCard = document.querySelector(`.add-to-cart[data-id='${id}']`)?.closest('.product-card');
    if (!productCard) return;
    const product = getProductDetailsFromCard(productCard);

    if (idx > -1) {
        wishlist.splice(idx, 1);
        showToast(`${product.name} removed from wishlist`);
    } else {
        wishlist.push(product);
        showToast(`${product.name} added to wishlist`);
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    renderWishlistIcons();
}

function updateWishlistCount() {
    const count = wishlist.length;
    document.querySelectorAll('.wishlist-count').forEach(el => el.textContent = count);
}

function renderWishlistIcons() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const id = btn.dataset.id;
        const icon = btn.querySelector('i');
        if (wishlist.some(item => item.id == id)) {
            icon.classList.remove('far'); icon.classList.add('fas'); icon.style.color = '#e05a00';
        } else {
            icon.classList.remove('fas'); icon.classList.add('far'); icon.style.color = '';
        }
    });
}

// ===================== MOBILE CART & WISHLIST BUTTONS =====================
function setupMobileCartListener() {
    const mobileBtn = document.querySelector('.mobile-cart-floating-button');
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    const closeBtn = document.getElementById('closeCart');

    if (!mobileBtn || !cartSidebar || !overlay || !closeBtn) return;

    mobileBtn.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        overlay.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
}

function setupMobileWishlistListener() {
    const mobileBtn = document.querySelector('.mobile-wishlist-floating-button');
    if (!mobileBtn) return;

    mobileBtn.addEventListener('click', () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            window.location.href = 'dashboard.html#wishlist';
        } else {
            window.location.href = 'account.html';
        }
    });
}

// ===================== HELPER FUNCTIONS =====================
function getProductDetailsFromCard(card) {
    const id = card.querySelector('.add-to-cart')?.dataset.id;
    const name = card.querySelector('.product-title')?.textContent || 'Product';
    const price = parseFloat(card.querySelector('.product-price')?.textContent.replace('$', '')) || 0;
    const image = card.querySelector('img')?.src;
    const store = card.querySelector('.product-store')?.textContent.replace('Sold by:', '').trim() || 'GlobalMart';
    const category = card.querySelector('.warehouse-badge') ? 'Warehouse' : 'General';
    return { id, name, price, image, store, category };
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// ===================== USER LOGIN =====================
function checkUserLoginOnPageLoad() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const dashboardLink = document.querySelector('.dashboard-link');

    if (currentUser && dashboardLink) {
        dashboardLink.style.display = 'block';
    }

    const protectedPages = ['dashboard.html', 'checkout.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !currentUser) {
        window.location.href = 'account.html';
    }
}

// ===================== FEATURED PRODUCTS =====================
function loadFeaturedProducts() {
    const storeProducts = JSON.parse(localStorage.getItem('storeProducts')) || getSampleProducts();
    const warehouseProducts = JSON.parse(localStorage.getItem('warehouseProducts')) || [];

    const allProducts = [...storeProducts, ...warehouseProducts.map(p => ({
        ...p, fromWarehouse: true, store: p.shipperName || 'Warehouse'
    }))];

    const container = document.getElementById('featuredProducts');
    if (!container) return;

    container.innerHTML = '';

    allProducts.slice(0, 4).forEach(product => {
        const isWishlisted = wishlist.some(item => item.id == product.id);
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.fromWarehouse ? '<div class="warehouse-badge">Warehouse</div>' : ''}
                <button class="wishlist-btn" data-id="${product.id}">
                    <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-store">Sold by: ${product.store || 'GlobalMart'}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn btn-small add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">Add to Cart</button>
            </div>
        `;
        container.appendChild(productElement);
    });

    // Add event listeners
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function () {
            addToCart({
                id: this.dataset.id,
                name: this.dataset.name,
                price: parseFloat(this.dataset.price),
                image: this.dataset.image,
                quantity: 1
            });
        });
    });

    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            toggleWishlist(this.dataset.id);
        });
    });
}

// ===================== SAMPLE PRODUCTS =====================
// function getSampleProducts() {
//     return [
//         { id: 1, name: "Wireless Earbuds", price: 49.99, image: "https://images.unsplash.com/photo-1590658165737-15a047b8b5e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", store: "TechZone" },
//         { id: 2, name: "Smart Watch", price: 129.99, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", store: "GadgetStore" },
//         { id: 3, name: "Premium Backpack", price: 59.99, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", store: "TravelGear" },
//         { id: 4, name: "LED Desk Lamp", price: 34.99, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", store: "HomeEssentials" }
//     ];
// }
