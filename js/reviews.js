// ===============================================================================
//                    REVIEWS MODULE
// ===============================================================================

let allReviews = [];
let filteredReviews = [];
let currentPage = 1;
let reviewsPerPage = 9;
let currentRatingFilter = 'all';
let currentSortFilter = 'newest';

// ===============================================================================
//                              REVIEWS LOADING
// ===============================================================================

// Load all reviews from API
async function loadAllReviews() {
  const loadingElement = document.getElementById('reviewsLoading');
  const errorElement = document.getElementById('reviewsError');
  const gridElement = document.getElementById('reviewsGrid');
  
  console.log('Loading all reviews...');
  
  // Show loading state
  if (loadingElement) loadingElement.style.display = 'block';
  if (errorElement) errorElement.style.display = 'none';
  if (gridElement) gridElement.style.display = 'none';
  
  try {
    // Load all pages of reviews
    let page = 1;
    let hasMore = true;
    allReviews = [];
    
    while (hasMore) {
      const url = `${API_BASE_URL}/reviews/?page=${page}&page_size=50`;
      console.log(`Fetching reviews page ${page} from:`, url);
      
      const response = await fetch(url);
      console.log(`Reviews page ${page} response status:`, response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Reviews page ${page} data:`, data);
      
      // Handle both array response and paginated response
      const pageReviews = Array.isArray(data) ? data : (data.results || []);
      allReviews = allReviews.concat(pageReviews);
      
      // Check if there are more pages
      hasMore = data.next ? true : false;
      page++;
      
      // Safety break to prevent infinite loops
      if (page > 10) break;
    }
    
    console.log('All reviews loaded:', allReviews);
    
    // Update statistics
    updateReviewsStats();
    
    // Apply current filters
    applyFilters();
    
    // Show reviews grid
    if (loadingElement) loadingElement.style.display = 'none';
    if (gridElement) gridElement.style.display = 'grid';
    
  } catch (error) {
    console.error('Failed to load reviews:', error);
    
    // Show error state
    if (loadingElement) loadingElement.style.display = 'none';
    if (errorElement) {
      errorElement.style.display = 'block';
      errorElement.innerHTML = `
        <p>Failed to load reviews: ${error.message}</p>
        <button class="btn btn-primary" onclick="loadAllReviews()">Retry</button>
      `;
    }
  }
}

// ===============================================================================
//                              STATISTICS
// ===============================================================================

function updateReviewsStats() {
  const totalReviewsElement = document.getElementById('totalReviews');
  const averageRatingElement = document.getElementById('averageRating');
  const fiveStarCountElement = document.getElementById('fiveStarCount');
  
  if (allReviews.length === 0) {
    if (totalReviewsElement) totalReviewsElement.textContent = '0';
    if (averageRatingElement) averageRatingElement.textContent = '0.0';
    if (fiveStarCountElement) fiveStarCountElement.textContent = '0';
    return;
  }
  
  // Calculate statistics
  const totalReviews = allReviews.length;
  const totalStars = allReviews.reduce((sum, review) => sum + review.stars, 0);
  const averageRating = (totalStars / totalReviews).toFixed(1);
  const fiveStarCount = allReviews.filter(review => review.stars === 5).length;
  
  // Update display
  if (totalReviewsElement) totalReviewsElement.textContent = totalReviews;
  if (averageRatingElement) averageRatingElement.textContent = averageRating;
  if (fiveStarCountElement) fiveStarCountElement.textContent = fiveStarCount;
}

// ===============================================================================
//                              FILTERING & SORTING
// ===============================================================================

function applyFilters() {
  // Start with all reviews
  filteredReviews = [...allReviews];
  
  // Apply rating filter
  if (currentRatingFilter !== 'all') {
    filteredReviews = filteredReviews.filter(review => review.stars === parseInt(currentRatingFilter));
  }
  
  // Apply sorting
  switch (currentSortFilter) {
    case 'newest':
      filteredReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case 'oldest':
      filteredReviews.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
    case 'highest':
      filteredReviews.sort((a, b) => b.stars - a.stars);
      break;
    case 'lowest':
      filteredReviews.sort((a, b) => a.stars - b.stars);
      break;
  }
  
  // Reset to first page
  currentPage = 1;
  
  // Render filtered results
  renderReviews();
  renderPagination();
}

function filterByRating(rating) {
  currentRatingFilter = rating;
  
  // Update filter button states
  document.querySelectorAll('.star-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-rating="${rating}"]`).classList.add('active');
  
  applyFilters();
}

// ===============================================================================
//                              RENDERING
// ===============================================================================

function renderReviews() {
  const gridElement = document.getElementById('reviewsGrid');
  if (!gridElement) return;
  
  if (filteredReviews.length === 0) {
    gridElement.innerHTML = `
      <div class="no-reviews">
        <div class="no-reviews-icon">📝</div>
        <h3>No reviews found</h3>
        <p>Try adjusting your filters or be the first to leave a review!</p>
      </div>
    `;
    return;
  }
  
  // Calculate pagination
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const pageReviews = filteredReviews.slice(startIndex, endIndex);
  
  gridElement.innerHTML = pageReviews.map(review => createReviewCardHTML(review)).join('');
}

function createReviewCardHTML(review) {
  const stars = generateStarsHTML(review.stars);
  const reviewDate = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const userInitial = review.user.username.charAt(0).toUpperCase();
  
  return `
    <div class="review-card">
      <div class="review-header">
        <div class="review-user">
          <div class="user-avatar">${userInitial}</div>
          <div class="user-info">
            <h4>${review.user.username}</h4>
            <div class="review-date">${reviewDate}</div>
          </div>
        </div>
        <div class="review-rating">${stars}</div>
      </div>
      <div class="review-content">"${review.description}"</div>
      ${review.order ? `
        <div class="review-order-info">
          <strong>Order #${review.order.id}</strong> • ${new Date(review.order.order_date).toLocaleDateString()}
        </div>
      ` : ''}
    </div>
  `;
}

function generateStarsHTML(rating) {
  let starsHTML = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      starsHTML += '<span class="star">⭐</span>';
    } else {
      starsHTML += '<span class="star empty">⭐</span>';
    }
  }
  return starsHTML;
}

