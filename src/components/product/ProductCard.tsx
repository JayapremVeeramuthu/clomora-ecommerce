import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  style?: React.CSSProperties;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className, style }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <article
      className={cn('group relative', className)}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div
        className="block aspect-[3/4] bg-secondary rounded-lg overflow-hidden relative"
      >
        <Link
          to={`/product/${product.slug}`}
          className="block w-full h-full"
        >
          <img
            src={product.imageUrls?.[0] || product.image || product.images?.[0] || ""}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Secondary Image on Hover */}
          {(product.imageUrls?.[1] || product.images?.[1]) && (
            <img
              src={product.imageUrls?.[1] || product.images?.[1]}
              alt={`${product.name} alternate`}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="px-2 py-1 bg-foreground text-background text-xs font-semibold rounded">
                NEW
              </span>
            )}
            {product.isBestseller && (
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded">
                BESTSELLER
              </span>
            )}
            {discount > 0 && (
              <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded">
                -{discount}%
              </span>
            )}
          </div>
        </Link>

        {/* Quick Actions */}
        <div
          className={cn(
            'absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300',
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          )}
        >
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              'h-9 w-9 rounded-full shadow-md',
              inWishlist && 'bg-primary text-primary-foreground'
            )}
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
          >
            <Heart className={cn('h-4 w-4', inWishlist && 'fill-current')} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-full shadow-md"
            asChild
          >
            <Link to={`/product/${product.slug}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Quick Add */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 p-3 transition-all duration-300',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
        >
          <Button
            variant="secondary"
            className="w-full backdrop-blur-md bg-card/90"
            asChild
          >
            <Link to={`/product/${product.slug}`}>Quick View</Link>
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-2">
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviews})
          </span>
        </div>

        {/* Title */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display font-medium line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Category & Fit */}
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {product.category} • {product.fit} fit
        </p>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Color Options */}
        <div className="flex items-center gap-1.5 pt-1">
          {product.colors.slice(0, 4).map((color, index) => (
            <span
              key={index}
              className="w-4 h-4 rounded-full border border-border cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-xs text-muted-foreground">
              +{product.colors.length - 4}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
