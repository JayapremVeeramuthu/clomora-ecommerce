# 🔥 FIREBASE SETUP GUIDE - Complete Instructions

## ✅ Status Check

Your Firebase configuration is **properly set up** and ready to use! Here's what's configured:

### ✅ What's Already Done:
1. ✅ Firebase config files created (`src/config/firebase.ts`)
2. ✅ Admin panel Firebase config created (`admin-panel/src/config/firebase.ts`)
3. ✅ Environment variable structure set up
4. ✅ `.env` file created with placeholders
5. ✅ `.env.example` files updated with instructions

### 📝 What You Need to Do:
1. Get Firebase credentials from Firebase Console
2. Paste them into `.env` files
3. Create admin panel `.env` file
4. Restart dev servers

---

## 🚀 STEP-BY-STEP SETUP

### Step 1: Get Firebase Credentials

#### 1.1 Go to Firebase Console
```
https://console.firebase.google.com/
```

#### 1.2 Create or Select Project
- If new: Click "Add Project" → Enter name → Create
- If existing: Select your project

#### 1.3 Get Configuration
1. Click the **gear icon** (⚙️) → **Project Settings**
2. Scroll down to "Your apps"
3. If no web app exists:
   - Click the **Web icon** (`</>`)
   - Register app name: "Teemaster"
   - Click "Register app"
4. You'll see a `firebaseConfig` object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

**Copy all these values!** You'll need them in the next step.

---

### Step 2: Update Client Website .env File

The `.env` file already exists in your project root. Now update it:

#### 2.1 Open the file:
```
c:\Desktop\clomora website\teemaster-commerce-main\.env
```

#### 2.2 Replace placeholders with your Firebase values:

**BEFORE:**
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

**AFTER (example):**
```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=teemaster-ecom.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=teemaster-ecom
VITE_FIREBASE_STORAGE_BUCKET=teemaster-ecom.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

#### 2.3 Save the file

---

### Step 3: Create Admin Panel .env File

#### 3.1 Copy the example file:
```powershell
# In PowerShell, run:
cd "c:\Desktop\clomora website\teemaster-commerce-main\admin-panel"
Copy-Item .env.example .env
```

Or manually:
1. Open `admin-panel\.env.example`
2. Copy all content
3. Create new file: `admin-panel\.env`
4. Paste content
5. Save

#### 3.2 Update with the SAME Firebase values:

**⚠️ IMPORTANT:** Use the **exact same** Firebase credentials as the client website!

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=teemaster-ecom.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=teemaster-ecom
VITE_FIREBASE_STORAGE_BUCKET=teemaster-ecom.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

#### 3.3 Save the file

---

### Step 4: Enable Firebase Services

#### 4.1 Enable Authentication
1. In Firebase Console → **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Click "Save"

#### 4.2 Create Firestore Database
1. In Firebase Console → **Firestore Database**
2. Click "Create Database"
3. Select **Start in production mode**
4. Choose location (closest to your users)
5. Click "Enable"

#### 4.3 Enable Storage
1. In Firebase Console → **Storage**
2. Click "Get Started"
3. Use default security rules
4. Click "Done"

---

### Step 5: Restart Dev Servers

**IMPORTANT:** You must restart all dev servers for environment variables to load!

#### 5.1 Stop all running servers:
Press `Ctrl + C` in each terminal

#### 5.2 Start them again:

**Terminal 1 - Client Website:**
```powershell
cd "c:\Desktop\clomora website\teemaster-commerce-main"
npm run dev
```

**Terminal 2 - Admin Panel:**
```powershell
cd "c:\Desktop\clomora website\teemaster-commerce-main\admin-panel"
npm run dev
```

**Terminal 3 - Backend (optional for now):**
```powershell
cd "c:\Desktop\clomora website\teemaster-commerce-main\backend"
npm run dev
```

---

### Step 6: Verify Connection

#### 6.1 Check Admin Panel
1. Open: `http://localhost:5174`
2. You should see the login page (no errors)
3. Check browser console (F12) - should be no Firebase errors