// ===============================================================================
//                              PAGINATION
// ===============================================================================

function renderPagination() {
  const paginationElement = document.getElementById('reviewsPagination');
  if (!paginationElement) return;
  
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  
  if (totalPages <= 1) {
    paginationElement.style.display = 'none';
    return;
  }
  
  paginationElement.style.display = 'flex';
  
  let paginationHTML = '';
  
  // Previous button
  paginationHTML += `
    <button class="pagination-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
      ← Previous
    </button>
  `;
  
  // Page numbers
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  if (startPage > 1) {
    paginationHTML += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
    if (startPage > 2) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
        ${i}
      </button>
    `;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }
    paginationHTML += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
  }
  
  // Next button
  paginationHTML += `
    <button class="pagination-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
      Next →
    </button>
  `;
  
  paginationElement.innerHTML = paginationHTML;
}

function goToPage(page) {
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  renderReviews();
  renderPagination();
  
  // Scroll to top of reviews
  document.getElementById('reviewsGrid').scrollIntoView({ behavior: 'smooth' });
}

// ===============================================================================
//                              EVENT HANDLERS
// ===============================================================================

// Sort filter change handler
function handleSortChange() {
  const sortSelect = document.getElementById('sortFilter');
  if (sortSelect) {
    currentSortFilter = sortSelect.value;
    applyFilters();
  }
}

// ===============================================================================
//                              INITIALIZATION
// ===============================================================================

// Initialize reviews page
document.addEventListener('DOMContentLoaded', () => {
  // Only run on reviews page
  if (document.getElementById('reviewsGrid')) {
    setTimeout(() => {
      loadAllReviews();
    }, 100);

    // Setup sort filter handler
    const sortSelect = document.getElementById('sortFilter');
    if (sortSelect) {
      sortSelect.addEventListener('change', handleSortChange);
    }

    // Setup review modal star rating
    const stars = document.querySelectorAll('#reviewModal .star');
    stars.forEach((star, index) => {
      star.addEventListener('click', () => setStarRating(index + 1));
    });

    // Setup review form handler
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
      reviewForm.addEventListener('submit', handleReviewSubmission);
    }
  }
});

// ===============================================================================
//                              WRITE REVIEW FUNCTIONALITY
// ===============================================================================

let selectedOrderForReview = null;
let reviewableOrders = [];

// Show write review options
function showWriteReviewOptions() {
  if (!api.isAuthenticated()) {
    showNotification('Please login to write a review', 'warning');
    showLoginModal();
    return;
  }

  // Show order selection modal
  showOrderSelectionModal();
}

// Show order selection modal
function showOrderSelectionModal() {
  const modal = document.getElementById('orderSelectionModal');
  if (modal) {
    modal.style.display = 'block';
    loadReviewableOrders();
  }
}

// Hide order selection modal
function hideOrderSelectionModal() {
  const modal = document.getElementById('orderSelectionModal');
  if (modal) {
    modal.style.display = 'none';
    selectedOrderForReview = null;
    updateSelectOrderButton();
  }
}

// Load orders that can be reviewed
async function loadReviewableOrders() {
  const loadingElement = document.getElementById('orderSelectionLoading');
  const errorElement = document.getElementById('orderSelectionError');
  const listElement = document.getElementById('ordersList');

  console.log('Loading reviewable orders...');

  // Show loading state
  if (loadingElement) loadingElement.style.display = 'block';
  if (errorElement) errorElement.style.display = 'none';
  if (listElement) listElement.style.display = 'none';

  try {
    // Get user orders
    const orders = await api.getUserOrders();
    console.log('User orders received:', orders);

    // Filter for reviewable orders (delivered and not reviewed)
    reviewableOrders = orders.filter(order =>
      order.status === 'delivered' && !order.has_review
    );

    console.log('Reviewable orders:', reviewableOrders);

    renderReviewableOrders();

    // Show orders list
    if (loadingElement) loadingElement.style.display = 'none';
    if (listElement) listElement.style.display = 'block';

  } catch (error) {
    console.error('Failed to load reviewable orders:', error);

    // Show error state
    if (loadingElement) loadingElement.style.display = 'none';
    if (errorElement) {
      errorElement.style.display = 'block';
      errorElement.innerHTML = `
        <p>Failed to load orders: ${error.message}</p>
        <button class="btn btn-primary" onclick="loadReviewableOrders()">Retry</button>
      `;
    }
  }
}

// Render reviewable orders
function renderReviewableOrders() {
  const listElement = document.getElementById('ordersList');
  if (!listElement) return;

  if (reviewableOrders.length === 0) {
    listElement.innerHTML = `
      <div class="no-orders-message">
        <h3>No orders available for review</h3>
        <p>You can only review orders that have been delivered and haven't been reviewed yet.</p>
        <p><a href="view.html">Browse our menu</a> to place a new order!</p>
      </div>
    `;
    return;
  }

  listElement.innerHTML = reviewableOrders.map(order => createSelectableOrderHTML(order)).join('');
}

// Create HTML for selectable order
function createSelectableOrderHTML(order) {
  const orderDate = new Date(order.order_date).toLocaleDateString();
  const itemsPreview = order.order_items.slice(0, 2).map(item =>
    `${item.menu_item.food_name} x${item.quantity}`
  ).join(', ');
  const moreItems = order.order_items.length > 2 ? ` and ${order.order_items.length - 2} more` : '';

  return `
    <div class="order-item-selectable" onclick="selectOrderForReview(${order.id})" data-order-id="${order.id}">
      <div class="order-summary">
        <span class="order-id-badge">Order #${order.id}</span>
        <span class="order-total-badge">${formatPrice(order.total_amount)}</span>
      </div>
      <div style="margin: 10px 0;">
        <strong>Date:</strong> ${orderDate}
      </div>
      <div class="order-items-preview">
        <strong>Items:</strong> ${itemsPreview}${moreItems}
      </div>
    </div>
  `;
}

// Select order for review
function selectOrderForReview(orderId) {
  selectedOrderForReview = reviewableOrders.find(order => order.id === orderId);

  // Update visual selection
  document.querySelectorAll('.order-item-selectable').forEach(item => {
    item.classList.remove('selected');
  });

  const selectedElement = document.querySelector(`[data-order-id="${orderId}"]`);
  if (selectedElement) {
    selectedElement.classList.add('selected');
  }

  updateSelectOrderButton();
}

// Update select order button state
function updateSelectOrderButton() {
  const button = document.getElementById('selectOrderBtn');
  if (button) {
    button.disabled = !selectedOrderForReview;
    button.textContent = selectedOrderForReview
      ? `Continue with Order #${selectedOrderForReview.id}`
      : 'Continue with Selected Order';
  }
}

