// ===============================================================================
//                    DASHBOARD MODULE
// ===============================================================================

let userOrders = [];
let userReservations = [];
let selectedRating = 0;

// ===============================================================================
//                              TAB MANAGEMENT
// ===============================================================================

function showTab(tabName) {
  // Hide all tabs
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.classList.remove('active'));
  
  // Remove active class from all buttons
  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach(button => button.classList.remove('active'));
  
  // Show selected tab
  const selectedTab = document.getElementById(tabName + 'Tab');
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Add active class to clicked button
  const selectedButton = event?.target || document.querySelector(`[onclick="showTab('${tabName}')"]`);
  if (selectedButton) {
    selectedButton.classList.add('active');
  }
  
  // Load data for the selected tab
  switch (tabName) {
    case 'orders':
      loadUserOrders();
      break;
    case 'reservations':
      loadUserReservations();
      break;
    case 'profile':
      loadUserProfile();
      break;
  }
}

// ===============================================================================
//                              ORDERS MANAGEMENT
// ===============================================================================

async function loadUserOrders() {
  const loadingElement = document.getElementById('ordersLoading');
  const listElement = document.getElementById('ordersList');
  
  if (loadingElement) loadingElement.style.display = 'block';
  if (listElement) listElement.innerHTML = '';
  
  try {
    userOrders = await api.getUserOrders();
    renderOrdersList(userOrders);
    
    if (loadingElement) loadingElement.style.display = 'none';
    
  } catch (error) {
    console.error('Failed to load orders:', error);
    if (loadingElement) loadingElement.style.display = 'none';
    if (listElement) {
      listElement.innerHTML = '<p class="no-data">Failed to load orders. Please try again.</p>';
    }
    showNotification('Failed to load orders', 'error');
  }
}

function renderOrdersList(orders) {
  const listElement = document.getElementById('ordersList');
  if (!listElement) return;
  
  if (orders.length === 0) {
    listElement.innerHTML = '<p class="no-data">No orders found. <a href="view.html">Browse our menu</a> to place your first order!</p>';
    return;
  }
  
  listElement.innerHTML = orders.map(order => createOrderHTML(order)).join('');
}

function createOrderHTML(order) {
  return `
    <div class="order-item">
      <div class="order-header">
        <div class="order-id">Order #${order.id}</div>
        <span class="status-badge" style="background-color: ${getOrderStatusColor(order.status)}">
          ${order.status}
        </span>
      </div>
      <div class="order-details">
        <p><strong>Date:</strong> ${formatDateTime(order.order_date)}</p>
        <div class="order-items">
          <strong>Items:</strong>
          ${order.order_items.map(item => `
            <div class="order-item-detail">
              <span>${item.menu_item.food_name} x${item.quantity}</span>
              <span>${formatPrice(item.price_at_time * item.quantity)}</span>
            </div>
          `).join('')}
        </div>
        ${order.special_instructions ? `<p><strong>Special Instructions:</strong> ${order.special_instructions}</p>` : ''}
        <div class="order-total">Total: ${formatPrice(order.total_amount)}</div>
        ${getReviewButtonHTML ? getReviewButtonHTML(order) : ''}
      </div>
    </div>
  `;
}

// ===============================================================================
//                              RESERVATIONS MANAGEMENT
// ===============================================================================

async function loadUserReservations() {
  const loadingElement = document.getElementById('reservationsLoading');
  const listElement = document.getElementById('reservationsList');
  
  if (loadingElement) loadingElement.style.display = 'block';
  if (listElement) listElement.innerHTML = '';
  
  try {
    userReservations = await api.getUserReservations();
    renderReservationsList(userReservations, 'reservationsList');
    
    if (loadingElement) loadingElement.style.display = 'none';
    
  } catch (error) {
    console.error('Failed to load reservations:', error);
    if (loadingElement) loadingElement.style.display = 'none';
    if (listElement) {
      listElement.innerHTML = '<p class="no-data">Failed to load reservations. Please try again.</p>';
    }
    showNotification('Failed to load reservations', 'error');
  }
}

// ===============================================================================
//                              PROFILE MANAGEMENT
// ===============================================================================

async function loadUserProfile() {
  const profileElement = document.getElementById('profileInfo');
  if (!profileElement) return;
  
  try {
    const profile = await api.getProfile();
    renderProfileInfo(profile);
    
  } catch (error) {
    console.error('Failed to load profile:', error);
    profileElement.innerHTML = '<p class="no-data">Failed to load profile information.</p>';
    showNotification('Failed to load profile', 'error');
  }
}

