# 🛍️ Shopv1 — Modern Full-Stack E-Commerce Platform

A production-ready, full-stack e-commerce web application built with **React**, **Node.js/Express**, **PostgreSQL**, **Prisma ORM**, and **Docker**. Features dual payment integrations (**Stripe** & **Bakong KHQR**), self-hosted image storage, real-time inventory management, and an administrative dashboard.

---

## 🚀 Tech Stack

### **Frontend**
* **Framework**: React 18, Vite, TypeScript
* **Routing**: React Router DOM
* **Styling**: Modern CSS / Responsive Design
* **Icons**: Lucide React
* **Payments**: `@stripe/stripe-js`, `@stripe/react-stripe-js`
* **State & Networking**: Axios with interceptors, Context API

### **Backend**
* **Runtime**: Node.js (v20+), Express 5, TypeScript
* **Database**: PostgreSQL 16+
* **ORM**: Prisma ORM 7 (with `@prisma/adapter-pg`)
* **Authentication**: JWT (Access Token + HttpOnly Refresh Token Cookies) & Bcrypt
* **Payments**: Stripe API & Bakong KHQR
* **Storage**: Self-hosted local static image serving (`/uploads`)
* **Security**: Helmet/CSP, Rate Limiting, Input Sanitization

### **DevOps & Deployment**
* **Containerization**: Docker & Docker Compose
* **Host Platform**: Self-hosted VPS / AWS EC2 / Coolify

---

## ✨ Features

### 🛒 Customer Storefront
* **Product Catalog & Filtering**: Browse by category (`hat`, `shirt`, `pant`, `shoe`), gender (`men`, `women`, `kids`), price range, colors, and sizes.
* **Fuzzy Search & Sorting**: Instant search by name, brand, or tag; sort by popularity, rating, newest, or price.
* **Variant Selection**: Interactive size and color selectors with live stock availability indicators.
* **Persistent Cart**: Local cart for guests with automated database merge on login.
* **Customer Reviews**: Rating distribution charts (1–5 stars) and verified purchase badges.

### 💳 Dual Payment Gateway
* **Stripe**: Credit/Debit card checkout via Stripe Payment Intents with webhook confirmation.
* **Bakong KHQR**: Dynamic Cambodian KHQR generation with MD5 transaction verification and polling/webhooks.

### 📦 Inventory & Orders
* **Atomic Reservations**: Safe, race-condition-free stock reservations during checkout via Prisma transactions.
* **Order Tracking**: Order status progression (`pending` $\rightarrow$ `confirmed` $\rightarrow$ `processing` $\rightarrow$ `shipped` $\rightarrow$ `delivered`).

### 🛡️ Admin Dashboard
* **Product Management**: Create, update, soft-delete, and restore products with multi-variant and image configurations.
* **Order Management**: Filter orders by status and update shipment tracking details.
* **Analytics**: Real-time revenue summaries, pending order counts, customer counts, and product metrics.

---

## 📁 Repository Structure

```
Shopv1/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # PostgreSQL schema definition
│   ├── src/
│   │   ├── config/               # Database, Stripe, and environment config
│   │   ├── controllers/          # Request handlers (auth, products, orders, etc.)
│   │   ├── middleware/           # Auth, admin role check, error handling, rate limiting
│   │   ├── routes/               # Express API route declarations
│   │   ├── scripts/              # Migration and backup utilities
│   │   ├── seeders/              # Database seeders & mock image catalog
│   │   └── utils/                # Inventory transactions, email notifications
│   ├── uploads/                  # Self-hosted uploaded product images
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios API clients
│   │   ├── components/           # UI components (ProductCard, Navbar, Modals, etc.)
│   │   ├── context/              # Auth, Cart, Currency contexts
│   │   ├── pages/                # Storefront, Checkout, and Admin pages
│   │   └── types/                # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml             # Full-stack Docker deployment config
```

---

## 🛠️ Getting Started

### Prerequisites
* **Node.js** v20+ and **npm**
* **Docker & Docker Compose**

---

### 1. Clone the Repository
```bash
git clone https://github.com/vichevong1-coder/Shopv1.git
cd Shopv1
```

---

### 2. Configure Environment Variables

#### **Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# PostgreSQL Connection (local Docker container)
DATABASE_URL=postgresql://postgres:postgres_password_123@localhost:5434/shopv1?schema=public
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_password_123
POSTGRES_DB=shopv1

# JWT Secrets (Generate with: openssl rand -hex 64)
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_key

# Initial Admin Credentials (for seed script)
ADMIN_EMAIL=admin@example.com
ADMIN_NAME=Store Admin
ADMIN_PASSWORD=secure_password_123
```

#### **Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

---

### 3. Start PostgreSQL Database
Start the dedicated PostgreSQL container:
```bash
docker compose up -d postgres
```

---

### 4. Setup Database & Seed Initial Catalog
```bash
cd backend
npm install

# Push schema to PostgreSQL
npm run db:push

# Seed Admin user, 18 products, 54 images, and 270 variants
npm run seed:postgres
```

---

### 5. Start Development Servers

**Backend API:**
```bash
cd backend
npm run dev
# API running at http://localhost:5000
```

**Frontend Store:**
```bash
cd frontend
npm install
npm run dev
# Storefront running at http://localhost:3000
```

---

## 🚢 Production Deployment (Docker Compose / Coolify)

To run the entire application stack in production with 24/7 uptime:

```bash
docker compose up -d --build
```

### Persistent Volumes
* `postgres_data`: Persists the PostgreSQL database across container rebuilds.
* `backend_uploads`: Persists uploaded product images on disk.

---

## 📜 Available NPM Scripts

### Backend (`/backend`)
| Script | Description |
| :--- | :--- |
| `npm run dev` | Start development API server with nodemon and ts-node |
| `npm run build` | Compile TypeScript to `/dist` |
| `npm start` | Run compiled production server |
| `npm run db:push` | Sync Prisma schema directly with PostgreSQL |
| `npm run db:generate`| Generate Prisma Client types |
| `npm run seed:postgres` | Seed admin account and full product catalog with images |
| `npm test` | Run test suite with Jest |

### Frontend (`/frontend`)
| Script | Description |
| :--- | :--- |
| `npm run dev` | Start Vite HMR development server |
| `npm run build` | Build optimized production bundle to `/dist` |
| `npm run preview` | Preview production build locally |

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