// Proceed with selected order
function proceedWithSelectedOrder() {
  if (!selectedOrderForReview) {
    showNotification('Please select an order to review', 'warning');
    return;
  }

  hideOrderSelectionModal();

  // Use the review submission function
  addReviewWithModal(selectedOrderForReview.id, {
    orderInfo: selectedOrderForReview,
    onSuccess: () => {
      // Refresh reviews list
      loadAllReviews();
      showNotification('Review submitted successfully! Thank you for your feedback.', 'success');
    }
  });
}

// ===============================================================================
//                              REVIEW MODAL FUNCTIONS
// ===============================================================================

let selectedRating = 0;

// Show review modal
function showReviewModal(orderId) {
  const modal = document.getElementById('reviewModal');
  const orderIdInput = document.getElementById('reviewOrderId');

  if (modal && orderIdInput) {
    orderIdInput.value = orderId;
    modal.style.display = 'block';
    resetReviewForm();
  }
}

// Hide review modal
function hideReviewModal() {
  const modal = document.getElementById('reviewModal');
  if (modal) {
    modal.style.display = 'none';
    resetReviewForm();
  }
}

// Reset review form
function resetReviewForm() {
  selectedRating = 0;

  // Reset star rating
  const stars = document.querySelectorAll('#reviewModal .star');
  stars.forEach(star => {
    star.style.opacity = '0.3';
    star.classList.remove('selected');
  });

  // Reset form
  const form = document.getElementById('reviewForm');
  if (form) {
    form.reset();
  }

  // Reset character count
  const charCount = document.getElementById('charCount');
  if (charCount) {
    charCount.textContent = '0';
    charCount.parentElement.classList.remove('warning');
  }

  // Reset rating description
  const ratingDescription = document.getElementById('ratingDescription');
  if (ratingDescription) {
    ratingDescription.textContent = 'Click stars to rate';
    ratingDescription.style.color = '#666';
  }
}

