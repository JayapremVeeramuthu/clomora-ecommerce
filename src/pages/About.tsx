import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Truck, Award, Zap } from 'lucide-react';

const About: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>About Clomora — Premium Custom T-Shirts | MP Prints | Tiruppur</title>
                <meta
                    name="description"
                    content="Clomora is a modern custom T-shirt brand from Tiruppur, focused on premium fabrics and quality printing. Managed by founder Jayaprem V under MP Prints."
                />
            </Helmet>

            <main className="min-h-screen pt-32 pb-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Header Section */}
                        <div className="text-center mb-16 animate-fade-in">
                            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                                About Clomora — Built With Passion in Tiruppur
                            </h1>
                            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
                        </div>

                        {/* Main Content Sections */}
                        <div className="space-y-12 text-lg leading-relaxed text-muted-foreground">
                            <section className="bg-card border border-border p-8 rounded-2xl shadow-sm animate-slide-up">
                                <p className="mb-6">
                                    <strong>Clomora</strong> is a modern custom T-shirt brand from <strong>Tiruppur</strong>, focused on premium fabrics, clean streetwear style, and high-quality printing. We understand that a T-shirt is more than just clothing; it's a canvas for expression.
                                </p>
                                <p>
                                    Clomora operates under <strong>MP Prints</strong>, managed by founder <strong>Jayaprem V</strong>. We help individuals, influencers, brands, and businesses create premium custom apparel with fast delivery and reliable service. Our production flow is optimized to ensure that every single garment meets our internal quality benchmarks before it reaches your doorstep.
                                </p>
                            </section>

                            <div className="grid md:grid-cols-2 gap-8">
                                <section className="p-8 bg-secondary/30 rounded-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                    <div className="flex items-center gap-3 mb-4 text-primary">
                                        <Award className="w-6 h-6" />
                                        <h2 className="font-display text-2xl font-bold text-foreground">Why Tiruppur?</h2>
                                    </div>
                                    <p className="text-sm">
                                        Tiruppur is India’s textile hub, globally known for fabric quality and stitching standards. Our production partners ensure durability, comfort, and consistent print quality by leveraging the decades of expertise available in this region.
                                    </p>
                                </section>

                                <section className="p-8 bg-secondary/30 rounded-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                    <div className="flex items-center gap-3 mb-4 text-primary">
                                        <Zap className="w-6 h-6" />
                                        <h2 className="font-display text-2xl font-bold text-foreground">What We Offer</h2>
                                    </div>
                                    <ul className="text-sm space-y-2 list-disc list-inside">
                                        <li>Premium Custom T-Shirts</li>
                                        <li>Oversized & Graphic Tees</li>
                                        <li>Corporate & Bulk Orders</li>
                                        <li>Influencer Brand Merchandise</li>
                                        <li>Event & Promotional Printing</li>
                                        <li>Custom Hoodies & Apparel</li>
                                    </ul>
                                </section>
                            </div>

                            <section className="text-center py-10 border-t border-border mt-16 animate-fade-in">
                                <h3 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                                <p className="max-w-2xl mx-auto italic">
                                    "Our mission is simple — make premium customization affordable and accessible without compromising on the quality that the Tiruppur textile industry is famous for."
                                </p>
                            </section>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 pt-10 border-t border-border text-center">
                            <div className="flex flex-col items-center">
                                <ShieldCheck className="w-8 h-8 text-primary mb-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Quality Assured</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Truck className="w-8 h-8 text-primary mb-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Fast Delivery</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Award className="w-8 h-8 text-primary mb-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Expert Printing</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Zap className="w-8 h-8 text-primary mb-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Bulk Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default About;
