# Teemaster Admin Panel

A secure, real-time admin panel for managing the Teemaster T-Shirt Ecommerce website.

## Features

✅ **Authentication**
- Admin login with email + password
- Firebase Auth protected routes
- Password reset functionality
- Role-based access control

✅ **Dashboard**
- Real-time statistics (Total Orders, Revenue, etc.)
- Today's sales and orders
- Recent orders table with live updates

✅ **Product Management**
- Add/Edit/Delete products
- Upload product images to Firebase Storage
- Manage sizes, colors, categories
- Real-time sync with client website

✅ **Orders Management**
- View all orders with search and filter
- Detailed order information
- Update order status (Pending → Packed → Shipped → Delivered → Cancelled)
- Real-time updates to user side

✅ **Users Management**
- View all registered users
- User statistics (total orders, total spent)
- User status management

✅ **Payments**
- Track Razorpay payment status
- View completed/failed payments
- Payment transaction history

✅ **Security**
- Protected admin routes
- Firestore security rules
- Form validation
- Unauthorized access prevention

## Setup Instructions

### 1. Install Dependencies

```bash
cd admin-panel
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings → General
4. Copy your Firebase configuration
5. Create a `.env` file in the `admin-panel` directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Deploy Firestore Security Rules

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in the admin-panel directory:
```bash
firebase init firestore
```

4. Deploy the security rules:
```bash
firebase deploy --only firestore:rules
```

### 4. Create First Admin User

You need to manually create the first admin user in Firestore:

1. Go to Firebase Console → Firestore Database
2. Create a new collection called `admins`
3. Add a document with the following structure:

```
Document ID: [Your Firebase Auth UID]
Fields:
  - email: "admin@example.com"
  - role: "admin"
  - active: true
  - createdAt: [Current Timestamp]
  - lastLoginAt: [Current Timestamp]
```

**To get your Firebase Auth UID:**
1. Go to Firebase Console → Authentication
2. Create a new user with email/password
3. Copy the UID from the user list

### 5. Run the Admin Panel

```bash
npm run dev
```

The admin panel will be available at `http://localhost:5174`

### 6. Login

Use the email and password you created in Firebase Authentication.

## Project Structure

```
admin-panel/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── toast.tsx
│   │   │   └── toaster.tsx
│   │   └── ProtectedRoute.tsx
│   ├── config/
│   │   └── firebase.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── helpers.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Orders.tsx
│   │   ├── Payments.tsx
│   │   ├── Products.tsx
│   │   ├── Unauthorized.tsx
│   │   └── Users.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── firestore.rules
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Connecting to Client Website

The admin panel uses the **same Firebase project** as your client website. This ensures:

1. **Shared Database**: Products, orders, and users are synced in real-time
2. **Unified Authentication**: Same user accounts across both platforms
3. **Consistent Data**: Changes in admin panel reflect immediately on client site

### Client Website Setup

Make sure your client website also has Firebase configured with the same credentials.

## Security Best Practices

1. **Never expose Firebase Admin SDK credentials** in the frontend
2. **Always validate data** on both client and server side
3. **Use Firestore Security Rules** to protect sensitive data
4. **Implement rate limiting** for API endpoints
5. **Regular security audits** of your codebase

## Troubleshooting

### "Permission Denied" Errors

- Make sure you've created an admin document in Firestore
- Verify the document ID matches your Firebase Auth UID
- Check that `role` is set to "admin" and `active` is true

### "Unauthorized" After Login

- Clear browser cache and cookies
- Check Firestore security rules are deployed
- Verify admin document exists with correct structure

### Images Not Uploading

- Check Firebase Storage rules allow admin uploads
- Verify Storage is enabled in Firebase Console
- Check file size limits

## Support

For issues or questions, please check:
- Firebase Documentation: https://firebase.google.com/docs
- React Documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com

## License

This project is proprietary and confidential.
