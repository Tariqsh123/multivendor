// Dashboard initialization
function loadDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Show not logged in message
        document.getElementById('notLoggedIn').style.display = 'block';
        return;
    }
    
    // Hide not logged in message
    document.getElementById('notLoggedIn').style.display = 'none';
    
    // Update user info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    
    // Show appropriate dashboard based on role
    if (currentUser.role === 'customer') {
        showCustomerDashboard(currentUser);
    } else if (currentUser.role === 'manager') {
        showManagerDashboard(currentUser);
    } else if (currentUser.role === 'shipper') {
        showShipperDashboard(currentUser);
    }
}

function showCustomerDashboard(user) {
    document.getElementById('customerDashboard').style.display = 'block';
    document.getElementById('dashboardTitle').textContent = 'Customer Dashboard';
    document.getElementById('dashboardSubtitle').textContent = `Welcome back, ${user.name}`;
    
    // Load customer orders
    loadCustomerOrders(user);
    
    // Load recommended products
    loadRecommendedProducts();
}

function showManagerDashboard(user) {
    document.getElementById('managerDashboard').style.display = 'block';
    document.getElementById('dashboardTitle').textContent = 'Store Manager Dashboard';
    document.getElementById('dashboardSubtitle').textContent = `Manage your store, ${user.name}`;
    
    // Update store name display
    const storeName = user.storeName || `${user.name}'s Store`;
    document.getElementById('storeName').textContent = storeName;
    
    // Update product count
    const storeProducts = JSON.parse(localStorage.getItem('storeProducts')) || [];
    const managerProducts = storeProducts.filter(p => p.storeId === user.storeId);
    document.getElementById('productCount').textContent = `Products: ${managerProducts.length}`;
    
    // Load warehouse products
    loadWarehouseProducts(user);
    
    // Load manager's store products
    loadManagerStoreProducts(user);
}

function showShipperDashboard(user) {
    document.getElementById('shipperDashboard').style.display = 'block';
    document.getElementById('dashboardTitle').textContent = 'Shipper Dashboard';
    document.getElementById('dashboardSubtitle').textContent = `Upload products to warehouse, ${user.name}`;
    
    // Update product count
    const warehouseProducts = JSON.parse(localStorage.getItem('warehouseProducts')) || [];
    const shipperProducts = warehouseProducts.filter(p => p.shipperId === user.id);
    document.getElementById('shipperProductCount').textContent = `Products: ${shipperProducts.length}`;
    
    // Calculate total commission
    const totalCommission = shipperProducts.reduce((sum, product) => {
        return sum + (product.price * (product.commission / 100) * (product.sold || 0));
    }, 0);
    document.getElementById('totalCommission').textContent = `Total: $${totalCommission.toFixed(2)}`;
    
    // Load shipper's products
    loadShipperProducts(user);
    
    // Setup upload form
    setupUploadForm(user);
}

function loadCustomerOrders(user) {
    // In a real app, this would fetch from backend
    // For demo, we'll use localStorage or empty array
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(order => order.userId === user.id);
    
    const tbody = document.getElementById('customerOrders');
    tbody.innerHTML = '';
    
    if (userOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">No orders yet</td></tr>';
        return;
    }
    
    userOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id.toString().substring(0, 8)}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="status ${order.status}">${order.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function loadRecommendedProducts() {
    const products = JSON.parse(localStorage.getItem('storeProducts')) || [];
    const container = document.getElementById('customerProducts');
    
    // Show first 4 products
    const recommended = products.slice(0, 4);
    
    container.innerHTML = '';
    recommended.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <button class="wishlist-btn"><i class="far fa-heart"></i></button>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-store">Sold by: ${product.store}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn btn-small add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">Add to Cart</button>
            </div>
        `;
        container.appendChild(productElement);
    });
    
    // Add event listeners to cart buttons
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
            updateCartCount();
        });
    });
}

function loadWarehouseProducts(user) {
    const warehouseProducts = JSON.parse(localStorage.getItem('warehouseProducts')) || [];
    const container = document.getElementById('warehouseProductsGrid');
    
    container.innerHTML = '';
    
    if (warehouseProducts.length === 0) {
        container.innerHTML = '<div class="no-data">No products in warehouse</div>';
        return;
    }
    
    warehouseProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="warehouse-badge">Warehouse</div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-store">From: ${product.shipperName || 'Shipper'}</p>
                <p class="product-desc">${product.description || ''}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="commission">Commission: ${product.commission}%</div>
                <button class="btn btn-small add-to-store" data-id="${product.id}">Add to My Store</button>
            </div>
        `;
        container.appendChild(productElement);
    });
    
    // Add event listeners to "Add to Store" buttons
    document.querySelectorAll('.add-to-store').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            addProductToStore(productId, user);
        });
    });
}