function renderProfileInfo(profile) {
  const profileElement = document.getElementById('profileInfo');
  if (!profileElement) return;
  
  profileElement.innerHTML = `
    <div class="info-item">
      <div class="info-label">Username</div>
      <div class="info-value">${profile.username}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Email</div>
      <div class="info-value">${profile.email}</div>
    </div>
    <div class="info-item">
      <div class="info-label">First Name</div>
      <div class="info-value">${profile.first_name || 'Not provided'}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Last Name</div>
      <div class="info-value">${profile.last_name || 'Not provided'}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Member Since</div>
      <div class="info-value">${formatDate(profile.date_created)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Account Status</div>
      <div class="info-value">${profile.is_active ? 'Active' : 'Inactive'}</div>
    </div>
  `;
}

// ===============================================================================
//                              REVIEW MANAGEMENT
// ===============================================================================

function showReviewModal(orderId, orderInfo = null) {
  // Check if the new ReviewWidget is available
  if (typeof window.showReviewModal !== 'undefined' && window.ReviewWidget) {
    // Use the new review widget modal
    window.showReviewModal(orderId, orderInfo, {
      onSuccess: (response) => {
        loadUserOrders(); // Reload orders to update review status
        showNotification('Thank you! Your review has been submitted successfully.', 'success');
      },
      onError: (error, message) => {
        showNotification(message, 'error');
      }
    });
    return;
  }

  // Fallback to existing modal
  const modal = document.getElementById('reviewModal');
  const orderIdInput = document.getElementById('reviewOrderId');

  if (modal && orderIdInput) {
    orderIdInput.value = orderId;
    modal.style.display = 'block';
    resetStarRating();
  }
}

function hideReviewModal() {
  const modal = document.getElementById('reviewModal');
  if (modal) {
    modal.style.display = 'none';
    clearReviewForm();
  }
}

function clearReviewForm() {
  // Use the new reset function if available
  if (typeof resetReviewModal === 'function') {
    resetReviewModal();
  } else {
    // Fallback to old method
    const form = document.getElementById('reviewForm');
    if (form) form.reset();
    resetStarRating();
  }
}

function resetStarRating() {
  selectedRating = 0;
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    star.style.opacity = '0.3';
  });
}

function setStarRating(rating) {
  selectedRating = rating;
  const starsInput = document.getElementById('reviewStars');
  if (starsInput) starsInput.value = rating;

  const stars = document.querySelectorAll('.star');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.style.opacity = '1';
      star.classList.add('selected');
    } else {
      star.style.opacity = '0.3';
      star.classList.remove('selected');
    }
  });

  // Update rating description
  const descriptions = {
    1: 'Poor - Not satisfied',
    2: 'Fair - Below expectations',
    3: 'Good - Met expectations',
    4: 'Very Good - Exceeded expectations',
    5: 'Excellent - Outstanding experience'
  };

  const ratingDescription = document.getElementById('ratingDescription');
  if (ratingDescription) {
    ratingDescription.textContent = descriptions[rating] || 'Click stars to rate';
    ratingDescription.style.color = rating > 0 ? '#e4514e' : '#666';
  }
}

// Character count function
function updateCharacterCount(textarea) {
  const charCount = document.getElementById('charCount');
  const currentLength = textarea.value.length;

  if (charCount) {
    charCount.textContent = currentLength;

    // Update styling based on character count
    const countElement = charCount.parentElement;
    if (currentLength < 10) {
      countElement.classList.add('warning');
    } else {
      countElement.classList.remove('warning');
    }
  }
}

async function handleReviewSubmission(event) {
  event.preventDefault();

  const form = event.target;
  const orderId = parseInt(form.order_id.value);
  const rating = selectedRating;
  const description = form.description.value.trim();

  try {
    // Use the new review submission function
    await addReview(orderId, rating, description, {
      onLoading: (isLoading) => {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = isLoading;
          submitButton.textContent = isLoading ? 'Submitting...' : 'Submit Review';
        }
      },
      onSuccess: (response) => {
        hideReviewModal();
        loadUserOrders(); // Reload orders to update review status
      },
      successMessage: 'Thank you! Your review has been submitted successfully.'
    });

  } catch (error) {
    // Error handling is done by the addReview function
    console.error('Review submission failed:', error);
  }
}

// ===============================================================================
//                              INITIALIZATION
// ===============================================================================

// Check authentication and redirect if not logged in
function checkDashboardAuth() {
  if (!api.isAuthenticated()) {
    showNotification('Please login to access your dashboard', 'warning');
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  if (!checkDashboardAuth()) return;
  
  // Setup star rating click handlers
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, index) => {
    star.addEventListener('click', () => setStarRating(index + 1));
  });
  
  // Setup review form handler
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', handleReviewSubmission);
  }
  
  // Load initial tab (orders)
  loadUserOrders();
});

// Export functions for global access
if (typeof window !== 'undefined') {
  window.showTab = showTab;
  window.showReviewModal = showReviewModal;
  window.hideReviewModal = hideReviewModal;
  window.updateCharacterCount = updateCharacterCount;
}
