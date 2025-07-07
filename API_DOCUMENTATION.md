# Restaurant Backend API Documentation

## Overview
This is a Django REST API for a restaurant web application with JWT authentication. The API is organized into three main apps:
- `auth_app`: User authentication and management
- `restaurant_server`: Restaurant operations (menu, orders, reservations, reviews)
- `admin_app`: Administrative functions

## Base URL
```
http://127.0.0.1:8000/api
```

## Authentication
The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

## API Endpoints

### Authentication Endpoints (`/api/auth/`)

#### Register User
- **POST** `/api/auth/register/`
- **Description**: Register a new user
- **Authentication**: Not required
- **Request Body**:
```json
{
    "username": "string",
    "email": "string",
    "password": "string",
    "password_confirm": "string"
}
```
- **Response**: User data with JWT tokens

#### Login User
- **POST** `/api/auth/login/`
- **Description**: Login and receive JWT tokens
- **Authentication**: Not required
- **Request Body**:
```json
{
    "email": "string",
    "password": "string"
}
```
- **Response**: User data with JWT tokens

#### User Profile
- **GET** `/api/auth/profile/`
- **Description**: Get current user profile
- **Authentication**: Required

### Restaurant Endpoints (`/api/`)

#### Menu Items
- **GET** `/api/menu/`
- **Description**: Get all available menu items
- **Authentication**: Not required

#### Create Reservation
- **POST** `/api/reservation/`
- **Description**: Create a table reservation
- **Authentication**: Required
- **Request Body**:
```json
{
    "reservation_date": "YYYY-MM-DD",
    "reservation_time": "HH:MM:SS",
    "party_size": integer,
    "special_requests": "string (optional)"
}
```

#### User Reservations
- **GET** `/api/reservations/`
- **Description**: Get current user's reservations
- **Authentication**: Required

#### Create Order
- **POST** `/api/order/`
- **Description**: Place a new order
- **Authentication**: Required
- **Request Body**:
```json
{
    "items": [
        {
            "menu_item_id": integer,
            "quantity": integer
        }
    ],
    "special_instructions": "string (optional)"
}
```

#### User Orders
- **GET** `/api/orders/`
- **Description**: Get current user's order history
- **Authentication**: Required

#### Create Review
- **POST** `/api/review/`
- **Description**: Submit a review for an order
- **Authentication**: Required
- **Request Body**:
```json
{
    "order_id": integer,
    "stars": integer (1-5),
    "description": "string"
}
```

#### Reviews List
- **GET** `/api/reviews/`
- **Description**: Get all reviews (paginated)
- **Authentication**: Not required

### Admin Endpoints (`/api/admin/`)
*Note: All admin endpoints require staff/superuser privileges*

#### List Users
- **GET** `/api/admin/users/`
- **Description**: Get all registered users
- **Authentication**: Required (Admin only)

#### Add Menu Item
- **POST** `/api/admin/menu/`
- **Description**: Add a new menu item
- **Authentication**: Required (Admin only)
- **Request Body**:
```json
{
    "food_name": "string",
    "food_description": "string",
    "food_price": float,
    "food_image": "file (optional)",
    "is_available": boolean
}
```

#### List All Menu Items
- **GET** `/api/admin/menu/all/`
- **Description**: Get all menu items (including unavailable)
- **Authentication**: Required (Admin only)

#### Delete Menu Item
- **DELETE** `/api/admin/menu/<id>/`
- **Description**: Delete a menu item
- **Authentication**: Required (Admin only)

#### List All Reviews
- **GET** `/api/admin/reviews/`
- **Description**: Get all reviews
- **Authentication**: Required (Admin only)

#### Delete Review
- **DELETE** `/api/admin/review/<id>/`
- **Description**: Delete a review
- **Authentication**: Required (Admin only)

## Error Responses
All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

Error responses include a message describing the issue.

## Testing
Run the test script to verify API functionality:
```bash
python test_api.py
```

## Development Server
Start the development server:
```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/api/`