function loadManagerStoreProducts(user) {
    const storeProducts = JSON.parse(localStorage.getItem('storeProducts')) || [];
    const managerProducts = storeProducts.filter(p => p.storeId === user.storeId);
    const container = document.getElementById('myStoreProductsGrid');
    
    container.innerHTML = '';
    
    if (managerProducts.length === 0) {
        container.innerHTML = '<div class="no-data">No products in your store yet</div>';
        return;
    }
    
    managerProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-store">In your store</p>
                <p class="product-desc">${product.description || ''}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn btn-small btn-outline remove-from-store" data-id="${product.id}">Remove</button>
            </div>
        `;
        container.appendChild(productElement);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-from-store').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            removeProductFromStore(productId, user);
        });
    });
}

function loadShipperProducts(user) {
    const warehouseProducts = JSON.parse(localStorage.getItem('warehouseProducts')) || [];
    const shipperProducts = warehouseProducts.filter(p => p.shipperId === user.id);
    const container = document.getElementById('shipperProductsGrid');
    
    container.innerHTML = '';
    
    if (shipperProducts.length === 0) {
        container.innerHTML = '<div class="no-data">You haven\'t uploaded any products yet</div>';
        return;
    }
    
    shipperProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="warehouse-badge">Your Product</div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description || ''}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="commission">Commission: ${product.commission}%</div>
                <div class="sold-count">Sold: ${product.sold || 0}</div>
                <div class="commission-earned">Earned: $${((product.price * (product.commission / 100) * (product.sold || 0)) || 0).toFixed(2)}</div>
                <button class="btn btn-small btn-outline remove-product" data-id="${product.id}">Remove</button>
            </div>
        `;
        container.appendChild(productElement);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-product').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            removeProductFromWarehouse(productId, user);
        });
    });
}

function setupUploadForm(user) {
    const form = document.getElementById('uploadProductForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('productName').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const category = document.getElementById('productCategory').value;
        const commission = parseInt(document.getElementById('productCommission').value);
        const description = document.getElementById('productDescription').value;
        const image = document.getElementById('productImage').value;
        
        // Get warehouse products
        const warehouseProducts = JSON.parse(localStorage.getItem('warehouseProducts')) || [];
        
        // Create product object
        const product = {
            id: Date.now(),
            name,
            price,
            category,
            commission,
            description,
            image,
            shipperId: user.id,
            shipperName: user.name,
            sold: 0,
            createdAt: new Date().toISOString()
        };
        
        // Add to warehouse
        warehouseProducts.push(product);
        localStorage.setItem('warehouseProducts', JSON.stringify(warehouseProducts));
        
        // Reset form
        form.reset();
        
        // Reload shipper products
        loadShipperProducts(user);
        
        // Update product count
        const shipperProducts = warehouseProducts.filter(p => p.shipperId === user.id);
        document.getElementById('shipperProductCount').textContent = `Products: ${shipperProducts.length}`;
        
        alert('Product uploaded to warehouse successfully!');
    });
}

function addProductToStore(productId, user) {
    // Get warehouse product
    const warehouseProducts = JSON.parse(localStorage.getItem('warehouseProducts')) || [];
    const product = warehouseProducts.find(p => p.id === productId);
    
    if (!product) {
        alert('Product not found in warehouse!');
        return;
    }
    
    // Get store products
    const storeProducts = JSON.parse(localStorage.getItem('storeProducts')) || [];
    
    // Check if product already in store
    if (storeProducts.find(p => p.warehouseId === productId && p.storeId === user.storeId)) {
        alert('This product is already in your store!');
        return;
    }
    
    // Create store product (with markup)
    const storeProduct = {
        id: Date.now(),
        warehouseId: product.id,
        name: product.name,
        price: product.price * 1.2, // 20% markup
        originalPrice: product.price,
        category: product.category,
        description: product.description,
        image: product.image,
        storeId: user.storeId,
        store: user.storeName || `${user.name}'s Store`,
        shipperId: product.shipperId,
        shipperName: product.shipperName,
        commission: product.commission,
        createdAt: new Date().toISOString()
    };
    
    // Add to store products
    storeProducts.push(storeProduct);
    localStorage.setItem('storeProducts', JSON.stringify(storeProducts));
    
    // Update product count
    const managerProducts = storeProducts.filter(p => p.storeId === user.storeId);
    document.getElementById('productCount').textContent = `Products: ${managerProducts.length}`;
    
    // Reload manager's store products
    loadManagerStoreProducts(user);
    
    alert('Product added to your store successfully!');
}

