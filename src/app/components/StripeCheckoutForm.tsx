import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, Lock, CreditCard } from 'lucide-react';

interface StripeCheckoutFormProps {
  clientSecret: string;
  onSuccess: () => void;
}

// ─── Mock Card Form (plain HTML — no Stripe iframe) ──────────────────────────
function MockCardForm({ onSuccess }: { onSuccess: () => void }) {
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const formatCard = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    if (digits.length === 2) return `${digits} / `;
    return digits;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const rawCard = cardNum.replace(/\s/g, '');
    const rawExpiry = expiry.replace(/\s/g, '').replace('/', '');

    if (rawCard.length !== 16) { setError('Please enter a valid 16-digit card number.'); return; }
    if (rawExpiry.length !== 4) { setError('Please enter a valid expiry date (MM/YY).'); return; }
    
    const month = parseInt(rawExpiry.slice(0, 2), 10);
    const year = parseInt('20' + rawExpiry.slice(2), 10);
    const now = new Date();
    if (month < 1 || month > 12 || year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
      setError('Your card expiration date is invalid or in the past.'); return;
    }
    if (cvc.length < 3) { setError('Please enter a valid CVC.'); return; }

    setProcessing(true);
    setTimeout(() => { setProcessing(false); onSuccess(); }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-5 border border-gray-200 rounded-xl bg-gray-50">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-4 h-4 text-green-600" />
        <span className="text-sm font-semibold text-gray-700">Secure Card Payment (Simulated)</span>
        <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Test Mode</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Card Number</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={cardNum}
              onChange={e => setCardNum(formatCard(e.target.value))}
              placeholder="4242 4242 4242 4242"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
            />
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
            <input
              type="text"
              inputMode="numeric"
              value={expiry}
              onChange={e => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM / YY"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">CVC</label>
            <input
              type="text"
              inputMode="numeric"
              value={cvc}
              onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="123"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>
      )}

      <button
        type="submit"
        disabled={processing}
        className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition disabled:opacity-70 flex justify-center items-center gap-2"
      >
        {processing ? <><Loader2 className="animate-spin w-5 h-5" /> Processing Payment...</> : <><Lock className="w-4 h-4" /> Confirm & Pay</>}
      </button>
      <p className="text-xs text-center text-gray-400 mt-2">🔒 This is a simulated payment. No real charge will occur.</p>
    </form>
  );
}

// ─── Real Stripe Card Form (uses Stripe iframe) ───────────────────────────────
function RealStripeForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! }
    });

    if (result.error) {
      setError(result.error.message || 'Payment failed.');
      setProcessing(false);
    } else if (result.paymentIntent?.status === 'succeeded') {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-5 border border-gray-200 rounded-xl bg-gray-50">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-4 h-4 text-green-600" />
        <span className="text-sm font-semibold text-gray-700">Stripe Secure Payment</span>
      </div>
      <div className="p-4 bg-white rounded-md border border-gray-300">
        <CardElement options={{ style: { base: { fontSize: '16px', color: '#374151', '::placeholder': { color: '#9CA3AF' } }, invalid: { color: '#EF4444' } } }} />
      </div>
      {error && <div className="mt-3 text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
      <button type="submit" disabled={!stripe || processing}
        className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition disabled:opacity-70 flex justify-center items-center gap-2">
        {processing ? <><Loader2 className="animate-spin w-5 h-5" /> Processing...</> : 'Pay Now'}
      </button>
    </form>
  );
}

// ─── Exported wrapper — switches between mock and real ────────────────────────
export function StripeCheckoutForm({ clientSecret, onSuccess }: StripeCheckoutFormProps) {
  if (clientSecret === 'mock_secret_key') {
    return <MockCardForm onSuccess={onSuccess} />;
  }
  return <RealStripeForm clientSecret={clientSecret} onSuccess={onSuccess} />;
}
