import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';

const OrderSuccess: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Order Successful | SITE_NAME</title>
            </Helmet>

            <main className="min-h-screen bg-background flex items-center justify-center pt-20 px-4">
                <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
                    <div className="flex justify-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-bounce-subtle">
                            <CheckCircle2 className="w-12 h-12 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="font-display text-4xl font-bold tracking-tight">Order Placed!</h1>
                        <p className="text-muted-foreground">
                            Thank you for your purchase. We've received your order and are getting it ready for shipment.
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <p className="text-sm font-medium mb-4">You will receive an email confirmation shortly with your order details and tracking link.</p>
                        <div className="flex flex-col gap-3">
                            <Button asChild className="w-full h-12 group">
                                <Link to="/products">
                                    Continue Shopping
                                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button variant="outline" asChild className="w-full h-12">
                                <Link to="/">
                                    Go to Home
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm font-medium">
                        <ShoppingBag className="w-4 h-4" />
                        <span>Site Name Secure Checkout</span>
                    </div>
                </div>
            </main>
        </>
    );
};

export default OrderSuccess;
