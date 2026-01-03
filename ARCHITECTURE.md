# 🏗️ SYSTEM ARCHITECTURE

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     TEEMASTER ECOMMERCE SYSTEM                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│  CLIENT WEBSITE  │         │   ADMIN PANEL    │         │  BACKEND SERVER  │
│  (Port 5173)     │         │   (Port 5174)    │         │   (Port 3001)    │
│                  │         │                  │         │                  │
│  - Browse        │         │  - Dashboard     │         │  - Razorpay API  │
│  - Add to Cart   │         │  - Products      │         │  - Order Create  │
│  - Checkout      │         │  - Orders        │         │  - Payment Verify│
│  - View Orders   │         │  - Users         │         │  - COD Orders    │
│                  │         │  - Payments      │         │                  │
└────────┬─────────┘         └────────┬─────────┘         └────────┬─────────┘
         │                            │                            │
         │                            │                            │
         └────────────────┬───────────┴────────────────────────────┘
                          │
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │                                        │
         │         FIREBASE SERVICES              │
         │                                        │
         │  ┌──────────────────────────────────┐ │
         │  │  Authentication                  │ │
         │  │  - Email/Password                │ │
         │  │  - Admin Role Check              │ │
         │  └──────────────────────────────────┘ │
         │                                        │
         │  ┌──────────────────────────────────┐ │
         │  │  Cloud Firestore                 │ │
         │  │  - products                      │ │
         │  │  - orders                        │ │
         │  │  - users                         │ │
         │  │  - admins                        │ │
         │  │  - payments                      │ │
         │  └──────────────────────────────────┘ │
         │                                        │
         │  ┌──────────────────────────────────┐ │
         │  │  Storage                         │ │
         │  │  - Product Images                │ │
         │  └──────────────────────────────────┘ │
         │                                        │
         └────────────────────────────────────────┘
                          │
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │                                        │
         │         RAZORPAY GATEWAY               │
         │                                        │
         │  - Payment Processing                  │
         │  - Order Creation                      │
         │  - Payment Verification                │
         │                                        │
         └────────────────────────────────────────┘
```

---

## Data Flow

### 1. User Places Order (Client Website)

```
User → Client Website → Backend Server → Razorpay
                              ↓
                         Firestore
                         (creates order)
                              ↓
                         Admin Panel
                         (sees new order)
```

### 2. Admin Updates Order Status

```
Admin → Admin Panel → Firestore → Client Website
                                   (user sees update)
```

### 3. Admin Adds Product

```
Admin → Admin Panel → Firebase Storage (image)
                    → Firestore (product data)
                    → Client Website (shows product)
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                       │
└─────────────────────────────────────────────────────────┘

Layer 1: Frontend Authentication
├─ Firebase Auth checks user login
├─ Protected routes verify admin role
└─ Unauthorized users redirected

Layer 2: Firestore Security Rules
├─ Admin collection: Admin read only
├─ Products: Public read, Admin write
├─ Orders: User read own, Admin read all
└─ Payments: Server write only

Layer 3: Backend Validation
├─ Server-side payment verification
├─ Razorpay signature check
├─ Amount validation
└─ Firebase Admin SDK for secure writes

Layer 4: Environment Variables
├─ API keys in .env files
├─ Never committed to Git
└─ Different keys for dev/prod
```

---

## Collections Structure

### Firestore Database

```
firestore/
│
├── products/
│   └── {productId}
│       ├── title: string
│       ├── description: string
│       ├── price: number
│       ├── category: string
│       ├── sizes: array
│       ├── colors: array
│       ├── images: array
│       ├── stockCount: number
│       ├── featured: boolean
│       ├── inStock: boolean
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── orders/
│   └── {orderId}
│       ├── orderNumber: string
│       ├── userId: string
│       ├── userEmail: string
│       ├── items: array
│       ├── subtotal: number
│       ├── shipping: number
│       ├── tax: number
│       ├── total: number
│       ├── status: string
│       ├── paymentMethod: string
│       ├── paymentStatus: string
│       ├── razorpayOrderId: string
│       ├── shippingAddress: object
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── users/
│   └── {userId}
│       ├── email: string
│       ├── displayName: string
│       ├── photoURL: string
│       ├── isBlocked: boolean
│       ├── totalOrders: number
│       ├── totalSpent: number
│       ├── createdAt: timestamp
│       └── lastLoginAt: timestamp
│
├── admins/
│   └── {adminId}
│       ├── email: string
│       ├── role: string
│       ├── active: boolean
│       ├── createdAt: timestamp
│       └── lastLoginAt: timestamp
│
└── payments/
    └── {paymentId}
        ├── orderId: string
        ├── userId: string
        ├── amount: number
        ├── currency: string
        ├── method: string
        ├── status: string
        ├── razorpayOrderId: string
        ├── razorpayPaymentId: string
        ├── createdAt: timestamp
        └── updatedAt: timestamp
