import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Truck, MapPin, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from '../components/StripeCheckoutForm';
import { useToast } from '../components/Toast';
import type { CartItem } from '../components/CartSidebar';

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

interface CheckoutPageProps {
  cartItems: CartItem[];
  clearCart: () => void;
  currentUser: { name: string; email: string } | null;
}

type Step = 'shipping' | 'payment' | 'review';

export function CheckoutPage({ cartItems, clearCart, currentUser }: CheckoutPageProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>('shipping');
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discountPct: number} | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  // Form State
  const [shippingInfo, setShippingInfo] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');

  // If cart is empty, block checkout
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-medium mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          You need to add items to your cart before proceeding to checkout.
        </p>
        <Link to="/" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition">
          Return to Shop
        </Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmt = appliedPromo ? (subtotal * appliedPromo.discountPct) / 100 : 0;
  const subtotalAfterDiscount = subtotal - discountAmt;
  const shippingCost = subtotalAfterDiscount > 499 ? 0 : 50;
  const totalAmount = subtotalAfterDiscount + shippingCost;

  const handleNextStep = async () => {
    if (step === 'shipping') {
      const { fullName, email, address, city, pincode } = shippingInfo;
      if (!fullName || !email || !address || !city || !pincode) {
        showToast('Please fill out all shipping fields', 'error');
        return;
      }
      setStep('payment');
    } else if (step === 'payment') {
      if (paymentMethod === 'card') {
        try {
          setLoading(true);
          const res = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: totalAmount })
          });
          if (!res.ok) {
            throw new Error(`Server returned ${res.status}`);
          }
          const data = await res.json();
          setClientSecret(data.clientSecret);
        } catch (err) {
          showToast('Failed to initialize payment gateway', 'error');
          setLoading(false);
          return;
        } finally {
          setLoading(false);
        }
      }
      setStep('review');
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const fullAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} - ${shippingInfo.pincode}`;

      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName: shippingInfo.fullName,
          contactEmail: shippingInfo.email,
          shippingAddress: fullAddress,
          paymentMethod,
          items: orderItems,
          totalAmount,
          couponCode: appliedPromo?.code,
          discountAmt: discountAmt,
        }),
      });

      if (!res.ok) throw new Error('Checkout failed');

      // Extract orderId from response
      const orderData = await res.json();

      // Success
      const successItems = [...cartItems];
      clearCart();
      showToast('Order placed successfully!', 'success');
      navigate('/order-success', {
        state: { customerName: shippingInfo.fullName, items: successItems, totalAmount, orderId: orderData.id },
        replace: true
      });
    } catch (err) {
      console.error(err);
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-medium mb-8 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
          Checkout
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Checkout Area */}
          <div className="lg:w-2/3">
            
            {/* Progress Stepper */}
            <div className="flex justify-between relative mb-12 px-2">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
              
              <div className={`flex flex-col items-center gap-1 sm:gap-2 ${step === 'shipping' || step === 'payment' || step === 'review' ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 bg-white ${step === 'shipping' || step === 'payment' || step === 'review' ? 'border-orange-600' : 'border-gray-300'}`}>
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden sm:block">Shipping</span>
              </div>
              
              <div className={`flex flex-col items-center gap-1 sm:gap-2 ${step === 'payment' || step === 'review' ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 bg-white ${step === 'payment' || step === 'review' ? 'border-orange-600' : 'border-gray-300'}`}>
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden sm:block">Payment</span>
              </div>
              
              <div className={`flex flex-col items-center gap-1 sm:gap-2 ${step === 'review' ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 bg-white ${step === 'review' ? 'border-orange-600' : 'border-gray-300'}`}>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden sm:block">Review</span>
              </div>
            </div>

            {/* Stepper Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: SHIPPING */}
                {step === 'shipping' && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 text-xl font-medium mb-6">
                      <MapPin className="w-6 h-6 text-orange-600" /> Shipping Details
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={shippingInfo.fullName}
                          onChange={e => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          placeholder="Rajesh Kumar"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={shippingInfo.email}
                          onChange={e => setShippingInfo({...shippingInfo, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          placeholder="rajesh@example.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={shippingInfo.address}
                        onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="House no, Building, Street area"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={shippingInfo.city}
                          onChange={e => setShippingInfo({...shippingInfo, city: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={shippingInfo.state}
                          onChange={e => setShippingInfo({...shippingInfo, state: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          value={shippingInfo.pincode}
                          onChange={e => setShippingInfo({...shippingInfo, pincode: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                      <button onClick={handleNextStep} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition">
                        Continue to Payment
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: PAYMENT */}
                {step === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 text-xl font-medium mb-6">
                      <CreditCard className="w-6 h-6 text-orange-600" /> Payment Method
                    </div>
                    
                    <div className="space-y-3">
                      <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'card' ? 'border-orange-600 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                        <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-orange-600" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">Credit / Debit Card</h4>
                          <p className="text-sm text-gray-500 mt-0.5">Stripe Gateway (Simulated)</p>
                        </div>
                        <CreditCard className="w-6 h-6 text-gray-400" />
                      </label>
                      
                      <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'upi' ? 'border-orange-600 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                        <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="w-5 h-5 text-orange-600" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">UPI / QR Code</h4>
                          <p className="text-sm text-gray-500 mt-0.5">Pay via Google Pay, PhonePe, Paytm</p>
                        </div>
                        <div className="font-bold text-gray-400 tracking-wider">UPI</div>
                      </label>
                      
                      <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'cod' ? 'border-orange-600 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                        <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-orange-600" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">Cash on Delivery</h4>
                          <p className="text-sm text-gray-500 mt-0.5">Pay when your order arrives</p>
                        </div>
                        <Truck className="w-6 h-6 text-gray-400" />
                      </label>
                    </div>

                    <div className="pt-6 flex justify-between">
                      <button onClick={() => setStep('shipping')} className="text-gray-500 hover:text-orange-600 font-medium transition flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Shipping
                      </button>
                      <button onClick={handleNextStep} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition disabled:opacity-70 flex items-center gap-2">
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        Review Order
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: REVIEW */}
                {step === 'review' && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="flex items-center gap-2 text-xl font-medium mb-6">
                      <CheckCircle className="w-6 h-6 text-orange-600" /> Review & Confirm
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-900">Shipping Details</h4>
                        <button onClick={() => setStep('shipping')} className="text-orange-600 text-sm hover:underline">Edit</button>
                      </div>
                      <p className="text-sm text-gray-700">{shippingInfo.fullName}</p>
                      <p className="text-sm text-gray-700">{shippingInfo.email}</p>
                      <p className="text-sm text-gray-700">{shippingInfo.address}</p>
                      <p className="text-sm text-gray-700">{shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}</p>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-8">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">Payment Method</h4>
                        <button onClick={() => setStep('payment')} className="text-orange-600 text-sm hover:underline">Edit</button>
                      </div>
                      <p className="text-sm text-gray-700 uppercase">{paymentMethod}</p>
                    </div>

                    <div className="pt-6 flex justify-between items-center border-t border-gray-100">
                      <button onClick={() => setStep('payment')} className="text-gray-500 hover:text-orange-600 font-medium transition flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Payment
                      </button>
                      {paymentMethod !== 'card' && (
                        <button 
                          onClick={handlePlaceOrder} 
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-70"
                        >
                          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                          {loading ? 'Processing...' : 'Place Secure Order'}
                        </button>
                      )}
                    </div>

                    {/* Render Stripe if Selected */}
                    {paymentMethod === 'card' && clientSecret && (
                      <div className="mt-8 border-t border-gray-200">
                        {/* Do NOT pass clientSecret to Elements provider — CardElement doesn't need it.
                            Only the newer PaymentElement requires it. Passing a mock string here
                            causes Stripe to reject initialization entirely. */}
                        <Elements stripe={stripePromise}>
                          <StripeCheckoutForm clientSecret={clientSecret} onSuccess={handlePlaceOrder} />
                        </Elements>
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar / Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-medium mb-4 pb-4 border-b border-gray-100">Order Summary</h3>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded bg-gray-50 border border-gray-100" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
                {/* Promo Code Section */}
                <div className="mb-4">
                  {!appliedPromo ? (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                          placeholder="Promo code"
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase text-sm"
                        />
                        <button
                          onClick={async () => {
                            if (!promoCodeInput) return;
                            setPromoLoading(true);
                            setPromoError('');
                            try {
                              const res = await fetch('/api/coupons/validate', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ code: promoCodeInput })
                              });
                              const data = await res.json();
                              if (res.ok) {
                                setAppliedPromo({ code: promoCodeInput, discountPct: data.discountPct });
                                setPromoCodeInput('');
                              } else {
                                setPromoError(data.error || 'Invalid code');
                              }
                            } catch (e) {
                              setPromoError('Failed to apply code');
                            } finally {
                              setPromoLoading(false);
                            }
                          }}
                          disabled={promoLoading}
                          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-70"
                        >
                          {promoLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-emerald-800">'{appliedPromo.code}' Applied!</p>
                        <p className="text-xs text-emerald-600">{appliedPromo.discountPct}% OFF subtotal</p>
                      </div>
                      <button onClick={() => setAppliedPromo(null)} className="text-emerald-800 text-xs hover:underline font-medium">Remove</button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-₹{discountAmt.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-green-600 font-medium">Free</span> : `₹${shippingCost.toFixed(2)}`}</span>
                </div>
                
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-orange-600">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
