import { useState, useEffect } from 'react';
import { Search, Loader2, Package, Truck, Home, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

interface OrderItem {
  id: number;
  quantity: number;
  product: { title: string; price: number; image: string };
}

interface TrackedOrder {
  id: number;
  customerName: string;
  totalAmount: number;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  shippingAddress: string;
  orderItems: OrderItem[];
}

export function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';
  const initialEmail = searchParams.get('email') || '';

  const [orderId, setOrderId] = useState(initialOrderId);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  useEffect(() => {
    if (initialOrderId && initialEmail) {
      const fetchInitial = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(initialOrderId)}&email=${encodeURIComponent(initialEmail)}`);
          if (!res.ok) throw new Error('Order not found. Please verify your details.');
          const data = await res.json();
          setOrder(data);
        } catch (err: any) {
          setError(err.message || 'Something went wrong.');
        } finally {
          setLoading(false);
        }
      };
      fetchInitial();
    }
  }, [initialOrderId, initialEmail]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email) {
      setError('Please provide both Order Number and Email.');
      return;
    }

    setError('');
    setLoading(true);
    setOrder(null);

    try {
      // Endpoint expects ?orderId=...&email=...
      const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        throw new Error('Order not found. Please verify your details.');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const statusMap = {
    'PENDING': 0,
    'SHIPPED': 1,
    'DELIVERED': 2,
    'CANCELLED': -1
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-medium text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Track Your Order
          </h1>
          <div className="w-16 h-1 bg-orange-600 mx-auto rounded-full mb-3"></div>
          <p className="text-gray-500 max-w-lg mx-auto">
            {!order 
              ? "Enter your order number and the email address used during checkout to receive real-time updates on your package."
              : "Live timeline status for your securely tracked package."}
          </p>
        </div>

        {/* Input Form */}
        {!order && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Order Number</label>
                <input 
                  type="text"
                  placeholder="e.g. #ORD-0012"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                />
              </div>
              <div className="flex items-end">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-medium px-8 py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5" /> Track Wait</>}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center border border-red-100">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Results UI */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header / Basic Info */}
            <div className="bg-gray-900 p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Order Confirmed On {new Date(order.createdAt).toLocaleDateString()}</p>
                <h2 className="text-2xl font-bold">#ORD-{order.id.toString().padStart(4, '0')}</h2>
              </div>
              <div className="md:text-right">
                <p className="text-gray-400 text-sm mb-1">Status</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold shadow-inner ${
                  order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 
                  order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 
                  'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${order.status === 'CANCELLED' ? 'bg-red-400' : 'bg-current animate-pulse'}`}></div>
                  {order.status}
                </div>
              </div>
            </div>

            {/* Timeline Graphic */}
            <div className="p-6 md:p-10 border-b border-gray-100">
              {order.status === 'CANCELLED' ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Order Cancelled</h3>
                  <p className="text-gray-500 mt-2 text-sm">Your order has been cancelled and any charges have been refunded.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 hidden sm:block"></div>
                  
                  {/* Dynamic Filled Progress */}
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600 -translate-y-1/2 z-0 hidden sm:block transition-all duration-1000 ease-in-out"
                    style={{ width: statusMap[order.status] === 0 ? '0%' : statusMap[order.status] === 1 ? '50%' : '100%' }}
                  ></div>

                  <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-8 sm:gap-0">
                    {/* Step 1: Processing */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-3 flex-1 sm:text-center group">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${statusMap[order.status] >= 0 ? 'bg-orange-600 border-orange-100 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${statusMap[order.status] >= 0 ? 'text-gray-900' : 'text-gray-400'}`}>Processing</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Order Confirmed</p>
                      </div>
                    </div>

                    {/* Step 2: Shipped */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-3 flex-1 sm:text-center group">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${statusMap[order.status] >= 1 ? 'bg-orange-600 border-orange-100 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${statusMap[order.status] >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Shipped</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Out for delivery</p>
                      </div>
                    </div>

                    {/* Step 3: Delivered */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-3 flex-1 sm:text-center group justify-end sm:justify-start">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${statusMap[order.status] >= 2 ? 'bg-green-600 border-green-100 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}>
                        <Home className="w-5 h-5" />
                      </div>
                      <div className="text-left sm:text-center">
                        <h4 className={`font-semibold ${statusMap[order.status] >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Delivered</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Arrived securely</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items Breakdown */}
            <div className="p-6 md:p-8 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">Items Included</h3>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                        <img 
                          src={item.product.image} 
                          alt={item.product.title} 
                          className="w-full h-full object-cover mix-blend-multiply"
                        />
                      </div>
                      <div>
                        <Link to={`/`} className="font-medium text-gray-900 hover:text-orange-600 transition truncate block max-w-[200px] md:max-w-md">
                          {item.product.title}
                        </Link>
                        <p className="text-gray-500 text-sm mt-0.5">Quantity: <span className="font-semibold text-gray-700">{item.quantity}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                <span className="font-medium text-gray-600">Total Paid</span>
                <span className="text-2xl font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
