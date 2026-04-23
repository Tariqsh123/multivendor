// main.js - Complete Fixed Version

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

    // Load products for homepage or products page
    if (document.getElementById('productsGrid')) {
        loadProducts();
    }
    
    // Load featured products if on homepage
    if (document.getElementById('featuredProducts')) {
        loadFeaturedProducts();
    }

    // Setup mobile buttons
    setupMobileCartListener();
    setupMobileWishlistListener();
    
    // Setup cart and wishlist sidebar listeners
    setupCartSidebarListeners();
    setupWishlistSidebarListeners();
});

// ===================== PRODUCT LOADING FROM JSON =====================
async function loadProducts() {
    console.log('Loading products from data/product.json...');
    
    const loadingElement = document.getElementById('productsLoading');
    const noProductsElement = document.getElementById('noProducts');
    const productsGrid = document.getElementById('productsGrid');
    
    if (loadingElement) loadingElement.style.display = 'flex';
    if (noProductsElement) noProductsElement.style.display = 'none';
    
    try {
        // Load products from JSON file with cache busting
        const response = await fetch('data/product.json?t=' + Date.now());
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const productData = await response.json();
        console.log('Products loaded successfully:', productData);
        
        // Extract products from JSON structure
        const warehouseProducts = productData.warehouseProducts || [];
        const storeProducts = productData.storeProducts || [];
        
        if (warehouseProducts.length === 0 && storeProducts.length === 0) {
            throw new Error('No products found in JSON file');
        }
        
        // Combine all products for customers to view
        const allProducts = [
            ...storeProducts,
            ...warehouseProducts.map(p => ({
                ...p,
                fromWarehouse: true,
                store: p.shipperName || 'Warehouse'
            }))
        ];
        
        // Store in localStorage for other pages to use
        localStorage.setItem('warehouseProducts', JSON.stringify(warehouseProducts));
        localStorage.setItem('storeProducts', JSON.stringify(storeProducts));
        
        // Check if we're on products page (show all) or homepage (show first 8)
        const isProductsPage = window.location.pathname.includes('products.html');
        
        if (isProductsPage) {
            renderProducts(allProducts);
            // Populate store filter if on products page
            populateStoreFilter(allProducts);
        } else {
            // Homepage - show first 8 products
            renderProducts(allProducts.slice(0, 8));
        }
        
    } catch (error) {
        console.error('Error loading products:', error);
        if (noProductsElement) {
            noProductsElement.style.display = 'block';
            noProductsElement.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to Load Products</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()" style="margin-top: 15px; padding: 8px 20px; background: #ff8c33; color: white; border: none; border-radius: 5px; cursor: pointer;">Retry</button>
            `;
        }
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

function renderProducts(products) {
    const container = document.getElementById('productsGrid');
    if (!container) {
        console.error('Products grid container not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (!products || products.length === 0) {
        const noProductsElement = document.getElementById('noProducts');
        if (noProductsElement) noProductsElement.style.display = 'block';
        return;
    }
    
    const noProductsElement = document.getElementById('noProducts');
    if (noProductsElement) noProductsElement.style.display = 'none';
    
    console.log('Rendering', products.length, 'products');
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    products.forEach((product, index) => {
        const productId = product.id || `product-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
        const isWishlisted = wishlist.some(item => String(item.id) === String(productId));
        
        const hasDiscount = product.originalPrice && product.originalPrice > product.price;
        const originalPrice = product.originalPrice || (product.price * 1.2);
        const rating = product.rating || (4 + Math.random()).toFixed(1);
        const reviewCount = Math.floor(Math.random() * 50) + 10;
        
        // PKR Conversion (280 PKR per USD)
        const priceInPKR = (product.price * 280).toFixed(0);
        const originalInPKR = (originalPrice * 280).toFixed(0);
        
        // Ensure image URL is valid
        const productImage = product.image && product.image.startsWith('http') ? product.image : 
                            (product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80');
        
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        
        productElement.innerHTML = `
            <div class="product-image">
                <img src="${productImage}" alt="${product.name || 'Product'}" 
                     onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
                ${product.fromWarehouse ? '<span class="product-badge">Warehouse</span>' : ''}
                <div class="product-wishlist" data-id="${productId}">
                    <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category || 'General'}</div>
                <h3 class="product-title">${product.name || 'Product'}</h3>
                <p class="product-store"><i class="fas fa-store"></i> Sold by: ${product.store || product.shipperName || 'GlobalMart'}</p>
                <div class="product-rating">
                    <div class="product-stars">${generateStarRating(parseFloat(rating))}</div>
                    <span class="product-reviews">(${reviewCount} reviews)</span>
                </div>
                <div class="product-price">
                    <span class="product-current">Rs ${parseInt(priceInPKR).toLocaleString()}</span>
                    ${hasDiscount ? `<span class="product-original">Rs ${parseInt(originalInPKR).toLocaleString()}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="product-add-cart add-to-cart" 
                            data-id="${productId}" 
                            data-name="${product.name || 'Product'}" 
                            data-price="${product.price || 0}" 
                            data-image="${productImage}">
                        <i class="fas fa-shopping-cart"></i> Add
                    </button>
                    <a href="product-detail.html?id=${productId}" class="product-view">
                        <i class="fas fa-eye"></i>
                    </a>
                </div>
            </div>
        `;
        
        container.appendChild(productElement);
    });
    
    // Add cart event listeners
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.removeEventListener('click', handleAddToCart);
        button.addEventListener('click', handleAddToCart);
    });
    
    // Add wishlist event listeners
    document.querySelectorAll('.product-wishlist').forEach(button => {
        button.removeEventListener('click', handleWishlistClick);
        button.addEventListener('click', handleWishlistClick);
    });
}

function handleAddToCart(e) {
    e.preventDefault();
    addToCart({
        id: this.dataset.id,
        name: this.dataset.name,
        price: parseFloat(this.dataset.price),
        image: this.dataset.image,
        quantity: 1
    });
}

function handleWishlistClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const productCard = this.closest('.product-card');
    const icon = this.querySelector('i');
    
    const product = {
        id: this.dataset.id,
        name: productCard.querySelector('.product-title').textContent,
        price: parseFloat(productCard.querySelector('.add-to-cart').dataset.price),
        image: productCard.querySelector('img').src,
        store: productCard.querySelector('.product-store').textContent.replace('Sold by:', '').trim(),
        category: productCard.querySelector('.product-category').textContent
    };
    
    toggleWishlist(product, icon);
}

function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - rating < 1 && i - rating > 0) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function populateStoreFilter(products) {
    const storeFilter = document.getElementById('storeFilter');
    if (!storeFilter) return;
    
    const uniqueStores = [...new Set(products.map(p => p.store || p.shipperName).filter(Boolean))];
    
    uniqueStores.forEach(store => {
        const option = document.createElement('option');
        option.value = store;
        option.textContent = store;
        storeFilter.appendChild(option);
    });
}

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchType = document.getElementById('searchType');

if (searchInput && searchButton) {
    function performSearch() {
        const query = searchInput.value.trim();
        const type = searchType ? searchType.value : 'products';
        
        if (query === '') return;
        
        if (type === 'products') {
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        } else if (type === 'sellers') {
            window.location.href = `sellers.html?search=${encodeURIComponent(query)}`;
        }
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

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
    showToast(`${product.name} added to cart`);
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
        container.innerHTML = `<div class="empty-cart"><i class="fas fa-shopping-cart"></i><p>Your cart is empty</p><small>Add items to get started</small></div>`;
        if (totalEl) totalEl.textContent = 'Rs 0';
        return;
    }

    container.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const priceInPKR = (item.price * 280).toFixed(0);
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-image"><img src="${item.image}" alt="${item.name}"></div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>Rs ${parseInt(priceInPKR).toLocaleString()} x ${item.quantity}</p>
                <button class="remove-cart-item" data-id="${item.id}">&times;</button>
            </div>
        `;
        container.appendChild(div);
    });

    if (totalEl) totalEl.textContent = 'Rs ' + (total * 280).toFixed(0);

    document.querySelectorAll('.remove-cart-item').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });
}

