# Fastor CRM Backend

A production-ready CRM backend system for an educational company, built with Node.js, Express.js, PostgreSQL, and Prisma ORM.

## 📋 Project Overview

This CRM system manages the lifecycle of student enquiries from initial public submission to private assignment to individual counselors/employees.

**Key Business Logic:**
- Students submit enquiries through a public endpoint (no auth required)
- All employees can view unclaimed (PUBLIC) enquiries
- An employee can **claim** an enquiry, making it private to them
- Once claimed, the enquiry disappears from the public list
- Atomic database operations prevent two employees from claiming the same enquiry simultaneously

---

## 🛠 Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | v18+ | Runtime |
| Express.js | ^4.21 | Web framework |
| PostgreSQL | 13+ | Database |
| Prisma ORM | ^6.1 | Database client & migrations |
| JWT (jsonwebtoken) | ^9.0 | Authentication |
| bcryptjs | ^2.4 | Password hashing |
| Zod | ^3.23 | Request validation |
| Helmet | ^8.0 | Security headers |
| CORS | ^2.8 | Cross-origin requests |
| express-rate-limit | ^7.4 | Rate limiting |
| Morgan | ^1.10 | HTTP request logging |
| Jest + Supertest | ^29 / ^7 | Testing |

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js v18 or higher
- npm v8 or higher  
- PostgreSQL 13 or higher

### Step 1: Clone and install

```bash
# Navigate to the project directory
cd fastor-crm-backend

# Install dependencies
npm install
```

### Step 2: PostgreSQL Setup

```sql
-- Connect to PostgreSQL and create the database
CREATE DATABASE fastor_crm;
```

Or using the command line:
```bash
psql -U postgres -c "CREATE DATABASE fastor_crm;"
```

### Step 3: Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` with your actual values:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/fastor_crm
JWT_SECRET=your_very_long_random_secret_minimum_32_characters
JWT_EXPIRES_IN=1d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> ⚠️ **Important:** Never commit your `.env` file. It is in `.gitignore`.

### Step 4: Run Prisma Migrations

```bash
# Generate Prisma client
npm run db:generate

# Create and apply migrations
npm run db:migrate
```

When prompted, give your migration a name like `init`.

### Step 5: Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:5000`

**Health Check:** `GET http://localhost:5000/health`

---

## 🗄 Database Schema

### Employee Model

```
employees
├── id           UUID (Primary Key, auto-generated)
├── name         String
├── email        String (UNIQUE, indexed)
├── password     String (bcrypt hash, never exposed)
├── createdAt    DateTime
└── updatedAt    DateTime
```

### Enquiry Model

```
enquiries
├── id             UUID (Primary Key, auto-generated)
├── name           String
├── email          String
├── courseInterest String
├── phone          String? (optional)
├── status         Enum: PUBLIC | CLAIMED
├── claimedById    UUID? (FK → employees.id, nullable)
├── createdAt      DateTime
└── updatedAt      DateTime
```

**Relationships:**
- `Enquiry.claimedById` → `Employee.id` (Many-to-One)
- `status = PUBLIC` + `claimedById = null` → unclaimed enquiry
- `status = CLAIMED` + `claimedById = <uuid>` → private enquiry

**Database Indexes:**
- `employees.email` (unique + index for fast lookup)
- `enquiries.status` (for filtering PUBLIC enquiries)
- `enquiries.claimedById` (for filtering by employee)
- `enquiries.(status, claimedById)` (composite for the main query)

---

## 📡 API Endpoints

### Base URL: `http://localhost:5000`

---

### Authentication

#### `POST /api/auth/register`
Register a new employee account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number

**Success Response (201):**
```json
{
  "success": true,
  "message": "Employee registered successfully.",
  "data": {
    "employee": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` — Validation error (invalid email, weak password, missing fields)
- `409` — Email already registered

---

#### `POST /api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "employee": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` — Validation error
- `401` — Invalid credentials

---

### Enquiries

#### `POST /api/enquiries/public`
Submit a new public enquiry. **No authentication required.**

**Rate Limit:** 10 requests per hour per IP

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@student.com",
  "courseInterest": "Full Stack Development",
  "phone": "9876543210"
}
```

> `phone` is optional.

**Success Response (201):**
```json
{
  "success": true,
  "message": "Enquiry submitted successfully.",
  "data": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@student.com",
    "courseInterest": "Full Stack Development",
    "phone": "9876543210",
    "status": "PUBLIC",
    "claimedById": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### `GET /api/enquiries/public`
Fetch all unclaimed (PUBLIC) enquiries. **Authentication required.**

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max 100) |
| sortOrder | asc \| desc | desc | Sort by creation date |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Public enquiries fetched successfully.",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

#### `PATCH /api/enquiries/:id/claim`
Claim an available enquiry. **Authentication required.**

