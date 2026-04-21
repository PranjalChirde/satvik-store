import { useState, useEffect } from 'react';
import { Search, User, ShoppingCart, Menu, X, ChevronDown, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';

interface AuthUser { id: number; name: string; email: string; }

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onUserClick?: () => void;
  currentUser?: AuthUser | null;
}

export function Header({ cartCount, onCartClick, onUserClick, currentUser }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { favorites } = useWishlist();

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setShowDropdown(true);
      const delayDebounceFn = setTimeout(() => {
        fetch('/api/products')
          .then(res => res.json())
          .then((data: any[]) => {
            const q = searchQuery.toLowerCase();
            const filtered = data.filter(p =>
              p.title.toLowerCase().startsWith(q)
            );
            setSearchResults(filtered.slice(0, 4));
          })
          .catch(err => console.error(err));
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const categories = [
    { name: 'Best Sellers', to: '/category/bestsellers' },
    { name: 'Brass Idols', to: '/category/brass-idols' },
    { name: 'Healing Combos', to: '/category/healing-combos' },
    { name: 'Jap Malas', to: '/category/mala-rudraksha' },
    { name: 'Puja Essentials', to: '/category/puja-samagri' },
  ];

  const closeMobile = () => {
    setMobileMenuOpen(false);
    setShopOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top Row */}
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" onClick={closeMobile} className="flex-shrink-0">
            <h1 className="text-xl md:text-3xl tracking-wider" style={{ fontFamily: 'Playfair Display, serif' }}>
              SATVIK STORE
            </h1>
          </Link>

          {/* Search Bar — hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchQuery.length > 0) setShowDropdown(true); }}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 300)}
                  placeholder="Search for spiritual products..."
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 transition">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
            
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="flex flex-col">
                    {searchResults.map(p => (
                      <div 
                        key={p.id} 
                        className="flex items-center gap-3 p-3 hover:bg-orange-50 cursor-pointer transition border-b border-gray-50 last:border-0"
                        onMouseDown={(e) => {
                          e.preventDefault(); // prevents input blur from firing first
                          setSearchQuery('');
                          setShowDropdown(false);
                          navigate(`/product/${p.id}`);
                        }}
                      >
                        <img 
                          src={p.image} 
                          alt={p.title} 
                          className="w-10 h-10 object-cover rounded bg-gray-100" 
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{p.category.replace('-', ' ')} • <span className="text-orange-600 font-medium">₹{p.price}</span></p>
                        </div>
                      </div>
                    ))}
                    <div 
                      className="bg-gray-50 p-2 text-center text-xs font-semibold text-orange-600 cursor-pointer hover:bg-gray-100 transition"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const q = searchQuery.trim();
                        if (q) {
                          setShowDropdown(false);
                          setSearchQuery('');
                          navigate(`/search?q=${encodeURIComponent(q)}`);
                        }
                      }}
                    >
                      View all results for "{searchQuery}"
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No products found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link
              to="/wishlist"
              className="relative hover:text-orange-600 transition hidden md:block"
              aria-label="Wishlist"
            >
              <Heart className="w-6 h-6" />
              {favorites.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {favorites.length}
                </span>
              )}
            </Link>
            
            {currentUser ? (
              <div className="hidden md:flex items-center gap-3">
                {currentUser.email === 'prajwal4545@gmail.com' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 hover:bg-red-50 transition bg-red-100/50 border border-red-200 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="hover:text-orange-600 transition"
                  title={`Logged in as ${currentUser.name} - Click for profile`}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-semibold text-sm shadow-sm ring-1 ring-orange-200">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                </Link>
              </div>
            ) : (
              <button
                className="hover:text-orange-600 transition hidden md:block"
                onClick={onUserClick}
                aria-label="Sign in"
              >
                <User className="w-6 h-6" />
              </button>
            )}
            <button
              className="relative hover:text-orange-600 transition"
              onClick={onCartClick}
              aria-label="Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden hover:text-orange-600 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="border-t border-gray-200 hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-8 py-3">
            <li>
              <Link to="/" className="text-sm tracking-wide hover:text-orange-600 transition duration-200">
                HOME
              </Link>
            </li>

            {/* SHOP dropdown */}
            <li className="relative group">
              <span className="text-sm tracking-wide hover:text-orange-600 transition duration-200 cursor-pointer flex items-center gap-1">
                SHOP <ChevronDown className="w-3 h-3" />
              </span>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px]">
                <div className="bg-white shadow-xl rounded-lg py-3 px-2 border border-gray-100">
                  {categories.map((cat, i) => (
                    <Link
                      key={i}
                      to={cat.to}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </li>

            <li>
              <Link to="/category/healing-gifts" className="text-sm tracking-wide hover:text-orange-600 transition duration-200">
                HEALING & WELLNESS
              </Link>
            </li>
            <li>
              <Link to="/category/brass-idols" className="text-sm tracking-wide hover:text-orange-600 transition duration-200">
                IDOLS
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          {/* Mobile Search */}
          <div className="px-4 py-3 border-b border-gray-100">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-600 text-white p-2 rounded-full">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Mobile Nav Links */}
          <nav className="px-4 py-2">
            <Link to="/" onClick={closeMobile} className="block py-3 text-sm font-medium border-b border-gray-100 hover:text-orange-600 transition">
              HOME
            </Link>
            
            {currentUser ? (
              <div className="border-b border-gray-100">
                <Link to="/profile" onClick={closeMobile} className="block py-3 text-sm font-medium hover:text-orange-600 transition">
                  MY PROFILE
                </Link>
                {currentUser.email === 'prajwal4545@gmail.com' && (
                  <Link to="/admin" onClick={closeMobile} className="block py-3 text-sm font-bold text-red-600 hover:text-red-700 transition">
                    ADMIN DASHBOARD
                  </Link>
                )}
              </div>
            ) : (
              <button 
                onClick={() => { closeMobile(); onUserClick?.(); }} 
                className="w-full text-left py-3 text-sm font-medium border-b border-gray-100 hover:text-orange-600 transition"
              >
                SIGN IN / REGISTER
              </button>
            )}
            <Link to="/wishlist" onClick={closeMobile} className="block py-3 text-sm font-medium border-b border-gray-100 hover:text-orange-600 transition flex items-center justify-between">
              WISHLIST
              {favorites.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* SHOP accordion on mobile */}
            <div className="border-b border-gray-100">
              <button
                className="w-full flex items-center justify-between py-3 text-sm font-medium hover:text-orange-600 transition"
                onClick={() => setShopOpen(!shopOpen)}
              >
                SHOP
                <ChevronDown className={`w-4 h-4 transition-transform ${shopOpen ? 'rotate-180' : ''}`} />
              </button>
              {shopOpen && (
                <div className="pl-4 pb-2 space-y-1">
                  {categories.map((cat, i) => (
                    <Link
                      key={i}
                      to={cat.to}
                      onClick={closeMobile}
                      className="block py-2 text-sm text-gray-600 hover:text-orange-600 transition"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/category/healing-gifts" onClick={closeMobile} className="block py-3 text-sm font-medium border-b border-gray-100 hover:text-orange-600 transition">
              HEALING & WELLNESS
            </Link>
            <Link to="/category/brass-idols" onClick={closeMobile} className="block py-3 text-sm font-medium hover:text-orange-600 transition">
              IDOLS
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
