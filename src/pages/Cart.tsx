import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const Cart: React.FC = () => {
  const { state, removeItem, updateQuantity, totalPrice } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const shippingThreshold = 999;
  const remainingForFreeShipping = shippingThreshold - totalPrice;
  const hasItems = state.items.length > 0;

  return (
    <>
      <Helmet>
        <title>Shopping Cart | SITE_NAME</title>
        <meta name="description" content="Review your cart and checkout at SITE_NAME." />
      </Helmet>

      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">
            Shopping Cart
          </h1>

          {hasItems ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Free Shipping Progress */}
                {remainingForFreeShipping > 0 && (
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm mb-2">
                      Add {formatPrice(remainingForFreeShipping)} more for{' '}
                      <span className="font-semibold text-primary">FREE SHIPPING</span>
                    </p>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (totalPrice / shippingThreshold) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Items */}
                {state.items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}`}
                    className="flex gap-4 p-4 bg-card border border-border rounded-xl"
                  >
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="w-24 h-32 bg-secondary rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={item.product.imageUrls?.[0] || item.product.image || item.product.images?.[0] || ""}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="font-display font-medium hover:text-primary transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        Size: {item.size} •{' '}
                        <span
                          className="inline-block w-3 h-3 rounded-full border border-border align-middle"
                          style={{ backgroundColor: item.color }}
                        />
                      </p>
                      <p className="font-display font-semibold mt-2">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size,
                                item.color,
                                item.quantity - 1
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size,
                                item.color,
                                item.quantity + 1
                              )
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            removeItem(item.product.id, item.size, item.color)
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 p-6 bg-card border border-border rounded-xl">
                  <h2 className="font-display text-xl font-semibold mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 pb-4 border-b border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {totalPrice >= shippingThreshold ? (
                          <span className="text-primary">FREE</span>
                        ) : (
                          formatPrice(99)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-4">
                    <span className="font-display font-semibold text-lg">Total</span>
                    <span className="font-display font-bold text-2xl">
                      {formatPrice(
                        totalPrice + (totalPrice >= shippingThreshold ? 0 : 99)
                      )}
                    </span>
                  </div>

                  <Button variant="hero" className="w-full" size="lg" asChild>
                    <Link to="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Secure checkout powered by Razorpay
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Looks like you haven't added anything yet. Start exploring our collection!
              </p>
              <Button asChild>
                <Link to="/products">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Start Shopping
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Cart;