```

---

## API Endpoints

### Backend Server (Port 3001)

```
GET  /health
     → Health check

POST /api/create-order
     Body: { amount, currency, userId, userEmail, items, shippingAddress }
     → Creates Razorpay order
     → Saves order to Firestore
     → Returns order ID

POST /api/verify-payment
     Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, firestoreOrderId }
     → Verifies payment signature
     → Updates order status
     → Updates payment status

POST /api/create-cod-order
     Body: { amount, userId, userEmail, items, shippingAddress }
     → Creates COD order
     → Saves to Firestore
     → Returns order ID
```

---

## Real-time Updates

```
┌─────────────────────────────────────────────────────────┐
│                  REAL-TIME SYNC FLOW                     │
└─────────────────────────────────────────────────────────┘

Admin adds product
       ↓
Firestore (products collection)
       ↓
Client Website (onSnapshot listener)
       ↓
Product appears instantly
       ↓
No page refresh needed!


User places order
       ↓
Backend creates order in Firestore
       ↓
Admin Panel (onSnapshot listener)
       ↓
Order appears in dashboard
       ↓
Admin sees notification


Admin updates order status
       ↓
Firestore (orders collection)
       ↓
Client Website (onSnapshot listener)
       ↓
User sees updated status
       ↓
Real-time tracking!
```

---

## Deployment Architecture

### Development

```
Local Machine
├── Client Website (localhost:5173)
├── Admin Panel (localhost:5174)
└── Backend Server (localhost:3001)
     ↓
Firebase (Cloud)
├── Authentication
├── Firestore
└── Storage
     ↓
Razorpay (Cloud)
└── Payment Gateway
```

### Production (Recommended)

```
Vercel/Netlify
├── Client Website (yourdomain.com)
└── Admin Panel (admin.yourdomain.com)

Railway/Render/Heroku
└── Backend Server (api.yourdomain.com)

Firebase (Cloud)
├── Authentication
├── Firestore
└── Storage

Razorpay (Cloud)
└── Payment Gateway
```

---

## User Roles & Permissions

```
┌─────────────────────────────────────────────────────────┐
│                    USER ROLES                            │
└─────────────────────────────────────────────────────────┘

Regular User (Customer)
├── Can browse products
├── Can add to cart
├── Can place orders
├── Can view own orders
└── Cannot access admin panel

Admin User
├── Can do everything regular user can
├── Can access admin panel
├── Can manage products
├── Can view all orders
├── Can update order status
├── Can view all users
└── Can track all payments

Super Admin (Future)
├── Can do everything admin can
├── Can add/remove admins
├── Can change system settings
└── Can view audit logs
```

---

## Tech Stack Summary

```
Frontend (Client + Admin)
├── React 18
├── TypeScript
├── Tailwind CSS
├── Vite
├── React Router
└── Radix UI

Backend
├── Node.js
├── Express
├── Razorpay SDK
└── Firebase Admin SDK

Database & Services
├── Firebase Authentication
├── Cloud Firestore
├── Firebase Storage
└── Razorpay Gateway

Development Tools
├── npm/yarn
├── Firebase CLI
├── Git
└── VS Code (recommended)
```

---

## Environment Variables

```
Client Website (.env)
├── VITE_FIREBASE_API_KEY
├── VITE_FIREBASE_AUTH_DOMAIN
├── VITE_FIREBASE_PROJECT_ID
├── VITE_FIREBASE_STORAGE_BUCKET
├── VITE_FIREBASE_MESSAGING_SENDER_ID
├── VITE_FIREBASE_APP_ID
├── VITE_FIREBASE_MEASUREMENT_ID
└── VITE_RAZORPAY_KEY_ID

Admin Panel (.env)
├── Same as Client Website

Backend (.env)
├── PORT
├── CLIENT_URL
├── RAZORPAY_KEY_ID
└── RAZORPAY_KEY_SECRET
```

---

This architecture ensures:
- ✅ Separation of concerns
- ✅ Real-time data sync
- ✅ Secure payment processing
- ✅ Role-based access control
- ✅ Scalability
- ✅ Easy maintenance
