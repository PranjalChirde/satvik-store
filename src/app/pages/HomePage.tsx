import React from 'react';
import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { TabbedSection } from '../components/TabbedSection';
import { DivineLuxe } from '../components/DivineLuxe';
import { MurtiSangrah } from '../components/MurtiSangrah';
import { TestimonialCarousel } from '../components/TestimonialCarousel';
import { TrustBar } from '../components/TrustBar';
import type { Product } from '../components/ProductCard';

interface HomePageProps {
  products: Product[];
  onAddToCart: (productId: number) => void;
}

export function HomePage({ products, onAddToCart }: HomePageProps) {
  // Filter products by category
  const bestSellers = products.filter((p) => p.category === 'bestsellers');
  const brassIdols = products.filter((p) => p.category === 'brass-idols');

  return (
    <>
      <Hero />

      {/* Best Sellers Section */}
      <section className="py-16 bg-[#FAF8F5]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl text-gray-900 font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Our Best Sellers
            </h2>
            <p className="text-gray-600 text-sm tracking-wide">
              Most Loved by Customers
            </p>
          </div>
          <ProductGrid products={bestSellers} onAddToCart={onAddToCart} theme="arch" />
        </div>
      </section>

      {/* Healing & Vastu Tabbed Section */}
      <TabbedSection
        title="Healing & Vastu"
        tabs={[
          { label: 'Our Combos', category: 'healing-combos' },
          { label: 'Yantra & Plates', category: 'healing-yantra' },
          { label: 'Healing Gifts', category: 'healing-gifts' },
        ]}
        products={products}
        onAddToCart={onAddToCart}
      />

      {/* Divine Luxe Illumination Banner */}
      <DivineLuxe products={products} onAddToCart={onAddToCart} />

      {/* Jap Mala Collection Tabbed Section */}
      <TabbedSection
        title="Jap Mala Collection"
        tabs={[
          { label: 'Tulsi', category: 'mala-tulsi' },
          { label: 'Karungali', category: 'mala-karungali' },
          { label: 'Sandalwood', category: 'mala-sandalwood' },
          { label: 'Rudraksha', category: 'mala-rudraksha' },
        ]}
        products={products}
        onAddToCart={onAddToCart}
      />

      {/* Daily Puja Essentials Tabbed Section */}
      <TabbedSection
        title="Daily Puja Essentials"
        tabs={[
          { label: 'Incense', category: 'puja-incense' },
          { label: 'Puja Samagri', category: 'puja-samagri' },
          { label: 'Ghee Wicks', category: 'puja-wicks' },
        ]}
        products={products}
        onAddToCart={onAddToCart}
      />

      {/* Murti Sangrah - High Ticket Items */}
      <MurtiSangrah products={brassIdols} onAddToCart={onAddToCart} />

      {/* Testimonials Section */}
      <TestimonialCarousel />

      {/* Trust Bar */}
      <TrustBar />
    </>
  );
}
