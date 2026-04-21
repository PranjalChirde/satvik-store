import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, ShoppingBag, User, Package } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CartItem } from '../components/CartSidebar';

interface OrderState {
  customerName: string;
  items: CartItem[];
  totalAmount: number;
  orderId?: number;
}

export function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as OrderState | null;

  // If someone lands here directly without going through checkout, redirect home
  useEffect(() => {
    if (!state) {
      navigate('/', { replace: true });
      return;
    }
    window.scrollTo(0, 0);
    // Fire confetti celebration
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#f97316', '#fb923c', '#fdba74', '#ffffff', '#fbbf24'],
    });
  }, [state, navigate]);

  if (!state) return null;

  const { customerName, items, totalAmount, orderId } = state;

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-xl max-w-2xl w-full overflow-hidden"
      >
        {/* ── Top success banner ───────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-10 text-white text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <CheckCircle2 className="w-20 h-20 text-white drop-shadow-lg" />
          </motion.div>
          <h1
            className="text-3xl md:text-4xl mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Order Placed!
          </h1>
          <p className="text-orange-100 text-lg">
            Thank you, <span className="font-semibold text-white">{customerName}</span>. Your order is confirmed.
          </p>
          {orderId && (
            <p className="mt-3 text-sm font-mono bg-white/20 text-white inline-block px-4 py-1.5 rounded-full">
              Order ID: #ORD-{orderId.toString().padStart(4, '0')}
            </p>
          )}
        </div>

        {/* ── Delivery timeline chips ──────────────────────────────────────── */}
        <div className="flex justify-center gap-4 flex-wrap px-6 py-5 border-b border-gray-100 bg-orange-50">
          {[
            { label: 'Order Confirmed', done: true },
            { label: 'Dispatched in 24–48 hrs', done: false },
            { label: 'Delivered in 3–7 days', done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  step.done ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              />
              <span className={step.done ? 'text-orange-700 font-medium' : 'text-gray-500'}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Order summary ────────────────────────────────────────────────── */}
        <div className="px-6 md:px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-14 h-14 rounded-xl object-cover bg-gray-100 border border-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Total row */}
          <div className="flex justify-between items-center py-4 border-t border-gray-100">
            <span className="text-base font-semibold text-gray-900">Total Paid</span>
            <span className="text-xl font-bold text-orange-600">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* ── CTA buttons ──────────────────────────────────────────────────── */}
        <div className="px-6 md:px-8 pb-8 flex flex-col sm:flex-row gap-3">
          <Link
            to="/profile"
            className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-medium transition shadow-sm"
          >
            <User className="w-4 h-4" />
            View My Orders
          </Link>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:border-orange-400 hover:text-orange-600 text-gray-700 py-3 rounded-xl font-medium transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
