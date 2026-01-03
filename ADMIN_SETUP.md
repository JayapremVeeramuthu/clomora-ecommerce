# 🚀 ADMIN SETUP - QUICK GUIDE

## ⚡ AUTOMATED SETUP (RECOMMENDED)

I've created an automated setup script that will:
1. Create admin user in Firebase Authentication
2. Create admin document in Firestore
3. Set up everything automatically

### Prerequisites:

You need the Firebase service account key file.

#### Get Service Account Key:

1. Go to: https://console.firebase.google.com/project/clomora-c75b8/settings/serviceaccounts/adminsdk
2. Click "Generate New Private Key"
3. Click "Generate Key"
4. Save the file as `firebase-service-account.json` in the `backend` folder

### Run Setup:

```powershell
# Navigate to backend
cd "c:\Desktop\clomora website\teemaster-commerce-main\backend"

# Run the setup script
node setup-admin.js
```

### Expected Output:

```
🔧 Creating admin user...
📝 Step 1: Creating user in Firebase Auth...
✅ User created successfully!
   UID: abc123xyz...
   Email: admin@clomora.com

📝 Step 2: Creating admin document in Firestore...
✅ Admin document created successfully!

📝 Step 3: Verifying setup...
✅ Verification successful!

🎉 SETUP COMPLETE!

📋 Your admin credentials:
   Email: admin@clomora.com
   Password: Admin@123
   UID: abc123xyz...

🚀 You can now login to the admin panel!
   URL: http://localhost:5174
```

---

## 🔐 YOUR ADMIN CREDENTIALS

After running the setup:

```
Email: admin@clomora.com
Password: Admin@123
```

---

## 📝 MANUAL SETUP (ALTERNATIVE)

If you prefer manual setup, follow these steps:

### Step 1: Enable Firestore

1. Go to: https://console.firebase.google.com/project/clomora-c75b8/firestore
2. Click "Create Database"
3. Select "Start in production mode"
4. Choose location: `asia-south1`
5. Click "Enable"

### Step 2: Create Admin User

1. Go to: https://console.firebase.google.com/project/clomora-c75b8/authentication
2. Click "Get Started"
3. Click "Sign-in method" → Enable "Email/Password"
4. Click "Users" → "Add User"
5. Email: `admin@clomora.com`
6. Password: `Admin@123`
7. Click "Add User"
8. **Copy the UID**

### Step 3: Create Admin Document

1. Go to Firestore
2. Click "Start Collection"
3. Collection ID: `admins`
4. Document ID: [Paste the UID]
5. Add fields:
   - email: "admin@clomora.com"
   - role: "admin"
   - active: true
   - createdAt: [timestamp]
   - lastLoginAt: [timestamp]
6. Click "Save"

### Step 4: Deploy Firestore Rules

```powershell
cd "c:\Desktop\clomora website\teemaster-commerce-main\admin-panel"
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

---

## ✅ VERIFICATION

After setup, try to login:

1. Go to: http://localhost:5174
2. Email: `admin@clomora.com`
3. Password: `Admin@123`
4. Click "Login"

You should be redirected to the dashboard!

---

## 🆘 TROUBLESHOOTING

### Error: "Missing or insufficient permissions"
- Firestore rules not deployed
- Run: `firebase deploy --only firestore:rules`

### Error: "Unauthorized: You do not have admin privileges"
- Admin document not created in Firestore
- Run the setup script again

### Error: "auth/user-not-found"
- User not created in Firebase Authentication
- Run the setup script

---

## 📞 QUICK COMMANDS

### Automated Setup:
```powershell
cd backend
node setup-admin.js
```

### Deploy Firestore Rules:
```powershell
cd admin-panel
firebase deploy --only firestore:rules
```

### Check Firestore:
https://console.firebase.google.com/project/clomora-c75b8/firestore

### Check Authentication:
https://console.firebase.google.com/project/clomora-c75b8/authentication

---

**Choose automated setup for fastest results!** 🚀
