'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const HeroSection: React.FC = () => {
  const [userType, setUserType] = useState<'customer' | 'worker' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const bubbles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 80 + 40,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 10,
    duration: Math.random() * 10 + 15,
    gradient:
      Math.random() > 0.5
        ? 'from-yellow-400/20 to-amber-500/20'
        : 'from-amber-400/20 to-yellow-500/20',
  }));

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/check');
      if (response.ok) {
        const userData = await response.json();
        setUserType(userData.customer ? 'customer' : 
                   userData.worker ? 'worker' : 
                   userData.admin ? 'admin' : null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookService = () => {
    if (userType === 'customer') {
      router.push('/customer/dashboard');
    } else if (userType) {
      router.push('/login?redirect=/book-service');
    } else {
      router.push('/book-service');
    }
  };

  const handleLogin = () => {
    if (userType === 'customer') {
      router.push('/customer/dashboard');
    } else if (userType === 'worker') {
      router.push('/worker/dashboard');
    } else if (userType === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/login');
    }
  };

  const getDashboardLink = (type: string) => {
    if (userType === type) {
      return type === 'customer' ? '/customer/dashboard' :
             type === 'worker' ? '/worker/dashboard' :
             '/admin/dashboard';
    }
    return `/login?type=${type}`;
  };

  const getLoginButtonText = () => {
    if (userType === 'customer') return 'Go to Dashboard';
    if (userType === 'worker') return 'Worker Dashboard';
    if (userType === 'admin') return 'Admin Panel';
    return 'System Login';
  };

  const getBookServiceButtonText = () => {
    if (userType === 'customer') return 'My Dashboard';
    if (userType) return 'Book Service';
    return 'Book Service Now';
  };

  if (isLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-black">
      {/* Animated Gradient Bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className={`absolute rounded-full bg-gradient-to-r ${bubble.gradient} animate-float`}
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              top: `${bubble.top}%`,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${bubble.duration}s`,
              filter: 'blur(40px)',
            }}
          />
        ))}
      </div>

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(#fbbf24 1px, transparent 1px),
                           linear-gradient(90deg, #fbbf24 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6">
          {/* Welcome Back Badge for Logged-in Users */}
          {userType && (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 backdrop-blur-sm text-green-300 text-sm font-medium mb-4 animate-fade-in-up border border-green-500/20">
              👋 Welcome back! {userType === 'customer' ? 'Ready to book your next service?' : 
                              userType === 'worker' ? 'Check your assigned jobs' : 
                              'View your dashboard'}
            </div>
          )}

          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/10 backdrop-blur-sm text-amber-300 text-sm font-medium mb-4 animate-fade-in-up border border-amber-500/20">
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
            <span className="block animate-fade-in-up">Cheng</span>
            <span className="block bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
              Service
            </span>
          </h1>

          {/* Subheading */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-300 font-light animate-fade-in-up animation-delay-300">
            {userType ? `Welcome to your ${userType} portal` : 'Complete Workshop Management System'}
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
            {userType === 'customer' 
              ? 'Manage your vehicles, track services, and book appointments seamlessly.' 
              : userType === 'worker'
              ? 'Access your assigned jobs, update service status, and manage your workflow.'
              : userType === 'admin'
              ? 'Oversee operations, generate reports, and manage your workshop efficiently.'
              : 'Streamline your auto workshop operations with our comprehensive management platform. From customer bookings to inventory management, ChengService provides everything you need to run an efficient and modern automotive service center.'
            }
          </p>

          {/* Feature Highlights */}
          {!userType && (
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto animate-fade-in-up animation-delay-500">
              {[
                '📅 Online Booking',
                '🔧 Real-time Tracking', 
                '📊 Automated Reports',
                '📦 Parts Management',
                '💳 Digital Payments',
                '👥 Multi-user Access'
              ].map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-sm border border-amber-500/20"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600 pt-8">
            <button
              onClick={handleBookService}
              className="relative overflow-hidden group bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-2xl shadow-amber-500/25 flex items-center gap-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 transition-all duration-500 group-hover:translate-x-full" />
              <span className="text-xl">🚗</span>
              <span className="relative z-10">{getBookServiceButtonText()}</span>
            </button>

            <button
              onClick={handleLogin}
              className="relative overflow-hidden group border-2 border-amber-500/30 text-amber-300 hover:border-amber-400 hover:text-amber-200 px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-3 backdrop-blur-sm hover:bg-amber-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent transform -skew-x-12 transition-all duration-500 group-hover:translate-x-full" />
              <span className="text-xl">🔑</span>
              <span className="relative z-10">{getLoginButtonText()}</span>
            </button>
          </div>

     
          {/* Stats Section */}
          {!userType && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto pt-12 animate-fade-in-up animation-delay-1000">
              {[
                { number: '500+', label: 'Services/Month' },
                { number: '99%', label: 'Satisfaction' },
                { number: '24/7', label: 'Support' },
                { number: '50+', label: 'Technicians' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-amber-400">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      {!userType && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <div className="text-center">
            <div className="text-sm text-amber-400/80 mb-2">Discover ChengService</div>
            <div className="w-6 h-10 border-2 border-amber-500/50 rounded-full flex justify-center mx-auto">
              <div className="w-1 h-3 bg-amber-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-0"></div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-40px) scale(1.05);
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }
        .animation-delay-800 {
          animation-delay: 0.8s;
          opacity: 0;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;