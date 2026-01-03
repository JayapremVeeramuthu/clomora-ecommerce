// Payments Management Page
// View all payment transactions

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/config/firebase';
import { Payment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/helpers';
import { CreditCard, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const Payments: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        const q = query(collection(db, COLLECTIONS.PAYMENTS), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const paymentsData: Payment[] = [];
            snapshot.forEach((doc) => {
                paymentsData.push({ id: doc.id, ...doc.data() } as Payment);
            });
            setPayments(paymentsData);
            setFilteredPayments(paymentsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let filtered = payments;

        if (searchTerm) {
            filtered = filtered.filter(
                (payment) =>
                    payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    payment.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((payment) => payment.status === statusFilter);
        }

        setFilteredPayments(filtered);
    }, [searchTerm, statusFilter, payments]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const completedPayments = filteredPayments.filter(p => p.status === 'completed');
    const failedPayments = filteredPayments.filter(p => p.status === 'failed');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
                <p className="text-gray-600 mt-1">Track all payment transactions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-600 font-medium">Total Payments</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{filteredPayments.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-600 font-medium">Completed</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">{completedPayments.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-600 font-medium">Failed</p>
                        <p className="text-2xl font-bold text-red-600 mt-2">{failedPayments.length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search by order ID or payment ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                        >
                            <option value="all">All Payments</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Payments List */}
            {filteredPayments.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'No payments found matching your filters'
                                    : 'No payments yet'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment ID</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Method</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map((payment) => (
                                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                                {payment.razorpayPaymentId || payment.id.substring(0, 12)}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{payment.orderId}</td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {payment.method === 'razorpay' ? '💳 Razorpay' : '💵 COD'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                                {formatCurrency(payment.amount)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={cn(
                                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                                                    getStatusColor(payment.status)
                                                )}>
                                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {formatDate(payment.createdAt, 'PPp')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Payments;
