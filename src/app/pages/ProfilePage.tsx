import { useEffect, useState } from 'react';
import { Package, User, LogOut, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  id: number;
  quantity: number;
  product: { id: number; title: string; image: string; price: number };
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  contactEmail: string;
  createdAt: string;
  orderItems: OrderItem[];
}

interface ProfilePageProps {
  currentUser: { id: number; name: string; email: string } | null;
  onLogout: () => void;
}

export function ProfilePage({ currentUser, onLogout }: ProfilePageProps) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const statusStyle = (status: string) => {
    switch (status) {
      case 'SHIPPED':    return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELIVERED':  return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':  return 'bg-red-100 text-red-700 border-red-200';
      default:           return 'bg-amber-100 text-amber-800 border-amber-200'; // PENDING
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    
    // Fetch user's orders
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('/api/users/me/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar / User Info */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-1">{currentUser.name}</h2>
              <p className="text-gray-500 mb-6 text-sm">{currentUser.email}</p>
              
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full mb-3 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition flex items-center justify-center gap-2 font-medium shadow-sm"
                >
                  Enter Admin Dashboard
                </button>
              )}

              <button
                onClick={() => {
                  onLogout();
                  navigate('/');
                }}
                className="w-full py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition flex items-center justify-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* Orders History */}
          <div className="w-full md:w-2/3">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
                Your Orders
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-orange-50 text-orange-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">You haven't placed any orders with us. Start exploring our collection!</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg transition font-medium"
                >
                  Browse Store
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    {/* Order Header */}
                    <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-100 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 font-mono mb-1">#ORD-{order.id.toString().padStart(4, '0')}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Placed</p>
                        <p className="font-medium text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                        <p className="font-medium text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border tracking-wide ${statusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 pb-2">
                      <div className="space-y-4">
                        {order.orderItems.map(item => (
                          <div key={item.id} className="flex gap-4 items-center">
                            <img 
                              src={item.product.image} 
                              alt={item.product.title} 
                              className="w-16 h-16 object-cover rounded bg-gray-100 border border-gray-100"
                            />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 mb-0.5 line-clamp-1 hover:text-orange-600 cursor-pointer transition"
                                  onClick={() => navigate(`/product/${item.product.id}`)}>
                                {item.product.title}
                              </h4>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right font-medium text-gray-900">
                              ₹{(item.product.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Order Shipping Detail */}
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 m-4 rounded-xl mt-0 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Shipping Details</h5>
                        <p className="text-sm text-gray-600 leading-relaxed uppercase">{order.shippingAddress}</p>
                        <p className="text-sm text-gray-500 mt-1">Contact: {order.contactEmail}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/track-order?orderId=${encodeURIComponent('#ORD-' + order.id.toString().padStart(4, '0'))}&email=${encodeURIComponent(order.contactEmail)}`)}
                        className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition w-full sm:w-auto justify-center"
                      >
                        <Truck className="w-4 h-4"/> Track Package
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
