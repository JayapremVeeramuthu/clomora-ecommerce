// Authentication utilities for admin panel
// Handles admin login, logout, and role verification

import {
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    User,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '@/config/firebase';

/**
 * Check if a user has admin privileges
 * @param user - Firebase user object
 * @returns Promise<boolean> - true if user is admin
 */
export const isAdmin = async (user: User | null): Promise<boolean> => {
    if (!user) return false;

    try {
        // Check if user exists in users collection with isAdmin field
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            // Check if isAdmin field is explicitly true
            return userData.isAdmin === true;
        }

        return false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

/**
 * Sign in admin user with email and password
 * @param email - Admin email
 * @param password - Admin password
 * @returns Promise with user credentials
 */
export const loginAdmin = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Verify admin status
        const adminStatus = await isAdmin(user);

        if (!adminStatus) {
            // Sign out if not admin
            await signOut(auth);
            throw new Error('Unauthorized: You do not have admin privileges');
        }

        return userCredential;
    } catch (error: any) {
        console.error('Login error:', error);
        throw error;
    }
};

/**
 * Sign out current admin user
 */
export const logoutAdmin = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

/**
 * Send password reset email to admin
 * @param email - Admin email
 */
export const resetAdminPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error('Password reset error:', error);
        throw error;
    }
};

/**
 * Listen to authentication state changes
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};
