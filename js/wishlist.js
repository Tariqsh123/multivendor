function initWishlist() {
    if (!localStorage.getItem('wishlist')) {
        localStorage.setItem('wishlist', JSON.stringify([]));
    }
}

function toggleWishlist(product) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingIndex = wishlist.findIndex(item => item.id == product.id);

    let message = '';

    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        message = `${product.name} removed from wishlist`;
    } else {
        wishlist.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category || 'General',
            store: product.store || product.shipperName || 'GlobalMart',
            addedAt: new Date().toISOString()
        });
        message = `${product.name} added to wishlist`;
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistButtons();
    showToast(message);
    updateWishlistCount();

    if (window.location.pathname.includes('dashboard.html')) {
        updateDashboardWishlist();
    }
}

function isInWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    return wishlist.some(item => item.id == productId);
}

function updateWishlistButtons() {
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        const productCard = button.closest('.product-card');
        if (productCard) {
            const productId = button.dataset.id || getProductIdFromCard(productCard);
            if (productId) {
                button.dataset.id = productId;
                const heartIcon = button.querySelector('i');
                if (isInWishlist(productId)) {
                    button.classList.add('active');
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas');
                    heartIcon.style.color = '#ff4757';
                } else {
                    button.classList.remove('active');
                    heartIcon.classList.remove('fas');
                    heartIcon.classList.add('far');
                    heartIcon.style.color = '';
                }
            }
        }
    });
}

function getProductIdFromCard(productCard) {
    const addToCartBtn = productCard.querySelector('.add-to-cart');
    if (addToCartBtn && addToCartBtn.dataset.id) return addToCartBtn.dataset.id;

    const productTitle = productCard.querySelector('.product-title');
    if (productTitle) return productTitle.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    return null;
}

function getProductDetailsFromCard(productCard) {
    const productId = getProductIdFromCard(productCard);
    const productName = productCard.querySelector('.product-title')?.textContent || 'Product';

    let price = 0;
    const priceElement = productCard.querySelector('.product-price');
    if (priceElement) price = parseFloat(priceElement.textContent.replace('$', '').trim()) || 0;

    const imageElement = productCard.querySelector('img');
    const imageUrl = imageElement?.src || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';

    let store = 'GlobalMart';
    const storeElement = productCard.querySelector('.product-store');
    if (storeElement) store = storeElement.textContent.replace('Sold by:', '').trim() || 'GlobalMart';

    let category = 'General';
    const categoryBadge = productCard.querySelector('.warehouse-badge');
    if (categoryBadge) category = categoryBadge.textContent.trim();

    return { id: productId, name: productName, price, image: imageUrl, store, category };
}

function setupWishlistButtonListeners() {
    document.addEventListener('click', function(e) {
        const wishlistBtn = e.target.closest('.wishlist-btn');
        if (!wishlistBtn) return;

        const productCard = wishlistBtn.closest('.product-card');
        if (!productCard) return;

        const product = getProductDetailsFromCard(productCard);
        if (product.id) toggleWishlist(product);
    });
}

function getWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    return wishlist.length;
}

function updateWishlistCount() {
    const countElements = document.querySelectorAll('.wishlist-count');
    const count = getWishlistCount();

    countElements.forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: #2ed573;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                animation: slideIn 0.3s ease;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .toast i { font-size: 1.2rem; }
            @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100px); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas ${message.includes('added') ? 'fa-heart' : 'fa-times'}"></i><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }, 3000);
}

function getWishlistItems() {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
}

function clearWishlist() {
    localStorage.setItem('wishlist', JSON.stringify([]));
    updateWishlistButtons();
    updateWishlistCount();
    showToast('Wishlist cleared');
}

function updateDashboardWishlist() {
    if (!window.location.pathname.includes('dashboard.html')) return;
    const container = document.getElementById('wishlistContent');
    if (!container) return;
    loadWishlist();
}

function loadWishlist() {
    const wishlist = getWishlistItems();
    const container = document.getElementById('wishlistContent');
    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;">
                <i class="fas fa-heart" style="font-size:3rem;color:#ccc;margin-bottom:20px;"></i>
                <h3>Your wishlist is empty</h3>
                <p>Click the heart icon on any product to add it here</p>
                <a href="products.html" class="btn btn-primary">Browse Products</a>
            </div>
        `;
        return;
    }

    let html = '<div style="display:flex;flex-direction:column;gap:15px;">';
    wishlist.forEach(item => {
        html += `
            <div class="wishlist-item">
                <img src="${item.image}" alt="${item.name}" 
                     style="width:80px;height:80px;object-fit:cover;border-radius:8px;"
                     onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'">
                <div style="flex:1;">
                    <h4 style="margin:0 0 5px 0;">${item.name}</h4>
                    <div style="color:#2ed573;font-weight:bold;">$${item.price.toFixed(2)}</div>
                    <div style="font-size:0.9rem;color:#666;">${item.store}</div>
                    <div style="font-size:0.8rem;color:#999;">Added ${new Date(item.addedAt).toLocaleDateString()}</div>
                </div>
                <button class="remove-wishlist" onclick="removeFromWishlistById(${item.id})" title="Remove from wishlist">
                    <i class="fas fa-times"></i>
                </button>
                <div class="action-buttons">
                    <button class="btn btn-small" onclick="addToCartFromWishlist(${item.id})">Add to Cart</button>
                    <a href="products.html" class="btn btn-outline btn-small">View Similar</a>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function removeFromWishlistById(productId) {
    const updated = getWishlistItems().filter(item => item.id != productId);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    loadWishlist();
    updateWishlistCount();
    updateWishlistButtons();
    showToast('Product removed from wishlist');
}

function addToCartFromWishlist(productId) {
    const product = getWishlistItems().find(item => item.id == productId);
    if (!product) return;

    if (typeof addToCart === 'function') {
        addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
        showToast(`${product.name} added to cart!`);
        if (typeof updateCartCount === 'function') updateCartCount();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initWishlist();
    setupWishlistButtonListeners();
    updateWishlistButtons();
    updateWishlistCount();
});