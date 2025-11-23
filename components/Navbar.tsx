
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Code, BookOpen, Info, HelpCircle, GraduationCap, User, LogOut } from 'lucide-react';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'الرئيسية', path: '/', icon: null },
    { name: 'الدورات', path: '/courses', icon: <GraduationCap size={18} /> },
    { name: 'المحاكي', path: '/simulator', icon: <Code size={18} /> },
    { name: 'المتجر', path: '/store', icon: <ShoppingBag size={18} /> },
    { name: 'من نحن', path: '/about', icon: <Info size={18} /> },
    { name: 'التوثيق', path: '/docs', icon: <BookOpen size={18} /> },
    { name: 'الدعم', path: '/support', icon: <HelpCircle size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-primary/95 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 transition duration-300 hover:opacity-80">
              <Logo size="md" />
            </Link>
          </div>
          
          <div className="hidden lg:block">
            <div className="flex items-baseline space-x-1 space-x-reverse">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 relative ${
                    isActive(link.path)
                      ? 'text-highlight bg-highlight/10 border border-highlight/20'
                      : 'text-gray-300 hover:text-highlight hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* Standalone Cart Icon */}
            <Link to="/store" className="group relative p-2 mr-2 text-gray-300 hover:text-highlight transition-colors">
               <ShoppingBag size={24} className="transform group-hover:scale-110 transition duration-300" />
               {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center border border-primary shadow-sm animate-bounce-short">
                    {cartCount}
                  </span>
               )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 text-gray-300 hover:text-white transition">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold border border-white/10">
                    {user.name[0]}
                  </div>
                  <span className="text-sm font-bold max-w-[100px] truncate">{user.name}</span>
                </Link>
                <button onClick={logout} className="text-gray-500 hover:text-red-400 transition p-1" title="تسجيل الخروج">
                   <LogOut size={20} />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-highlight text-sm font-bold transition font-latin">
                  Login
                </Link>
                <Link to="/register" className="bg-accent hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-lg shadow-accent/20">
                  ابدا الآن
                </Link>
              </>
            )}
          </div>

          <div className="-mr-2 flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-highlight hover:bg-white/5 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-secondary border-b border-white/5">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-3 py-3 rounded-md text-base font-bold justify-between ${
                  isActive(link.path)
                    ? 'text-highlight bg-highlight/10'
                    : 'text-gray-300 hover:text-highlight hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  {link.icon}
                  {link.name}
                </div>
                {link.path === '/store' && cartCount > 0 && (
                  <span className="bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 mt-2 flex flex-col gap-3 p-2">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-bold text-white bg-white/5">
                     <User size={20} />
                     <span>{user.name}</span>
                  </Link>
                  <button onClick={() => {logout(); setIsOpen(false);}} className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-bold text-red-400 hover:bg-red-500/10">
                     <LogOut size={20} />
                     <span>تسجيل الخروج</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center w-full px-3 py-3 rounded-md text-base font-bold text-gray-300 hover:bg-white/5">
                    تسجيل الدخول
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block text-center w-full px-3 py-3 rounded-md text-base font-bold bg-accent text-white hover:opacity-90">
                    حساب جديد
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
