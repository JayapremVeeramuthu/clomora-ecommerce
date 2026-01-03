# 🎯 QUICK START - Teemaster Admin Panel

## ⚡ Fast Setup (5 Minutes)

### 1. Install All Dependencies

```bash
# Install admin panel dependencies
cd admin-panel
npm install

# Install backend dependencies
cd ../backend
npm install

# Go back to root
cd ..
```

### 2. Configure Firebase

1. **Get Firebase Config:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing
   - Go to Project Settings → Your apps → Web app
   - Copy the config

2. **Create `.env` files:**

**Admin Panel** (`admin-panel/.env`):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
```

**Backend** (`backend/.env`):
```env
PORT=3001
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
```

**Client Website** (root `.env`):
```env
# Same as admin panel .env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
```

### 3. Download Firebase Service Account

1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `backend/firebase-service-account.json`

### 4. Deploy Firestore Rules

```bash
cd admin-panel
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

### 5. Create Admin User

1. Firebase Console → Authentication → Add User
   - Email: `admin@example.com`
   - Password: `Admin@123`
   - Copy the UID

2. Firebase Console → Firestore → Create Collection
   - Collection: `admins`
   - Document ID: [Paste UID]
   - Fields:
     - email: "admin@example.com"
     - role: "admin"
     - active: true
     - createdAt: [timestamp]
     - lastLoginAt: [timestamp]

### 6. Start Everything

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Admin Panel:**
```bash
cd admin-panel
npm run dev
```

**Terminal 3 - Client Website:**
```bash
npm run dev
```

### 7. Access

- **Client Website:** http://localhost:5173
- **Admin Panel:** http://localhost:5174
- **Backend API:** http://localhost:3001

### 8. Login to Admin Panel

1. Go to http://localhost:5174
2. Login with:
   - Email: `admin@example.com`
   - Password: `Admin@123`

## ✅ You're Done!

Now you can:
- Add products from admin panel
- Manage orders
- Track payments
- View analytics

## 📚 Full Documentation

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🆘 Quick Troubleshooting

**Problem:** "Permission Denied"
- Deploy Firestore rules: `firebase deploy --only firestore:rules`

**Problem:** "Unauthorized"
- Check admin document exists in Firestore
- Verify UID matches

**Problem:** Backend not starting
- Check `firebase-service-account.json` exists
- Verify `.env` file is configured

**Problem:** Images not uploading
- Enable Firebase Storage
- Update Storage rules to allow writes

## 🎉 Happy Coding!