// ===================== WISHLIST FUNCTIONS =====================
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function toggleWishlist(product, iconElement) {
    const existingIndex = wishlist.findIndex(item => String(item.id) === String(product.id));
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        showToast(`${product.name} removed from wishlist`);
        if (iconElement) {
            iconElement.classList.remove('fas');
            iconElement.classList.add('far');
        }
    } else {
        wishlist.push({
            id: String(product.id),
            name: product.name,
            price: product.price || 0,
            image: product.image || '',
            category: product.category || 'General',
            store: product.store || 'GlobalMart',
            addedAt: new Date().toISOString()
        });
        showToast(`${product.name} added to wishlist`);
        if (iconElement) {
            iconElement.classList.remove('far');
            iconElement.classList.add('fas');
        }
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    renderWishlistSidebar();
    renderWishlistIcons();
}

function updateWishlistCount() {
    const count = wishlist.length;
    document.querySelectorAll('.wishlist-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

function renderWishlistIcons() {
    document.querySelectorAll('.product-wishlist').forEach(btn => {
        const id = btn.dataset.id;
        const icon = btn.querySelector('i');
        if (wishlist.some(item => String(item.id) === String(id))) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    });
}

function renderWishlistSidebar() {
    const container = document.getElementById('wishlistItems');
    if (!container) return;
    
    if (wishlist.length === 0) {
        container.innerHTML = `
            <div class="empty-wishlist">
                <i class="fas fa-heart"></i>
                <p>Your wishlist is empty</p>
                <small>Click the heart icon on products to add them here</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    wishlist.forEach(item => {
        const priceInPKR = (item.price * 280).toFixed(0);
        html += `
            <div class="wishlist-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'">
                <div class="wishlist-item-info">
                    <h4 class="wishlist-item-title">${item.name}</h4>
                    <div class="wishlist-item-price">Rs ${parseInt(priceInPKR).toLocaleString()}</div>
                    <div class="wishlist-item-store">${item.store}</div>
                    <button class="wishlist-item-add-cart" onclick="addToCartFromWishlist('${item.id}')">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
                <button class="wishlist-item-remove" onclick="removeFromWishlist('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    container.innerHTML = html;
}

function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => String(item.id) !== String(productId));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    renderWishlistSidebar();
    renderWishlistIcons();
    showToast('Product removed from wishlist');
}

function addToCartFromWishlist(productId) {
    const product = wishlist.find(item => String(item.id) === String(productId));
    if (!product) return;
    
    addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
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
        cartSidebar.classList.add('active');
        overlay.classList.add('active');
        renderCartSidebar();
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

function setupCartSidebarListeners() {
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCart = document.getElementById('closeCart');
    const mobileCartBtn = document.getElementById('mobileCartBtn');
    
    if (cartIcon && cartSidebar && cartOverlay) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
            renderCartSidebar();
        });
    }
    
    if (mobileCartBtn && cartSidebar && cartOverlay) {
        mobileCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
            renderCartSidebar();
        });
    }
    
    if (closeCart && cartSidebar && cartOverlay) {
        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
        });
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
        });
    }
}

