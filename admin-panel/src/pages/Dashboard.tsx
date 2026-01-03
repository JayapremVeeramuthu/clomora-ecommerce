// Dashboard Page
// Real-time analytics and statistics

import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/config/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order, DashboardStats } from '@/types';
import { formatCurrency, formatRelativeTime, getStatusColor } from '@/lib/helpers';
import {
    TrendingUp,
    TrendingDown,
    Package,
    ShoppingCart,
    DollarSign,
    CheckCircle,
    Clock,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        totalRevenue: 0,
        todaySales: 0,
        todayOrders: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener for orders
        const ordersQuery = query(collection(db, COLLECTIONS.ORDERS));

        const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
            const orders: Order[] = [];

            snapshot.forEach((doc) => {
                orders.push({ id: doc.id, ...doc.data() } as Order);
            });

            // Calculate statistics
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayTimestamp = Timestamp.fromDate(todayStart);

            const totalOrders = orders.length;
            const pendingOrders = orders.filter(o => o.status === 'pending').length;
            const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
            const totalRevenue = orders
                .filter(o => o.paymentStatus === 'completed')
                .reduce((sum, o) => sum + o.total, 0);

            const todayOrders = orders.filter(o =>
                o.createdAt.seconds >= todayTimestamp.seconds
            );
            const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);

            // Calculate growth (mock data for now - you can implement proper comparison)
            const revenueGrowth = 12.5; // Percentage
            const ordersGrowth = 8.3; // Percentage

            setStats({
                totalOrders,
                pendingOrders,
                deliveredOrders,
                totalRevenue,
                todaySales,
                todayOrders: todayOrders.length,
                revenueGrowth,
                ordersGrowth,
            });

            // Get recent orders (last 10)
            const sortedOrders = orders
                .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
                .slice(0, 10);

            setRecentOrders(sortedOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            change: stats.revenueGrowth,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders.toString(),
            change: stats.ordersGrowth,
            icon: ShoppingCart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Pending Orders',
            value: stats.pendingOrders.toString(),
            change: null,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
        },
        {
            title: 'Delivered Orders',
            value: stats.deliveredOrders.toString(),
            change: null,
            icon: CheckCircle,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Today's Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white">
                <div>
                    <p className="text-purple-100 text-sm">Today's Sales</p>
                    <p className="text-3xl font-bold mt-1">{formatCurrency(stats.todaySales)}</p>
                </div>
                <div>
                    <p className="text-purple-100 text-sm">Today's Orders</p>
                    <p className="text-3xl font-bold mt-1">{stats.todayOrders}</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                        {stat.change !== null && (
                                            <div className="flex items-center gap-1 mt-2">
                                                {stat.change >= 0 ? (
                                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                                )}
                                                <span
                                                    className={cn(
                                                        'text-sm font-medium',
                                                        stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                                                    )}
                                                >
                                                    {Math.abs(stat.change)}%
                                                </span>
                                                <span className="text-sm text-gray-500">vs last month</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', stat.bgColor)}>
                                        <Icon className={cn('w-6 h-6', stat.color)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No orders yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                                {order.orderNumber}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {order.userEmail}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                                {formatCurrency(order.total)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={cn(
                                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                                                    getStatusColor(order.status)
                                                )}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {formatRelativeTime(order.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
