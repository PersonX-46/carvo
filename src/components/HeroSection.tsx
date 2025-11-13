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
            🚗 Professional Auto Service & Workshop Management
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
            Complete Workshop Management System
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
            Streamline your auto workshop operations with our comprehensive management platform. 
            From customer bookings to inventory management, ChengService provides everything you need 
            to run an efficient and modern automotive service center.
          </p>

          {/* Feature Highlights */}
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

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600 pt-8">
            <Link
              href="/book-service"
              className="relative overflow-hidden group bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-2xl shadow-amber-500/25 flex items-center gap-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 transition-all duration-500 group-hover:translate-x-full" />
              <span className="text-xl">🚗</span>
              <span className="relative z-10">Book Service Now</span>
            </Link>

            <Link
              href="/login"
              className="relative overflow-hidden group border-2 border-amber-500/30 text-amber-300 hover:border-amber-400 hover:text-amber-200 px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-3 backdrop-blur-sm hover:bg-amber-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent transform -skew-x-12 transition-all duration-500 group-hover:translate-x-full" />
              <span className="text-xl">🔑</span>
              <span className="relative z-10">System Login</span>
            </Link>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-12 animate-fade-in-up animation-delay-800">
            {[
              { 
                icon: '👤', 
                title: 'For Customers', 
                desc: 'Easy booking & service tracking',
                features: ['Online Booking', 'Status Updates', 'Service History'],
                link: '/login?type=customer',
                buttonText: 'Customer Login'
              },
              { 
                icon: '🔧', 
                title: 'For Technicians', 
                desc: 'Efficient job management',
                features: ['Task Management', 'Parts Request', 'Work Reports'],
                link: '/login?type=worker', 
                buttonText: 'Worker Login'
              },
              { 
                icon: '📊', 
                title: 'For Management', 
                desc: 'Complete business oversight',
                features: ['Analytics', 'Inventory', 'Finance Reports'],
                link: '/login?type=admin',
                buttonText: 'Admin Login'
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-amber-500/20 hover:border-amber-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/10"
              >
                <div className="text-3xl font-bold text-amber-400 mb-3">
                  {item.icon}
                </div>
                <div className="text-xl font-bold text-white mb-2">
                  {item.title}
                </div>
                <div className="text-gray-400 text-sm mb-4">{item.desc}</div>
                
                {/* Features List */}
                <div className="space-y-1 mb-4">
                  {item.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="text-xs text-amber-300/80">
                      ✓ {feature}
                    </div>
                  ))}
                </div>
                
                <Link
                  href={item.link}
                  className="inline-block w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400/50 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  {item.buttonText}
                </Link>
              </div>
            ))}
          </div>

          {/* Stats Section */}
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
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <div className="text-center">
          <div className="text-sm text-amber-400/80 mb-2">Discover ChengService</div>
          <div className="w-6 h-10 border-2 border-amber-500/50 rounded-full flex justify-center mx-auto">
            <div className="w-1 h-3 bg-amber-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

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