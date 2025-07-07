// ===============================================================================
//                    ERROR HANDLING MODULE
// ===============================================================================

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showNotification('An unexpected error occurred. Please try again.', 'error');
  event.preventDefault();
});

// Global error handler for JavaScript errors
window.addEventListener('error', (event) => {
  console.error('JavaScript error:', event.error);
  showNotification('An unexpected error occurred. Please refresh the page.', 'error');
});

// Network error handler
function handleNetworkError(error) {
  console.error('Network error:', error);
  
  if (!navigator.onLine) {
    showNotification('No internet connection. Please check your network.', 'error');
    return;
  }
  
  if (error.message.includes('Failed to fetch')) {
    showNotification('Unable to connect to server. Please try again later.', 'error');
    return;
  }
  
  showNotification('Network error occurred. Please try again.', 'error');
}

// API error handler
function handleApiError(error, context = '') {
  console.error(`API error ${context}:`, error);
  
  // Handle specific error types
  if (error.message.includes('Authentication required')) {
    showNotification('Your session has expired. Please login again.', 'warning');
    api.logout();
    return;
  }
  
  if (error.message.includes('403') || error.message.includes('Forbidden')) {
    showNotification('You do not have permission to perform this action.', 'error');
    return;
  }
  
  if (error.message.includes('404') || error.message.includes('Not Found')) {
    showNotification('The requested resource was not found.', 'error');
    return;
  }
  
  if (error.message.includes('400') || error.message.includes('Bad Request')) {
    showNotification('Invalid request. Please check your input and try again.', 'error');
    return;
  }
  
  if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
    showNotification('Server error. Please try again later.', 'error');
    return;
  }
  
  // Generic error message
  showNotification(error.message || 'An error occurred. Please try again.', 'error');
}

// Form validation error handler
function handleValidationError(field, message) {
  // Remove existing error styling
  field.classList.remove('error');
  const existingError = field.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Add error styling
  field.classList.add('error');
  
  // Add error message
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  field.parentNode.appendChild(errorElement);
  
  // Focus on the field
  field.focus();
}

// Clear validation errors
function clearValidationErrors(form) {
  const errorFields = form.querySelectorAll('.error');
  errorFields.forEach(field => {
    field.classList.remove('error');
  });
  
  const errorMessages = form.querySelectorAll('.error-message');
  errorMessages.forEach(message => {
    message.remove();
  });
}

// Retry mechanism for failed operations
class RetryHandler {
  constructor(maxRetries = 3, delay = 1000) {
    this.maxRetries = maxRetries;
    this.delay = delay;
  }
  
  async execute(operation, context = '') {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed for ${context}:`, error);
        
        if (attempt < this.maxRetries) {
          await this.wait(this.delay * attempt);
        }
      }
    }
    
    throw lastError;
  }
  
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create global retry handler instance
const retryHandler = new RetryHandler();

// Enhanced API call wrapper with error handling
async function safeApiCall(apiFunction, context = '', showErrors = true) {
  try {
    return await retryHandler.execute(apiFunction, context);
  } catch (error) {
    if (showErrors) {
      if (error.message.includes('fetch')) {
        handleNetworkError(error);
      } else {
        handleApiError(error, context);
      }
    }
    throw error;
  }
}

// Form submission wrapper with error handling
async function safeFormSubmit(form, submitFunction, context = '') {
  try {
    clearValidationErrors(form);
    
    // Disable form during submission
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent;
    
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Processing...';
    }
    
    const result = await submitFunction();
    
    // Re-enable form
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
    
    return result;
    
  } catch (error) {
    // Re-enable form on error
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.originalText || 'Submit';
    }
    
    handleApiError(error, context);
    throw error;
  }
}

// Connection status monitor
class ConnectionMonitor {
  constructor() {
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      showNotification('Connection restored', 'success');
      this.onConnectionRestored();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      showNotification('Connection lost. Some features may not work.', 'warning');
    });
  }
  
  onConnectionRestored() {
    // Retry any failed operations
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('view.html')) {
      loadMenuItems();
    } else if (currentPage.includes('dashboard.html')) {
      // Reload current dashboard tab
      const activeTab = document.querySelector('.tab-button.active');
      if (activeTab) {
        const tabName = activeTab.textContent.toLowerCase();
        showTab(tabName);
      }
    }
  }
}

// Initialize connection monitor
const connectionMonitor = new ConnectionMonitor();

// Enhanced notification system with queue
class NotificationQueue {
  constructor() {
    this.queue = [];
    this.isShowing = false;
  }
  
  add(message, type = 'info', duration = 3000) {
    this.queue.push({ message, type, duration });
    this.processQueue();
  }
  
  async processQueue() {
    if (this.isShowing || this.queue.length === 0) return;
    
    this.isShowing = true;
    const { message, type, duration } = this.queue.shift();
    
    await this.showNotification(message, type, duration);
    
    this.isShowing = false;
    
    // Process next notification if any
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 500);
    }
  }
  
  showNotification(message, type, duration) {
    return new Promise(resolve => {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
        resolve();
      }, duration);
    });
  }
}

// Replace global showNotification with queued version
const notificationQueue = new NotificationQueue();

// Override the global showNotification function
if (typeof window !== 'undefined') {
  window.showNotification = (message, type = 'info', duration = 3000) => {
    notificationQueue.add(message, type, duration);
  };
  
  // Export error handling functions
  window.handleApiError = handleApiError;
  window.handleNetworkError = handleNetworkError;
  window.handleValidationError = handleValidationError;
  window.clearValidationErrors = clearValidationErrors;
  window.safeApiCall = safeApiCall;
  window.safeFormSubmit = safeFormSubmit;
}
