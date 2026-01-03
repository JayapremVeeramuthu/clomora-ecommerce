import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Heart,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/config/firebase';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import SizeChart from '@/components/product/SizeChart';
import ProductCard from '@/components/product/ProductCard';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  const { addItem, setCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  React.useEffect(() => {
    if (!slug) return;

    console.log("Fetching products…");
    setLoading(true);

    const q = query(collection(db, 'products'), where('slug', '==', slug.toLowerCase()), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();

        // Rule 6: Skip unpublished
        if (data.isPublished === false) {
          setProduct(null);
          setLoading(false);
          return;
        }

        // Rule 3: Field mapping
        const p = {
          id: doc.id,
          ...data,
          name: data.title || data.name || 'Untitled Product', // title -> name
          price: Number(data.price) || 0, // price -> price
          originalPrice: Number(data.compareAtPrice) || Number(data.originalPrice) || 0, // compareAtPrice -> originalPrice
          images: data.imageUrls || data.images || [], // imageUrls -> images
          imageUrls: data.imageUrls || [],
          category: data.category || 'Uncategorized', // category -> category
          gender: (data.gender || 'unisex').toLowerCase(), // gender -> gender (Rule 5)
          fit: (data.fit || 'regular').toLowerCase(), // fit -> fit (Rule 5)
          slug: data.slug || '',
          rating: data.rating || 5,
          reviews: data.reviews || 0,
          sizes: Array.isArray(data.sizes)
            ? data.sizes.map((s: any) => typeof s === 'string' ? { size: s, stock: 10 } : s)
            : [],
          colors: Array.isArray(data.colors)
            ? data.colors.map((c: any) => typeof c === 'string' ? c : (c.hex || '#000'))
            : [],
          fabric: data.fabric || 'Cotton',
          neckType: data.neckType || 'Round',
          sleeve: data.sleeve || 'Half',
          modelInfo: data.modelInfo || '',
          fabricCare: data.fabricCare || ['Machine wash cold', 'Tumble dry low']
        };

        console.log("Processed Products:", [p]);
        setProduct(p);

        // Fetch related products in real-time too
        const rq = query(
          collection(db, 'products'),
          where('category', '==', p.category),
          limit(10)
        );

        const rUnsubscribe = onSnapshot(rq, (rSnapshot) => {
          const rdocs = rSnapshot.docs
            .map(rdoc => {
              const rdata = rdoc.data();
              if (rdata.isPublished === false) return null;
              return {
                id: rdoc.id,
                ...rdata,
                name: rdata.title || rdata.name,
                price: Number(rdata.price) || 0,
                slug: rdata.slug,
                imageUrls: rdata.imageUrls || rdata.images || []
              };
            })
            .filter((rp: any) => rp && rp.id !== doc.id && rp.slug)
            .slice(0, 4);
          setRelatedProducts(rdocs);
        });

        setLoading(false);
        return () => rUnsubscribe();
      } else {
        setProduct(null);
        setLoading(false);
      }
    }, (error) => {
      console.error("❌ Firestore Subscription Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  const activeVariant = React.useMemo(() => {
    return product?.variants?.find((v: any) => v.color.toLowerCase() === selectedColor.toLowerCase());
  }, [product, selectedColor]);

  // Reset image when color changes
  React.useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  const baseImages = product?.imageUrls?.length
    ? product.imageUrls
    : product?.image
      ? [product.image, ...(product?.images || [])]
      : (product?.images || []);

  const productImages = activeVariant?.images?.length ? activeVariant.images : baseImages;
  const currentPrice = activeVariant?.price || product?.price || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading product...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Product Not Found</h1>
          <Button asChild>
            <Link to="/products">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: 'Please select a size',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedColor) {
      toast({
        title: 'Please select a color',
        variant: 'destructive',
      });
      return;
    }

    addItem({
      product,
      quantity,
      size: selectedSize,
      color: selectedColor,
    });

    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });

    setCartOpen(true);
  };

  const getSizeStock = (size: string) => {
    const sizeInfo = product.sizes.find((s) => s.size === size);
    return sizeInfo?.stock || 0;
  };

  return (
    <>
      <Helmet>
        <title>{`Buy ${product.name} Online - Best Price | SITE_NAME`}</title>
        <meta
          name="description"
          content={`${product.description.slice(0, 155)}...`}
        />
        <link rel="canonical" href={`https://site-name.com/product/${product.slug}`} />

        {/* Product Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": productImages,
            "brand": {
              "@type": "Brand",
              "name": "SITE_NAME"
            },
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": product.rating,
              "reviewCount": product.reviews
            }
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/products" className="hover:text-foreground">Products</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to={`/products?category=${product.category.toLowerCase()}`} className="hover:text-foreground">
              {product.category}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-[3/4] bg-secondary rounded-xl overflow-hidden relative">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImage((prev) =>
                          prev === 0 ? productImages.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImage((prev) =>
                          prev === productImages.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="px-3 py-1 bg-foreground text-background text-sm font-semibold rounded">
                      NEW
                    </span>
                  )}
                  {product.isBestseller && (
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded">
                      BESTSELLER
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        'w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                        selectedImage === index
                          ? 'border-primary'
                          : 'border-transparent hover:border-border'
                      )}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title & Rating */}
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
                  {product.category}
                </p>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < Math.floor(product.rating)
                            ? 'fill-primary text-primary'
                            : 'fill-muted text-muted'
                        )}
                      />
                    ))}
                    <span className="ml-2 font-medium">{product.rating}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold">
                  {formatPrice(currentPrice)}
                </span>
                {product.originalPrice && product.originalPrice > currentPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="px-2 py-1 bg-destructive/10 text-destructive text-sm font-semibold rounded">
                      {Math.round(
                        ((product.originalPrice - currentPrice) /
                          product.originalPrice) *
                        100
                      )}
                      % OFF
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Color Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Color</span>
                  {selectedColor && (
                    <span className="text-sm text-muted-foreground">
                      Selected: {selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  {product.colors.map((color) => {
                    const isHex = color.startsWith('#');
                    const v = product.variants?.find((variant: any) => variant.color.toLowerCase() === color.toLowerCase());
                    const hasStock = v ? v.stock > 0 : product.inStock;

                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        disabled={!hasStock}
                        className={cn(
                          'w-10 h-10 rounded-full border-2 transition-all relative overflow-hidden',
                          selectedColor === color
                            ? 'border-primary scale-110 shadow-lg'
                            : 'border-border hover:scale-105',
                          !hasStock && 'opacity-40 cursor-not-allowed grayscale'
                        )}
                        title={color + (!hasStock ? ' (Out of Stock)' : '')}
                      >
                        {isHex ? (
                          <div className="w-full h-full" style={{ backgroundColor: color }} />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-[10px] font-bold uppercase overflow-hidden">
                            {color.slice(0, 2)}
                          </div>
                        )}
                        {selectedColor === color && (
                          <Check
                            className={cn(
                              'absolute inset-0 h-4 w-4 m-auto',
                              (isHex && (color === '#ffffff' || color === '#f5f5dc')) || !isHex
                                ? 'text-foreground'
                                : 'text-white'
                            )}
                          />
                        )}
                        {!hasStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[2px] bg-red-500 rotate-45" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Size</span>
                  <button
                    onClick={() => setIsSizeChartOpen(true)}
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Ruler className="h-4 w-4" />
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(({ size, stock }) => (
                    <button
                      key={size}
                      onClick={() => stock > 0 && setSelectedSize(size)}
                      disabled={stock === 0}
                      className={cn(
                        'min-w-[3.5rem] h-12 px-4 rounded-lg border-2 font-medium transition-all relative',
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : stock > 0
                            ? 'border-border hover:border-primary/50'
                            : 'border-border/50 text-muted-foreground/50 cursor-not-allowed'
                      )}
                    >
                      {size}
                      {stock > 0 && stock <= 5 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                          {stock}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {selectedSize && getSizeStock(selectedSize) <= 5 && (
                  <p className="mt-2 text-sm text-destructive">
                    Only {getSizeStock(selectedSize)} left in stock!
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <span className="font-medium block mb-3">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium text-lg">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-4 pt-4">
                <Button
                  variant="hero"
                  size="xl"
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  Add to Cart — {formatPrice(product.price * quantity)}
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  onClick={() => toggleWishlist(product)}
                  className={cn(inWishlist && 'border-primary text-primary')}
                >
                  <Heart className={cn('h-5 w-5', inWishlist && 'fill-current')} />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="text-center">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On ₹999+</p>
                </div>
                <div className="text-center">
                  <RefreshCw className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">15 Days</p>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Secure</p>
                  <p className="text-xs text-muted-foreground">Payment</p>
                </div>
              </div>

              {/* Product Details */}
              <div className="pt-6 border-t border-border space-y-4">
                <h3 className="font-display font-semibold">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Fit:</span>
                    <span className="ml-2 capitalize">{product.fit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fabric:</span>
                    <span className="ml-2 capitalize">{product.fabric}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Neck:</span>
                    <span className="ml-2 capitalize">{product.neckType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sleeve:</span>
                    <span className="ml-2 capitalize">{product.sleeve}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{product.modelInfo}</p>
              </div>

              {/* Care Instructions */}
              <div className="pt-6 border-t border-border">
                <h3 className="font-display font-semibold mb-3">Care Instructions</h3>
                <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {product.fabricCare.map((care, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {care}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display text-2xl font-bold mb-8">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <SizeChart isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} />
    </>
  );
};

export default ProductDetail;
