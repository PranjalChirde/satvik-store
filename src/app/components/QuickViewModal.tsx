import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Product } from './ProductCard';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: number) => void;
}

export function QuickViewModal({ product, isOpen, onClose, onAddToCart }: QuickViewModalProps) {
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    onAddToCart(product.id);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm shadow-2xl"
            onClick={onClose}
          />
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl bg-white rounded-2xl shadow-xl z-[70] overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur rounded-full hover:bg-gray-100 transition z-10"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            
            {/* Image side */}
            <div className="w-full md:w-1/2 bg-gray-50 relative aspect-square md:aspect-auto">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs px-3 py-1.5 rounded uppercase tracking-wider font-semibold">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Info Side */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                {product.category.replace('-', ' ')}
              </p>
              <h2 className="text-2xl md:text-3xl font-medium mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                {product.title}
              </h2>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-medium text-gray-900">
                  ₹{product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-red-600 line-through">
                    ₹{product.originalPrice.toFixed(2)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-semibold ml-auto">
                    Save {discount}%
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-1">
                {product.description ||
                  'A premium, spiritually authentic product meticulously sourced and crafted for your daily rituals. View the full page for detailed materials and shipping information.'}
              </p>
              
              <div className="mt-auto flex flex-col gap-3">
                <button
                  onClick={handleAdd}
                  className={`w-full py-3.5 rounded-lg flex justify-center items-center gap-2 font-medium transition ${
                    added ? 'bg-green-600 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md'
                  }`}
                >
                  {added ? <><Check className="w-5 h-5" /> Added to Cart</> : 'Add to Cart — ₹' + product.price.toFixed(2)}
                </button>
                <Link
                  to={`/product/${product.id}`}
                  onClick={onClose}
                  className="w-full py-3 text-center text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition font-medium"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
