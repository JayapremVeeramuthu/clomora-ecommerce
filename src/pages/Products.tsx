import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product/ProductCard';
import { categories } from '@/data/constants';
import { cn } from '@/lib/utils';
import { db } from '@/config/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['category', 'gender', 'fit', 'size']);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get filter values from URL
  const selectedCategory = searchParams.get('category') || '';
  const selectedGender = searchParams.get('gender') || '';
  const selectedFit = searchParams.get('fit') || '';
  const selectedSize = searchParams.get('size') || '';
  const sortBy = searchParams.get('sort') || 'featured';

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const toggleFilter = (filterName: string) => {
    setExpandedFilters((prev) =>
      prev.includes(filterName)
        ? prev.filter((f) => f !== filterName)
        : [...prev, filterName]
    );
  };

  // Fetch products from Firestore
  useEffect(() => {
    console.log("Fetching products…");
    const q = query(collection(db, 'products'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();

        // Show only: isPublished === true (or missing → still show)
        if (data.isPublished === false) return null;

        const name = data.title || data.name || 'Untitled Product';
        const slug = data.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        return {
          id: doc.id,
          ...data,
          name: name, // title -> name
          slug: slug,
          price: Number(data.price) || 0, // price -> price
          originalPrice: Number(data.compareAtPrice) || Number(data.originalPrice) || 0, // compareAtPrice -> originalPrice
          category: data.category || 'Uncategorized', // category -> category
          gender: (data.gender || 'unisex').toLowerCase(), // gender -> gender
          fit: (data.fit || 'regular').toLowerCase(),
          images: data.imageUrls || data.images || [], // imageUrls -> images
          rating: data.rating || 5,
          reviews: data.reviews || 0,
          sizes: Array.isArray(data.sizes)
            ? data.sizes.map((s: any) => typeof s === 'string' ? { size: s, stock: 10 } : s)
            : [],
          colors: Array.isArray(data.colors)
            ? data.colors.map((c: any) => typeof c === 'string' ? c : (c.hex || '#000'))
            : [],
          createdAt: data.createdAt?.toDate?.() || new Date(0),
          featured: !!data.featured
        };
      }).filter((doc): doc is any => doc !== null);

      // Default sort by newest if createdAt exists
      docs.sort((a: any, b: any) => b.createdAt - a.createdAt);

      console.log("Processed Products:", docs);
      setProducts(docs);
      setLoading(false);
    }, (error) => {
      console.error("❌ Firestore Subscription Error:", error);
      setProducts([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory) {
      result = result.filter(
        (p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    if (selectedGender) {
      result = result.filter((p) => (p.gender || '').toLowerCase() === selectedGender.toLowerCase());
    }
    if (selectedFit) {
      result = result.filter((p) => (p.fit || '').toLowerCase() === selectedFit.toLowerCase());
    }
    if (selectedSize) {
      result = result.filter((p) =>
        p.sizes.some((s: any) => s.size.toLowerCase() === selectedSize.toLowerCase() && s.stock > 0)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Featured first, then newest
        result.sort((a, b) => {
          if (a.featured !== b.featured) return b.featured ? 1 : -1;
          return b.createdAt - a.createdAt;
        });
    }

    return result;
  }, [products, selectedCategory, selectedGender, selectedFit, selectedSize, sortBy]);

  const hasActiveFilters = selectedCategory || selectedGender || selectedFit || selectedSize;

  const filterOptions = {
    category: categories.map((c) => c.name),
    gender: ['men', 'women', 'unisex'],
    fit: ['regular', 'oversized', 'slim'],
    size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  };

  const FilterSection = ({ title, options, selected, filterKey }: {
    title: string;
    options: string[];
    selected: string;
    filterKey: string;
  }) => (
    <div className="border-b border-border pb-4">
      <button
        className="w-full flex items-center justify-between py-2 font-display font-medium"
        onClick={() => toggleFilter(filterKey)}
      >
        {title}
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            expandedFilters.includes(filterKey) && 'rotate-180'
          )}
        />
      </button>
      {expandedFilters.includes(filterKey) && (
        <div className="mt-2 space-y-2">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => updateFilter(filterKey, selected === option ? '' : option)}
              className={cn(
                'block w-full text-left px-3 py-2 rounded-md text-sm transition-colors capitalize',
                selected === option
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Shop All T-Shirts - Best Price Online | SITE_NAME</title>
        <meta
          name="description"
          content="Browse our collection of premium t-shirts. Oversized, graphic, slim fit, and more. Free shipping on orders over ₹999."
        />
      </Helmet>

      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              All Products
            </h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} products found
            </p>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-semibold text-lg">Filters</h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <FilterSection
                  title="Category"
                  options={filterOptions.category}
                  selected={selectedCategory}
                  filterKey="category"
                />
                <FilterSection
                  title="Gender"
                  options={filterOptions.gender}
                  selected={selectedGender}
                  filterKey="gender"
                />
                <FilterSection
                  title="Fit"
                  options={filterOptions.fit}
                  selected={selectedFit}
                  filterKey="fit"
                />
                <FilterSection
                  title="Size"
                  options={filterOptions.size}
                  selected={selectedSize}
                  filterKey="size"
                />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>

                {/* Sort */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                      {selectedCategory}
                      <button onClick={() => updateFilter('category', '')}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedGender && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm capitalize">
                      {selectedGender}
                      <button onClick={() => updateFilter('gender', '')}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedFit && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm capitalize">
                      {selectedFit}
                      <button onClick={() => updateFilter('fit', '')}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedSize && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                      Size {selectedSize}
                      <button onClick={() => updateFilter('size', '')}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Products Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading products...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-xl font-display font-semibold mb-2">No products found</p>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters to find what you're looking for.
                  </p>
                  <Button onClick={clearAllFilters}>Clear Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {isFilterOpen && (
          <>
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-card border-r border-border z-50 lg:hidden animate-slide-up overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-semibold text-lg">Filters</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <FilterSection
                    title="Category"
                    options={filterOptions.category}
                    selected={selectedCategory}
                    filterKey="category"
                  />
                  <FilterSection
                    title="Gender"
                    options={filterOptions.gender}
                    selected={selectedGender}
                    filterKey="gender"
                  />
                  <FilterSection
                    title="Fit"
                    options={filterOptions.fit}
                    selected={selectedFit}
                    filterKey="fit"
                  />
                  <FilterSection
                    title="Size"
                    options={filterOptions.size}
                    selected={selectedSize}
                    filterKey="size"
                  />
                </div>

                <div className="mt-8 space-y-3">
                  <Button className="w-full" onClick={() => setIsFilterOpen(false)}>
                    Show {filteredProducts.length} Results
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default Products;
