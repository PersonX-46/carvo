'use client'
// components/Navbar.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NavBar(){
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

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
          ? 'w-11/12 max-w-4xl scale-95' 
          : 'w-10/12 max-w-6xl'
      }`}>
        {/* Outer glow effect */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-400/20 to-blue-400/20 blur-xl transition-opacity duration-500 ${
          isScrolled ? 'opacity-50' : 'opacity-30'
        }`}></div>
        
        {/* Main nav container */}
        <div className={`relative rounded-2xl border border-teal-400/30 backdrop-blur-xl transition-all duration-500 ${
          isScrolled 
            ? 'bg-gray-900/80 dark:bg-gray-900/90 shadow-2xl shadow-teal-500/10' 
            : 'bg-gray-900/60 dark:bg-gray-900/80 shadow-lg shadow-teal-500/5'
        }`}>
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-400/10 via-blue-400/10 to-purple-400/10 animate-pulse"></div>
          
          {/* Scan line effect */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-scan"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-3">
            <div className="flex justify-between items-center">
              {/* Logo with sci-fi style */}
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center group" onClick={() => setActiveTab('home')}>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg shadow-teal-400/20">
                      <span className="text-white font-bold text-xl">C</span>
                    </div>
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-teal-400 rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                  </div>
                  <span className="ml-3 text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                    CARVO
                  </span>
                </Link>
              </div>

              {/* Desktop Menu with sci-fi tabs */}
              <div className="hidden md:block">
                <div className="flex items-center space-x-1 bg-gray-800/50 rounded-xl p-1 border border-teal-400/20">
                  {['home', 'services', 'workshops', 'about', 'contact'].map((tab) => (
                    <Link 
                      key={tab}
                      href={`/${tab === 'home' ? '' : tab}`}
                      className={`relative px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform ${
                        activeTab === tab
                          ? 'text-white bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-400/30 scale-105'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {activeTab === tab && (
                        <>
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-teal-400/10 to-blue-400/10 animate-pulse"></div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-400 rounded-full animate-ping"></div>
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
                  className="relative p-2 rounded-xl bg-gray-800/50 border border-teal-400/20 text-teal-300 hover:text-teal-400 transition-all duration-300 hover:scale-110 hover:border-teal-400/40 group"
                  aria-label="Toggle theme"
                >
                  <div className="absolute inset-0 rounded-xl bg-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

                {/* CTA Button with sci-fi glow */}
                <Link 
                  href="/book" 
                  className="hidden md:block relative group"
                  onClick={() => setActiveTab('book')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl blur-md group-hover:blur-lg transition-all duration-300 opacity-70"></div>
                  <div className="relative z-10 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-all transform group-hover:scale-105 shadow-lg border border-teal-400/30">
                    Book Service
                  </div>
                </Link>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-xl bg-gray-800/50 border border-teal-400/20 text-teal-300 hover:text-teal-400 transition-all duration-300 hover:scale-110"
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
              <div className="md:hidden mt-4 bg-gray-800/80 backdrop-blur-xl rounded-xl border border-teal-400/20 p-4 animate-slideDown">
                <div className="space-y-2">
                  {['home', 'services', 'workshops', 'about', 'contact'].map((tab) => (
                    <Link 
                      key={tab}
                      href={`/${tab === 'home' ? '' : tab}`}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        activeTab === tab
                          ? 'text-white bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-400/30'
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
                  <div className="pt-2 border-t border-teal-400/20">
                    <Link 
                      href="/book" 
                      className="block w-full text-center bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 border border-teal-400/30"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Book Service
                    </Link>
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