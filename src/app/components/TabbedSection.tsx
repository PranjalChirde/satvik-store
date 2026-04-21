import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductGrid } from './ProductGrid';
import { Product } from './ProductCard';

interface Tab {
  label: string;
  category: string;
}

interface TabbedSectionProps {
  title: string;
  tabs: Tab[];
  products: Product[];
  onAddToCart: (productId: number) => void;
}

export function TabbedSection({ title, tabs, products, onAddToCart }: TabbedSectionProps) {
  const [activeTab, setActiveTab] = useState(0);

  const filteredProducts = products.filter(
    (product) => product.category === tabs[activeTab].category
  );

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2
          className="text-4xl text-center mb-8"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {title}
        </h2>

        {/* Tabs */}
        <div className="flex justify-center gap-8 mb-12 border-b border-gray-200">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`pb-4 px-2 relative transition-colors ${
                activeTab === index
                  ? 'text-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {activeTab === index && (
                <motion.div
                  layoutId={`tab-${title}`}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ProductGrid products={filteredProducts} onAddToCart={onAddToCart} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
