# Fastor Restaurant Mobile Application

A production-ready food delivery mobile web application built with **React.js**, **Vite**, **React Router v7**, and **Axios**, faithfully reproducing the provided 4-screen Figma design and integrated with live **Fastor Staging APIs**.

---

## 📱 Application Preview & Screenshots

The application faithfully reproduces all four screens from the Figma design:

1. **Screen 1 — Signup (`/signup`)**:
   - Mobile signup interface with country dialing code selector (`+91` India, `+1` US, etc.)
   - Phone number input with 10-digit validation
   - Orange vibrant primary button (**Get OTP**) with loading spinner
   - Direct integration with `POST https://staging.fastor.ai/v1/pwa/user/register`
   - Interactive on-screen numeric keypad matching the Figma mobile mockup
   - Terms & Conditions and Privacy Policy links

2. **Screen 2 — 6-Digit OTP Verification (`/verify-otp`)**:
   - Displays registered phone number (e.g. `+91 98765 43210`)
   - 6 individual OTP input boxes in the exact `3 - 3` split layout from Figma
   - Auto-focus, auto-advance, backspace navigation, and full 6-digit paste support
   - Live 15-second countdown timer (`00:15` → `00:00`) with dynamic "Resend Code" trigger
   - Direct integration with `POST https://staging.fastor.ai/v1/pwa/user/login`
   - Secure extraction and storage of JWT Bearer token into `localStorage` and `AuthContext`
   - Quick one-click "Fill 123456" helper for staging review

3. **Screen 3 — Restaurant Home (`/home`)**:
   - **Header**: Current location ("Model Town, New Delhi") and quick log out action
   - **Search & Filter Bar**: Search box with "Karan" placeholder, clear button, and quick offer/bookmark buttons
   - **Best Seller Section**: Horizontal carousel of food cards (Sushi Special, Chicken Burger, Pepperoni Pizza, Strawberry Shake) with star ratings and prices
   - **Promotional Banner**: Gradient orange card featuring "Experience our delicious new dish", "30% OFF", and hero pizza imagery
   - **Popular Items Section**: Recent order cards matching Figma (Strawberry Shake, Chicken Burger) with order timestamps, items count, "Cancel Order" and "Track Driver" modal
   - **Live Fastor Restaurants API**: Real-time integration with `GET https://staging.fastor.ai/v1/m/restaurant?city_id=118` with JWT Bearer token, displaying real restaurant names (e.g. VYB, Mother India), logos, addresses, open badges, and delivery estimates

4. **Screen 4 — Food Details (`/food/:id`)**:
   - Large hero pizza photograph (`323px × 223px`)
   - Dynamic price calculation based on selected portion and quantity
   - Quantity stepper (`[-]` decrement, count, `[+]` increment) with minimum threshold of 1
   - Complete product copy: "Lorem ipsum dolor sit amet"
   - **Portion Selection**:
     - *Personal (4 Slices)* — $9.00
     - *Medium (8 Slices)* — $11.00
     - *Familiar (10 Slices)* — $13.00
     - *Jumbo (12 Slices)* — $15.00
   - Single radio selection with clear visual highlight
   - Bottom sticky **"Add to cart"** button with dynamic total and animated feedback

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite 8
- **Language**: JavaScript (ESModules, JSX)
- **Routing**: `react-router-dom` v7 with protected routes
- **HTTP Client**: `axios` with centralized request/response interceptors
- **Icons**: `lucide-react`
- **Styling**: Pure CSS3 with CSS Custom Properties (Design System tokens)

---

## 🔌 API Integration Architecture

All requests communicate directly with Fastor staging servers at `https://staging.fastor.ai`.

### 1. User Registration (OTP Request)
- **Endpoint**: `POST /v1/pwa/user/register`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Request Body**:
  ```
  phone=9876543210&dial_code=+91
  ```
- **Response**:
  ```json
  {
    "status": "Success",
    "status_code": 200,
    "data": "otp sent"
  }
  ```

### 2. User Authentication (Login)
- **Endpoint**: `POST /v1/pwa/user/login`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Request Body**:
  ```
  phone=9876543210&otp=123456&dial_code=+91
  ```
- **Response**:
  ```json
  {
    "status": "Success",
    "status_code": 200,
    "data": {
      "user_id": "6693",
      "user_name": "ravindra",
      "user_mobile": "9876543210",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      ...
    }
  }
  ```

