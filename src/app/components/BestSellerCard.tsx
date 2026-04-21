import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import type { Product } from './ProductCard';

interface BestSellerCardProps {
  product: Product;
  onAddToCart: () => void;
  onQuickView?: () => void;
}

export function BestSellerCard({ product, onAddToCart, onQuickView }: BestSellerCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useWishlist();

  const handleToggleHeart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div
      className="bg-white flex flex-col items-center p-3 sm:p-4 rounded-t-[1000px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 group h-full relative border border-gray-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="flex flex-col items-center w-full flex-grow relative">
        <button 
          onClick={handleToggleHeart}
          className={`absolute z-20 top-6 right-6 bg-white/80 backdrop-blur p-2 rounded-full shadow-sm transition-transform hover:scale-110 ${isFavorite(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
        >
          <Heart className="w-4 h-4" fill={isFavorite(product.id) ? 'currentColor' : 'none'} />
        </button>

        <div className="w-full aspect-[3/4] rounded-t-[1000px] overflow-hidden relative mb-5 bg-gray-50">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          
          {onQuickView && (
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView();
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
              className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-lg text-gray-800 p-3 rounded-full hover:bg-gray-900 hover:text-white transition-colors"
              title="Quick View"
            >
              <Eye className="w-5 h-5" />
            </motion.button>
          )}

          {product.badge && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-orange-600/95 backdrop-blur-sm text-white text-[10px] px-3 py-1 rounded-full shadow-sm uppercase font-bold tracking-wider whitespace-nowrap z-10">
              {product.badge}
            </div>
          )}
        </div>

        <div className="px-2 text-center flex flex-col items-center gap-1.5 flex-grow">
          <h3 className="font-bold text-[14px] md:text-[15px] leading-snug line-clamp-2 text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            {product.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 mb-2">
            <span className="text-[15px] font-bold text-gray-900">
              ₹{product.price.toFixed(0)}
            </span>
            {product.originalPrice && (
              <span className="text-[12px] text-gray-400 line-through">
                ₹{product.originalPrice.toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="mt-2 mb-2 w-full flex justify-center">
        <button
          onClick={onAddToCart}
          className="border border-gray-900 text-gray-900 bg-white hover:bg-gray-900 hover:text-white px-6 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-300"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
}
