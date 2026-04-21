import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Star, StarHalf } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';

export interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images?: { id: number; url: string }[];
  badge?: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  onQuickView?: () => void;
}

export function ProductCard({ product, onAddToCart, onQuickView }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useWishlist();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  
  const handleToggleHeart = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group relative border border-gray-100 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Clickable Image and Info */}
      <Link to={`/product/${product.id}`} className="block relative">
        {/* Wishlist Heart Top Right */}
        <button 
          onClick={handleToggleHeart}
          className={`absolute z-10 top-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-sm transition-transform hover:scale-110 ${isFavorite(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
        >
          <Heart className="w-4 h-4" fill={isFavorite(product.id) ? 'currentColor' : 'none'} />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.badge && (
            <div className="bg-orange-600/95 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded shadow-sm uppercase font-bold tracking-wider w-fit">
              {product.badge}
            </div>
          )}
          {discount > 0 && (
            <div className="bg-red-600/95 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded shadow-sm uppercase font-bold tracking-wider w-fit">
              -{discount}% OFF
            </div>
          )}
        </div>

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Quick View Button */}
          {onQuickView && (
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView();
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
              className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-lg text-gray-800 p-3 rounded-full hover:bg-orange-600 hover:text-white transition-colors"
              title="Quick View"
            >
              <Eye className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col gap-1 flex-grow">
          <h3 className="text-sm font-medium leading-snug text-gray-800 line-clamp-2 h-10 group-hover:text-orange-600 transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-0.5">
            <div className="flex text-orange-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <StarHalf className="w-3.5 h-3.5 fill-current tracking-tighter" />
            </div>
            <span className="text-xs text-gray-400 ml-1">(4.5)</span>
          </div>

          <div className="flex items-center gap-2 mt-auto pt-1">
            <span className="text-base font-bold text-gray-900">
              ₹{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 font-medium line-through decoration-gray-300">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button - appears on hover */}
      <motion.button
        onClick={onAddToCart}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 20
        }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-0 left-0 right-0 bg-orange-600 text-white py-2.5 hover:bg-orange-700 transition font-medium text-sm"
      >
        Add to Cart
      </motion.button>
    </motion.div>
  );
}
