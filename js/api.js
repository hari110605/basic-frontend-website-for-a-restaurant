// ===============================================================================
//                    RESTAURANT API SERVICE MODULE
// ===============================================================================

// Base configuration
const API_BASE_URL = 'https://hp005-restaurant-server.hf.space/api';

// ===============================================================================
//                              API SERVICE CLASS
// ===============================================================================

class RestaurantAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  // Helper method to get headers
  getHeaders(includeAuth = true, contentType = 'application/json') {
    const headers = {}; 
    
    if (contentType) headers['Content-Type'] = contentType;
    if (includeAuth && this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, options);

      if (response.status === 401) {
        // Token expired, redirect to login
        this.logout();
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server');
      }
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    const response = await this.apiCall('/auth/register/', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(userData)
    });
    
    // Store tokens
    if (response.tokens) {
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      this.token = response.tokens.access;
    }
    
    return response;
  }

  async login(email, password) {
    const response = await this.apiCall('/auth/login/', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password })
    });
    
    // Store tokens
    localStorage.setItem('access_token', response.tokens.access);
    localStorage.setItem('refresh_token', response.tokens.refresh);
    this.token = response.tokens.access;
    
    return response;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.token = null;
    // Trigger logout event
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
  }

  async getProfile() {
    return this.apiCall('/auth/profile/', {
      method: 'GET',
      headers: this.getHeaders()
    });
  }

  // Menu methods
  async getMenu() {
    return this.apiCall('/menu/', {
      method: 'GET',
      headers: this.getHeaders(false)
    });
  }

  // Order methods
  async createOrder(orderData) {
    return this.apiCall('/order/', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderData)
    });
  }

  // Checkout method - uses the new checkout endpoint
  async checkout(checkoutData) {
    return this.apiCall('/checkout/', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(checkoutData)
    });
  }

  async getUserOrders() {
    return this.apiCall('/orders/', {
      method: 'GET',
      headers: this.getHeaders()
    });
  }

  // Reservation methods
  async createReservation(reservationData) {
    return this.apiCall('/reservation/', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(reservationData)
    });
  }

  async getUserReservations() {
    return this.apiCall('/reservations/', {
      method: 'GET',
      headers: this.getHeaders()
    });
  }

  // Review methods
  async createReview(reviewData) {
    return this.apiCall('/review/', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(reviewData)
    });
  }

  async getReviews(page = 1, pageSize = 10) {
    return this.apiCall(`/reviews/?page=${page}&page_size=${pageSize}`, {
      method: 'GET',
      headers: this.getHeaders(false)
    });
  }

  async getAllReviews() {
    // Get all reviews by fetching all pages
    let allReviews = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await this.getReviews(page, 50);
        const reviews = Array.isArray(response) ? response : (response.results || []);
        allReviews = allReviews.concat(reviews);

        // Check if there are more pages
        hasMore = response.next ? true : false;
        page++;

        // Safety break
        if (page > 20) break;
      } catch (error) {
        break;
      }
    }

    return allReviews;
  }

  async getReviewStats() {
    try {
      const reviews = await this.getAllReviews();

      if (reviews.length === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }

      const totalReviews = reviews.length;
      const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
      const averageRating = totalStars / totalReviews;

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        ratingDistribution[review.stars]++;
      });

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        reviews
      };
    } catch (error) {
      throw error;
    }
  }

  // Utility methods
  isAuthenticated() {
    return !!this.token;
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setCurrentUser(user) {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await this.apiCall('/profile/update/', {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(profileData)
      });

      // Update stored user data if successful
      if (response.user) {
        this.setCurrentUser(response.user);
      }

      return { success: true, ...response };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      const response = await this.apiCall('/profile/', {
        method: 'GET',
        headers: this.getHeaders()
      });
      return { success: true, ...response };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// ===============================================================================
//                              UTILITY FUNCTIONS
// ===============================================================================

// Format date for display
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

// Format datetime for display
function formatDateTime(dateTimeString) {
  return new Date(dateTimeString).toLocaleString();
}

// Format price for display
function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

// Get order status badge color
function getOrderStatusColor(status) {
  const colors = {
    pending: '#ffa500',
    confirmed: '#007bff',
    preparing: '#6f42c1',
    ready: '#28a745',
    delivered: '#6c757d',
    cancelled: '#dc3545'
  };
  return colors[status] || '#6c757d';
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Initialize API service
const api = new RestaurantAPI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RestaurantAPI, api, formatDate, formatDateTime, formatPrice, getOrderStatusColor, showNotification };
}