### 3. Fetch Restaurants List
- **Endpoint**: `GET /v1/m/restaurant?city_id=118`
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Response**:
  ```json
  {
    "status": "Success",
    "status_code": 200,
    "data": {
      "results": [
        {
          "restaurant_id": "75",
          "restaurant_name": "VYB",
          "logo": "https://fastor-d2c-shared-bucket-1.s3.ap-south-1.amazonaws.com/...",
          "address_complete": "Address, ssasasa, Andhra Pradesh, 110009, India"
        },
        ...
      ]
    }
  }
  ```

---

## 📂 Project Structure

```text
Factor 7 Assignment/
├── .env                  # Local environment configuration
├── .env.example          # Template environment configuration
├── index.html            # Entry HTML with Google Fonts
├── package.json          # Dependencies and npm scripts
├── vite.config.js        # Vite build configuration
├── src/
│   ├── assets/
│   │   └── images/       # Extracted Figma assets (pizza, sushi, burger, shake)
│   ├── components/
│   │   ├── Keypad.jsx    # Numeric mobile keypad component
│   │   ├── Keypad.css
│   │   └── MobileFrame.jsx # iOS-style frame container with status bar
│   ├── context/
│   │   └── AuthContext.jsx # Authentication state, JWT & user profile persistence
│   ├── pages/
│   │   ├── Signup.jsx     # Screen 1: Mobile phone signup
│   │   ├── Signup.css
│   │   ├── VerifyOTP.jsx  # Screen 2: 6-digit OTP verification
│   │   ├── VerifyOTP.css
│   │   ├── Home.jsx       # Screen 3: Restaurant Home & live Fastor API
│   │   ├── Home.css
│   │   ├── FoodDetails.jsx # Screen 4: Food details & portion pricing
│   │   └── FoodDetails.css
│   ├── services/
│   │   ├── api.js         # Central Axios instance with interceptors
│   │   ├── authService.js # Register & Login API calls
│   │   └── restaurantService.js # Staging restaurant API calls
│   ├── styles/
│   │   ├── variables.css  # Design system color and typography tokens
│   │   └── global.css     # Global layout and responsive styling
│   ├── App.jsx            # Router and Protected Routes
│   └── main.jsx           # React DOM root
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended; developed and verified on Node v24)
- npm or yarn

### 2. Installation
```bash
# Clone or navigate to the project directory
cd "Factor 7 Assignment"

# Install dependencies
npm install
```

### 3. Environment Setup
The repository includes a ready `.env` file. You can also duplicate `.env.example`:
```bash
cp .env.example .env
```
Ensure the API configuration matches:
```env
VITE_API_BASE_URL=https://staging.fastor.ai
VITE_CITY_ID=118
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Building for Production
```bash
npm run build
```
Generates an optimized production build in the `dist/` directory with 0 errors.

---

## 🧪 Testing and Validation Summary

| Test Case | Flow / Action | Result | Status |
|:---|:---|:---|:---:|
| **Signup Flow** | Enter phone number `9876543210` and submit | Calls `/v1/pwa/user/register`, receives `status: 200`, redirects to OTP page | ✅ PASSED |
| **Input Validation** | Submit with < 10 digits | Displays validation error banner without API request | ✅ PASSED |
| **OTP Input Navigation** | Type digits 1-6 / Backspace / Arrow keys | Auto-advances focus to next input, backspaces to previous cleanly | ✅ PASSED |
| **OTP Paste** | Paste `123456` into first box | Parses and populates all 6 boxes simultaneously | ✅ PASSED |
| **OTP Authentication** | Submit OTP `123456` | Calls `/v1/pwa/user/login`, extracts Bearer JWT, sets user in AuthContext | ✅ PASSED |
| **Protected Routing** | Access `/home` without token | Automatically redirects unauthenticated users to `/signup` | ✅ PASSED |
| **Live Restaurant API** | Load `/home` | Calls `/v1/m/restaurant?city_id=118` with Bearer token, renders 20 real restaurants | ✅ PASSED |
| **Search Filter** | Type restaurant or food name in search box | Dynamically filters restaurant list in real time | ✅ PASSED |
| **Order Tracking** | Click "Track Driver" on popular item | Opens interactive driver delivery status modal | ✅ PASSED |
| **Portion Selection** | Select Personal / Medium / Familiar / Jumbo | Radio indicator updates; total price recalculates dynamically | ✅ PASSED |
| **Quantity Stepper** | Click `[+]` and `[-]` | Increments/decrements correctly; prevents quantity < 1 | ✅ PASSED |
| **Add to Cart** | Click "Add to cart" | Shows animated confirmation toast and updates cart counter badge | ✅ PASSED |
| **Responsive Design** | Test mobile viewports and desktop browser | Centers cleanly as a mobile preview on desktop; native 100% full-width on mobile | ✅ PASSED |
