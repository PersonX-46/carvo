'use client'
import Link from 'next/link';

const HeroSection: React.FC = () => {
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
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/10 backdrop-blur-sm text-amber-300 text-sm font-medium mb-4 animate-fade-in-up border border-amber-500/20">
            🚗 Chong Meng AutoService Seremban
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            <span className="block animate-fade-in-up">Workshop Management</span>
            <span className="block bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
              System
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
            CARVO streamlines workshop operations with automated service booking, real-time tracking, and comprehensive management tools.
            <span className="block text-amber-400 font-semibold mt-2">
              Online Booking • Real-time Updates • Automated Reports • Spare Parts Management
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
            <Link
              href="/login"
              className="relative overflow-hidden group bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-2xl shadow-amber-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 transition-all duration-500 group-hover:translate-x-full" />
              <span className="relative z-10">Login to System</span>
            </Link>

            <Link
              href="/register"
              className="border-2 border-amber-500/30 text-amber-300 hover:border-amber-400 hover:text-amber-200 px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-2 backdrop-blur-sm hover:bg-amber-500/10"
            >
              <span>📝</span> Register Account
            </Link>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto pt-12 animate-fade-in-up animation-delay-800">
            {[
              { icon: '👥', title: 'For Customers', desc: 'Book Services & Track Status' },
              { icon: '🔧', title: 'For Workers', desc: 'Manage Jobs & Updates' },
              { icon: '📊', title: 'For Managers', desc: 'Reports & Inventory' },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-amber-500/20 hover:border-amber-400/40 transition-all duration-300 hover:scale-105"
              >
                <div className="text-2xl font-bold text-amber-400 mb-2">
                  {item.icon}
                </div>
                <div className="text-lg font-semibold text-white">
                  {item.title}
                </div>
                <div className="text-gray-400 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <div className="text-center">
          <div className="text-sm text-amber-400/80 mb-2">Explore CARVO Features</div>
          <div className="w-6 h-10 border-2 border-amber-500/50 rounded-full flex justify-center mx-auto">
            <div className="w-1 h-3 bg-amber-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

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
        .animation-delay-400 {
          animation-delay: 0.4s;
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
      `}</style>
    </section>
  );
};

export default HeroSection;