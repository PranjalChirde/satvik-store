import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, ChevronRight, Tag, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Product } from './ProductCard';

export interface CartItem extends Product {
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  loggedInUser?: { name: string } | null;
}

export function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
}: CartSidebarProps) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalOriginal = cartItems.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
  const totalSavings = totalOriginal - totalAmount;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const FREE_SHIPPING_THRESHOLD = 999;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - totalAmount;
  const progressPercentage = Math.min((totalAmount / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const handleProceedToCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!mounted && !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Sidebar Panel */}
          <motion.div
            key="sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-[420px] z-50 flex flex-col"
            style={{ background: '#FAF8F5' }}
          >
            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="relative px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #E8E2D9' }}>
              {/* Decorative top gold line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-t-none" />

              <div className="flex items-start justify-between mt-1">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <ShoppingBag className="w-5 h-5 text-orange-600" />
                    <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Your Sacred Cart
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 ml-7">
                    {totalItems === 0
                      ? 'Nothing added yet'
                      : `${totalItems} item${totalItems > 1 ? 's' : ''} selected`}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-full transition-all duration-200 text-gray-500 hover:text-gray-900 hover:rotate-90"
                  style={{ transition: 'all 0.2s' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── Free Shipping Progress ───────────────────────────────── */}
            <AnimatePresence>
              {cartItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 py-3 flex flex-col gap-2"
                  style={{ background: amountToFreeShipping <= 0 ? '#F0FDF4' : '#FFF8F0', borderBottom: '1px solid #E8E2D9' }}
                >
                  <div className="flex items-center gap-2">
                    <Truck className={`w-4 h-4 shrink-0 ${amountToFreeShipping <= 0 ? 'text-green-600' : 'text-orange-500'}`} />
                    {amountToFreeShipping > 0 ? (
                      <p className="text-xs text-gray-700">
                        Add <span className="font-bold text-orange-600">₹{amountToFreeShipping.toFixed(0)}</span> more to unlock <span className="font-semibold">Free Shipping</span>
                      </p>
                    ) : (
                      <p className="text-xs text-green-700 font-semibold">🎉 Free Shipping Unlocked!</p>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${amountToFreeShipping <= 0 ? 'bg-green-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Cart Items ───────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin">
              {cartItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center pt-10 pb-20"
                >
                  <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-5 border-2 border-dashed border-orange-200">
                    <ShoppingBag className="w-10 h-10 text-orange-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-gray-500 max-w-[220px] leading-relaxed mb-6">
                    Explore our sacred collection and bring divine energy into your home.
                  </p>
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-400 px-5 py-2.5 rounded-full transition-all"
                  >
                    Continue Shopping <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 group"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                            {item.title}
                          </h3>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="shrink-0 p-1.5 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity Stepper */}
                          <div className="flex items-center gap-1 bg-gray-100 rounded-full px-1 py-1">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              ₹{(item.price * item.quantity).toFixed(0)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-[10px] text-gray-400">₹{item.price.toFixed(0)} each</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* ── Footer Summary & Checkout ─────────────────────────── */}
            {cartItems.length > 0 && (
              <div className="px-6 pt-4 pb-6 space-y-3" style={{ borderTop: '1px solid #E8E2D9', background: '#FAF8F5' }}>

                {/* Savings badge */}
                {totalSavings > 0.5 && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-xs px-3 py-2 rounded-xl">
                    <Tag className="w-3.5 h-3.5 shrink-0" />
                    <span>You're saving <strong>₹{totalSavings.toFixed(0)}</strong> on this order!</span>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal ({totalItems} item{totalItems > 1 ? 's' : ''})</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span className={amountToFreeShipping <= 0 ? 'text-green-600 font-medium' : ''}>
                      {amountToFreeShipping <= 0 ? 'FREE' : `₹${(49).toFixed(0)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-2" style={{ borderTop: '1px dashed #E8E2D9' }}>
                    <span>Total</span>
                    <span>₹{(totalAmount + (amountToFreeShipping <= 0 ? 0 : 49)).toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button with shimmer */}
                <button
                  onClick={handleProceedToCheckout}
                  className="relative w-full overflow-hidden bg-gradient-to-r from-orange-600 to-amber-500 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-lg hover:shadow-orange-200 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  {/* Shimmer effect */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                  Proceed to Checkout
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                  🔒 Secure checkout · 100% authentic products
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
