import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Categories from '@/components/home/Categories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoSection from '@/components/home/PromoSection';
import Bestsellers from '@/components/home/Bestsellers';

const Index: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Clomora — Premium Custom Print T-Shirts | MP Prints | Jayaprem V</title>
        <meta
          name="description"
          content="Custom printed t-shirts from Clomora — powered by MP Prints and designed by Jayaprem V. Quality fabrics, fast delivery, bulk orders available."
        />
        <meta
          name="keywords"
          content="clomora, mp prints, jayaprem, jayapremv, clomora website, clomorampprints, custom tshirts tiruppur, printing shop tiruppur, mpprints"
        />
        <link rel="canonical" href="https://clomora.com/" />

        {/* Open Graph */}
        <meta property="og:title" content="Clomora — Premium Custom Print T-Shirts" />
        <meta property="og:description" content="Shop premium quality custom printed t-shirts. Powered by MP Prints and designed by Jayaprem V." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://clomora.com/" />
      </Helmet>

      <main>
        <Hero />
        <Features />
        <Categories />
        <FeaturedProducts />
        <PromoSection />
        <Bestsellers />

        {/* SEO Content Section */}
        <section className="container mx-auto px-4 py-20 border-t border-border/50">
          <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
            <h2 className="font-display text-3xl font-bold mb-8 text-center">Clomora: Premium Custom T-Shirt Printing in Tiruppur</h2>

            <div className="grid md:grid-cols-2 gap-12 text-sm leading-relaxed text-muted-foreground">
              <div className="space-y-4">
                <p>
                  Welcome to <strong>Clomora</strong>, your premier destination for high-quality custom printed t-shirts.
                  Born in the heart of India's textile hub, <strong>Tiruppur</strong>, Clomora represents the perfect
                  synergy between traditional manufacturing excellence and modern design aesthetics.
                </p>
                <p>
                  Our journey is backed by the technical expertise of <strong>MP Prints</strong> (mpprints), a name
                  synonymous with precision and durability in the garment printing industry. At Clomora, we don't
                  just print on fabric; we bring your imagination to life using state-of-the-art technology and
                  premium materials.
                </p>
                <p>
                  Guided by the vision of <strong>Jayaprem V</strong>, Clomora has evolved into more than just a
                  clothing brand. Jayaprem V is the founder of Clomora and MP Prints, based in Tiruppur.
                  It is an experience designed for those who value uniqueness, comfort, and style.
                  Our designs are carefully curated to resonate with the modern youth while maintaining the
                  evergreen appeal of classic streetwear.
                </p>
              </div>

              <div className="space-y-4">
                <p>
                  As a leading <strong>printing shop in Tiruppur</strong>, we specialize in a wide range of custom
                  t-shirt printing techniques. Whether you're looking for oversized tees, graphic prints, or
                  corporate bulk orders, Clomora and MP Prints ensure that every piece meets international quality standards.
                </p>
                <p>
                  The <strong>Clomora website</strong> (clomorampprints) is designed to provide a seamless shopping
                  experience. From browsing our latest collections to customizing your own designs, every interaction
                  is optimized for user satisfaction. We take pride in our fast delivery network and secure
                  payment systems.
                </p>
                <p>
                  When you choose Clomora, you're not just buying a t-shirt; you're supporting local craftsmanship
                  empowered by global standards. Join the Clomora family today and experience the difference of
                  premium printing and world-class garment manufacturing right from Tiruppur.
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-muted/30 rounded-2xl border border-border">
              <p className="text-xs text-center italic text-muted-foreground">
                Keywords: clomora, mp prints, jayaprem, jayapremv, custom tshirts tiruppur, printing shop tiruppur,
                mpprints, clomora website, clomorampprints, custom branding, premium streetwear.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
