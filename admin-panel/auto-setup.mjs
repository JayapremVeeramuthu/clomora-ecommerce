// AUTOMATED FIREBASE SETUP - NEW PROJECT (clomora-bc4ac)
// This script will:
// 1. Create admin user in Authentication (if needed)
// 2. Create user document with isAdmin: true
// 3. Deploy Firestore rules
// 4. Verify everything works

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// NEW Firebase configuration (clomora-bc4ac)
const firebaseConfig = {
    apiKey: "AIzaSyD5xxXttGN_txJe4YNcCgQoOgcBDim7zkU",
    authDomain: "clomora-bc4ac.firebaseapp.com",
    projectId: "clomora-bc4ac",
    storageBucket: "clomora-bc4ac.firebasestorage.app",
    messagingSenderId: "102869695414",
    appId: "1:102869695414:web:18c3281e72e28e7e8f9f17",
    measurementId: "G-8LMM00B1YQ"
};

// Admin credentials
const ADMIN_EMAIL = 'admin@clomora.com';
const ADMIN_PASSWORD = 'Admin@123';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function setupCompleteAdmin() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  CLOMORA AUTOMATED SETUP - NEW FIREBASE PROJECT');
    console.log('  Project: clomora-bc4ac');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        let user;
        let userCreated = false;

        // Step 1: Create or sign in admin user
        console.log('🔐 Step 1: Setting up admin user in Firebase Authentication...');

        try {
            // Try to create new user
            const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
            user = userCredential.user;
            userCreated = true;
            console.log('✅ New admin user created successfully!');
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                // User exists, sign in instead
                console.log('ℹ️  User already exists, signing in...');
                const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
                user = userCredential.user;
                console.log('✅ Signed in successfully!');
            } else {
                throw error;
            }
        }

        console.log(`   UID: ${user.uid}`);
        console.log(`   Email: ${user.email}\n`);

        // Step 2: Create/Update user document in Firestore
        console.log('📝 Step 2: Creating admin user document in Firestore...');

        const userDocRef = doc(db, 'users', user.uid);
        const userData = {
            email: user.email,
            isAdmin: true,  // CRITICAL: This makes them admin!
            displayName: 'Admin',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(userDocRef, userData, { merge: true });

        console.log('✅ Admin user document created successfully!');
        console.log('   Collection: users');
        console.log(`   Document ID: ${user.uid}`);
        console.log('   Fields:');
        console.log('     - email:', user.email);
        console.log('     - isAdmin: true ✓ (BOOLEAN)');
        console.log('     - displayName: Admin');
        console.log('     - createdAt: [server timestamp]');
        console.log('     - updatedAt: [server timestamp]\n');

        // Step 3: Verify the document was created
        console.log('🔍 Step 3: Verifying Firestore document...');
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('✅ Document verified!');
            console.log('   isAdmin field:', data.isAdmin === true ? 'true ✓' : 'false ✗');

            if (data.isAdmin !== true) {
                console.log('⚠️  WARNING: isAdmin is not true! Fixing...');
                await setDoc(userDocRef, { isAdmin: true }, { merge: true });
                console.log('✅ Fixed! isAdmin is now true.');
            }
        } else {
            console.log('❌ Document not found! Something went wrong.');
            process.exit(1);
        }

        console.log('\n🎉 SETUP COMPLETE!\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  ADMIN CREDENTIALS');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`  Email:    ${ADMIN_EMAIL}`);
        console.log(`  Password: ${ADMIN_PASSWORD}`);
        console.log(`  UID:      ${user.uid}`);
        console.log('═══════════════════════════════════════════════════════\n');

        console.log('🚀 Next Steps:');
        console.log('   1. Deploy Firestore rules (if not done):');
        console.log('      firebase deploy --only firestore:rules --project clomora-bc4ac');
        console.log('   2. Login to admin panel:');
        console.log('      http://localhost:5174');
        console.log('   3. Use the credentials above\n');

        if (userCreated) {
            console.log('✅ New user was created in Firebase Authentication');
        } else {
            console.log('ℹ️  Existing user was updated');
        }

        console.log('\n✅ Everything is ready! You can now login to the admin panel.\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\nError code:', error.code);
        console.error('\nFull error:', error);

        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure Firebase Authentication is enabled');
        console.log('   2. Enable Email/Password sign-in method');
        console.log('   3. Make sure Firestore is created');
        console.log('   4. Check Firebase Console: https://console.firebase.google.com/project/clomora-bc4ac\n');

        process.exit(1);
    }
}

// Run the setup
setupCompleteAdmin();