#### 6.2 Expected Behavior:
- ✅ Login page loads without errors
- ✅ No "auth/invalid-api-key" errors
- ✅ No "missing environment variable" errors
- ✅ Console shows Firebase initialized

#### 6.3 If you see errors:
- Check that `.env` files exist in both locations
- Verify all values are correct (no quotes, no spaces)
- Make sure you restarted the dev servers
- Check browser console for specific error messages

---

## 🔍 Troubleshooting

### Error: "auth/invalid-api-key"
**Cause:** Wrong API key or not loaded

**Fix:**
1. Double-check `VITE_FIREBASE_API_KEY` in `.env`
2. Make sure there are no quotes around the value
3. Restart dev server
4. Clear browser cache (Ctrl + Shift + Delete)

### Error: "Firebase: Error (auth/configuration-not-found)"
**Cause:** Environment variables not loaded

**Fix:**
1. Make sure `.env` file exists (not just `.env.example`)
2. Restart dev server (Ctrl + C, then `npm run dev`)
3. Check file is in the correct location

### Error: "Cannot find module '@/config/firebase'"
**Cause:** Path alias issue

**Fix:**
- This shouldn't happen - the files are already created
- If it does, check `vite.config.ts` has path alias configured

### No errors but can't login
**Cause:** Admin user not created yet

**Fix:**
- You need to create an admin user in Firestore first
- See `SETUP_GUIDE.md` → "Creating First Admin User"

---

## 📋 Checklist

Use this to verify everything is set up:

- [ ] Firebase project created
- [ ] Firebase credentials copied
- [ ] Client `.env` file updated
- [ ] Admin panel `.env` file created and updated
- [ ] Authentication enabled in Firebase
- [ ] Firestore database created
- [ ] Storage enabled
- [ ] All dev servers restarted
- [ ] Admin panel loads without errors
- [ ] No console errors in browser

---

## 📁 File Locations

```
teemaster-commerce-main/
├── .env                          ← Client website config (UPDATE THIS)
├── .env.example                  ← Template (don't edit)
│
├── admin-panel/
│   ├── .env                      ← Admin panel config (CREATE & UPDATE THIS)
│   └── .env.example              ← Template (don't edit)
│
├── src/config/
│   └── firebase.ts               ← Client Firebase setup (already done ✅)
│
└── admin-panel/src/config/
    └── firebase.ts               ← Admin Firebase setup (already done ✅)
```

---

## 🎯 Quick Commands

### Create admin panel .env:
```powershell
cd "c:\Desktop\clomora website\teemaster-commerce-main\admin-panel"
Copy-Item .env.example .env
```

### Restart client dev server:
```powershell
cd "c:\Desktop\clomora website\teemaster-commerce-main"
# Press Ctrl+C to stop
npm run dev
```

### Restart admin dev server:
```powershell
cd "c:\Desktop\clomora website\teemaster-commerce-main\admin-panel"
# Press Ctrl+C to stop
npm run dev
```

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Admin panel loads at `http://localhost:5174`
2. ✅ Login page displays without errors
3. ✅ Browser console shows no Firebase errors
4. ✅ No "invalid-api-key" or "configuration-not-found" errors

---

## 🔐 Security Notes

- ✅ `.env` files are in `.gitignore` (won't be committed)
- ✅ Only API Key ID is in frontend (safe to expose)
- ✅ Secret keys stay in backend only
- ✅ Firestore security rules protect data

---

## 📞 Need Help?

If you're still seeing errors:

1. **Copy the exact error message** from browser console
2. **Check which file** is causing the error
3. **Verify** your `.env` file exists and has correct values
4. **Make sure** you restarted the dev server

---

## 🎉 Next Steps

Once Firebase is connected:

1. **Create admin user** (see SETUP_GUIDE.md)
2. **Deploy Firestore rules**
3. **Test login**
4. **Start adding products**

---

**Your Firebase configuration is ready! Just add your credentials and restart the servers.** 🚀
