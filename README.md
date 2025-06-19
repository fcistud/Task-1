# Online Shop Backend

A minimalistic backend web application for an online shop built with Node.js and Express.

## Features

- Full CRUD APIs for:
  - Customers
  - Shop Item Categories
  - Shop Items
  - Orders
- In-memory data persistence with test data initialization
- Input validation using Joi
- Comprehensive endpoint tests using Jest and Supertest

## Project Structure

```
online-shop-backend/
├── src/
│   ├── data/
│   │   └── database.js       # In-memory database implementation
│   ├── routes/
│   │   ├── customers.js      # Customer CRUD endpoints
│   │   ├── categories.js     # Category CRUD endpoints
│   │   ├── shopItems.js      # Shop item CRUD endpoints
│   │   └── orders.js         # Order CRUD endpoints
│   ├── validators/
│   │   └── schemas.js        # Joi validation schemas
│   └── server.js             # Express server setup
├── tests/                    # Endpoint tests for all APIs
├── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm

## Setup

1. Clone the repository or navigate to the project directory:
```bash
cd online-shop-backend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on port 3000 by default (or the port specified in the PORT environment variable).

## API Endpoints

Base URL: `http://localhost:3000`

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Shop Items
- `GET /api/shop-items` - Get all shop items
- `GET /api/shop-items/:id` - Get shop item by ID
- `POST /api/shop-items` - Create new shop item
- `PUT /api/shop-items/:id` - Update shop item
- `DELETE /api/shop-items/:id` - Delete shop item

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

## Running Tests

Run all tests:
```bash
npm test
```

## Data Models

### Customer
```json
{
  "id": 1,
  "name": "John",
  "surname": "Doe",
  "email": "john.doe@example.com"
}
```

### ShopItemCategory
```json
{
  "id": 1,
  "title": "Electronics",
  "description": "Electronic devices and accessories"
}
```

### ShopItem
```json
{
  "id": 1,
  "title": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "categories": [...]
}
```

### Order
```json
{
  "id": 1,
  "customer": {...},
  "items": [
    {
      "id": 1,
      "shopItem": {...},
      "quantity": 2
    }
  ]
}
```

## Test Data

The application automatically initializes with test data including:
- 2 customers
- 3 categories (Electronics, Books, Clothing)
- 3 shop items
- 1 order

## Notes

- The application uses an in-memory database, so all data is lost when the server restarts
- Test data is automatically loaded on server startup
- All endpoints include proper validation and error handling