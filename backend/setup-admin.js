// Admin Setup Script
// This script creates the first admin user in Firestore

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
    readFileSync('./firebase-service-account.json', 'utf8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function createAdminUser() {
    try {
        console.log('🔧 Creating admin user...');

        // Admin email and password
        const adminEmail = 'admin@clomora.com';
        const adminPassword = 'Admin@123';

        // Step 1: Create user in Firebase Authentication
        console.log('📝 Step 1: Creating user in Firebase Auth...');
        let userRecord;

        try {
            userRecord = await admin.auth().createUser({
                email: adminEmail,
                password: adminPassword,
                emailVerified: true,
            });
            console.log('✅ User created successfully!');
            console.log('   UID:', userRecord.uid);
            console.log('   Email:', userRecord.email);
        } catch (error) {
            if (error.code === 'auth/email-already-exists') {
                console.log('⚠️  User already exists, fetching existing user...');
                userRecord = await admin.auth().getUserByEmail(adminEmail);
                console.log('   UID:', userRecord.uid);
            } else {
                throw error;
            }
        }

        // Step 2: Create admin document in Firestore
        console.log('\n📝 Step 2: Creating admin document in Firestore...');

        const adminDoc = {
            email: adminEmail,
            role: 'admin',
            active: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection('admins').doc(userRecord.uid).set(adminDoc, { merge: true });
        console.log('✅ Admin document created successfully!');

        // Step 3: Verify setup
        console.log('\n📝 Step 3: Verifying setup...');
        const doc = await db.collection('admins').doc(userRecord.uid).get();

        if (doc.exists) {
            console.log('✅ Verification successful!');
            console.log('   Document data:', doc.data());
        } else {
            console.log('❌ Verification failed - document not found');
        }

        console.log('\n🎉 SETUP COMPLETE!');
        console.log('\n📋 Your admin credentials:');
        console.log('   Email:', adminEmail);
        console.log('   Password:', adminPassword);
        console.log('   UID:', userRecord.uid);
        console.log('\n🚀 You can now login to the admin panel!');
        console.log('   URL: http://localhost:5174');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error creating admin user:', error);
        process.exit(1);
    }
}

// Run the setup
createAdminUser();