function setupWishlistSidebarListeners() {
    const wishlistIcon = document.getElementById('wishlistIcon');
    const wishlistSidebar = document.getElementById('wishlistSidebar');
    const wishlistOverlay = document.getElementById('wishlistOverlay');
    const closeWishlist = document.getElementById('closeWishlist');
    const mobileWishlistBtn = document.getElementById('mobileWishlistBtn');
    
    if (wishlistIcon && wishlistSidebar && wishlistOverlay) {
        wishlistIcon.addEventListener('click', (e) => {
            e.preventDefault();
            wishlistSidebar.classList.add('active');
            wishlistOverlay.classList.add('active');
            renderWishlistSidebar();
        });
    }
    
    if (mobileWishlistBtn && wishlistSidebar && wishlistOverlay) {
        mobileWishlistBtn.addEventListener('click', (e) => {
            e.preventDefault();
            wishlistSidebar.classList.add('active');
            wishlistOverlay.classList.add('active');
            renderWishlistSidebar();
        });
    }
    
    if (closeWishlist && wishlistSidebar && wishlistOverlay) {
        closeWishlist.addEventListener('click', () => {
            wishlistSidebar.classList.remove('active');
            wishlistOverlay.classList.remove('active');
        });
    }
    
    if (wishlistOverlay) {
        wishlistOverlay.addEventListener('click', () => {
            wishlistSidebar.classList.remove('active');
            wishlistOverlay.classList.remove('active');
        });
    }
}

// ===================== HELPER FUNCTIONS =====================
function getProductDetailsFromCard(card) {
    const id = card.querySelector('.add-to-cart')?.dataset.id;
    const name = card.querySelector('.product-title')?.textContent || 'Product';
    const price = parseFloat(card.querySelector('.product-price .current')?.textContent.replace('Rs', '').replace(',', '').trim()) / 280 || 0;
    const image = card.querySelector('img')?.src;
    const store = card.querySelector('.product-store')?.textContent.replace('Sold by:', '').trim() || 'GlobalMart';
    const category = card.querySelector('.product-category')?.textContent || 'General';
    return { id, name, price, image, store, category };
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-heart"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s';
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    }, 3000);
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
    const storeProducts = JSON.parse(localStorage.getItem('storeProducts')) || [];
    const warehouseProducts = JSON.parse(localStorage.getItem('warehouseProducts')) || [];

    const allProducts = [...storeProducts, ...warehouseProducts.map(p => ({
        ...p, fromWarehouse: true, store: p.shipperName || 'Warehouse'
    }))];

    const container = document.getElementById('featuredProducts');
    if (!container) return;

    container.innerHTML = '';

    allProducts.slice(0, 4).forEach(product => {
        const isWishlisted = wishlist.some(item => item.id == product.id);
        const priceInPKR = (product.price * 280).toFixed(0);
        
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
                <div class="product-price">Rs ${parseInt(priceInPKR).toLocaleString()}</div>
                <button class="btn btn-small add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">Add to Cart</button>
            </div>
        `;
        container.appendChild(productElement);
    });

    // Add event listeners
    document.querySelectorAll('#featuredProducts .add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            addToCart({
                id: this.dataset.id,
                name: this.dataset.name,
                price: parseFloat(this.dataset.price),
                image: this.dataset.image,
                quantity: 1
            });
        });
    });

    document.querySelectorAll('#featuredProducts .wishlist-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const product = {
                id: this.dataset.id,
                name: productCard.querySelector('.product-title').textContent,
                price: parseFloat(productCard.querySelector('.add-to-cart').dataset.price),
                image: productCard.querySelector('img').src,
                store: productCard.querySelector('.product-store').textContent.replace('Sold by:', '').trim(),
                category: 'Featured'
            };
            toggleWishlist(product, this.querySelector('i'));
        });
    });
}