import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product/ProductCard';
import { useWishlist } from '@/context/WishlistContext';

const Wishlist: React.FC = () => {
  const { items } = useWishlist();

  return (
    <>
      <Helmet>
        <title>Wishlist | SITE_NAME</title>
        <meta name="description" content="Your saved items at SITE_NAME." />
      </Helmet>

      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Wishlist
            </h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Start saving your favorite items by clicking the heart icon on products you love.
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

export default Wishlist;
