# 🔐 ADMIN USER SETUP - UPDATED (isAdmin Field)

## ✅ WHAT CHANGED

The admin authentication now uses:
- **Collection:** `users/{uid}`
- **Field:** `isAdmin: true` (boolean)

This is simpler and more efficient than the previous `admins` collection approach.

---

## 🚀 QUICK SETUP (3 STEPS)

### Step 1: Enable Firebase Services

1. **Enable Firestore:**
   - Go to: https://console.firebase.google.com/project/clomora-c75b8/firestore
   - Click "Create Database"
   - Select "Start in test mode"
   - Location: `asia-south1`
   - Click "Enable"

2. **Enable Authentication:**
   - Go to: https://console.firebase.google.com/project/clomora-c75b8/authentication
   - Click "Get Started"
   - Click "Sign-in method" → Enable "Email/Password"
   - Click "Save"

---

### Step 2: Create Admin User

1. **Go to Authentication:**
   ```
   https://console.firebase.google.com/project/clomora-c75b8/authentication/users
   ```

2. **Click "Add User"**

3. **Enter credentials:**
   - Email: `admin@clomora.com`
   - Password: `Admin@123`

4. **Click "Add User"**

5. **COPY THE UID** (you'll need it in Step 3)

---

### Step 3: Create User Document with isAdmin Field

1. **Go to Firestore:**
   ```
   https://console.firebase.google.com/project/clomora-c75b8/firestore/data
   ```

2. **Create Collection:**
   - Click "Start Collection"
   - Collection ID: `users`
   - Click "Next"

3. **Create Document:**
   - **Document ID:** Paste the UID from Step 2
   - Click "Add field" for each:

   | Field | Type | Value |
   |-------|------|-------|
   | `email` | string | `admin@clomora.com` |
   | `isAdmin` | boolean | `true` ← **IMPORTANT!** |
   | `displayName` | string | `Admin` |
   | `createdAt` | timestamp | (click "Set to current time") |

4. **Click "Save"**

---

## 🔐 YOUR ADMIN CREDENTIALS

```
Email: admin@clomora.com
Password: Admin@123
```

---

## ✅ VERIFICATION

After completing the steps:

1. Go to: http://localhost:5174
2. Login with the credentials above
3. You should be redirected to the dashboard!

---

## 📋 FIRESTORE STRUCTURE

Your Firestore should look like this:

```
users/
  └── {uid}
      ├── email: "admin@clomora.com"
      ├── isAdmin: true          ← This makes them admin!
      ├── displayName: "Admin"
      └── createdAt: [timestamp]
```

---

## 🔄 DEPLOY FIRESTORE RULES

After creating the user, deploy the updated rules:

```powershell
cd "c:\Desktop\clomora website\teemaster-commerce-main\admin-panel"
firebase deploy --only firestore:rules
```

Or manually update in Firebase Console:
1. Go to Firestore → Rules tab
2. Copy the rules from `firestore.rules` file
3. Click "Publish"

---

## 🆘 TROUBLESHOOTING

### Error: "Unauthorized: You do not have admin privileges"

**Check:**
1. User document exists in `users` collection
2. Document ID matches the UID from Authentication
3. `isAdmin` field is set to `true` (boolean, not string)
4. Firestore rules are deployed

### Error: "Missing or insufficient permissions"

**Fix:**
1. Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. Or update rules manually in Firebase Console

---

## 🎯 WHAT'S DIFFERENT FROM BEFORE

**Old approach:**
- Separate `admins` collection
- Fields: `role: "admin"`, `active: true`
- More complex to maintain

**New approach:**
- Single `users` collection
- Field: `isAdmin: true`
- Simpler and cleaner

---

## 📝 ADDING MORE ADMINS

To make any user an admin:

1. Go to Firestore → `users` collection
2. Find the user's document (by UID)
3. Add field: `isAdmin: true`
4. Save

That's it! They're now an admin.

---

**Follow these 3 steps and you'll be able to login!** 🚀
