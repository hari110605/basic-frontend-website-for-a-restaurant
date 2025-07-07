// ===============================================================================
//                    RESTAURANT API SERVICE MODULE
// ===============================================================================

// Base configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
    const response = await fetch(url, options);
    
    if (response.status === 401) {
      // Token expired, redirect to login
      this.logout();
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  }

  // Authentication methods
  async register(userData) {
    return this.apiCall('/auth/register/', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(userData)
    });
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
    // Redirect to login page
    window.location.href = '/login';
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

  // Admin methods (require admin privileges)
  async getUsers() {
    return this.apiCall('/admin/users/', {
      method: 'GET',
      headers: this.getHeaders()
    });
  }

  async addMenuItem(menuItemData) {
    // For file uploads, don't set Content-Type (let browser set it)
    const formData = new FormData();
    Object.keys(menuItemData).forEach(key => {
      formData.append(key, menuItemData[key]);
    });

    return this.apiCall('/admin/menu/', {
      method: 'POST',
      headers: this.getHeaders(true, null), // No content-type for FormData
      body: formData
    });
  }

  async deleteMenuItem(menuItemId) {
    return this.apiCall(`/admin/menu/${menuItemId}/`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }
}

// ===============================================================================
//                              USAGE EXAMPLES
// ===============================================================================

// Initialize API service
const api = new RestaurantAPI();

// Example: User Registration
async function registerUser() {
  try {
    const userData = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'securepassword123',
      password_confirm: 'securepassword123'
    };
    
    const response = await api.register(userData);
    console.log('Registration successful:', response.user);
    
    // Tokens are automatically stored
    // Redirect to dashboard or home page
    
  } catch (error) {
    console.error('Registration failed:', error.message);
    // Show error message to user
  }
}

// Example: User Login
async function loginUser() {
  try {
    const response = await api.login('user@example.com', 'password123');
    console.log('Login successful:', response.user);
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
    
  } catch (error) {
    console.error('Login failed:', error.message);
    // Show error message to user
  }
}

// Example: Load Menu Items
async function loadMenu() {
  try {
    const menuItems = await api.getMenu();
    
    // Display menu items in UI
    menuItems.forEach(item => {
      console.log(`${item.food_name}: $${item.food_price}`);
      // Create menu item elements in DOM
    });
    
  } catch (error) {
    console.error('Failed to load menu:', error.message);
  }
}

// Example: Create Order
async function placeOrder() {
  try {
    const orderData = {
      items: [
        { menu_item_id: 1, quantity: 2 },
        { menu_item_id: 3, quantity: 1 }
      ],
      special_instructions: 'Extra spicy, no onions'
    };
    
    const order = await api.createOrder(orderData);
    console.log('Order placed:', order);
    console.log('Total amount:', order.total_amount);
    
    // Show success message and redirect to order confirmation
    
  } catch (error) {
    console.error('Failed to place order:', error.message);
    // Show error message to user
  }
}

// Example: Create Reservation
async function makeReservation() {
  try {
    const reservationData = {
      reservation_date: '2025-07-15',
      reservation_time: '19:30:00',
      party_size: 4,
      special_requests: 'Window seat preferred'
    };
    
    const reservation = await api.createReservation(reservationData);
    console.log('Reservation created:', reservation);
    
    // Show confirmation message
    
  } catch (error) {
    console.error('Failed to create reservation:', error.message);
    // Show error message to user
  }
}

// Example: Submit Review
async function submitReview(orderId) {
  try {
    const reviewData = {
      order_id: orderId,
      stars: 5,
      description: 'Excellent food and service!'
    };
    
    const review = await api.createReview(reviewData);
    console.log('Review submitted:', review);
    
    // Show success message and update UI
    
  } catch (error) {
    console.error('Failed to submit review:', error.message);
    // Show error message to user
  }
}

// ===============================================================================
//                              REACT HOOKS EXAMPLES
// ===============================================================================

// Custom hook for menu data
function useMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        const menuData = await api.getMenu();
        setMenu(menuData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  return { menu, loading, error };
}

// Custom hook for user orders
function useUserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const orderData = await api.getUserOrders();
        setOrders(orderData);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  return { orders, loading, refetch: fetchOrders };
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

// Check if user is authenticated
function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}

// Get order status badge color
function getOrderStatusColor(status) {
  const colors = {
    pending: 'orange',
    confirmed: 'blue',
    preparing: 'purple',
    ready: 'green',
    delivered: 'gray',
    cancelled: 'red'
  };
  return colors[status] || 'gray';
}

// Export the API service for use in other modules
export default RestaurantAPI;
