import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product/ProductCard';
import { db } from '@/config/firebase';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';

const Bestsellers: React.FC = () => {
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching products…");
    const q = query(
      collection(db, 'products'),
      where('isBestseller', '==', true),
      limit(4)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map(doc => {
          const data = doc.data();
          if (data.isPublished === false) return null;
          return {
            id: doc.id,
            ...data,
            name: data.title || data.name,
            price: Number(data.price) || 0,
            originalPrice: Number(data.compareAtPrice) || Number(data.originalPrice) || 0,
            imageUrls: data.imageUrls || data.images || [],
          };
        })
        .filter((doc): doc is any => doc !== null);

      console.log("Processed Products:", docs);
      setBestsellers(docs);
      setLoading(false);
    }, (error) => {
      console.error("❌ Firestore Subscription Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 text-primary text-sm font-medium uppercase tracking-widest">
              <TrendingUp className="h-4 w-4" />
              Trending now
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">
              Bestsellers
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Our most loved pieces, chosen by thousands of customers worldwide.
            </p>
          </div>
          <Button variant="minimal" asChild>
            <Link to="/products?filter=bestseller" className="group">
              Shop all bestsellers
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {bestsellers.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;
