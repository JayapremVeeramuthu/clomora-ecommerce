# 🚀 COMPLETE SETUP GUIDE - Teemaster Admin Panel

This guide will walk you through setting up the complete admin panel system for your T-shirt ecommerce website.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Backend Server Setup](#backend-server-setup)
4. [Admin Panel Setup](#admin-panel-setup)
5. [Client Website Integration](#client-website-integration)
6. [Creating First Admin User](#creating-first-admin-user)
7. [Testing the System](#testing-the-system)
8. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

Before starting, make sure you have:

- ✅ Node.js (v18 or higher) installed
- ✅ npm or yarn package manager
- ✅ A Firebase account
- ✅ A Razorpay account (for payments)
- ✅ Basic knowledge of React and Firebase

---

## 2. Firebase Setup

### Step 2.1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `teemaster-ecommerce`
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Step 2.2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Click "Save"

### Step 2.3: Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create Database"
3. Select **Start in production mode**
4. Choose your location (closest to your users)
5. Click "Enable"

### Step 2.4: Enable Storage

1. Go to **Storage**
2. Click "Get Started"
3. Use default security rules
4. Click "Done"

### Step 2.5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register app name: `teemaster-admin`
5. Copy the Firebase configuration object

**Save this configuration - you'll need it for both admin panel and client website!**

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-ABC123"
};
```

### Step 2.6: Download Service Account Key

1. Go to **Project Settings** → **Service Accounts**
2. Click "Generate New Private Key"
3. Click "Generate Key"
4. Save the JSON file as `firebase-service-account.json`
5. **Keep this file secure - never commit it to Git!**

---

## 3. Backend Server Setup

### Step 3.1: Navigate to Backend Folder

```bash
cd backend
```

### Step 3.2: Install Dependencies

```bash
npm install
```

### Step 3.3: Configure Environment Variables

Create a `.env` file in the `backend` folder:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY
```

**To get Razorpay credentials:**
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in
3. Go to **Settings** → **API Keys**
4. Generate Test Keys (for development)
5. Copy Key ID and Key Secret

### Step 3.4: Add Firebase Service Account

1. Copy the `firebase-service-account.json` file you downloaded earlier
2. Paste it in the `backend` folder
3. Make sure it's named exactly `firebase-service-account.json`

### Step 3.5: Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Teemaster Backend Server running on port 3001
📍 Health check: http://localhost:3001/health
💳 Razorpay configured: Yes
✅ Firebase Admin initialized
```

**Keep this terminal running!**

---

## 4. Admin Panel Setup

### Step 4.1: Navigate to Admin Panel Folder

Open a **new terminal** and run:

```bash
cd admin-panel
```

### Step 4.2: Install Dependencies

```bash
npm install
```

### Step 4.3: Configure Environment Variables

Create a `.env` file in the `admin-panel` folder:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
```

**Use the Firebase config you copied in Step 2.5!**

### Step 4.4: Deploy Firestore Security Rules

1. Install Firebase CLI (if not already installed):
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase:
```bash
firebase init firestore
```

Select:
- Use existing project
- Choose your project
- Accept default Firestore rules file
- Accept default Firestore indexes file

4. Copy the security rules:
```bash
# The firestore.rules file is already created in admin-panel folder
```

5. Deploy the rules:
```bash
firebase deploy --only firestore:rules
```

### Step 4.5: Start Admin Panel

```bash
npm run dev
```

Admin panel will open at: `http://localhost:5174`

**Keep this terminal running!**

---

## 5. Client Website Integration

### Step 5.1: Add Firebase to Client Website

Your client website already has the structure. Now add Firebase:

1. Navigate to your client website folder:
```bash
cd ..  # Go back to root
# The firebase config is already created at src/config/firebase.ts
```

2. Create `.env` file in the **root** of your client website:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
```

**Use the same Firebase config as admin panel!**

---

## 6. Creating First Admin User

### Step 6.1: Create User in Firebase Authentication

1. Go to Firebase Console → **Authentication**
2. Click "Add User"
3. Enter email: `admin@teemaster.com`
4. Enter password: `Admin@123` (or your choice)
5. Click "Add User"
6. **Copy the UID** from the user list

### Step 6.2: Create Admin Document in Firestore

1. Go to Firebase Console → **Firestore Database**
2. Click "Start Collection"
3. Collection ID: `admins`
4. Click "Next"
5. Document ID: **Paste the UID you copied**
6. Add fields:

| Field | Type | Value |
|-------|------|-------|
| email | string | admin@teemaster.com |
| role | string | admin |
| active | boolean | true |
| createdAt | timestamp | (click "Set to current time") |
| lastLoginAt | timestamp | (click "Set to current time") |

7. Click "Save"

### Step 6.3: Test Admin Login

1. Go to `http://localhost:5174`
2. You should see the login page
3. Enter:
   - Email: `admin@teemaster.com`
   - Password: `Admin@123`
4. Click "Login"
5. You should be redirected to the dashboard! 🎉

---

## 7. Testing the System

### Test 1: Add a Product

1. Go to **Products** page
2. Click "Add Product"
3. Fill in product details:
   - Title: "Classic White T-Shirt"
   - Description: "Premium cotton t-shirt"
   - Price: 499
   - Category: "T-Shirts"
   - Sizes: S, M, L, XL
   - Stock: 100
4. Upload an image
5. Click "Add Product"
6. Product should appear in the list

### Test 2: View Dashboard

1. Go to **Dashboard**
2. You should see:
   - Total Orders: 0
   - Total Revenue: ₹0
   - Recent orders table (empty)

### Test 3: Check Real-time Sync

1. Open Firebase Console → Firestore
2. You should see the `products` collection
3. Your product should be there
4. Any changes in admin panel will reflect in Firestore immediately

---

## 8. Troubleshooting

### Problem: "Permission Denied" Error

**Solution:**
1. Make sure Firestore rules are deployed: `firebase deploy --only firestore:rules`
2. Verify admin document exists in Firestore
3. Check that document ID matches Firebase Auth UID
4. Ensure `role` is "admin" and `active` is true

### Problem: "Unauthorized" After Login

**Solution:**
1. Clear browser cache and cookies
2. Log out and log in again
3. Check browser console for errors
4. Verify admin document structure in Firestore

### Problem: Backend Server Not Starting

**Solution:**
1. Check if port 3001 is already in use
2. Verify `.env` file exists in backend folder
3. Ensure `firebase-service-account.json` exists
4. Check Node.js version (should be v18+)

### Problem: Images Not Uploading

**Solution:**
1. Go to Firebase Console → Storage
2. Click "Rules" tab
3. Update rules to allow admin uploads:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
4. Click "Publish"

### Problem: Razorpay Not Working

**Solution:**
1. Verify Razorpay keys in backend `.env`
2. Check backend server is running
3. Test with Razorpay test keys first
4. Check browser console for errors

---

## 🎯 Next Steps

1. **Add More Products**: Populate your product catalog
2. **Test Orders**: Create test orders from client website
3. **Customize Design**: Modify colors, fonts, etc.
4. **Deploy to Production**: 
   - Deploy backend to Heroku/Railway/Render
   - Deploy admin panel to Vercel/Netlify
   - Update environment variables for production

---

## 📞 Support

If you encounter any issues:

1. Check the browser console for errors
2. Check backend server logs
3. Verify all environment variables are set correctly
4. Ensure Firebase project is properly configured

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change default admin password
- [ ] Use production Razorpay keys
- [ ] Enable Firebase App Check
- [ ] Review Firestore security rules
- [ ] Enable HTTPS for backend
- [ ] Set up Firebase Storage CORS
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts

---

## 🎉 Congratulations!

You now have a fully functional admin panel for your T-shirt ecommerce website!

**What you can do:**
- ✅ Manage products (add, edit, delete)
- ✅ View and update orders
- ✅ Track payments
- ✅ Manage users
- ✅ View real-time analytics
- ✅ Everything syncs with your client website

**Happy selling! 🛍️**
