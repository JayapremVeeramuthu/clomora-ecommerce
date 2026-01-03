import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/config/firebase';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';

const Hero: React.FC = () => {
  const [featuredProduct, setFeaturedProduct] = useState<any>(null);

  useEffect(() => {
    console.log("Fetching products…");
    const q = query(
      collection(db, 'products'),
      where('featured', '==', true),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();

        // Rule 6: Skip unpublished
        if (data.isPublished === false) {
          setFeaturedProduct(null);
          return;
        }

        const p = {
          id: doc.id,
          ...data,
          name: data.title || data.name,
          price: Number(data.price) || 0,
          image: data.imageUrls?.[0] || data.images?.[0] || data.image || ""
        };
        console.log("Processed Products:", [p]);
        setFeaturedProduct(p);
      } else {
        setFeaturedProduct(null);
      }
    }, (error) => {
      console.error("❌ Firestore Subscription Error:", error);
    });

    return () => unsubscribe();
  }, []);
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[150px]" style={{ animationDelay: '1.5s' }} />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full animate-fade-in">
                New Collection 2025
              </span>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-slide-up">
                Clomora — Elevate Your
                <br />
                <span className="text-gradient">Street Style with Custom T-Shirts</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Premium quality tees crafted for comfort and designed for the modern individual. Express yourself with every fit.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/products">
                  Shop Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/products?filter=new">New Arrivals</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div>
                <p className="font-display text-3xl font-bold">50K+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <p className="font-display text-3xl font-bold">200+</p>
                <p className="text-sm text-muted-foreground">Unique Designs</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <p className="font-display text-3xl font-bold">4.9★</p>
                <p className="text-sm text-muted-foreground">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="aspect-[4/5] relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 z-10 rounded-2xl" />
              <img
                src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80"
                alt="Model wearing premium streetwear t-shirt"
                className="w-full h-full object-cover rounded-2xl shadow-strong"
              />

              {/* Floating Card */}
              {featuredProduct && (
                <div className="absolute bottom-8 left-8 right-8 glass rounded-xl p-4 z-20 animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={featuredProduct.image}
                        alt={featuredProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold truncate">{featuredProduct.name}</p>
                      <p className="text-sm text-muted-foreground">Starting at ₹{featuredProduct.price.toLocaleString('en-IN')}</p>
                    </div>
                    <Button size="sm" asChild>
                      <Link to={`/product/${featuredProduct.slug}`}>View</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1 h-3 bg-muted-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
