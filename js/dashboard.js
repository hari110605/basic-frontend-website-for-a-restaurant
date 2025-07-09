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
    profileElement.innerHTML = '<p class="no-data">Failed to load profile information.</p>';
    showNotification('Failed to load profile', 'error');
  }
}

function renderProfileInfo(profile) {
  const profileElement = document.getElementById('profileInfo');
  if (!profileElement) return;

  profileElement.innerHTML = `
    <div class="profile-header">
      <h3>👤 Profile Information</h3>
      <button class="edit-profile-btn" onclick="showEditProfileModal()">
        ✏️ Edit Profile
      </button>
    </div>

    <div class="profile-grid">
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
        <div class="info-value" id="displayFirstName">${profile.first_name || 'Not provided'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Last Name</div>
        <div class="info-value" id="displayLastName">${profile.last_name || 'Not provided'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Member Since</div>
        <div class="info-value">${formatDate(profile.date_created)}</div>
      </div>
    </div>
  `;

  // Store current profile data for editing
  window.currentUserProfile = profile;
}

// ===============================================================================
//                              PROFILE MANAGEMENT
// ===============================================================================

// Show edit profile modal
function showEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  if (!modal) return;

  // Pre-fill form with current data
  const firstNameInput = document.getElementById('editFirstName');
  const lastNameInput = document.getElementById('editLastName');

  if (window.currentUserProfile) {
    if (firstNameInput) firstNameInput.value = window.currentUserProfile.first_name || '';
    if (lastNameInput) lastNameInput.value = window.currentUserProfile.last_name || '';
  }

  modal.style.display = 'block';
}

// Hide edit profile modal
function hideEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  if (modal) {
    modal.style.display = 'none';
    clearProfileForm();
  }
}

// Clear profile form
function clearProfileForm() {
  const form = document.getElementById('editProfileForm');
  if (form) form.reset();
}

// Handle profile form submission
async function handleProfileSubmission(event) {
  event.preventDefault();

  const firstNameInput = document.getElementById('editFirstName');
  const lastNameInput = document.getElementById('editLastName');
  const submitButton = document.querySelector('#editProfileForm button[type="submit"]');

  if (!firstNameInput || !lastNameInput) {
    showNotification('Form elements not found', 'error');
    return;
  }

  // Check if API is available
  if (typeof api === 'undefined') {
    showNotification('API service not available', 'error');
    return;
  }

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();

  // Validation
  if (!firstName || !lastName) {
    showNotification('Please fill in both first name and last name', 'warning');
    return;
  }

  if (firstName.length < 2 || lastName.length < 2) {
    showNotification('Names must be at least 2 characters long', 'warning');
    return;
  }

  // Disable submit button during request
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Updating...';
  }

  try {
    const profileData = {
      first_name: firstName,
      last_name: lastName
    };

    const response = await api.updateProfile(profileData);

    if (response.success) {
      // Update stored profile data
      if (window.currentUserProfile) {
        window.currentUserProfile.first_name = firstName;
        window.currentUserProfile.last_name = lastName;
        window.currentUserProfile.full_name = `${firstName} ${lastName}`;
      }

      // Update stored user data in localStorage
      const currentUser = api.getCurrentUser();
      if (currentUser) {
        currentUser.first_name = firstName;
        currentUser.last_name = lastName;
        currentUser.full_name = `${firstName} ${lastName}`;
        api.setCurrentUser(currentUser);
      }

      // Update display
      updateProfileDisplay(firstName, lastName);

      // Hide modal and show success message
      hideEditProfileModal();
      showNotification(response.message || 'Profile updated successfully!', 'success');

    } else {
      showNotification(response.message || 'Failed to update profile', 'error');
    }

  } catch (error) {
    showNotification('Failed to update profile. Please try again.', 'error');
  } finally {
    // Re-enable submit button
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Save Changes';
    }
  }
}

// Update profile display without full reload
function updateProfileDisplay(firstName, lastName) {
  const firstNameDisplay = document.getElementById('displayFirstName');
  const lastNameDisplay = document.getElementById('displayLastName');

  if (firstNameDisplay) firstNameDisplay.textContent = firstName;
  if (lastNameDisplay) lastNameDisplay.textContent = lastName;

  // Update user info in header if it exists
  const currentUser = api.getCurrentUser();
  if (currentUser && typeof updateUserInfo === 'function') {
    // Update the stored user object with new names
    currentUser.first_name = firstName;
    currentUser.last_name = lastName;
    currentUser.full_name = `${firstName} ${lastName}`;

    // Update the display
    updateUserInfo(currentUser);
  }
}

// ===============================================================================
//                              REVIEW MANAGEMENT
// ===============================================================================

function showReviewModal(orderId, orderInfo = null) {
  // Use the enhanced modal directly
  const modal = document.getElementById('reviewModal');
  const orderIdInput = document.getElementById('reviewOrderId');

  if (modal && orderIdInput) {
    orderIdInput.value = orderId;

    // Show order info if available
    if (orderInfo) {
      updateReviewModalOrderInfo(orderInfo);
    }

    modal.style.display = 'block';
    resetEnhancedStarRating();
    resetEnhancedTextarea();
  }
}

