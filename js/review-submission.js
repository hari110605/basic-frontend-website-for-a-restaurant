// ===============================================================================
//                    REVIEW SUBMISSION MODULE
// ===============================================================================

// Global variables for review submission
let currentReviewOrderId = null;
let currentReviewRating = 0;

// ===============================================================================
//                              REVIEW SUBMISSION FUNCTIONS
// ===============================================================================

/**
 * Add a review for an order
 * @param {number} orderId - The ID of the order to review
 * @param {number} rating - Rating from 1 to 5 stars
 * @param {string} description - Review description text
 * @param {Object} options - Additional options
 * @returns {Promise} - Promise that resolves when review is submitted
 */
async function addReview(orderId, rating, description, options = {}) {
  // Validation
  const validationResult = validateReviewData(orderId, rating, description);
  if (!validationResult.isValid) {
    throw new Error(validationResult.message);
  }

  // Check authentication
  if (!api.isAuthenticated()) {
    throw new Error('You must be logged in to submit a review');
  }

  // Prepare review data
  const reviewData = {
    order_id: parseInt(orderId),
    stars: parseInt(rating),
    description: description.trim()
  };

  try {
    console.log('Submitting review:', reviewData);
    
    // Show loading state if callback provided
    if (options.onLoading) {
      options.onLoading(true);
    }

    // Submit review to backend
    const response = await api.createReview(reviewData);
    console.log('Review submitted successfully:', response);

    // Show success notification
    const successMessage = options.successMessage || 'Thank you! Your review has been submitted successfully.';
    if (typeof showNotification === 'function') {
      showNotification(successMessage, 'success');
    }

    // Call success callback if provided
    if (options.onSuccess) {
      options.onSuccess(response);
    }

    return response;

  } catch (error) {
    console.error('Failed to submit review:', error);
    
    // Handle specific error cases
    const errorMessage = getReviewErrorMessage(error);
    
    // Show error notification
    if (typeof showNotification === 'function') {
      showNotification(errorMessage, 'error');
    }

    // Call error callback if provided
    if (options.onError) {
      options.onError(error, errorMessage);
    }

    throw error;
  } finally {
    // Hide loading state if callback provided
    if (options.onLoading) {
      options.onLoading(false);
    }
  }
}

/**
 * Quick review submission with modal
 * @param {number} orderId - The ID of the order to review
 * @param {Object} options - Additional options
 */
function addReviewWithModal(orderId, options = {}) {
  if (!api.isAuthenticated()) {
    showNotification('Please login to submit a review', 'warning');
    showLoginModal();
    return;
  }

  currentReviewOrderId = orderId;
  currentReviewRating = 0;
  
  // Show review modal
  showReviewModal(orderId);
  
  // Pre-fill order information if available
  if (options.orderInfo) {
    updateReviewModalWithOrderInfo(options.orderInfo);
  }
}

/**
 * Add review directly without modal (for programmatic use)
 * @param {Object} reviewData - Complete review data
 */
async function addReviewDirect(reviewData) {
  const { orderId, rating, description, ...options } = reviewData;
  return await addReview(orderId, rating, description, options);
}

// ===============================================================================
//                              VALIDATION FUNCTIONS
// ===============================================================================

/**
 * Validate review data
 * @param {number} orderId - Order ID
 * @param {number} rating - Rating (1-5)
 * @param {string} description - Review description
 * @returns {Object} - Validation result
 */
function validateReviewData(orderId, rating, description) {
  // Check order ID
  if (!orderId || isNaN(orderId) || orderId <= 0) {
    return { isValid: false, message: 'Invalid order ID' };
  }

  // Check rating
  if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
    return { isValid: false, message: 'Rating must be between 1 and 5 stars' };
  }

  // Check description
  if (!description || typeof description !== 'string') {
    return { isValid: false, message: 'Review description is required' };
  }

  const trimmedDescription = description.trim();
  if (trimmedDescription.length < 10) {
    return { isValid: false, message: 'Review description must be at least 10 characters long' };
  }

  if (trimmedDescription.length > 500) {
    return { isValid: false, message: 'Review description must be less than 500 characters' };
  }

  return { isValid: true, message: 'Valid' };
}

/**
 * Get user-friendly error message for review submission errors
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
function getReviewErrorMessage(error) {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('already reviewed') || errorMessage.includes('duplicate')) {
    return 'You have already reviewed this order.';
  }
  
  if (errorMessage.includes('not found') || errorMessage.includes('404')) {
    return 'Order not found or cannot be reviewed.';
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('403')) {
    return 'You do not have permission to review this order.';
  }
  
  if (errorMessage.includes('authentication') || errorMessage.includes('401')) {
    return 'Please login to submit a review.';
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (errorMessage.includes('validation')) {
    return 'Please check your review details and try again.';
  }
  
  // Return original message if no specific case matches
  return error.message || 'Failed to submit review. Please try again.';
}

// ===============================================================================
//                              MODAL HELPER FUNCTIONS
// ===============================================================================

/**
 * Update review modal with order information
 * @param {Object} orderInfo - Order information
 */
function updateReviewModalWithOrderInfo(orderInfo) {
  // Update modal title or add order details
  const modalContent = document.querySelector('#reviewModal .modal-content');
  if (modalContent && orderInfo) {
    const orderInfoElement = modalContent.querySelector('.review-order-info');
    if (orderInfoElement) {
      orderInfoElement.innerHTML = `
        <strong>Order #${orderInfo.id}</strong> • 
        ${new Date(orderInfo.order_date).toLocaleDateString()} • 
        ${formatPrice(orderInfo.total_amount)}
      `;
    }
  }
}

/**
 * Reset review modal to initial state
 */
function resetReviewModal() {
  currentReviewOrderId = null;
  currentReviewRating = 0;
  
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

// ===============================================================================
//                              UTILITY FUNCTIONS
// ===============================================================================

/**
 * Check if user can review an order
 * @param {Object} order - Order object
 * @returns {boolean} - Whether the order can be reviewed
 */
function canReviewOrder(order) {
  if (!order) return false;
  
  // Order must be delivered
  if (order.status !== 'delivered') return false;
  
  // Order must not already have a review
  if (order.has_review) return false;
  
  // Order must belong to current user (this should be handled by backend)
  return true;
}

/**
 * Get review button HTML for an order
 * @param {Object} order - Order object
 * @returns {string} - HTML for review button
 */
function getReviewButtonHTML(order) {
  if (!canReviewOrder(order)) {
    return '';
  }
  
  return `
    <button class="review-button" onclick="addReviewWithModal(${order.id}, {orderInfo: ${JSON.stringify(order).replace(/"/g, '&quot;')}})">
      Write Review
    </button>
  `;
}

// ===============================================================================
//                              EXPORT FUNCTIONS
// ===============================================================================

// Make functions available globally
if (typeof window !== 'undefined') {
  window.addReview = addReview;
  window.addReviewWithModal = addReviewWithModal;
  window.addReviewDirect = addReviewDirect;
  window.validateReviewData = validateReviewData;
  window.canReviewOrder = canReviewOrder;
  window.getReviewButtonHTML = getReviewButtonHTML;
  window.resetReviewModal = resetReviewModal;
  
  // Also export for module systems
  window.ReviewSubmission = {
    addReview,
    addReviewWithModal,
    addReviewDirect,
    validateReviewData,
    canReviewOrder,
    getReviewButtonHTML,
    resetReviewModal
  };
}