function removeProductFromStore(productId, user) {
    // Get store products
    const storeProducts = JSON.parse(localStorage.getItem('storeProducts')) || [];
    
    // Remove product
    const updatedProducts = storeProducts.filter(p => p.id !== productId);
    localStorage.setItem('storeProducts', JSON.stringify(updatedProducts));
    
    // Update product count
    const managerProducts = updatedProducts.filter(p => p.storeId === user.storeId);
    document.getElementById('productCount').textContent = `Products: ${managerProducts.length}`;
    
    // Reload manager's store products
    loadManagerStoreProducts(user);
    
    alert('Product removed from your store!');
}

function removeProductFromWarehouse(productId, user) {
    // Get warehouse products
    const warehouseProducts = JSON.parse(localStorage.getItem('warehouseProducts')) || [];
    
    // Remove product
    const updatedProducts = warehouseProducts.filter(p => p.id !== productId);
    localStorage.setItem('warehouseProducts', JSON.stringify(updatedProducts));
    
    // Also remove from store products
    const storeProducts = JSON.parse(localStorage.getItem('storeProducts')) || [];
    const updatedStoreProducts = storeProducts.filter(p => p.warehouseId !== productId);
    localStorage.setItem('storeProducts', JSON.stringify(updatedStoreProducts));
    
    // Reload shipper products
    loadShipperProducts(user);
    
    // Update product count
    const shipperProducts = updatedProducts.filter(p => p.shipperId === user.id);
    document.getElementById('shipperProductCount').textContent = `Products: ${shipperProducts.length}`;
    
    alert('Product removed from warehouse!');
}

function setupDashboardTabs() {
    const tabBtns = document.querySelectorAll('.dash-tab-btn');
    const tabContents = document.querySelectorAll('.dash-tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}Tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

function setupDashboardEvents() {
    // Store name edit
    const editStoreBtn = document.getElementById('editStoreBtn');
    const storeNameModal = document.getElementById('storeNameModal');
    const storeNameInput = document.getElementById('storeNameInput');
    const saveStoreNameBtn = document.getElementById('saveStoreNameBtn');
    
    if (editStoreBtn) {
        editStoreBtn.addEventListener('click', () => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            storeNameInput.value = currentUser.storeName || `${currentUser.name}'s Store`;
            storeNameModal.style.display = 'flex';
        });
    }
    
    if (saveStoreNameBtn) {
        saveStoreNameBtn.addEventListener('click', () => {
            const newStoreName = storeNameInput.value.trim();
            
            if (newStoreName) {
                // Update current user
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                currentUser.storeName = newStoreName;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // Update store name display
                document.getElementById('storeName').textContent = newStoreName;
                
                // Update store products
                const storeProducts = JSON.parse(localStorage.getItem('storeProducts')) || [];
                storeProducts.forEach(product => {
                    if (product.storeId === currentUser.storeId) {
                        product.store = newStoreName;
                    }
                });
                localStorage.setItem('storeProducts', JSON.stringify(storeProducts));
                
                // Close modal
                storeNameModal.style.display = 'none';
                
                alert('Store name updated successfully!');
            }
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === storeNameModal) {
            storeNameModal.style.display = 'none';
        }
    });
    
    // Add from warehouse button
    const addFromWarehouseBtn = document.getElementById('addFromWarehouseBtn');
    if (addFromWarehouseBtn) {
        addFromWarehouseBtn.addEventListener('click', () => {
            // Switch to warehouse tab
            document.querySelector('[data-tab="warehouse"]').click();
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', loadDashboard);