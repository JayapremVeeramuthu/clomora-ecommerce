// TypeScript types and interfaces for the admin panel

import { Timestamp } from 'firebase/firestore';

// Product Types
export interface ProductVariant {
    color: string;
    images: string[];
    stock: number;
    price?: number;
}

export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    category: string;
    sizes: string[];
    colors: string[];
    images: string[];
    imageUrls?: string[];
    image?: string;
    variants?: ProductVariant[];
    featured: boolean;
    isPublished: boolean;
    gender: string;
    slug: string;
    inStock: boolean;
    stockCount: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface ProductFormData {
    title: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    category: string;
    sizes: string[];
    colors: string;
    variants: ProductVariant[];
    featured: boolean;
    isPublished: boolean;
    gender: string;
    slug: string;
    inStock: boolean;
    stockCount: number;
}

// Order Types
export type OrderStatus = 'pending' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'razorpay' | 'cod';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface OrderItem {
    productId: string;
    title: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
    imageUrl: string;
}

export interface ShippingAddress {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    userEmail: string;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    shippingAddress: ShippingAddress;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    deliveredAt?: Timestamp;
}

// User Types
export interface User {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
    isBlocked: boolean;
    createdAt: Timestamp;
    lastLoginAt: Timestamp;
    totalOrders: number;
    totalSpent: number;
}

// Admin Types
export interface Admin {
    id: string;
    email: string;
    role: 'admin' | 'super_admin';
    active: boolean;
    createdAt: Timestamp;
    lastLoginAt: Timestamp;
}

// Payment Types
export interface Payment {
    id: string;
    orderId: string;
    userId: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    status: PaymentStatus;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    failureReason?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Dashboard Stats Types
export interface DashboardStats {
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
    todaySales: number;
    todayOrders: number;
    revenueGrowth: number;
    ordersGrowth: number;
}

// Chart Data Types
export interface RevenueChartData {
    date: string;
    revenue: number;
    orders: number;
}

export interface CategorySalesData {
    category: string;
    sales: number;
    percentage: number;
}
