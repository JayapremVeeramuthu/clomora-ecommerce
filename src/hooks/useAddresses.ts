import { useState, useEffect } from 'react';
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
    where,
    getDocs,
    writeBatch
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';

export interface Address {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    isDefault: boolean;
    createdAt: Timestamp;
}

export type AddressFormData = Omit<Address, 'id' | 'createdAt'>;

export const useAddresses = () => {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setAddresses([]);
            setLoading(false);
            return;
        }

        const q = query(collection(db, `users/${user.uid}/addresses`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const addressData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Address[];

            // Sort: default first, then by date
            setAddresses(addressData.sort((a, b) => {
                if (a.isDefault) return -1;
                if (b.isDefault) return 1;
                return b.createdAt.toMillis() - a.createdAt.toMillis();
            }));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addAddress = async (formData: AddressFormData) => {
        if (!user) return;

        // If setting as default, unset others first
        if (formData.isDefault) {
            await unsetOtherDefaults();
        }

        await addDoc(collection(db, `users/${user.uid}/addresses`), {
            ...formData,
            createdAt: Timestamp.now()
        });
    };

    const updateAddress = async (id: string, formData: Partial<AddressFormData>) => {
        if (!user) return;

        if (formData.isDefault) {
            await unsetOtherDefaults();
        }

        await updateDoc(doc(db, `users/${user.uid}/addresses`, id), formData);
    };

    const deleteAddress = async (id: string) => {
        if (!user) return;
        await deleteDoc(doc(db, `users/${user.uid}/addresses`, id));
    };

    const setDefaultAddress = async (id: string) => {
        if (!user) return;
        await unsetOtherDefaults();
        await updateDoc(doc(db, `users/${user.uid}/addresses`, id), { isDefault: true });
    };

    const unsetOtherDefaults = async () => {
        if (!user) return;
        const q = query(collection(db, `users/${user.uid}/addresses`), where('isDefault', '==', true));
        const snapshot = await getDocs(q);

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, { isDefault: false });
        });
        await batch.commit();
    };

    return {
        addresses,
        loading,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress
    };
};