// Set star rating
function setStarRating(rating) {
  selectedRating = rating;
  const starsInput = document.getElementById('reviewStars');
  if (starsInput) starsInput.value = rating;

  const stars = document.querySelectorAll('#reviewModal .star');
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

// Handle review form submission
async function handleReviewSubmission(event) {
  event.preventDefault();

  const form = event.target;
  const orderId = parseInt(form.order_id.value);
  const rating = selectedRating;
  const description = form.description.value.trim();

  try {
    // Use the review submission function
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
        loadAllReviews(); // Reload reviews to show the new one
      },
      successMessage: 'Thank you! Your review has been submitted successfully.'
    });

  } catch (error) {
    console.error('Review submission failed:', error);
  }
}

// Add global functions
if (typeof window !== 'undefined') {
  window.showReviewModal = showReviewModal;
  window.hideReviewModal = hideReviewModal;
  window.setStarRating = setStarRating;
  window.updateCharacterCount = updateCharacterCount;
  window.handleReviewSubmission = handleReviewSubmission;
}

// Export functions for global access
if (typeof window !== 'undefined') {
  window.loadAllReviews = loadAllReviews;
  window.filterByRating = filterByRating;
  window.applyFilters = applyFilters;
  window.goToPage = goToPage;
  window.showWriteReviewOptions = showWriteReviewOptions;
  window.showOrderSelectionModal = showOrderSelectionModal;
  window.hideOrderSelectionModal = hideOrderSelectionModal;
  window.loadReviewableOrders = loadReviewableOrders;
  window.selectOrderForReview = selectOrderForReview;
  window.proceedWithSelectedOrder = proceedWithSelectedOrder;
}
