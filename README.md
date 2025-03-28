# Inventory Management System

## Overview

This **Inventory Management System** is built with **NestJS** and **Prisma**, designed to streamline inventory tracking, Purchase Requests, purchase orders, and stock management. The system supports two user roles with different access levels:

- **Admin** → Full access (CRUD for products, purchase orders, and stock management)
- **Manager** → Can only **update product stock**

## Features

- **Authentication & Authorization** (JWT-based, Role-based access control)
- **Products Management** (CRUD for inventory items)
- **Purchase Requests** (CRUD for Purchase Requests)
- **Purchase Orders** (CRUD for Purchase Orders)
- **Goods Received** (Tracks received goods and updates inventory)
- **Role-Based Access** (Admin and Manager permissions)

## Tech Stack

- **Backend**: NestJS, Prisma ORM, PostgreSQL (Render)
- **Authentication**: JWT, Passport.js
- **Database**: PostgreSQL (Neon)
- **Validation**: Class-validator, Class-transformer

## Installation & Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL (Neon Cloud or Local)
- NestJS CLI installed (`npm install -g @nestjs/cli`)

## 1. Clone the Repository

```sh
git clone https://github.com/Abubokkor98/inventory-management
cd inventory-management
```

## 2. Install Dependencies

```sh
npm install
```

## 3. Set Up Environment Variables

Create a `.env` file in the root directory and configure:

```env
DATABASE_URL=postgresql://your_username:your_password@your_neon_database_url
JWT_SECRET=your_secret_key
```

## 4. Set Up Database with Prisma

```sh
npx prisma migrate dev --name init
npx prisma generate
```

## 5. Start the Server

```sh
npm run start:dev
```

## API Routes

### Authentication (`/auth`)

- **POST `/auth/register`** → User Registration
- **POST `/auth/login`** → User Login

### Items (`/items`)

- **GET `/items`** → Get all products _(Admin only)_
- **GET `/items/:id`** → Get a specific product _(Admin only)_
- **POST `/items`** → Create a new product _(Admin only)_
- **PATCH `/items/:id`** → Update product details _(Admin only)_
- **PATCH `/items/:id/stock`** → Update product stock _(Manager only)_
- **DELETE `/items/:id`** → Delete a product _(Admin only)_

### Purchase Requests (`/purchase-requests`)

- **POST `/purchase-requests`** → Creates a purchase order
- **GET `/purchase-requests`** → View all purchase requests
- **GET `/purchase-requests/:id`** → View a single purchase request
- **PATCH `/purchase-requests/:id`** → Update a purchase request
- **DELETE `/purchase-requests/:id`** → Delete a purchase request

### Purchase Orders (`/purchase-orders`)

- **POST `/purchase-orders`** → Creates a purchase order
- **GET `/purchase-orders`** → View all purchase orders
- **GET `/purchase-orders/:id`** → View a single purchase order
- **PATCH `/purchase-orders/:id`** → Update a purchase order
- **DELETE `/purchase-orders/:id`** → Delete a purchase order

### Goods Received (`/goods-received`)

- **POST `/goods-received`** → Creates a goods-received
- **GET `/goods-received`** → View all goods-received
- **GET `/goods-received:id`** → View a single goods-received
- **PATCH `goods-received/:id`** → Update a goods-received
- **DELETE `/goods-received/:id`** → Delete a goods-received

## Error Handling

| Error Code | Description           |
| ---------- | --------------------- |
| `400`      | Bad Request           |
| `401`      | Unauthorized          |
| `403`      | Forbidden             |
| `404`      | Not Found             |
| `500`      | Internal Server Error |

---

## Role-Based Access

| Role    | Authentication | Manage Items      | Purchase Requests | Purchase Orders | Goods Received |
| ------- | -------------- | ----------------- | ----------------- | --------------- | -------------- |
| Admin   | ✅             | ✅ (CRUD)         | ✅ (CRUD)         | ✅ (CRUD)       | ✅ (CRUD)      |
| Manager | ✅             | ✅ (Update Stock) | ❌                | ❌              | ❌             |

---

## Contributing

Pull requests are welcome! Please ensure your code follows NestJS best practices.

## About the Developer

Built with ❤️ and passion by Abu Bokkor Siddik.

- **GitHub**: [Abubokkor98](https://github.com/Abubokkor98)
- **LinkedIn**: [Connect with me](https://www.linkedin.com/in/abubokkor)

---

## License

This project is open-source under the **MIT License**.
