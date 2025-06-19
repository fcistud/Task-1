# Online Shop Backend

A minimalistic backend web application for an online shop with full CRUD APIs for managing customers, product categories, shop items, and orders.

## Features

- Data models for Customer, ShopItemCategory, ShopItem, OrderItem, and Order
- SQLite database for data persistence with Sequelize ORM
- RESTful API endpoints with Express
- Initial test data loaded on application startup
- Comprehensive test suite with Jest
- Inventory management with stock tracking
- Order status tracking and management
- Customer address and contact information
- Advanced filtering and sorting for shop items

## API Endpoints

The following API endpoints are available:

### Customers
- `GET /customers` - Get all customers
- `GET /customers/:id` - Get a customer by ID
- `POST /customers` - Create a new customer
- `PUT /customers/:id` - Update a customer
- `DELETE /customers/:id` - Delete a customer

### Categories
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get a category by ID
- `POST /categories` - Create a new category
- `PUT /categories/:id` - Update a category
- `DELETE /categories/:id` - Delete a category

### Shop Items
- `GET /shop-items` - Get all shop items (supports filtering and sorting)
- `GET /shop-items/:id` - Get a shop item by ID
- `POST /shop-items` - Create a new shop item
- `PUT /shop-items/:id` - Update a shop item
- `PATCH /shop-items/:id/stock` - Update stock quantity
- `DELETE /shop-items/:id` - Delete a shop item

### Orders
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get an order by ID
- `GET /orders/status/:status` - Get orders by status
- `POST /orders` - Create a new order
- `PUT /orders/:id` - Update an order
- `DELETE /orders/:id` - Delete an order

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd online-shop-backend
```

2. Install dependencies:
```
npm install
```

## Running the Application

Start the server:
```
npm start
```

The server will start on port 3000 by default. You can access the API at `http://localhost:3000`.

For development with auto-restart:
```
npm run dev
```

## Testing

Run the automated tests:
```
npm test
```

This will run all tests in the `/tests` directory.

## Linting

Check code quality with ESLint:
```
npm run lint
```

## Database

The application uses SQLite as the database, which is stored in a file called `database.sqlite`. The database is automatically created when the application starts, and test data is loaded.

## Project Structure

- `/models` - Database models (Customer, ShopItemCategory, etc.)
- `/routes` - API route handlers
- `/seeders` - Initial data for the database
- `/tests` - Automated tests
- `server.js` - Main application entry point

## Model Details

### Customer
- Basic information: name, surname, email
- Address information: address, city, state, zipCode, country
- Contact information: phone

### Shop Item
- Basic information: title, description, price
- Inventory management: stockQuantity, isActive
- Additional metadata: imageUrl, sku

### Order
- Status tracking: pending, processing, shipped, delivered, canceled
- Date information: orderDate
- Shipping details: shippingAddress, notes

## Sample Requests

### Create a customer
```
POST /customers
{
  "name": "John",
  "surname": "Smith",
  "email": "john.smith@example.com",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "phone": "555-123-4567"
}
```

### Create a shop item
```
POST /shop-items
{
  "title": "Smartphone",
  "description": "Latest model smartphone",
  "price": 699.99,
  "stockQuantity": 50,
  "imageUrl": "https://example.com/images/smartphone.jpg",
  "isActive": true,
  "sku": "PHONE-001",
  "categoryIds": [1]
}
```

### Create an order
```
POST /orders
{
  "customerId": 1,
  "status": "pending",
  "shippingAddress": "123 Main St, New York, NY 10001",
  "notes": "Please deliver after 5pm",
  "items": [
    {
      "shopItemId": 1,
      "quantity": 2
    }
  ]
}
```

### Filter shop items
```
GET /shop-items?minPrice=20&maxPrice=100&inStock=true&category=2&sortBy=price&sortOrder=asc
```

### Get orders by status
```
GET /orders/status/processing
```

### Update stock quantity
```
PATCH /shop-items/1/stock
{
  "stockQuantity": 75
}
```