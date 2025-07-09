// ===============================================================================
//                    SHOPPING CART MODULE
// ===============================================================================

class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.listeners = [];
  }

  // Load cart from localStorage
  loadCart() {
    const cartData = localStorage.getItem('shopping_cart');
    return cartData ? JSON.parse(cartData) : [];
  }

  // Save cart to localStorage
  saveCart() {
    localStorage.setItem('shopping_cart', JSON.stringify(this.items));
    this.notifyListeners();
  }

  // Add item to cart
  addItem(menuItem, quantity = 1) {
    const existingItem = this.items.find(item => item.id === menuItem.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: menuItem.id,
        food_name: menuItem.food_name,
        food_price: menuItem.food_price,
        food_image: menuItem.food_image,
        quantity: quantity
      });
    }
    
    this.saveCart();
    showNotification(`${menuItem.food_name} added to cart!`, 'success');
  }

  // Remove item from cart
  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    this.saveCart();
    showNotification('Item removed from cart', 'info');
  }

  // Update item quantity
  updateQuantity(itemId, quantity) {
    const item = this.items.find(item => item.id === itemId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(itemId);
      } else {
        item.quantity = quantity;
        this.saveCart();
      }
    }
  }

  // Get cart items
  getItems() {
    return this.items;
  }

  // Get cart total
  getTotal() {
    return this.items.reduce((total, item) => total + (item.food_price * item.quantity), 0);
  }

  // Get cart item count
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  // Clear cart
  clear() {
    this.items = [];
    this.saveCart();
  }

  // Check if cart is empty
  isEmpty() {
    return this.items.length === 0;
  }

  // Add change listener
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove change listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this));
  }

  // Convert cart to order format
  toOrderFormat() {
    return {
      items: this.items.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      }))
    };
  }
}

// ===============================================================================
//                              CART UI FUNCTIONS
// ===============================================================================

// Add item to cart (global function for menu integration)
function addToCart(itemId) {
  // Try to get the item from menu if available
  let item = null;

  // Check if menu items are available (from menu.js)
  if (typeof window.getMenuItemById === 'function') {
    item = window.getMenuItemById(itemId);
  } else if (typeof window.menuItems !== 'undefined') {
    item = window.menuItems.find(menuItem => menuItem.id === itemId);
  }

  if (item && item.is_available !== false) {
    cart.addItem(item, 1);
  } else if (item && item.is_available === false) {
    showNotification('This item is currently unavailable', 'warning');
  } else {
    console.error('Menu item not found:', itemId);
    showNotification('Item not found', 'error');
  }
}

// Process food image URL (same logic as menu.js)
function processImageUrl(foodImage) {
  let imageUrl = 'images/default-food.svg'; // Default fallback

  if (foodImage) {
    if (foodImage.startsWith('http')) {
      // Already a full URL
      imageUrl = foodImage;
    } else if (foodImage.startsWith('/')) {
      // Absolute path from backend - prepend backend base URL
      const apiBaseUrl = window.API_BASE_URL || 'http://127.0.0.1:8000/api';
      const backendBase = apiBaseUrl.replace('/api', '');
      imageUrl = `${backendBase}${foodImage}`;
    } else {
      // Relative path - prepend backend media URL
      const apiBaseUrl = window.API_BASE_URL || 'http://127.0.0.1:8000/api';
      const backendBase = apiBaseUrl.replace('/api', '');
      imageUrl = `${backendBase}/media/${foodImage}`;
    }
  }

  return imageUrl;
}

// Handle image loading errors in cart
function handleCartImageError(img, itemName) {
  console.log(`Cart image failed to load for ${itemName}, using fallback`);

  // Try different fallback strategies
  if (img.src.includes('default-food.svg')) {
    // Already using fallback, try a different one
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDxjaXJjbGUgY3g9IjE1MCIgY3k9IjgwIiByPSIyNSIgZmlsbD0iI2U0NTE0ZSIgb3BhY2l0eT0iMC4zIi8+CiAgPHJlY3QgeD0iMTI1IiB5PSIxMTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIzMCIgcng9IjUiIGZpbGw9IiNlNDUxNGUiIG9wYWNpdHk9IjAuMyIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiPkZvb2QgSW1hZ2U8L3RleHQ+CiAgPHRleHQgeD0iMTUwIiB5PSIxODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSI+Q29taW5nIFNvb248L3RleHQ+Cjwvc3ZnPg==';
  } else {
    // Try the SVG fallback first
    img.src = 'images/default-food.svg';
  }

  // Remove any error handlers to prevent infinite loops
  img.onerror = null;
}

