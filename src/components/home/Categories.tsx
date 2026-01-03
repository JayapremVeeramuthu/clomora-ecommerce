import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/data/constants';
import { db } from '@/config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const Categories: React.FC = () => {
  const [categoryCounts, setCategoryCounts] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    console.log("Fetching products…");
    const q = query(collection(db, 'products'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts: Record<string, number> = {};
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.isPublished === false) return null;

        const category = data.category;
        if (category) {
          // Normalize category name to match constants (case-insensitive)
          const matchedCategory = categories.find(c => c.name.toLowerCase() === category.toLowerCase());
          const catName = matchedCategory ? matchedCategory.name : category;
          counts[catName] = (counts[catName] || 0) + 1;
        }
        return data;
      }).filter(d => d !== null);

      console.log("Processed Products:", docs);
      setCategoryCounts(counts);
    }, (error) => {
      console.error("❌ Firestore Subscription Error:", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-primary text-sm font-medium uppercase tracking-widest">
              Browse by
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">
              Shop Categories
            </h2>
          </div>
          <Link
            to="/products"
            className="group inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            View all categories
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={`/products?category=${category.name.toLowerCase()}`}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-overlay" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300" />

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-display font-semibold text-lg text-foreground">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {categoryCounts[category.name] || 0} products
                </p>
              </div>

              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="h-5 w-5 text-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
