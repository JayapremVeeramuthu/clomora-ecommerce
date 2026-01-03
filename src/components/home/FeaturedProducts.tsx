import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product/ProductCard';
import { db } from '@/config/firebase';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';

const FeaturedProducts: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    console.log("Fetching products…");
    const q = query(
      collection(db, 'products'),
      where('featured', '==', true),
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
      setFeaturedProducts(docs);
      setLoading(false);
    }, (error) => {
      console.error("❌ Firestore Subscription Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-primary text-sm font-medium uppercase tracking-widest">
              Curated for you
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">
              Featured Collection
            </h2>
          </div>
          <Button variant="minimal" asChild>
            <Link to="/products?filter=featured" className="group">
              View all
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featuredProducts.map((product, index) => (
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

export default FeaturedProducts;