**CRITICAL:** Uses an atomic database operation to prevent race conditions. If two employees attempt to claim simultaneously, only one succeeds.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Enquiry claimed successfully.",
  "data": {
    "id": "uuid",
    "status": "CLAIMED",
    "claimedById": "employee-uuid",
    "claimedBy": {
      "id": "employee-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Responses:**
- `401` — Not authenticated
- `404` — Enquiry not found
- `409` — Enquiry already claimed

---

#### `GET /api/enquiries/my`
Fetch only the currently authenticated employee's claimed enquiries. **Authentication required.**

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
Same as `GET /api/enquiries/public` (page, limit, sortOrder)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Your enquiries fetched successfully.",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

## 🔐 Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Details:**
- Algorithm: HS256
- Expiration: Configured via `JWT_EXPIRES_IN` (default: 1 day)
- Payload: `{ sub: employeeId, iat: ..., exp: ... }`

---

## 🛡 Security Features

| Feature | Implementation |
|---|---|
| Password Hashing | bcrypt with 12 salt rounds |
| JWT Auth | Signed with `JWT_SECRET` from env |
| Rate Limiting | Auth: 20/15min, Public form: 10/hr, General: 200/15min |
| Security Headers | Helmet.js |
| Input Validation | Zod schemas on all inputs |
| CORS | Configured for `CLIENT_URL` env var |
| No Stack Traces | Hidden in production mode |
| Atomic Operations | `updateMany` with conditions prevents race conditions |

---

## ⚠️ Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Meaningful error description",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

> The `errors` array is only present for validation errors (400).

---

## 🧪 Running Tests

### Setup Test Database

Tests use the same database but clean up their test data. Make sure your `DATABASE_URL` in `.env` is configured.

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Coverage

**Authentication Tests (13 scenarios):**
- ✅ Registration with valid data
- ✅ Duplicate email rejection
- ✅ Invalid email format rejection
- ✅ Weak password rejection
- ✅ Password stored as bcrypt hash (verified)
- ✅ Successful login
- ✅ Wrong password rejection
- ✅ Non-existent user rejection
- ✅ JWT token generation
- ✅ Invalid JWT rejection
- ✅ Missing token rejection

**Enquiry Tests (23 scenarios):**
- ✅ Public enquiry submission without auth
- ✅ Enquiry defaults to PUBLIC status
- ✅ Required field validation
- ✅ Invalid email rejection
- ✅ Optional phone field
- ✅ Authenticated public enquiry fetch
- ✅ Unauthenticated public enquiry fetch rejection
- ✅ Pagination support
- ✅ Only PUBLIC enquiries returned
- ✅ Employee can claim available enquiry
- ✅ Claimed enquiry disappears from public list
- ✅ Claimed enquiry appears in private list
- ✅ Double-claiming prevented (409)
- ✅ Other employee cannot see claimed enquiry
- ✅ Invalid enquiry ID returns 404
- ✅ **Concurrency test** — simultaneous claims: exactly one succeeds
- ✅ Private enquiries show only own enquiries
- ✅ Unauthenticated private list rejection
- ✅ Pagination on private list
- ✅ Foreign key relationship verified
- ✅ Unique email constraint verified

---

## 📂 Project Structure

```
fastor-crm-backend/
│
├── prisma/
│   └── schema.prisma          # Database schema
│
├── src/
│   ├── config/
│   │   └── database.js        # Prisma singleton client
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── enquiry.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js    # Business logic (hashing, JWT, DB queries)
│   │   └── enquiry.service.js # Atomic claim operation here
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── enquiry.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT verification
│   │   ├── validate.middleware.js    # Zod validation factory
│   │   ├── error.middleware.js       # Centralized error handling
│   │   └── rateLimit.middleware.js   # Rate limiting configs
│   │
│   ├── validators/
│   │   ├── auth.validator.js
│   │   └── enquiry.validator.js
│   │
│   ├── utils/
│   │   ├── jwt.js             # Token generation/verification
│   │   └── response.js        # Standardized response helpers
│   │
│   ├── app.js                 # Express app configuration
│   └── server.js              # Server entry point
│
├── tests/
│   ├── auth.test.js
│   └── enquiry.test.js
│
├── fastor-crm-api.postman_collection.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔧 Prisma Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and apply a new migration
npm run db:migrate

# Open Prisma Studio (visual database browser)
npm run db:studio

# Reset database (WARNING: destroys all data)
npm run db:reset
```

---

## 📬 Postman Collection

Import `fastor-crm-api.postman_collection.json` into Postman.

The collection includes:
1. Health Check
2. Register Employee (auto-saves token)
3. Login Employee (auto-saves token)
4. Submit Public Enquiry (auto-saves enquiry ID)
5. Get Public Enquiries
6. Claim Enquiry (uses saved enquiry ID)
7. Get My Enquiries

Use `{{baseUrl}}` collection variable (default: `http://localhost:5000`) and `{{token}}` is auto-populated after login.

---

## 🚨 Concurrency Protection

The most critical business requirement is preventing two employees from claiming the same enquiry simultaneously.

**Implementation:** Instead of a read-then-update pattern (which has a race condition), we use Prisma's `updateMany` with a conditional `WHERE` clause:

```javascript
const result = await prisma.enquiry.updateMany({
  where: {
    id: enquiryId,
    status: 'PUBLIC',       // Only update if still public
    claimedById: null,      // Only update if still unclaimed
  },
  data: {
    status: 'CLAIMED',
    claimedById: employeeId,
  },
});

if (result.count === 0) {
  throw new Error('This enquiry has already been claimed'); // 409
}
```

PostgreSQL executes this as a single atomic `UPDATE ... WHERE` statement, ensuring only one transaction can win.

---

## 📝 HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation Error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate / already claimed) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
