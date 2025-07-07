// ===============================================================================
//                    ENHANCED REVIEW WIDGET COMPONENT
// ===============================================================================

/**
 * Enhanced Review Widget - A comprehensive review component that can be embedded anywhere
 * Features:
 * - Interactive star rating with hover effects
 * - Real-time character counting
 * - Form validation
 * - Error handling
 * - Success feedback
 * - Responsive design
 * - Accessibility features
 */

class ReviewWidget {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      orderId: null,
      orderInfo: null,
      showOrderInfo: true,
      onSuccess: null,
      onError: null,
      onCancel: null,
      ...options
    };
    
    this.selectedRating = 0;
    this.isSubmitting = false;
    
    this.ratingDescriptions = {
      0: "Click stars to rate your experience",
      1: "😞 Poor - Very disappointed",
      2: "😐 Fair - Below expectations", 
      3: "🙂 Good - Met expectations",
      4: "😊 Very Good - Exceeded expectations",
      5: "🤩 Excellent - Outstanding experience!"
    };
    
    this.init();
  }

  init() {
    if (!this.container) {
      console.error('Review widget container not found');
      return;
    }
    
    this.render();
    this.attachEventListeners();
    
    if (this.options.orderId) {
      this.loadOrder(this.options.orderId, this.options.orderInfo);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="review-widget">
        <div class="review-widget-header">
          <h3>📝 Write a Review</h3>
          <p>Share your experience to help other customers</p>
        </div>

        ${this.options.showOrderInfo ? this.renderOrderInfo() : ''}

        <form class="review-widget-form" id="reviewWidgetForm">
          <input type="hidden" id="widgetOrderId" name="order_id" value="${this.options.orderId || ''}">
          
          <!-- Star Rating -->
          <div class="widget-rating-section">
            <label class="widget-rating-label">How would you rate your experience?</label>
            <div class="widget-star-rating" id="widgetStarRating">
              ${[1,2,3,4,5].map(i => `<span class="widget-star" data-rating="${i}">⭐</span>`).join('')}
            </div>
            <div class="widget-rating-description" id="widgetRatingDescription">
              ${this.ratingDescriptions[0]}
            </div>
            <input type="hidden" id="widgetStars" name="stars" required>
          </div>

          <!-- Review Text -->
          <div class="widget-textarea-section">
            <label for="widgetDescription">Tell us about your experience:</label>
            <textarea
              id="widgetDescription"
              name="description"
              class="widget-textarea"
              placeholder="What did you think of the food, service, and overall experience? Please be specific and helpful to other customers."
              required
              maxlength="500"
              minlength="10">
            </textarea>
            <div class="widget-character-count">
              <span id="widgetCharCount">0</span>/500 characters (minimum 10)
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="widget-actions">
            <button type="button" class="widget-btn widget-btn-secondary" id="widgetCancelBtn">Cancel</button>
            <button type="submit" class="widget-btn widget-btn-primary" id="widgetSubmitBtn">Submit Review</button>
          </div>
        </form>

        <!-- Messages -->
        <div id="widgetSuccessMessage" class="widget-message widget-success hidden"></div>
        <div id="widgetErrorMessage" class="widget-message widget-error hidden"></div>
      </div>
    `;

    this.addStyles();
  }

  renderOrderInfo() {
    return `
      <div class="widget-order-info" id="widgetOrderInfo">
        <h4>Order Details</h4>
        <div class="widget-order-details">
          <div class="widget-order-detail">
            <span>Order ID:</span>
            <strong id="widgetOrderIdDisplay">#${this.options.orderId || '---'}</strong>
          </div>
          <div class="widget-order-detail">
            <span>Date:</span>
            <strong id="widgetOrderDateDisplay">---</strong>
          </div>
          <div class="widget-order-detail">
            <span>Total:</span>
            <strong id="widgetOrderTotalDisplay">---</strong>
          </div>
          <div class="widget-order-detail">
            <span>Status:</span>
            <strong id="widgetOrderStatusDisplay">---</strong>
          </div>
        </div>
      </div>
    `;
  }

  addStyles() {
    if (document.getElementById('reviewWidgetStyles')) return;

    const styles = document.createElement('style');
    styles.id = 'reviewWidgetStyles';
    styles.textContent = `
      .review-widget {
        background: white;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        margin: 20px 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .review-widget-header {
        text-align: center;
        margin-bottom: 25px;
      }

      .review-widget-header h3 {
        color: #e4514e;
        margin: 0 0 8px 0;
        font-size: 24px;
      }

      .review-widget-header p {
        color: #666;
        margin: 0;
        font-size: 14px;
      }

      .widget-order-info {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 25px;
        border-left: 4px solid #e4514e;
      }

      .widget-order-info h4 {
        margin: 0 0 15px 0;
        color: #333;
        font-size: 16px;
      }

      .widget-order-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
      }

      .widget-order-detail {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
      }

      .widget-order-detail strong {
        color: #e4514e;
      }

      .widget-rating-section {
        margin: 20px 0;
        text-align: center;
      }

      .widget-rating-label {
        display: block;
        font-weight: 600;
        color: #333;
        margin-bottom: 15px;
        font-size: 16px;
      }

      .widget-star-rating {
        display: flex;
        gap: 6px;
        justify-content: center;
        margin: 15px 0;
      }

      .widget-star {
        font-size: 32px;
        cursor: pointer;
        transition: all 0.2s ease;
        filter: grayscale(100%);
        opacity: 0.5;
        user-select: none;
      }

      .widget-star:hover,
      .widget-star.active {
        filter: grayscale(0%);
        opacity: 1;
        transform: scale(1.1);
      }

      .widget-star.active {
        animation: widgetStarPulse 0.3s ease;
      }

      @keyframes widgetStarPulse {
        0% { transform: scale(1.1); }
        50% { transform: scale(1.25); }
        100% { transform: scale(1.1); }
      }

      .widget-rating-description {
        margin: 10px 0;
        font-size: 14px;
        color: #666;
        min-height: 20px;
      }

      .widget-rating-description.selected {
        color: #e4514e;
        font-weight: 600;
      }

      .widget-textarea-section {
        margin: 20px 0;
      }

      .widget-textarea-section label {
        display: block;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .widget-textarea {
        width: 100%;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
        min-height: 100px;
        transition: border-color 0.3s ease;
        box-sizing: border-box;
      }

      .widget-textarea:focus {
        outline: none;
        border-color: #e4514e;
        box-shadow: 0 0 0 3px rgba(228, 81, 78, 0.1);
      }

      .widget-character-count {
        text-align: right;
        margin-top: 6px;
        font-size: 12px;
        color: #666;
      }

      .widget-character-count.warning {
        color: #ffa500;
      }

      .widget-character-count.error {
        color: #dc3545;
      }

      .widget-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 25px;
      }

      .widget-btn {
        padding: 10px 24px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
        text-align: center;
      }

      .widget-btn-primary {
        background: #e4514e;
        color: white;
      }

      .widget-btn-primary:hover:not(:disabled) {
        background: #d63384;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(228, 81, 78, 0.3);
      }

      .widget-btn-secondary {
        background: #6c757d;
        color: white;
      }

      .widget-btn-secondary:hover {
        background: #5a6268;
      }

      .widget-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .widget-message {
        padding: 12px;
        border-radius: 6px;
        margin: 15px 0;
        text-align: center;
        font-size: 14px;
      }

      .widget-success {
        background: #d4edda;
        color: #155724;
        border-left: 4px solid #28a745;
      }

      .widget-error {
        background: #f8d7da;
        color: #721c24;
        border-left: 4px solid #dc3545;
      }

      .hidden {
        display: none;
      }

      .loading {
        opacity: 0.7;
        pointer-events: none;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .review-widget {
          padding: 20px;
          margin: 10px 0;
        }

        .widget-star {
          font-size: 28px;
        }

        .widget-order-details {
          grid-template-columns: 1fr;
        }

        .widget-actions {
          flex-direction: column;
        }

        .widget-btn {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  attachEventListeners() {
    // Star rating
    const stars = this.container.querySelectorAll('.widget-star');
    const ratingDescription = this.container.querySelector('#widgetRatingDescription');

    stars.forEach((star, index) => {
      star.addEventListener('click', () => {
        this.setRating(index + 1);
      });

      star.addEventListener('mouseenter', () => {
        this.highlightStars(index + 1);
        ratingDescription.textContent = this.ratingDescriptions[index + 1];
        ratingDescription.className = 'widget-rating-description selected';
      });
    });

    this.container.querySelector('#widgetStarRating').addEventListener('mouseleave', () => {
      this.highlightStars(this.selectedRating);
      ratingDescription.textContent = this.ratingDescriptions[this.selectedRating];
      ratingDescription.className = this.selectedRating > 0 ? 'widget-rating-description selected' : 'widget-rating-description';
    });

    // Textarea character count
    const textarea = this.container.querySelector('#widgetDescription');
    const charCount = this.container.querySelector('#widgetCharCount');

    textarea.addEventListener('input', () => {
      const length = textarea.value.length;
      charCount.textContent = length;
      
      const countElement = charCount.parentElement;
      countElement.className = 'widget-character-count';
      
      if (length < 10) {
        countElement.classList.add('error');
      } else if (length > 450) {
        countElement.classList.add('warning');
      }
    });

    // Form submission
    this.container.querySelector('#reviewWidgetForm').addEventListener('submit', (e) => {
      this.handleSubmit(e);
    });

    // Cancel button
    this.container.querySelector('#widgetCancelBtn').addEventListener('click', () => {
      this.handleCancel();
    });
  }

  setRating(rating) {
    this.selectedRating = rating;
    this.container.querySelector('#widgetStars').value = rating;
    this.highlightStars(rating);
    
    const ratingDescription = this.container.querySelector('#widgetRatingDescription');
    ratingDescription.textContent = this.ratingDescriptions[rating];
    ratingDescription.className = 'widget-rating-description selected';
  }

  highlightStars(rating) {
    const stars = this.container.querySelectorAll('.widget-star');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    if (this.isSubmitting) return;
    
    if (!this.validateForm()) {
      return;
    }

    const submitBtn = this.container.querySelector('#widgetSubmitBtn');
    const form = this.container.querySelector('#reviewWidgetForm');
    
    try {
      this.isSubmitting = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      form.classList.add('loading');
      this.hideMessages();

      const reviewData = {
        order_id: parseInt(this.container.querySelector('#widgetOrderId').value),
        stars: this.selectedRating,
        description: this.container.querySelector('#widgetDescription').value.trim()
      };

      // Submit review using the API
      const response = await api.createReview(reviewData);
      
      this.showSuccessMessage('Thank you! Your review has been submitted successfully.');
      
      // Call success callback
      if (this.options.onSuccess) {
        this.options.onSuccess(response);
      }
      
      // Reset form after successful submission
      setTimeout(() => {
        this.resetForm();
      }, 2000);

    } catch (error) {
      console.error('Review submission failed:', error);
      const errorMessage = this.getErrorMessage(error);
      this.showErrorMessage(errorMessage);
      
      // Call error callback
      if (this.options.onError) {
        this.options.onError(error, errorMessage);
      }
    } finally {
      this.isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Review';
      form.classList.remove('loading');
    }
  }

  validateForm() {
    if (this.selectedRating === 0) {
      this.showErrorMessage('Please select a star rating.');
      return false;
    }

    const description = this.container.querySelector('#widgetDescription').value.trim();
    if (description.length < 10) {
      this.showErrorMessage('Please write at least 10 characters in your review.');
      return false;
    }

    if (!api.isAuthenticated()) {
      this.showErrorMessage('Please login to submit a review.');
      return false;
    }

    return true;
  }

  handleCancel() {
    if (this.options.onCancel) {
      this.options.onCancel();
    } else {
      if (confirm('Are you sure you want to cancel? Your review will be lost.')) {
        this.resetForm();
      }
    }
  }

  loadOrder(orderId, orderInfo = null) {
    this.options.orderId = orderId;
    this.container.querySelector('#widgetOrderId').value = orderId;
    
    if (orderInfo) {
      this.updateOrderDisplay(orderInfo);
    } else {
      // Update with basic info
      this.container.querySelector('#widgetOrderIdDisplay').textContent = `#${orderId}`;
    }
  }

  updateOrderDisplay(orderInfo) {
    if (!this.options.showOrderInfo) return;
    
    const elements = {
      '#widgetOrderIdDisplay': `#${orderInfo.id || this.options.orderId}`,
      '#widgetOrderDateDisplay': orderInfo.order_date ? new Date(orderInfo.order_date).toLocaleDateString() : '---',
      '#widgetOrderTotalDisplay': orderInfo.total_amount ? `$${orderInfo.total_amount}` : '---',
      '#widgetOrderStatusDisplay': orderInfo.status || '---'
    };

    Object.entries(elements).forEach(([selector, value]) => {
      const element = this.container.querySelector(selector);
      if (element) element.textContent = value;
    });
  }

  resetForm() {
    this.selectedRating = 0;
    this.container.querySelector('#widgetStars').value = '';
    this.container.querySelector('#widgetDescription').value = '';
    this.container.querySelector('#widgetCharCount').textContent = '0';
    this.highlightStars(0);
    
    const ratingDescription = this.container.querySelector('#widgetRatingDescription');
    ratingDescription.textContent = this.ratingDescriptions[0];
    ratingDescription.className = 'widget-rating-description';
    
    this.hideMessages();
  }

  showSuccessMessage(message) {
    const successDiv = this.container.querySelector('#widgetSuccessMessage');
    const errorDiv = this.container.querySelector('#widgetErrorMessage');
    
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');
  }

  showErrorMessage(message) {
    const successDiv = this.container.querySelector('#widgetSuccessMessage');
    const errorDiv = this.container.querySelector('#widgetErrorMessage');
    
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    successDiv.classList.add('hidden');
  }

  hideMessages() {
    this.container.querySelector('#widgetSuccessMessage').classList.add('hidden');
    this.container.querySelector('#widgetErrorMessage').classList.add('hidden');
  }

  getErrorMessage(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('already reviewed')) {
      return 'You have already reviewed this order.';
    }
    if (message.includes('not found')) {
      return 'Order not found or cannot be reviewed.';
    }
    if (message.includes('permission') || message.includes('403')) {
      return 'You do not have permission to review this order.';
    }
    if (message.includes('authentication') || message.includes('401')) {
      return 'Please login to submit a review.';
    }
    
    return error.message || 'Failed to submit review. Please try again.';
  }

  // Public methods
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  setOrderId(orderId, orderInfo = null) {
    this.loadOrder(orderId, orderInfo);
  }

  show() {
    this.container.style.display = 'block';
  }

  hide() {
    this.container.style.display = 'none';
  }
}

// Make ReviewWidget available globally
if (typeof window !== 'undefined') {
  window.ReviewWidget = ReviewWidget;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReviewWidget;
}

// ===============================================================================
//                    HELPER FUNCTIONS FOR EASY INTEGRATION
// ===============================================================================

/**
 * Quick function to create a review widget for an order
 * @param {string} containerId - ID of the container element
 * @param {number} orderId - Order ID to review
 * @param {Object} orderInfo - Optional order information
 * @param {Object} callbacks - Optional callbacks {onSuccess, onError, onCancel}
 * @returns {ReviewWidget} - The created widget instance
 */
function createReviewWidget(containerId, orderId, orderInfo = null, callbacks = {}) {
  return new ReviewWidget(containerId, {
    orderId: orderId,
    orderInfo: orderInfo,
    showOrderInfo: true,
    ...callbacks
  });
}

/**
 * Show review modal for an order (creates a modal overlay)
 * @param {number} orderId - Order ID to review
 * @param {Object} orderInfo - Optional order information
 * @param {Object} callbacks - Optional callbacks
 */
function showReviewModal(orderId, orderInfo = null, callbacks = {}) {
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'reviewModalOverlay';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    padding: 20px;
    box-sizing: border-box;
  `;

  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.id = 'reviewModalContainer';
  modalContainer.style.cssText = `
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  `;

  modalOverlay.appendChild(modalContainer);
  document.body.appendChild(modalOverlay);

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: #e4514e;
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-size: 18px;
    cursor: pointer;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  modalContainer.appendChild(closeButton);

  // Create review widget
  const widget = new ReviewWidget('reviewModalContainer', {
    orderId: orderId,
    orderInfo: orderInfo,
    showOrderInfo: true,
    onSuccess: (response) => {
      if (callbacks.onSuccess) callbacks.onSuccess(response);
      setTimeout(() => closeModal(), 2000);
    },
    onError: callbacks.onError,
    onCancel: () => {
      if (callbacks.onCancel) callbacks.onCancel();
      closeModal();
    }
  });

  function closeModal() {
    if (modalOverlay && modalOverlay.parentNode) {
      modalOverlay.parentNode.removeChild(modalOverlay);
    }
  }

  // Close modal when clicking overlay or close button
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  closeButton.addEventListener('click', closeModal);

  // Close modal on escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  return widget;
}

// Make helper functions available globally
if (typeof window !== 'undefined') {
  window.createReviewWidget = createReviewWidget;
  window.showReviewModal = showReviewModal;
}
