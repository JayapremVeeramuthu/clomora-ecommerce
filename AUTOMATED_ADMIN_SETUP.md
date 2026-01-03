# 🚀 AUTOMATED ADMIN SETUP - COMPLETE GUIDE

## ✅ WHAT'S BEEN DONE AUTOMATICALLY

1. ✅ **Firestore Rules Updated**
   - Users can read their own data
   - Admin check uses `users/{uid}` collection
   - Checks `isAdmin === true` field

2. ✅ **Setup Script Created**
   - Automatically creates admin user document
   - Sets `isAdmin: true` field
   - Located at: `admin-panel/setup-admin.mjs`

---

## 🎯 QUICK SETUP (2 STEPS)

### **Step 1: Create User in Firebase Authentication**

**Option A: Firebase Console (Easiest)**

1. Go to: https://console.firebase.google.com/project/clomora-c75b8/authentication/users

2. Click "Add User"

3. Enter:
   - Email: `admin@clomora.com`
   - Password: `Admin@123`

4. Click "Add User"

**Option B: Command Line**
```powershell
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login
firebase login

# Create user (requires Firebase Admin SDK)
```

---

### **Step 2: Run Automated Setup Script**

This script will:
- Sign in with your credentials
- Create user document in Firestore
- Set `isAdmin: true`
- Verify everything

```powershell
cd "c:\Desktop\clomora website\teemaster-commerce-main\admin-panel"
node setup-admin.mjs admin@clomora.com Admin@123
```

**Expected Output:**
```
═══════════════════════════════════════════════════════
  CLOMORA ADMIN USER SETUP
═══════════════════════════════════════════════════════

🔧 Starting admin user setup...

📧 Email: admin@clomora.com
🔑 Password: **********

🔐 Step 1: Signing in to Firebase Auth...
✅ Signed in successfully!
   UID: abc123xyz...

📝 Step 2: Creating admin user document in Firestore...
✅ Admin user document created successfully!
   Collection: users
   Document ID: abc123xyz...
   Fields:
     - email: admin@clomora.com
     - isAdmin: true ✓
     - displayName: Admin
     - createdAt: [server timestamp]
     - updatedAt: [server timestamp]

🔍 Step 3: Verifying setup...
✅ Setup complete!

🎉 SUCCESS! Admin user is ready!

📋 Your admin credentials:
   Email: admin@clomora.com
   Password: Admin@123
   UID: abc123xyz...

🚀 You can now login to the admin panel:
   URL: http://localhost:5174
```

---

## 🔄 ALTERNATIVE: MANUAL SETUP

If the script doesn't work, do this manually:

### **1. Create User in Authentication** (Same as above)

### **2. Create User Document in Firestore**

1. Go to: https://console.firebase.google.com/project/clomora-c75b8/firestore/data

2. Click "Start Collection" or navigate to `users` collection

3. Collection ID: `users`

4. Click "Next"

5. Document ID: **PASTE THE UID FROM AUTHENTICATION**

6. Add fields:

| Field | Type | Value |
|-------|------|-------|
| `email` | string | `admin@clomora.com` |
| `isAdmin` | boolean | `true` ← **MUST BE BOOLEAN!** |
| `displayName` | string | `Admin` |
| `createdAt` | timestamp | (Set to current time) |
| `updatedAt` | timestamp | (Set to current time) |

7. Click "Save"

---

## 📝 DEPLOY FIRESTORE RULES

### **Option A: Firebase Console**

1. Go to: https://console.firebase.google.com/project/clomora-c75b8/firestore/rules

2. Copy content from: `admin-panel/firestore.rules`

3. Paste in the editor

4. Click "Publish"

5. Wait 3-4 seconds

### **Option B: Firebase CLI**

```powershell
cd "c:\Desktop\clomora website\teemaster-commerce-main\admin-panel"
firebase deploy --only firestore:rules --project clomora-c75b8
```

---

## ✅ TEST LOGIN

1. Go to: http://localhost:5174

2. Login with:
   ```
   Email: admin@clomora.com
   Password: Admin@123
   ```

3. Expected result:
   - ✅ No errors
   - ✅ Redirected to dashboard
   - ✅ Admin panel working!

---

## 🆘 TROUBLESHOOTING

### **Error: "User not found" when running script**

**Cause:** User doesn't exist in Firebase Authentication

**Fix:**
1. Create user in Firebase Console first
2. Then run the script again

### **Error: "Missing or insufficient permissions"**

**Cause:** Firestore rules not deployed

**Fix:**
1. Go to Firebase Console → Firestore → Rules
2. Click "Publish"
3. Wait 3-4 seconds
4. Try login again

### **Error: "Unauthorized: You do not have admin privileges"**

**Cause:** `isAdmin` field not set or wrong type

**Fix:**
1. Go to Firestore → `users` collection
2. Find your user document
3. Check `isAdmin` field:
   - Must be **boolean** `true`
   - NOT string `"true"`
4. Save and try again

### **Script Error: "Cannot find module"**

**Cause:** Node.js can't find Firebase modules

**Fix:**
```powershell
cd admin-panel
npm install firebase
node setup-admin.mjs admin@clomora.com Admin@123
```

---

## 📊 VERIFICATION CHECKLIST

Before testing login:

- [ ] User created in Firebase Authentication
- [ ] UID copied
- [ ] Firestore rules deployed (published)
- [ ] Setup script run successfully OR
- [ ] User document created manually in Firestore
- [ ] `isAdmin: true` field exists (boolean)
- [ ] Document ID matches UID from Authentication
- [ ] Tried to login at http://localhost:5174

---

## 🎯 FIRESTORE STRUCTURE

After setup, your Firestore should look like this:

```
users/
  └── abc123xyz... (your UID)
      ├── email: "admin@clomora.com"
      ├── isAdmin: true (boolean)
      ├── displayName: "Admin"
      ├── createdAt: [timestamp]
      └── updatedAt: [timestamp]
```

---

## 🔐 SECURITY RULES SUMMARY

The updated rules allow:

1. **Users Collection:**
   - Users can read their own data
   - Admins can read all users
   - Users can create/update their own data

2. **Admin Check:**
   - Checks `users/{uid}` collection
   - Verifies `isAdmin === true`

3. **Products/Orders:**
   - Only admins can manage
   - Regular users can view their own orders

---

## 🚀 QUICK COMMANDS

### **Run Setup Script:**
```powershell
cd "c:\Desktop\clomora website\teemaster-commerce-main\admin-panel"
node setup-admin.mjs admin@clomora.com Admin@123
```

### **Deploy Rules:**
```powershell
cd "c:\Desktop\clomora website\teemaster-commerce-main\admin-panel"
firebase deploy --only firestore:rules --project clomora-c75b8
```

### **Check Firestore:**
https://console.firebase.google.com/project/clomora-c75b8/firestore/data

### **Check Authentication:**
https://console.firebase.google.com/project/clomora-c75b8/authentication/users

---

## 📞 SUPPORT

If you're still having issues:

1. Check browser console (F12) for errors
2. Verify user document exists in Firestore
3. Make sure `isAdmin` is boolean `true`, not string
4. Ensure Firestore rules are published
5. Try logging out and logging in again

---

**Everything is automated! Just create the user in Firebase Console and run the script!** 🎉
