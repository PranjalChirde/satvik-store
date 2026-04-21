import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { Product } from './components/ProductCard';
import { CartSidebar, type CartItem } from './components/CartSidebar';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { CategoryPage } from './pages/CategoryPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { WishlistPage } from './pages/WishlistPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ToastProvider, useToast } from './components/Toast';
import { BackToTop } from './components/BackToTop';
import { MobileNavBar } from './components/MobileNavBar';

interface AuthUser { id: number; name: string; email: string; }

// ─── Page Transition Wrapper ──────────────────────────────────────────────
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// ─── Admin Protection Wrapper ───────────────────────────────────────────────
function AdminRoute({ currentUser, children }: { currentUser: AuthUser | null, children: React.ReactNode }) {
  // Hardcoded early-stage security: only this specific email can access Admin panel.
  if (!currentUser || currentUser.email !== 'prajwal4545@gmail.com') {
    return <Navigate to="/" replace />;
  }
  return <PageWrapper>{children}</PageWrapper>;
}

// ─── Inner app — inside BrowserRouter so hooks like useNavigate work ──────────
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // ── Global Scroll Restoration ─────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Cart — initialised from localStorage so it survives page refresh
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('satvik_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState<Product[]>([]);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('authUser');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  // ── Persist cart on every change ──────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('satvik_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ── Fetch product catalogue ───────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data: Product[]) => setProducts(data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ── Cart handlers ─────────────────────────────────────────────────────────
  const handleAddToCart = (productId: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      const product = products.find((p) => p.id === productId);
      if (product) return [...prev, { ...product, quantity: 1 }];
      return prev;
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + delta;
            // quantity hits 0 → remove the item entirely
            return newQuantity <= 0 ? null : { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  // ── Checkout ──────────────────────────────────────────────────────────────
  const clearCart = () => setCartItems([]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleAuthSuccess = (user: AuthUser, _token: string) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      <AnnouncementBar />
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onUserClick={currentUser ? undefined : () => setIsAuthOpen(true)}
        currentUser={currentUser}
      />
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        loggedInUser={currentUser}
      />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><HomePage products={products} onAddToCart={handleAddToCart} /></PageWrapper>} />
            <Route path="/product/:id" element={<PageWrapper><ProductPage onAddToCart={handleAddToCart} /></PageWrapper>} />
            <Route path="/category/:categoryId" element={<PageWrapper><CategoryPage onAddToCart={handleAddToCart} /></PageWrapper>} />
            <Route path="/search" element={<PageWrapper><SearchPage onAddToCart={handleAddToCart} /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper><ProfilePage currentUser={currentUser} onLogout={handleLogout} /></PageWrapper>} />
            <Route path="/admin" element={<AdminRoute currentUser={currentUser}><AdminDashboard /></AdminRoute>} />
            <Route path="/checkout" element={<PageWrapper><CheckoutPage cartItems={cartItems} clearCart={clearCart} currentUser={currentUser} /></PageWrapper>} />
            <Route path="/wishlist" element={<PageWrapper><WishlistPage onAddToCart={handleAddToCart} /></PageWrapper>} />
            <Route path="/track-order" element={<PageWrapper><TrackOrderPage /></PageWrapper>} />
            <Route path="/order-success" element={<PageWrapper><OrderSuccessPage /></PageWrapper>} />
            
            {/* Catch-all 404 Route */}
            <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Add empty padding at bottom so Mobile Nav doesn't overlap the absolute bottom footer on scroll */}
      <div className="md:hidden h-16 w-full" />
      <Footer />
      <MobileNavBar 
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onUserClick={currentUser ? undefined : () => setIsAuthOpen(true)}
        currentUser={currentUser}
      />
      <BackToTop />
    </div>
  );
}

// ─── Outer shell — only provides the Router context ───────────────────────────
export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ToastProvider>
  );
}