import React, { useEffect, useState } from "react";
import { auth, db } from "@/config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    User as UserIcon,
    Package,
    MapPin,
    CreditCard,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    LogOut,
    Loader2,
    LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, signInWithGoogle, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // 📦 Load user orders using userId for better accuracy
                const ordersQ = query(
                    collection(db, "orders"),
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const orderSnap = await getDocs(ordersQ);
                setOrders(orderSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

                // 🏠 Load saved addresses
                const addressQ = query(collection(db, `users/${user.uid}/addresses`));
                const addrSnap = await getDocs(addressQ);
                setAddresses(addrSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }

            setLoading(false);
        };

        fetchProfileData();
    }, [user]);

    if (authLoading || (user && loading)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <main className="container mx-auto px-4 py-32 text-center pt-48">
                <div className="max-w-md mx-auto bg-card border border-border p-8 rounded-2xl shadow-xl shadow-primary/5">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="font-display text-2xl font-bold mb-4">Login Required</h1>
                    <p className="text-muted-foreground mb-8 text-sm">You need to be logged in to view your account, track orders and manage your addresses.</p>
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

    return (
        <main className="min-h-screen bg-background pt-32 pb-20">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="font-display text-4xl font-bold tracking-tight">My Account</h1>
                            <p className="text-muted-foreground mt-2">Manage your orders and personal details.</p>
                        </div>
                        {/* Logout button */}
                        <Button
                            variant="outline"
                            className="text-destructive hover:bg-destructive/5 hover:text-destructive gap-2 md:w-fit w-full"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Button>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">

                        {/* Left Column: Profile & Addresses */}
                        <div className="space-y-8 lg:col-span-1">

                            {/* Profile Card */}
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        <UserIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h2 className="font-display text-xl font-bold">Personal Info</h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Full Name</p>
                                        <p className="font-medium">{user.displayName || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Email Address</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Addresses Card */}
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                            <MapPin className="w-6 h-6 text-primary" />
                                        </div>
                                        <h2 className="font-display text-xl font-bold">Addresses</h2>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-primary" onClick={() => navigate("/checkout")}>
                                        Edit
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {addresses.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">No saved addresses yet.</p>
                                    ) : (
                                        addresses.map((a) => (
                                            <div key={a.id} className="p-4 bg-muted/30 rounded-xl border border-border/50 text-sm">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold">{a.fullName}</span>
                                                    {a.isDefault && (
                                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Default</span>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground">
                                                    {a.addressLine1}
                                                    {a.addressLine2 && `, ${a.addressLine2}`}
                                                </p>
                                                <p className="text-muted-foreground">{a.city}, {a.state} - {a.pincode}</p>
                                                <p className="mt-2 font-medium">Phone: {a.phone}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Order History */}
                        <div className="lg:col-span-2">
                            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm h-full">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Package className="w-6 h-6 text-primary" />
                                    </div>
                                    <h2 className="font-display text-2xl font-bold">Order History</h2>
                                </div>

                                {orders.length === 0 ? (
                                    <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                                        <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                                        <Button variant="outline" onClick={() => navigate("/products")}>
                                            Start Shopping
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((o) => (
                                            <div
                                                key={o.id}
                                                className="group p-5 bg-card border border-border hover:border-primary/50 rounded-xl transition-all duration-300"
                                            >
                                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold text-muted-foreground tracking-tighter uppercase">Order ID</span>
                                                            <span className="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded">{o.id.substring(0, 10)}...</span>
                                                            <div className={cn(
                                                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                                o.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"
                                                            )}>
                                                                {o.status === "Delivered" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                                {o.status || "Processing"}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-muted-foreground">Total:</span>
                                                                <span className="font-bold text-lg text-primary">{formatCurrency(o.total || o.amount || 0)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 border-l border-border pl-6">
                                                                <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">Payment:</span>
                                                                <span className="text-xs font-black">{o.paymentMethod || "COD"}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center md:justify-end gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                                                        <span className="text-xs text-muted-foreground italic">
                                                            {o.createdAt && o.createdAt.toDate ? o.createdAt.toDate().toLocaleDateString('en-IN', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            }) : 'Recent Order'}
                                                        </span>
                                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
};

export default Profile;
