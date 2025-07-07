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
  
  if (!cartItems) return;
  
  if (cart.isEmpty()) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    cartTotal.textContent = '$0.00';
    checkoutBtn.disabled = true;
  } else {
    cartItems.innerHTML = cart.getItems().map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.food_image || 'images/default-food.svg'}" alt="${item.food_name}" class="cart-item-image">
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
    `).join('');
    
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
    const orderData = cart.toOrderFormat();
    const order = await api.createOrder(orderData);
    
    cart.clear();
    updateCartBadge();
    hideCartModal();
    
    showNotification('Order placed successfully!', 'success');
    
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
