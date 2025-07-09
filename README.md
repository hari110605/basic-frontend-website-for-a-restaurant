# Restaurant Frontend Website

A modern, responsive frontend for a restaurant web application built with HTML, CSS, and JavaScript. This frontend connects to a Django REST API backend to provide a complete restaurant ordering and reservation system.

## Features

### User Features
- **User Authentication**: Registration, login, and logout functionality
- **Dynamic Menu**: Browse menu items loaded from the backend API
- **Shopping Cart**: Add items to cart, manage quantities, and checkout
- **Order Management**: Place orders and view order history
- **Reservations**: Make table reservations with date/time selection
- **Reviews**: Submit reviews for completed orders
- **User Dashboard**: Manage orders, reservations, and profile

### Technical Features
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Dynamic content loading from API
- **Error Handling**: Comprehensive error handling and user feedback
- **Offline Detection**: Network status monitoring
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Modern UI**: Clean, animated interface with smooth transitions

## File Structure

```
├── index.html              # Homepage
├── view.html              # Menu page
├── dashboard.html         # User dashboard
├── style.css             # Main stylesheet
├── js/
│   ├── api.js            # API service module
│   ├── app.js            # Main application logic
│   ├── cart.js           # Shopping cart functionality
│   ├── menu.js           # Menu page logic
│   ├── dashboard.js      # Dashboard functionality
│   ├── reservations.js   # Reservation system
│   └── error-handler.js  # Error handling and notifications
├── images/               # Image assets
└── README.md            # This file
```

## Setup Instructions

### Prerequisites
- A running Django backend server (see API_DOCUMENTATION.md)
- Modern web browser with JavaScript enabled
- Web server (for production) or local file serving capability

### Development Setup

1. **Clone or download the frontend files**
   ```bash
   git clone <repository-url>
   cd restaurant-frontend
   ```

2. **Start the backend server**
   Make sure your Django backend is running on `https://hp005-restaurant-server.hf.space`

3. **Serve the frontend files**
   
   **Option A: Using Python's built-in server**
   ```bash
   python -m http.server 8080
   ```
   
   **Option B: Using Node.js http-server**
   ```bash
   npx http-server -p 8080
   ```
   
   **Option C: Using Live Server (VS Code extension)**
   - Install the Live Server extension
   - Right-click on `index.html` and select "Open with Live Server"

4. **Access the application**
   Open your browser and navigate to `http://localhost:8080`

### Configuration

The API base URL is configured in `js/api.js`:
```javascript
const API_BASE_URL = 'https://hp005-restaurant-server.hf.space/api';
```

Update this URL if your backend is running on a different address.

## Usage Guide

### For Users

1. **Homepage (`index.html`)**
   - View restaurant information and hours
   - Quick access to menu and reservations
   - Login/register functionality

2. **Menu Page (`view.html`)**
   - Browse all available menu items
   - Search and filter items
   - Add items to shopping cart
   - View item details and prices

3. **Shopping Cart**
   - Accessible from any page via cart icon
   - Manage item quantities
   - Proceed to checkout (requires login)

4. **User Dashboard (`dashboard.html`)**
   - View order history and status
   - Manage reservations
   - Submit reviews for completed orders
   - View profile information

### Authentication Flow

1. **Registration**
   - Click "Sign Up" button
   - Fill in username, email, and password
   - Automatic login after successful registration

2. **Login**
   - Click "Login" button
   - Enter email and password
   - Access to protected features (cart, orders, reservations)

3. **Logout**
   - Click username dropdown → "Logout"
   - Clears session and redirects to homepage

### Making Orders

1. Browse menu items on the menu page
2. Add desired items to cart
3. Click cart icon to review items
4. Click "Checkout" (login required)
5. Order is submitted and confirmation shown
6. View order status in dashboard

### Making Reservations

1. Click "Reservations" or "Book a Table"
2. Select date, time, and party size
3. Add special requests (optional)
4. Submit reservation (login required)
5. Receive confirmation with details

## API Integration

The frontend communicates with the Django backend through REST API endpoints:

- **Authentication**: `/api/auth/login/`, `/api/auth/register/`
- **Menu**: `/api/menu/`
- **Orders**: `/api/order/`, `/api/orders/`
- **Reservations**: `/api/reservation/`, `/api/reservations/`
- **Reviews**: `/api/review/`, `/api/reviews/`

See `API_DOCUMENTATION.md` for complete API reference.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Breakpoints

- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: 320px - 767px

## Error Handling

The application includes comprehensive error handling:

- **Network errors**: Automatic retry with user feedback
- **API errors**: Specific error messages based on response
- **Validation errors**: Real-time form validation
- **Offline detection**: Graceful degradation when offline

## Security Features

- **JWT Token Management**: Secure token storage and refresh
- **Input Validation**: Client-side validation for all forms
- **XSS Protection**: Proper data sanitization
- **CSRF Protection**: Handled by Django backend

## Performance Optimizations

- **Lazy Loading**: Images loaded on demand
- **Caching**: API responses cached where appropriate
- **Minification**: CSS and JS optimized for production
- **Compression**: Gzip compression recommended for production

## Troubleshooting

### Common Issues

1. **"Failed to load menu items"**
   - Check if backend server is running
   - Verify API_BASE_URL in `js/api.js`
   - Check browser console for network errors

2. **"Authentication required" errors**
   - Clear browser localStorage
   - Login again
   - Check token expiration

3. **Cart not working**
   - Enable JavaScript in browser
   - Clear browser cache
   - Check for JavaScript errors in console

4. **Responsive issues**
   - Clear browser cache
   - Test in different browsers
   - Check viewport meta tag

### Debug Mode

To enable debug logging, add this to browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## Contributing

1. Follow existing code style and structure
2. Test on multiple browsers and devices
3. Ensure accessibility compliance
4. Update documentation for new features

## License

This project is licensed under the MIT License.
