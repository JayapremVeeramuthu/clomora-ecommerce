import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useAddresses, Address, AddressFormData } from '@/hooks/useAddresses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
    ShieldCheck,
    Truck,
    ArrowLeft,
    Plus,
    MapPin,
    Check,
    Trash2,
    Loader2,
    LogIn
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Checkout = () => {
    const navigate = useNavigate();
    const { state, totalPrice, clearCart } = useCart();
    const { user, signInWithGoogle, loading: authLoading } = useAuth();
    const {
        addresses,
        loading: addressesLoading,
        addAddress,
        deleteAddress,
        setDefaultAddress
    } = useAddresses();

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("razorpay");

    // Form State
    const [formData, setFormData] = useState<AddressFormData>({
        fullName: '',
        phone: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        isDefault: false,
    });

    // Set default selected address
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
            setSelectedAddressId(defaultAddr.id);
        }
    }, [addresses, selectedAddressId]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Basic Validation
        if (!formData.fullName || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }

        setIsSubmitting(true);
        try {
            await addAddress(formData);
            toast.success('Address added successfully');
            setShowAddressForm(false);
            setFormData({
                fullName: '',
                phone: '',
                email: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                pincode: '',
                landmark: '',
                isDefault: false,
            });
        } catch (error) {
            toast.error('Failed to add address');
        } finally {
            setIsSubmitting(false);
        }
    };

    const shipping = totalPrice > 999 ? 0 : 99;
    const finalTotal = totalPrice + shipping;

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!selectedAddressId) {
            toast.error('Please select a shipping address');
            return;
        }

        if (paymentMethod === "cod") {
            return handleCOD();
        }

        return handleRazorpay();
    };

    const handleRazorpay = async () => {
        const res = await loadRazorpay();
        if (!res) {
            toast.error("Razorpay SDK failed to load. Check your internet connection.");
            return;
        }

        setIsSubmitting(true);
        try {
            const orderRes = await fetch("https://clomora.onrender.com/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: finalTotal }),
            });

            const data = await orderRes.json();
            const order = data.order;

            if (!orderRes.ok || !order) {
                throw new Error("Failed to create order on server");
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: "INR",
                name: "Clomora",
                description: "Order Payment",
                order_id: order.id,
                prefill: {
                    name: user?.displayName || "",
                    email: user?.email || "",
                    contact: selectedAddress?.phone || "",
                },
                handler: async function (response: any) {
                    const verify = await fetch("https://clomora.onrender.com/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(response),
                    });

                    const data = await verify.json();

                    if (data.success) {
                        toast.success("Payment Successful 🎉");

                        try {
                            const orderData = {
                                userId: user?.uid,
                                userEmail: user?.email,
                                fullName: selectedAddress?.fullName,
                                phone: selectedAddress?.phone,
                                address: selectedAddress,
                                items: state.items.map(item => ({
                                    productId: item.product.id,
                                    name: item.product.name,
                                    price: item.product.price,
                                    quantity: item.quantity,
                                    size: item.size,
                                    color: item.color,
                                    image: item.product.imageUrls?.[0] || item.product.image || ""
                                })),
                                subtotal: totalPrice,
                                shipping: shipping,
                                total: finalTotal,
                                status: 'Order Placed',
                                paymentMethod: 'Razorpay',
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                createdAt: serverTimestamp(),
                            };

                            await addDoc(collection(db, 'orders'), orderData);

                            // Send WhatsApp Confirmation
                            try {
                                await fetch("https://clomora.onrender.com/confirm-order-whatsapp", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        phone: selectedAddress?.phone,
                                        name: selectedAddress?.fullName,
                                        id: response.razorpay_order_id,
                                        total: finalTotal
                                    })
                                });
                            } catch (waError) {
                                console.error("WhatsApp notification failed:", waError);
                            }

                            clearCart();
                            navigate('/order-success');
                        } catch (error) {
                            console.error("Order save error:", error);
                            toast.error("Payment successful but failed to save order. Please contact support.");
                        }
                    } else {
                        toast.error("Payment Verification Failed ❌");
                    }
                },
                modal: {
                    ondismiss: function () {
                        setIsSubmitting(false);
                    }
                },
                theme: {
                    color: "#111827",
                },
            };

            const payment = new (window as any).Razorpay(options);
            payment.open();
        } catch (err) {
            console.error(err);
            toast.error("Process failed. Make sure backend server is running.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCOD = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("https://clomora.onrender.com/create-cod-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cart: state.items,
                    address: selectedAddress,
                    total: finalTotal,
                    paymentType: "COD",
                }),
            });

            if (!res.ok) throw new Error("Backend error");

            const orderData = {
                userId: user?.uid,
                userEmail: user?.email,
                fullName: selectedAddress?.fullName,
                phone: selectedAddress?.phone,
                address: selectedAddress,
                items: state.items.map(item => ({
                    productId: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    image: item.product.imageUrls?.[0] || item.product.image || ""
                })),
                subtotal: totalPrice,
                shipping: shipping,
                total: finalTotal,
                status: 'Order Placed',
                paymentMethod: 'COD',
                paymentStatus: 'PENDING',
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'orders'), orderData);

            // Send WhatsApp Confirmation
            try {
                await fetch("https://clomora.onrender.com/confirm-order-whatsapp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        phone: selectedAddress?.phone,
                        name: selectedAddress?.fullName,
                        id: docRef.id,
                        total: finalTotal
                    })
                });
            } catch (waError) {
                console.error("WhatsApp notification failed:", waError);
            }

            clearCart();
            toast.success("Order placed successfully! Pay on delivery.");
            navigate("/order-success");
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong while placing COD order");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <main className="container mx-auto px-4 py-32 text-center">
                <div className="max-w-md mx-auto bg-card border border-border p-8 rounded-2xl shadow-xl shadow-primary/5">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="font-display text-2xl font-bold mb-4">Login Required</h1>
                    <p className="text-muted-foreground mb-8 text-sm">You need to be logged in to manage addresses and complete your purchase.</p>
                    <Button className="w-full h-12 gap-2" onClick={signInWithGoogle}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </Button>
                </div>
            </main>
        );
    }

    if (state.items.length === 0) {
        return (
            <main className="container mx-auto px-4 py-32 text-center">
                <h1 className="font-display text-3xl font-bold mb-4">Your cart is empty</h1>
                <p className="text-muted-foreground mb-8">Add some items to your cart before checking out.</p>
                <Button asChild>
                    <Link to="/products">Return to Shop</Link>
                </Button>
            </main>
        );
    }

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    return (
        <main className="min-h-screen bg-background pt-24 pb-20">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Link to="/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Cart
                </Link>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Left Column: Checkout Forms */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</div>
                                    <h2 className="font-display text-2xl font-bold">Shipping Address</h2>
                                </div>
                                {!showAddressForm && (
                                    <Button variant="outline" size="sm" onClick={() => setShowAddressForm(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Address
                                    </Button>
                                )}
                            </div>

                            {showAddressForm ? (
                                <form onSubmit={handleAddAddress} className="space-y-6 animate-fade-in">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name *</Label>
                                            <Input id="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <Input id="phone" value={formData.phone} onChange={handleInputChange} placeholder="10-digit mobile number" />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address (Optional)</Label>
                                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pincode">Pincode *</Label>
                                            <Input id="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="6-digit pincode" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="addressLine1">Address Line 1 *</Label>
                                        <Input id="addressLine1" value={formData.addressLine1} onChange={handleInputChange} placeholder="House/Flat No, Building, Street" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                                        <Input id="addressLine2" value={formData.addressLine2} onChange={handleInputChange} placeholder="Area, Landmark" />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City *</Label>
                                            <Input id="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Mumbai" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State *</Label>
                                            <Input id="state" value={formData.state} onChange={handleInputChange} placeholder="e.g. Maharashtra" />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 py-2">
                                        <Checkbox
                                            id="isDefault"
                                            checked={formData.isDefault}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: !!checked }))}
                                        />
                                        <Label htmlFor="isDefault" className="text-sm font-medium leading-none cursor-pointer">
                                            Make this my default address
                                        </Label>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Save Address'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)} disabled={isSubmitting}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    {addressesLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
                                        </div>
                                    ) : addresses.length === 0 ? (
                                        <div className="p-12 border-2 border-dashed border-border rounded-xl bg-muted/30 flex flex-col items-center justify-center text-center space-y-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                                <MapPin className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold">No saved addresses</h3>
                                                <p className="text-sm text-muted-foreground">Add a shipping address to continue your checkout.</p>
                                            </div>
                                            <Button size="sm" onClick={() => setShowAddressForm(true)}>Add Address</Button>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {addresses.map((addr) => (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => setSelectedAddressId(addr.id)}
                                                    className={cn(
                                                        "relative p-4 rounded-xl border-2 transition-all cursor-pointer group",
                                                        selectedAddressId === addr.id
                                                            ? "border-primary bg-primary/5 shadow-sm"
                                                            : "border-border hover:border-primary/50"
                                                    )}
                                                >
                                                    <div className="flex justify-between items-start pr-8">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-sm">{addr.fullName}</span>
                                                                {addr.isDefault && (
                                                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Default</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                                                                {addr.city}, {addr.state} - {addr.pincode}
                                                            </p>
                                                            <p className="text-xs font-medium mt-2">Phone: {addr.phone}</p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteAddress(addr.id);
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    {selectedAddressId === addr.id && (
                                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-background animate-scale-in">
                                                            <Check className="w-3 h-3 stroke-[3]" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={cn("bg-card border border-border rounded-2xl p-6 md:p-8 transition-opacity", !selectedAddressId ? "opacity-50" : "opacity-100")}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">2</div>
                                <h2 className="font-display text-2xl font-bold">Payment Method</h2>
                            </div>

                            {!selectedAddressId ? (
                                <p className="text-sm text-muted-foreground italic text-center py-4">Select a shipping address to enable payment...</p>
                            ) : (
                                <div className="space-y-4">
                                    <div
                                        onClick={() => setPaymentMethod("razorpay")}
                                        className={cn(
                                            "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4",
                                            paymentMethod === "razorpay" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        <div className="w-10 h-10 bg-white rounded-lg border border-border flex items-center justify-center p-2">
                                            <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="w-full grayscale-0" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm tracking-tight text-foreground">Razorpay Secure</h4>
                                            <p className="text-[10px] text-muted-foreground">Pay securely via Cards, UPI, Netbanking or Wallets.</p>
                                        </div>
                                        <div className="ml-auto">
                                            {paymentMethod === "razorpay" && <Check className="w-5 h-5 text-primary" />}
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setPaymentMethod("cod")}
                                        className={cn(
                                            "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4",
                                            paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Truck className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm tracking-tight text-foreground">Cash On Delivery (COD)</h4>
                                            <p className="text-[10px] text-muted-foreground">Pay with cash when your package arrives at your doorstep.</p>
                                        </div>
                                        <div className="ml-auto">
                                            {paymentMethod === "cod" && <Check className="w-5 h-5 text-primary" />}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 sticky top-28 shadow-xl shadow-primary/5 animate-slide-in-right">
                            <h2 className="font-display text-2xl font-bold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {state.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="w-16 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border transition-transform group-hover:scale-105">
                                            <img
                                                src={item.product.imageUrls?.[0] || item.product.image || ""}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} | Size: {item.size}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-[10px] uppercase text-muted-foreground">Color:</span>
                                                <div
                                                    className="w-3 h-3 rounded-full border border-border"
                                                    style={{ backgroundColor: item.color }}
                                                    title={item.color}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="mb-6" />

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className={cn("font-medium", shipping === 0 ? "text-green-500" : "")}>
                                        {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Estimated GST (18%)</span>
                                    <span className="font-medium italic text-muted-foreground">Included</span>
                                </div>
                            </div>

                            <Separator className="mb-6" />

                            <div className="flex justify-between items-center mb-8">
                                <span className="text-lg font-bold tracking-tight">Total Amount</span>
                                <span className="text-2xl font-black text-primary">{formatPrice(finalTotal)}</span>
                            </div>

                            <Button
                                className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 group relative overflow-hidden"
                                disabled={!selectedAddressId || isSubmitting}
                                onClick={handlePayment}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Payment'}
                                </span>
                                {!selectedAddressId && (
                                    <div className="absolute inset-0 bg-muted/20 backdrop-blur-[2px]" />
                                )}
                            </Button>

                            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                                <span>128-bit Encryption Secured</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Checkout;