function updateReviewModalOrderInfo(orderInfo) {
  const orderInfoSection = document.getElementById('reviewOrderInfo');
  const orderIdDisplay = document.getElementById('displayOrderId');
  const orderDateDisplay = document.getElementById('displayOrderDate');
  const orderTotalDisplay = document.getElementById('displayOrderTotal');
  const orderStatusDisplay = document.getElementById('displayOrderStatus');

  if (orderInfoSection && orderInfo) {
    orderInfoSection.style.display = 'block';

    if (orderIdDisplay) orderIdDisplay.textContent = `#${orderInfo.id}`;
    if (orderDateDisplay) orderDateDisplay.textContent = orderInfo.order_date ? new Date(orderInfo.order_date).toLocaleDateString() : '---';
    if (orderTotalDisplay) orderTotalDisplay.textContent = orderInfo.total_amount ? `$${orderInfo.total_amount}` : '---';
    if (orderStatusDisplay) orderStatusDisplay.textContent = orderInfo.status || '---';
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
  // Reset the form
  const form = document.getElementById('reviewForm');
  if (form) form.reset();

  // Reset both star rating systems
  resetStarRating();
  resetEnhancedStarRating();
  resetEnhancedTextarea();

  // Hide order info section
  const orderInfoSection = document.getElementById('reviewOrderInfo');
  if (orderInfoSection) {
    orderInfoSection.style.display = 'none';
  }
}

function resetStarRating() {
  selectedRating = 0;
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    star.style.opacity = '0.3';
  });
}

// Enhanced star rating functions
function resetEnhancedStarRating() {
  selectedRating = 0;
  document.getElementById('reviewStars').value = '';

  // Reset enhanced visual state
  document.querySelectorAll('.enhanced-star').forEach(star => {
    star.classList.remove('active');
  });

  // Reset enhanced description
  const description = document.getElementById('enhancedRatingDescription');
  if (description) {
    description.textContent = 'Click stars to rate your experience';
    description.classList.remove('selected');
  }
}

function resetEnhancedTextarea() {
  const textarea = document.getElementById('reviewDescription');
  const charCount = document.getElementById('enhancedCharCount');

  if (textarea) {
    textarea.value = '';
  }

  if (charCount) {
    charCount.textContent = '0';
    charCount.parentElement.className = 'enhanced-character-count';
  }
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

// Enhanced character count function
function updateEnhancedCharacterCount(textarea) {
  const charCount = document.getElementById('enhancedCharCount');
  if (!charCount) return;

  const countContainer = charCount.parentElement;
  const length = textarea.value.length;

  charCount.textContent = length;

  // Reset classes
  countContainer.className = 'enhanced-character-count';

  // Add appropriate class based on length
  if (length < 10) {
    countContainer.classList.add('error');
  } else if (length > 450) {
    countContainer.classList.add('warning');
  }
}

// Enhanced star rating functions
function initializeEnhancedStarRating() {
  const ratingDescriptions = {
    0: "Click stars to rate your experience",
    1: "😞 Poor - Very disappointed",
    2: "😐 Fair - Below expectations",
    3: "🙂 Good - Met expectations",
    4: "😊 Very Good - Exceeded expectations",
    5: "🤩 Excellent - Outstanding experience!"
  };

  const stars = document.querySelectorAll('.enhanced-star');
  const ratingDescription = document.getElementById('enhancedRatingDescription');

  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      setEnhancedStarRating(index + 1);
    });

    star.addEventListener('mouseenter', () => {
      highlightEnhancedStars(index + 1);
      if (ratingDescription) {
        ratingDescription.textContent = ratingDescriptions[index + 1];
        ratingDescription.classList.add('selected');
      }
    });
  });

  const starContainer = document.getElementById('enhancedStarRating');
  if (starContainer) {
    starContainer.addEventListener('mouseleave', () => {
      highlightEnhancedStars(selectedRating);
      if (ratingDescription) {
        ratingDescription.textContent = ratingDescriptions[selectedRating];
        if (selectedRating === 0) {
          ratingDescription.classList.remove('selected');
        }
      }
    });
  }
}

function setEnhancedStarRating(rating) {
  selectedRating = rating;
  document.getElementById('reviewStars').value = rating;
  highlightEnhancedStars(rating);

  const ratingDescription = document.getElementById('enhancedRatingDescription');
  if (ratingDescription) {
    const descriptions = {
      1: "😞 Poor - Very disappointed",
      2: "😐 Fair - Below expectations",
      3: "🙂 Good - Met expectations",
      4: "😊 Very Good - Exceeded expectations",
      5: "🤩 Excellent - Outstanding experience!"
    };
    ratingDescription.textContent = descriptions[rating];
    ratingDescription.classList.add('selected');
  }
}

function highlightEnhancedStars(rating) {
  const stars = document.querySelectorAll('.enhanced-star');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  if (!checkDashboardAuth()) return;

  // Setup star rating click handlers
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, index) => {
    star.addEventListener('click', () => setStarRating(index + 1));
  });

  // Setup enhanced star rating
  initializeEnhancedStarRating();

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
