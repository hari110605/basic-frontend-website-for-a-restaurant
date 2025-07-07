# Review Functions Documentation

This document provides comprehensive documentation for the review submission functions in the restaurant frontend application.

## Overview

The review system provides multiple ways to submit customer reviews for completed orders. It includes validation, error handling, and flexible callback options.

## Main Functions

### 1. `addReview(orderId, rating, description, options)`

The primary function for submitting reviews programmatically.

**Parameters:**
- `orderId` (number): The ID of the order to review
- `rating` (number): Rating from 1 to 5 stars
- `description` (string): Review description text (10-500 characters)
- `options` (object, optional): Additional configuration options

**Options Object:**
```javascript
{
  onLoading: (isLoading) => void,     // Loading state callback
  onSuccess: (response) => void,       // Success callback
  onError: (error, message) => void,   // Error callback
  successMessage: string               // Custom success message
}
```

**Returns:** Promise that resolves with the API response

**Example:**
```javascript
// Basic usage
await addReview(123, 5, "Excellent food and service!");

// With callbacks
await addReview(123, 4, "Good experience", {
  onLoading: (isLoading) => {
    console.log("Loading:", isLoading);
  },
  onSuccess: (response) => {
    console.log("Review submitted:", response);
    refreshOrderList();
  },
  onError: (error, message) => {
    console.error("Failed:", message);
  },
  successMessage: "Thank you for your feedback!"
});
```

### 2. `addReviewWithModal(orderId, options)`

Opens a modal interface for users to submit reviews interactively.

**Parameters:**
- `orderId` (number): The ID of the order to review
- `options` (object, optional): Configuration options

**Options Object:**
```javascript
{
  orderInfo: {              // Order information to display
    id: number,
    order_date: string,
    total_amount: number
  }
}
```

**Example:**
```javascript
// Simple modal
addReviewWithModal(123);

// With order information
addReviewWithModal(123, {
  orderInfo: {
    id: 123,
    order_date: "2024-01-15",
    total_amount: 25.99
  }
});
```

### 3. `addReviewDirect(reviewData)`

Submit a review with all data provided in a single object.

**Parameters:**
- `reviewData` (object): Complete review data

**Review Data Object:**
```javascript
{
  orderId: number,
  rating: number,
  description: string,
  // ... any options from addReview
}
```

**Example:**
```javascript
await addReviewDirect({
  orderId: 123,
  rating: 5,
  description: "Amazing experience!",
  successMessage: "Thanks for the review!"
});
```

## Utility Functions

### 4. `validateReviewData(orderId, rating, description)`

Validates review data before submission.

**Returns:** Object with `isValid` boolean and `message` string

**Example:**
```javascript
const validation = validateReviewData(123, 5, "Great food!");
if (validation.isValid) {
  // Proceed with submission
} else {
  console.error("Validation error:", validation.message);
}
```

### 5. `canReviewOrder(order)`

Checks if an order can be reviewed.

**Parameters:**
- `order` (object): Order object with status and review information

**Returns:** Boolean indicating if the order can be reviewed

**Example:**
```javascript
const order = { id: 123, status: 'delivered', has_review: false };
if (canReviewOrder(order)) {
  // Show review button
}
```

### 6. `getReviewButtonHTML(order)`

Generates HTML for a review button.

**Parameters:**
- `order` (object): Order object

**Returns:** HTML string for the review button

**Example:**
```javascript
const order = { id: 123, status: 'delivered', has_review: false };
const buttonHTML = getReviewButtonHTML(order);
document.getElementById('container').innerHTML += buttonHTML;
```

### 7. `resetReviewModal()`

Resets the review modal to its initial state.

**Example:**
```javascript
resetReviewModal(); // Clears form, resets stars, etc.
```

## Error Handling

The review functions provide comprehensive error handling with user-friendly messages:

### Common Error Scenarios:
- **Already reviewed**: "You have already reviewed this order."
- **Order not found**: "Order not found or cannot be reviewed."
- **Permission denied**: "You do not have permission to review this order."
- **Authentication required**: "Please login to submit a review."
- **Network error**: "Network error. Please check your connection and try again."
- **Validation error**: "Please check your review details and try again."

### Error Handling Example:
```javascript
try {
  await addReview(123, 5, "Great food!");
} catch (error) {
  // Error is automatically displayed to user
  // Additional custom handling can be done here
  console.error("Review submission failed:", error.message);
}
```

## Validation Rules

### Order ID:
- Must be a positive integer
- Must exist in the system

### Rating:
- Must be between 1 and 5 (inclusive)
- Must be an integer

### Description:
- Minimum 10 characters
- Maximum 500 characters
- Cannot be empty or only whitespace

### Order Requirements:
- Order status must be 'delivered'
- Order must not already have a review
- User must own the order

## Integration Examples

### 1. Dashboard Integration
```javascript
// In order list rendering
function createOrderHTML(order) {
  return `
    <div class="order-item">
      <!-- Order details -->
      ${getReviewButtonHTML(order)}
    </div>
  `;
}
```

### 2. Custom Review Form
```javascript
// Custom form submission
async function handleCustomReviewForm(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const orderId = formData.get('orderId');
  const rating = formData.get('rating');
  const description = formData.get('description');
  
  try {
    await addReview(parseInt(orderId), parseInt(rating), description, {
      onSuccess: () => {
        event.target.reset();
        loadOrders(); // Refresh order list
      }
    });
  } catch (error) {
    // Error handling is automatic
  }
}
```

### 3. Bulk Review Operations
```javascript
// Submit multiple reviews
async function submitMultipleReviews(reviews) {
  const results = [];
  
  for (const review of reviews) {
    try {
      const result = await addReview(
        review.orderId,
        review.rating,
        review.description
      );
      results.push({ success: true, result });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }
  
  return results;
}
```

## Backend Requirements

The review functions expect the following backend API endpoints:

### POST `/api/review/`
**Request Body:**
```json
{
  "order_id": 123,
  "stars": 5,
  "description": "Great food and service!"
}
```

**Response:**
```json
{
  "id": 456,
  "order": { "id": 123 },
  "user": { "id": 789, "username": "customer" },
  "stars": 5,
  "description": "Great food and service!",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Error Responses:
- `400`: Validation error or duplicate review
- `401`: Authentication required
- `403`: Permission denied
- `404`: Order not found

## Browser Support

The review functions work in all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

The review functions depend on:
- `api.js` - API communication
- `error-handler.js` - Error handling and notifications
- `app.js` - Authentication state

## Testing

Use the `review-examples.html` page to test all review functions interactively.

## Troubleshooting

### Common Issues:

1. **"Function not defined" errors**
   - Ensure `review-submission.js` is loaded before other scripts
   - Check browser console for script loading errors

2. **Reviews not submitting**
   - Check authentication status
   - Verify backend API is running
   - Check network connectivity

3. **Modal not appearing**
   - Ensure user is logged in
   - Check if modal HTML exists in the page
   - Verify CSS is loaded properly

4. **Validation errors**
   - Check review description length (10-500 characters)
   - Ensure rating is between 1-5
   - Verify order ID is valid
