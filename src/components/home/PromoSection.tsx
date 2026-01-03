import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PromoSection: React.FC = () => {
  return (
    <section className="py-20 bg-card relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/4" />
      
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image Grid */}
          <div className="grid grid-cols-2 gap-4 relative">
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&q=80"
                  alt="T-shirt detail"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="aspect-[4/5] rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80"
                  alt="Oversized t-shirt"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="aspect-[4/5] rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80"
                  alt="Streetwear style"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="aspect-square rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&q=80"
                  alt="Graphic tee"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-primary flex flex-col items-center justify-center text-primary-foreground shadow-glow animate-float">
              <Sparkles className="h-6 w-6 mb-1" />
              <span className="font-display font-bold text-2xl">30%</span>
              <span className="text-xs uppercase tracking-widest">Off</span>
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-6 relative z-10">
            <span className="text-primary text-sm font-medium uppercase tracking-widest">
              Limited Time Offer
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
              Premium Oversized
              <br />
              <span className="text-gradient">Collection</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Experience ultimate comfort with our signature oversized fits. Premium heavyweight cotton, dropped shoulders, and the perfect boxy silhouette.
            </p>
            
            <ul className="space-y-3">
              {[
                '100% Premium Cotton',
                'Relaxed Oversized Fit',
                'Available in 6 Sizes',
                'Free Shipping Included',
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/products?fit=oversized">
                  Shop Oversized
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/size-guide">Size Guide</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
