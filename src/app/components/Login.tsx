'use client'
// components/Login.tsx
import { useState } from 'react';
import Link from 'next/link';

const Login: React.FC = () => {
  const [isCustomerLogin, setIsCustomerLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      // Handle login logic here based on user type
      console.log(`${isCustomerLogin ? 'Customer' : isWorkerLogin ? 'Worker' : 'Manager'} Login:`, { email, password });
    }, 1500);
  };

  const [isWorkerLogin, setIsWorkerLogin] = useState(false);

  const handleLoginType = (type: 'customer' | 'worker' | 'manager') => {
    if (type === 'customer') {
      setIsCustomerLogin(true);
      setIsWorkerLogin(false);
    } else if (type === 'worker') {
      setIsCustomerLogin(false);
      setIsWorkerLogin(true);
    } else {
      setIsCustomerLogin(false);
      setIsWorkerLogin(false);
    }
  };

  const getCurrentUserType = () => {
    if (isCustomerLogin) return 'Customer';
    if (isWorkerLogin) return 'Worker';
    return 'Manager';
  };

  const getLoginDescription = () => {
    if (isCustomerLogin) return 'Sign in to book services and track your vehicle';
    if (isWorkerLogin) return 'Worker access to service management system';
    return 'Manager access to workshop administration';
  };

  return (
    <section className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center py-4 xs:py-6 sm:py-8 lg:py-12">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#fbbf24 1px, transparent 1px),
                             linear-gradient(90deg, #fbbf24 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      {/* Floating Gradient Bubbles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-float hidden sm:block ${
              i % 2 === 0 ? 'bg-gradient-to-r from-yellow-400/10 to-amber-500/10' : 'bg-gradient-to-r from-amber-400/10 to-yellow-500/10'
            }`}
            style={{
              width: `${Math.random() * 50 + 25}px`,
              height: `${Math.random() * 50 + 25}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${Math.random() * 25 + 25}s`,
              filter: 'blur(20px)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-xs xs:max-w-sm sm:max-w-md mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        {/* Login Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border-2 border-amber-500/30 shadow-2xl shadow-amber-500/20 p-4 xs:p-5 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl xs:text-2xl sm:text-3xl">C</span>
              </div>
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome to <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">CARVO</span>
            </h1>
            <p className="text-gray-400 text-xs xs:text-sm">
              {getLoginDescription()}
            </p>
          </div>

          {/* Login Type Toggle */}
          <div className="flex bg-gray-800/50 rounded-lg sm:rounded-xl p-1 mb-4 sm:mb-6 border border-gray-700">
            <button
              onClick={() => handleLoginType('customer')}
              className={`flex-1 py-2 xs:py-3 sm:py-3 px-2 xs:px-3 sm:px-4 rounded-md xs:rounded-lg text-xs xs:text-sm font-semibold transition-all duration-300 ${
                isCustomerLogin
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="hidden xs:inline">👤 </span>
              Customer
            </button>
            <button
              onClick={() => handleLoginType('worker')}
              className={`flex-1 py-2 xs:py-3 sm:py-3 px-2 xs:px-3 sm:px-4 rounded-md xs:rounded-lg text-xs xs:text-sm font-semibold transition-all duration-300 ${
                isWorkerLogin
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="hidden xs:inline">🔧 </span>
              Worker
            </button>
            <button
              onClick={() => handleLoginType('manager')}
              className={`flex-1 py-2 xs:py-3 sm:py-3 px-2 xs:px-3 sm:px-4 rounded-md xs:rounded-lg text-xs xs:text-sm font-semibold transition-all duration-300 ${
                !isCustomerLogin && !isWorkerLogin
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="hidden xs:inline">⚙️ </span>
              Manager
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4 sm:space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 xs:px-4 sm:px-4 py-2 xs:py-3 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg xs:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 xs:px-4 sm:px-4 py-2 xs:py-3 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg xs:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3 h-3 xs:w-4 xs:h-4 text-amber-500 bg-gray-800 border-gray-700 rounded focus:ring-amber-500 focus:ring-1 xs:focus:ring-2"
                />
                <span className="ml-2 text-xs xs:text-sm text-gray-300">Remember me</span>
              </label>
              
              <Link 
                href="/forgot-password" 
                className="text-xs xs:text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-2 xs:py-3 sm:py-3 px-4 rounded-lg xs:rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-sm xs:text-base"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 xs:w-5 xs:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-xs xs:text-sm">Signing in...</span>
                </>
              ) : (
                `Sign in as ${getCurrentUserType()}`
              )}
            </button>
          </form>

          {/* Customer Registration Link */}
          {isCustomerLogin && (
            <div className="mt-4 xs:mt-5 sm:mt-6 text-center">
              <p className="text-gray-400 text-xs xs:text-sm">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  Register here
                </Link>
              </p>
            </div>
          )}

          {/* Demo Credentials */}
          <div className="mt-4 xs:mt-5 sm:mt-6 p-3 xs:p-4 bg-gray-800/30 rounded-lg xs:rounded-xl border border-amber-500/20">
            <h3 className="text-xs xs:text-sm font-semibold text-amber-400 mb-1 xs:mb-2 flex items-center">
              <span className="mr-1 xs:mr-2">💡</span>
              Demo Credentials
            </h3>
            <div className="text-xs text-gray-300 space-y-1">
              <div className="break-words">
                <span className="text-amber-400">Customer:</span> customer@demo.com
              </div>
              <div className="break-words">
                <span className="text-amber-400">Worker:</span> worker@chongmeng.com
              </div>
              <div className="break-words">
                <span className="text-amber-400">Manager:</span> manager@chongmeng.com
              </div>
              <div className="text-amber-400/80 text-xs">
                Password: demo123
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-4 xs:mt-5 sm:mt-6 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-xs xs:text-sm text-gray-400 hover:text-white transition-colors"
            >
              <span className="mr-1 xs:mr-2">←</span>
              Back to homepage
            </Link>
          </div>
        </div>

        {/* Workshop Info */}
        <div className="mt-4 xs:mt-5 sm:mt-6 text-center">
          <div className="inline-flex items-center space-x-1 xs:space-x-2 bg-gray-800/30 backdrop-blur-sm rounded-full px-3 xs:px-4 py-1 xs:py-2 border border-amber-500/20">
            <span className="text-amber-400 text-xs xs:text-sm">🏢</span>
            <span className="text-gray-300 text-xs xs:text-sm">Chong Meng AutoService</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(120deg); }
          66% { transform: translateY(4px) rotate(240deg); }
        }
        .animate-float { animation: float 35s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default Login;