// Automated Admin User Setup Script
// This script creates an admin user document in Firestore

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD5xxXttGN_txJe4YNcCgQoOgcBDim7zkU",
    authDomain: "clomora-bc4ac.firebaseapp.com",
    projectId: "clomora-bc4ac",
    storageBucket: "clomora-bc4ac.firebasestorage.app",
    messagingSenderId: "102869695414",
    appId: "1:102869695414:web:18c3281e72e28e7e8f9f17",
    measurementId: "G-8LMM00B1YQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function setupAdminUser() {
    try {
        console.log('🔧 Starting admin user setup...\n');

        // Prompt for email and password
        const email = process.argv[2] || 'admin@clomora.com';
        const password = process.argv[3] || 'Admin@123';

        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password.replace(/./g, '*')}\n`);

        // Step 1: Sign in to get the UID
        console.log('🔐 Step 1: Signing in to Firebase Auth...');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('✅ Signed in successfully!');
        console.log(`   UID: ${user.uid}\n`);

        // Step 2: Create/Update user document in Firestore
        console.log('📝 Step 2: Creating admin user document in Firestore...');

        const userDocRef = doc(db, 'users', user.uid);
        const userData = {
            email: user.email,
            isAdmin: true,  // This is the critical field!
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
        console.log('     - isAdmin: true ✓');
        console.log('     - displayName: Admin');
        console.log('     - createdAt: [server timestamp]');
        console.log('     - updatedAt: [server timestamp]\n');

        // Step 3: Verify
        console.log('🔍 Step 3: Verifying setup...');
        console.log('✅ Setup complete!\n');

        console.log('🎉 SUCCESS! Admin user is ready!\n');
        console.log('📋 Your admin credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   UID: ${user.uid}\n`);

        console.log('🚀 You can now login to the admin panel:');
        console.log('   URL: http://localhost:5174\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error setting up admin user:', error.message);

        if (error.code === 'auth/user-not-found') {
            console.log('\n💡 User not found in Firebase Authentication.');
            console.log('   Please create the user first:');
            console.log('   1. Go to: https://console.firebase.google.com/project/clomora-c75b8/authentication');
            console.log('   2. Click "Add User"');
            console.log('   3. Email: admin@clomora.com');
            console.log('   4. Password: Admin@123');
            console.log('   5. Run this script again\n');
        } else if (error.code === 'auth/wrong-password') {
            console.log('\n💡 Wrong password. Please check your credentials.\n');
        } else if (error.code === 'auth/invalid-credential') {
            console.log('\n💡 Invalid credentials. User may not exist yet.');
            console.log('   Create the user in Firebase Console first.\n');
        }

        process.exit(1);
    }
}

// Run the setup
console.log('═══════════════════════════════════════════════════════');
console.log('  CLOMORA ADMIN USER SETUP');
console.log('═══════════════════════════════════════════════════════\n');

setupAdminUser();
