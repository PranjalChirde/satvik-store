import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductGrid } from '../components/ProductGrid';
import type { Product } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoaders';
import hero1 from '../../assets/hero-1.png';
import hero2 from '../../assets/hero-2.png';
import hero3 from '../../assets/hero-3.png';

interface CategoryPageProps {
  onAddToCart: (productId: number) => void;
}

export function CategoryPage({ onAddToCart }: CategoryPageProps) {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    hero1,
    hero2,
    hero3,
  ];

  // Format categoryId to a readable title
  const formatTitle = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const title = categoryId ? formatTitle(categoryId) : 'Collection';

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    
    if (categoryId) {
      fetch(`/api/products?category=${categoryId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch category');
          return res.json();
        })
        .then((data) => {
          setProducts(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [categoryId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  return (
    <div className="bg-white min-h-screen">
      {/* Category Header Banner with Carousel */}
      <div className="relative h-[300px] md:h-[400px] bg-gray-900 overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={heroImages[currentSlide]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        <div className="relative z-10 text-center px-4 max-w-3xl pt-10">
          <motion.p 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-sm tracking-[0.2em] font-semibold uppercase mb-4 text-orange-400"
          >
            Exclusive Collection
          </motion.p>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-medium mb-6 text-white" 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {title}
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-gray-200 text-lg leading-relaxed max-w-xl mx-auto drop-shadow-md"
          >
            Discover our authentic and premium curation of {title.toLowerCase()}. Handcrafted with devotion, sourced ethically.
          </motion.p>
        </div>

        {/* Controls */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition z-20 backdrop-blur-sm">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition z-20 backdrop-blur-sm">
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${currentSlide === idx ? 'w-8 bg-orange-500' : 'w-4 bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
      </div>

      {/* Product Grid Layout */}
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <div className="text-center py-24 max-w-lg mx-auto">
            <div className="w-24 h-24 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Empty Collection</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              We are currently restocking our authentic {title.toLowerCase()}. Please check back soon or explore our other divine collections.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3.5 rounded-full font-medium transition shadow-md hover:shadow-lg"
            >
              Explore All Collections
            </button>
          </div>
        ) : (
          <ProductGrid products={products} onAddToCart={onAddToCart} />
        )}
      </div>
    </div>
  );
}
