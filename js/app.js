// ===============================================================================
//                    MAIN APPLICATION JAVASCRIPT
// ===============================================================================

// Global state
let currentUser = null;

// ===============================================================================
//                              AUTHENTICATION
// ===============================================================================

// Check authentication status on page load
function checkAuthStatus() {
  if (api.isAuthenticated()) {
    currentUser = api.getCurrentUser();
    updateNavigation(true);
    if (currentUser) {
      updateUserInfo(currentUser);
    } else {
      // Fetch user profile if not cached
      fetchUserProfile();
    }
  } else {
    updateNavigation(false);
  }
}

// Fetch user profile
async function fetchUserProfile() {
  try {
    const profile = await api.getProfile();
    currentUser = profile;
    api.setCurrentUser(profile);
    updateUserInfo(profile);
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    // Token might be invalid, logout
    api.logout();
    updateNavigation(false);
  }
}

// Update navigation based on auth status
function updateNavigation(isAuthenticated) {
  const authButtons = document.querySelector('.auth-buttons');
  const userMenu = document.querySelector('.user-menu');
  
  if (isAuthenticated) {
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) userMenu.style.display = 'block';
  } else {
    if (authButtons) authButtons.style.display = 'block';
    if (userMenu) userMenu.style.display = 'none';
  }
}

// Update user info display
function updateUserInfo(user) {
  const userNameElements = document.querySelectorAll('.user-name');
  userNameElements.forEach(element => {
    element.textContent = user.username || user.email;
  });
}

// Show login modal
function showLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

// Hide login modal
function hideLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.style.display = 'none';
    clearLoginForm();
  }
}

// Show register modal
function showRegisterModal() {
  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

// Hide register modal
function hideRegisterModal() {
  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.style.display = 'none';
    clearRegisterForm();
  }
}

// Clear login form
function clearLoginForm() {
  const form = document.getElementById('loginForm');
  if (form) form.reset();
}

// Clear register form
function clearRegisterForm() {
  const form = document.getElementById('registerForm');
  if (form) form.reset();
}

// Handle login form submission
async function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const email = form.email.value;
  const password = form.password.value;
  
  try {
    const response = await api.login(email, password);
    currentUser = response.user;
    api.setCurrentUser(response.user);
    
    hideLoginModal();
    updateNavigation(true);
    updateUserInfo(response.user);
    
    showNotification('Login successful!', 'success');
    
  } catch (error) {
    console.error('Login failed:', error);
    showNotification(error.message || 'Login failed', 'error');
  }
}

// Handle register form submission
async function handleRegister(event) {
  event.preventDefault();
  
  const form = event.target;
  const userData = {
    username: form.username.value,
    email: form.email.value,
    password: form.password.value,
    password_confirm: form.password_confirm.value
  };
  
  if (userData.password !== userData.password_confirm) {
    showNotification('Passwords do not match', 'error');
    return;
  }
  
  try {
    const response = await api.register(userData);
    currentUser = response.user;
    api.setCurrentUser(response.user);
    
    hideRegisterModal();
    updateNavigation(true);
    updateUserInfo(response.user);
    
    showNotification('Registration successful!', 'success');
    
  } catch (error) {
    console.error('Registration failed:', error);
    showNotification(error.message || 'Registration failed', 'error');
  }
}

// Handle logout
function handleLogout() {
  api.logout();
  currentUser = null;
  updateNavigation(false);
  cart.clear();
  showNotification('Logged out successfully', 'info');
  
  // Redirect to home if on protected page
  if (window.location.pathname.includes('dashboard')) {
    window.location.href = 'index.html';
  }
}

// ===============================================================================
//                              MODAL MANAGEMENT
// ===============================================================================

// Close modal when clicking outside
function setupModalCloseHandlers() {
  const modals = document.querySelectorAll('.modal');
  
  modals.forEach(modal => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      modals.forEach(modal => {
        modal.style.display = 'none';
      });
    }
  });
}

// ===============================================================================
//                              INITIALIZATION
// ===============================================================================

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  setupModalCloseHandlers();

  // Setup form handlers
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Setup logout handler
  const logoutButtons = document.querySelectorAll('.logout-btn');
  logoutButtons.forEach(button => {
    button.addEventListener('click', handleLogout);
  });

  // Load reviews if on homepage
  if (document.getElementById('reviewsList')) {
    setTimeout(() => {
      loadReviews();
    }, 500);
  }
});

// Listen for logout events
window.addEventListener('userLoggedOut', () => {
  currentUser = null;
  updateNavigation(false);
  cart.clear();
});

// ===============================================================================
//                              REVIEWS FUNCTIONALITY
// ===============================================================================

// Load reviews for homepage
async function loadReviews() {
  const loadingElement = document.getElementById('reviewsLoading');
  const errorElement = document.getElementById('reviewsError');
  const listElement = document.getElementById('reviewsList');

  if (!listElement) return; // Not on a page with reviews

  console.log('Loading reviews...');

  // Show loading state
  if (loadingElement) loadingElement.style.display = 'block';
  if (errorElement) errorElement.style.display = 'none';
  if (listElement) listElement.style.display = 'none';

  try {
    // Direct fetch call to test
    const url = `${API_BASE_URL}/reviews/`;
    console.log('Fetching reviews from:', url);

    const response = await fetch(url);
    console.log('Reviews response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Reviews data received:', data);

    // Handle both array response and paginated response
    const reviews = Array.isArray(data) ? data : (data.results || data.data || []);
    console.log('Processed reviews:', reviews);

    renderReviews(reviews);

    // Show reviews list
    if (loadingElement) loadingElement.style.display = 'none';
    if (listElement) listElement.style.display = 'grid';

  } catch (error) {
    console.error('Failed to load reviews:', error);

    // Show error state
    if (loadingElement) loadingElement.style.display = 'none';
    if (errorElement) {
      errorElement.style.display = 'block';
      errorElement.innerHTML = `
        <p>Failed to load reviews: ${error.message}</p>
        <button class="btn btn-primary" onclick="loadReviews()">Retry</button>
      `;
    }
  }
}

// Render reviews
function renderReviews(reviews) {
  const listElement = document.getElementById('reviewsList');
  if (!listElement) return;

  if (reviews.length === 0) {
    listElement.innerHTML = '<p class="no-data">No reviews yet. Be the first to leave a review!</p>';
    return;
  }

  listElement.innerHTML = reviews.slice(0, 6).map(review => createReviewHTML(review)).join('');
}

// Create HTML for a single review
function createReviewHTML(review) {
  const stars = '⭐'.repeat(review.stars);
  const reviewDate = new Date(review.created_at).toLocaleDateString();

  return `
    <div class="review-card">
      <div class="review-header">
        <div class="review-stars">${stars}</div>
        <div class="review-author">${review.user.username}</div>
        <div class="review-date">${reviewDate}</div>
      </div>
      <div class="review-text">"${review.description}"</div>
      ${review.order ? `<div class="review-order">Order #${review.order.id}</div>` : ''}
    </div>
  `;
}

// Make loadReviews available globally
window.loadReviews = loadReviews;
