import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import hero1 from '../../assets/hero-1.png';
import hero2 from '../../assets/hero-2.png';
import hero3 from '../../assets/hero-3.png';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  ctaLink: string;
}

const slides: HeroSlide[] = [
  {
    id: 1,
    title: 'Sacred Brass Idols',
    subtitle: 'Handcrafted Ganesha, Lakshmi & More',
    image: hero1,
    cta: 'Shop Idols',
    ctaLink: '/category/brass-idols',
  },
  {
    id: 2,
    title: 'Astro Products',
    subtitle: 'Yantras, Gemstones & Cosmic Energisers',
    image: hero2,
    cta: 'Explore Now',
    ctaLink: '/category/bestsellers',
  },
  {
    id: 3,
    title: 'Puja Essentials',
    subtitle: 'Everything for Your Daily Rituals',
    image: hero3,
    cta: 'View Collection',
    ctaLink: '/category/puja-samagri',
  }
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[500px] overflow-hidden bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            draggable={false}
          />
          <div className="absolute inset-0 z-10 bg-black/45 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-sm uppercase tracking-[0.3em] text-orange-300 font-semibold mb-3"
              >
                Satvik Store
              </motion.p>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-5xl md:text-6xl mb-4"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-lg md:text-xl mb-8 text-white/90"
              >
                {slides[currentSlide].subtitle}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <Link
                  to={slides[currentSlide].ctaLink}
                  className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-10 py-3.5 rounded-full transition font-semibold text-base shadow-lg hover:shadow-orange-600/40"
                >
                  {slides[currentSlide].cta}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}