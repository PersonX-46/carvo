'use client'
// components/Navbar.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NavBar(){
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <>
      <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'w-12/12 max-w-4xl scale-95' 
          : 'w-11/12 max-w-6xl'
      }`}>
        {/* Outer glow effect */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-amber-400/20 blur-xl transition-opacity duration-500 ${
          isScrolled ? 'opacity-50' : 'opacity-30'
        }`}></div>
        
        {/* Main nav container */}
        <div className={`relative rounded-2xl border border-amber-400/30 backdrop-blur-xl transition-all duration-500 ${
          isScrolled 
            ? 'bg-gray-900/80 dark:bg-gray-900/90 shadow-2xl shadow-amber-500/10' 
            : 'bg-gray-900/60 dark:bg-gray-900/80 shadow-lg shadow-amber-500/5'
        }`}>
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/10 via-amber-400/10 to-orange-400/10 animate-pulse"></div>
          
          {/* Scan line effect */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-scan"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-3">
            <div className="flex justify-between items-center">
              {/* Logo with sci-fi style */}
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center group" onClick={() => setActiveTab('home')}>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg shadow-amber-400/20">
                      <span className="text-white font-bold text-xl">C</span>
                    </div>
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-amber-400 rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                  </div>
                  <span className="ml-3 text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                    CARVO
                  </span>
                </Link>
              </div>

              {/* Desktop Menu with sci-fi tabs */}
              <div className="hidden md:block">
                <div className="flex items-center space-x-1 rounded-xl p-1 ml-6 mr-6">
                  {['home', 'services', 'features', 'about', 'contact'].map((tab) => (
                    <Link 
                      key={tab}
                      href={`/${tab === 'home' ? '' : tab}`}
                      className={`relative px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform ${
                        activeTab === tab
                          ? 'text-white bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-amber-400/30 scale-105'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {activeTab === tab && (
                        <>
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/10 to-amber-400/10 animate-pulse"></div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full animate-ping"></div>
                        </>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right side items */}
              <div className="flex items-center space-x-3">
                {/* Theme Toggle with sci-fi style */}
                <button
                  onClick={toggleDarkMode}
                  className="relative p-2 rounded-xl bg-gray-800/50 border border-amber-400/20 text-amber-300 hover:text-amber-400 transition-all duration-300 hover:scale-110 hover:border-amber-400/40 group"
                  aria-label="Toggle theme"
                >
                  <div className="absolute inset-0 rounded-xl bg-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {darkMode ? (
                    <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>

                {/* Login Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                    className="hidden md:flex items-center space-x-2 bg-gray-800/50 border border-amber-400/20 text-amber-300 hover:text-amber-400 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 hover:border-amber-400/40 group"
                  >
                    <span className="text-lg">🔑</span>
                    <span className="font-medium">Login</span>
                    <svg className={`w-4 h-4 transition-transform ${isLoginDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Login Dropdown Menu */}
                  {isLoginDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-amber-400/30 rounded-xl shadow-2xl shadow-amber-500/20 py-2 z-50 animate-slideDown">
                      <Link
                        href="/login?type=customer"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-amber-500/10 transition-all group"
                        onClick={() => setIsLoginDropdownOpen(false)}
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">👤</span>
                        <div>
                          <div className="font-medium">Customer Login</div>
                          <div className="text-xs text-gray-400">Book & track services</div>
                        </div>
                      </Link>
                      
                      <Link
                        href="/login?type=worker"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-amber-500/10 transition-all group"
                        onClick={() => setIsLoginDropdownOpen(false)}
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">🔧</span>
                        <div>
                          <div className="font-medium">Worker Login</div>
                          <div className="text-xs text-gray-400">Service management</div>
                        </div>
                      </Link>
                      
                      <Link
                        href="/login?type=admin"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-amber-500/10 transition-all group"
                        onClick={() => setIsLoginDropdownOpen(false)}
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">⚙️</span>
                        <div>
                          <div className="font-medium">Admin Login</div>
                          <div className="text-xs text-gray-400">Workshop administration</div>
                        </div>
                      </Link>

                      <div className="border-t border-amber-400/20 mt-2 pt-2">
                        <Link
                          href="/register"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all group"
                          onClick={() => setIsLoginDropdownOpen(false)}
                        >
                          <span className="text-lg group-hover:scale-110 transition-transform">✨</span>
                          <div>
                            <div className="font-medium">Register as Customer</div>
                            <div className="text-xs text-amber-400/70">Create new account</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Book Service Button */}
                <Link 
                  href="/book-service" 
                  className="hidden md:block relative group"
                  onClick={() => setActiveTab('book')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl blur-md group-hover:blur-lg transition-all duration-300 opacity-70"></div>
                  <div className="relative z-10 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-6 py-2 rounded-xl font-medium transition-all transform group-hover:scale-105 shadow-lg border border-amber-400/30">
                    Book Service
                  </div>
                </Link>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-xl bg-gray-800/50 border border-amber-400/20 text-amber-300 hover:text-amber-400 transition-all duration-300 hover:scale-110"
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu with sci-fi style */}
            {isMenuOpen && (
              <div className="md:hidden mt-4 bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 animate-slideDown">
                <div className="space-y-2">
                  {['home', 'services', 'features', 'about', 'contact'].map((tab) => (
                    <Link 
                      key={tab}
                      href={`/${tab === 'home' ? '' : tab}`}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        activeTab === tab
                          ? 'text-white bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-amber-400/30'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }`}
                      onClick={() => {
                        setActiveTab(tab);
                        setIsMenuOpen(false);
                      }}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Link>
                  ))}
                  
                  {/* Mobile Login Options */}
                  <div className="pt-2 border-t border-amber-400/20">
                    <div className="space-y-2">
                      <Link 
                        href="/login?type=customer"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm bg-gray-700/50 border border-amber-400/20 text-amber-300 hover:text-white hover:bg-amber-500/10 transition-all"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>👤</span>
                        <span>Customer Login</span>
                      </Link>
                      
                      <Link 
                        href="/login?type=worker"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm bg-gray-700/50 border border-amber-400/20 text-amber-300 hover:text-white hover:bg-amber-500/10 transition-all"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>🔧</span>
                        <span>Worker Login</span>
                      </Link>
                      
                      <Link 
                        href="/login?type=admin"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm bg-gray-700/50 border border-amber-400/20 text-amber-300 hover:text-white hover:bg-amber-500/10 transition-all"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>⚙️</span>
                        <span>Admin Login</span>
                      </Link>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <Link 
                        href="/register"
                        className="block w-full text-center bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-amber-400 border border-amber-400/30 px-6 py-3 rounded-lg font-medium transition-all hover:bg-amber-500/10"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Register as Customer
                      </Link>
                      
                      <Link 
                        href="/book-service" 
                        className="block w-full text-center bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 border border-amber-400/30"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Book Service
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};