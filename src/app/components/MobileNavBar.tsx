import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User } from 'lucide-react';

interface AuthUser { id: number; name: string; email: string; }

interface MobileNavBarProps {
  cartCount: number;
  onCartClick: () => void;
  onUserClick?: () => void;
  currentUser?: AuthUser | null;
}

export function MobileNavBar({ cartCount, onCartClick, onUserClick, currentUser }: MobileNavBarProps) {
  const location = useLocation();

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[80] shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${location.pathname === '/' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Home className="w-5 h-5" strokeWidth={location.pathname === '/' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        
        <Link 
          to="/search" 
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${location.pathname.startsWith('/search') ? 'text-orange-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Search className="w-5 h-5" strokeWidth={location.pathname.startsWith('/search') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Search</span>
        </Link>
        
        <button 
          onClick={onCartClick}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-gray-500 hover:text-gray-900 transition-colors relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-orange-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full leading-none">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium mt-0.5">Cart</span>
        </button>
        
        {currentUser ? (
          <Link 
            to="/profile" 
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${location.pathname.startsWith('/profile') ? 'text-orange-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-[10px] ring-1 ring-orange-200">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        ) : (
          <button 
            onClick={onUserClick}
            className="flex flex-col items-center justify-center w-full h-full gap-1 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <User className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium mt-0.5">Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
}