// Update cart badge in navigation
function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  const count = cart.getItemCount();
  
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none';
  }
}

// Show cart modal
function showCartModal() {
  const modal = document.getElementById('cartModal');
  if (modal) {
    updateCartModalContent();
    modal.style.display = 'block';
  }
}

// Hide cart modal
function hideCartModal() {
  const modal = document.getElementById('cartModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Update cart modal content
function updateCartModalContent() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const specialInstructionsElement = document.getElementById('specialInstructions');

  if (!cartItems) return;

  if (cart.isEmpty()) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    cartTotal.textContent = '$0.00';
    checkoutBtn.disabled = true;

    // Clear special instructions when cart is empty
    if (specialInstructionsElement) {
      specialInstructionsElement.value = '';
    }
  } else {
    cartItems.innerHTML = cart.getItems().map(item => {
      const imageUrl = processImageUrl(item.food_image);
      console.log(`Cart item ${item.food_name}: original image = ${item.food_image}, processed = ${imageUrl}`);

      return `
        <div class="cart-item" data-id="${item.id}">
          <img src="${imageUrl}" alt="${item.food_name}" class="cart-item-image" onerror="handleCartImageError(this, '${item.food_name}')" loading="lazy">
          <div class="cart-item-details">
            <h4>${item.food_name}</h4>
            <p class="cart-item-price">${formatPrice(item.food_price)}</p>
          </div>
          <div class="cart-item-controls">
            <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
            <button class="remove-btn" onclick="removeCartItem(${item.id})">×</button>
          </div>
        </div>
      `;
    }).join('');

    cartTotal.textContent = formatPrice(cart.getTotal());
    checkoutBtn.disabled = false;
  }
}

// Update cart item quantity
function updateCartItemQuantity(itemId, quantity) {
  cart.updateQuantity(itemId, quantity);
  updateCartModalContent();
  updateCartBadge();
}

// Remove cart item
function removeCartItem(itemId) {
  cart.removeItem(itemId);
  updateCartModalContent();
  updateCartBadge();
}

// Clear cart (wrapper function for global access)
function clearCart() {
  cart.clear();
  updateCartModalContent();
  updateCartBadge();
  showNotification('Cart cleared', 'info');
}

// Checkout function
async function checkout() {
  if (!api.isAuthenticated()) {
    showNotification('Please login to place an order', 'warning');
    showLoginModal();
    return;
  }

  if (cart.isEmpty()) {
    showNotification('Your cart is empty', 'warning');
    return;
  }

  try {
    // Get special instructions from the textarea
    const specialInstructionsElement = document.getElementById('specialInstructions');
    const specialInstructions = specialInstructionsElement ? specialInstructionsElement.value.trim() : '';

    // Prepare checkout data using the new checkout endpoint format
    const checkoutData = {
      items: cart.items.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      })),
      special_instructions: specialInstructions || undefined
    };

    // Use the new checkout endpoint
    const response = await api.checkout(checkoutData);

    cart.clear();
    updateCartBadge();
    hideCartModal();

    // Clear special instructions field
    if (specialInstructionsElement) {
      specialInstructionsElement.value = '';
    }

    showNotification('Order placed and delivered successfully!', 'success');

    // Redirect to order confirmation or dashboard
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);

  } catch (error) {
    console.error('Checkout failed:', error);
    showNotification('Failed to place order. Please try again.', 'error');
  }
}

// Initialize cart
const cart = new ShoppingCart();

// Add cart change listener to update UI
cart.addListener(() => {
  updateCartBadge();
});

// Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});

// Export cart and functions for global access
if (typeof window !== 'undefined') {
  window.cart = cart;
  window.addToCart = addToCart;
  window.showCartModal = showCartModal;
  window.hideCartModal = hideCartModal;
  window.updateCartItemQuantity = updateCartItemQuantity;
  window.removeCartItem = removeCartItem;
  window.clearCart = clearCart;
  window.checkout = checkout;
  window.updateCartBadge = updateCartBadge;
  window.processImageUrl = processImageUrl;
  window.handleCartImageError = handleCartImageError;
}
