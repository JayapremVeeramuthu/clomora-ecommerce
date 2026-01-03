// Orders Management Page
// View and manage all orders with status updates

import React, { useEffect, useState } from 'react';
import {
    collection,
    onSnapshot,
    updateDoc,
    doc,
    query,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/config/firebase';
import { Order, OrderStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
    formatCurrency,
    formatDate,
    formatRelativeTime,
    getStatusColor,
} from '@/lib/helpers';
import {
    ShoppingCart,
    Loader2,
    Search,
    Eye,
    X,
    Package,
    Truck,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updating, setUpdating] = useState(false);
    const { toast } = useToast();

    // Fetch orders in real-time
    useEffect(() => {
        const q = query(collection(db, COLLECTIONS.ORDERS), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData: Order[] = [];
            snapshot.forEach((doc) => {
                ordersData.push({ id: doc.id, ...doc.data() } as Order);
            });
            setOrders(ordersData);
            setFilteredOrders(ordersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Filter orders based on search and status
    useEffect(() => {
        let filtered = orders;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (order) =>
                    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter((order) => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    }, [searchTerm, statusFilter, orders]);

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        setUpdating(true);

        try {
            const updateData: any = {
                status: newStatus,
                updatedAt: Timestamp.now(),
            };

            // If status is delivered, add deliveredAt timestamp
            if (newStatus === 'delivered') {
                updateData.deliveredAt = Timestamp.now();
            }

            await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), updateData);

            toast({
                title: 'Order Updated',
                description: `Order status updated to ${newStatus}`,
            });

            // Update selected order if it's the one being updated
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating order:', error);
            toast({
                title: 'Error',
                description: 'Failed to update order status. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setUpdating(false);
        }
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'pending':
                return <ShoppingCart className="w-4 h-4" />;
            case 'packed':
                return <Package className="w-4 h-4" />;
            case 'shipped':
                return <Truck className="w-4 h-4" />;
            case 'delivered':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            default:
                return <ShoppingCart className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search by order number or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'No orders found matching your filters'
                                    : 'No orders yet'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <Card key={order.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900">{order?.orderNumber || "ORD-UNKNOWN"}</h3>
                                            <span className={cn(
                                                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                                                getStatusColor(order?.status || 'pending')
                                            )}>
                                                {getStatusIcon(order?.status || 'pending')}
                                                {(order?.status || 'pending').charAt(0).toUpperCase() + (order?.status || 'pending').slice(1)}
                                            </span>
                                            <span className={cn(
                                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                                                getStatusColor(order?.paymentStatus || 'pending')
                                            )}>
                                                {order?.paymentMethod === 'razorpay' ? '💳 Online' : '💵 COD'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            Customer: <span className="font-medium">{order?.shipping?.email || order?.customer?.email || order?.userEmail || "—"}</span>
                                        </p>
                                        <p className="text-sm text-gray-600 mb-1">
                                            Items: <span className="font-medium">{order?.items?.length || 0}</span> •
                                            Total: <span className="font-medium">{formatCurrency(order?.total || 0)}</span>
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatRelativeTime(order?.createdAt || new Date())} • {formatDate(order?.createdAt || new Date(), 'PPp')}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <CardContent className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Order Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-gray-600">Order Number:</span> <span className="font-medium">{selectedOrder.orderNumber}</span></p>
                                        <p><span className="text-gray-600">Date:</span> <span className="font-medium">{formatDate(selectedOrder.createdAt, 'PPp')}</span></p>
                                        <p><span className="text-gray-600">Status:</span> <span className={cn('font-medium', getStatusColor(selectedOrder.status))}>{selectedOrder.status}</span></p>
                                        <p><span className="text-gray-600">Payment:</span> <span className="font-medium">{selectedOrder.paymentMethod === 'razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery'}</span></p>
                                        <p><span className="text-gray-600">Payment Status:</span> <span className={cn('font-medium', getStatusColor(selectedOrder.paymentStatus))}>{selectedOrder.paymentStatus}</span></p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedOrder?.shipping?.email || selectedOrder?.customer?.email || selectedOrder?.userEmail || "—"}</span></p>
                                        <p><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedOrder?.shippingAddress?.fullName || selectedOrder?.shipping?.fullName || selectedOrder?.customer?.fullName || selectedOrder?.fullName || "Unknown User"}</span></p>
                                        <p><span className="text-gray-600">Phone:</span> <span className="font-medium">{selectedOrder?.shippingAddress?.phone || selectedOrder?.shipping?.phone || selectedOrder?.customer?.phone || selectedOrder?.phone || "—"}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                    <p className="font-medium">{selectedOrder?.shippingAddress?.fullName || selectedOrder?.shipping?.fullName || selectedOrder?.customer?.fullName || selectedOrder?.fullName || "Unknown User"}</p>
                                    <p>{selectedOrder?.shippingAddress?.addressLine1 || selectedOrder?.address?.addressLine1 || "—"}</p>
                                    {(selectedOrder?.shippingAddress?.addressLine2 || selectedOrder?.address?.addressLine2) && <p>{selectedOrder?.shippingAddress?.addressLine2 || selectedOrder?.address?.addressLine2}</p>}
                                    <p>{selectedOrder?.shippingAddress?.city || selectedOrder?.address?.city || "—"}, {selectedOrder?.shippingAddress?.state || selectedOrder?.address?.state || "—"} - {selectedOrder?.shippingAddress?.pincode || selectedOrder?.address?.pincode || "—"}</p>
                                    <p>{selectedOrder?.shippingAddress?.country || selectedOrder?.address?.country || "INDIA"}</p>
                                    <p className="mt-2">Phone: {selectedOrder?.shippingAddress?.phone || selectedOrder?.shipping?.phone || selectedOrder?.customer?.phone || selectedOrder?.phone || "—"}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                                                <img
                                                    src={
                                                        item?.image ||
                                                        item?.imageUrl ||
                                                        "https://via.placeholder.com/80?text=No+Image"
                                                    }
                                                    alt={item?.name || item?.title}
                                                    className="w-full h-full object-cover"
                                                    style={{ width: 60, height: 60, borderRadius: 8 }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{item?.name || item?.title || "Unknown Product"}</h4>
                                                <p className="text-sm text-gray-600">Size: {item?.size} • Color: {item?.color}</p>
                                                <p className="text-sm text-gray-600">Quantity: {item?.quantity} × {formatCurrency(item?.price || 0)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(selectedOrder?.subtotal || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping:</span>
                                        <span className="font-medium">{formatCurrency(selectedOrder?.shipping || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax:</span>
                                        <span className="font-medium">{formatCurrency(selectedOrder?.tax || 0)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-300">
                                        <span className="font-semibold text-gray-900">Total:</span>
                                        <span className="font-bold text-gray-900 text-lg">{formatCurrency(selectedOrder?.total || 0)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Update Status */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Update Order Status</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(['pending', 'packed', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => (
                                        <Button
                                            key={status}
                                            size="sm"
                                            variant={selectedOrder.status === status ? 'default' : 'outline'}
                                            onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                                            disabled={updating || selectedOrder.status === status}
                                            className={selectedOrder.status === status ? 'bg-purple-600' : ''}
                                        >
                                            {updating ? (
                                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                            ) : (
                                                getStatusIcon(status)
                                            )}
                                            <span className="ml-1">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Orders;
