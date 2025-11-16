'use client';
// components/Features.tsx
import { useState, useEffect, useRef } from 'react';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  screenContent: React.ReactNode;
}

const Features: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<number>(1);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const features: Feature[] = [
    {
      id: 1,
      title: "Easy Online Booking",
      description: "Book car services in just a few clicks. Choose your preferred time slot and service type.",
      icon: "📅",
      gradient: "from-yellow-500 to-amber-600",
      screenContent: (
        <div className="p-3 xs:p-4 h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="w-6 h-6 xs:w-8 xs:h-8 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs xs:text-sm">C</span>
            </div>
            <div className="text-white text-base xs:text-lg font-semibold">CARVO</div>
            <div className="w-4 h-4 xs:w-6 xs:h-6 bg-gray-700 rounded"></div>
          </div>
          
          <div className="space-y-2 xs:space-y-3 mb-3 xs:mb-4">
            <div className="bg-gray-800/80 rounded-lg xs:rounded-xl p-2 xs:p-3 border border-gray-700">
              <div className="flex justify-between items-center mb-1 xs:mb-2">
                <span className="text-amber-300 text-xs xs:text-sm font-medium">Regular Maintenance</span>
                <span className="text-white text-xs font-bold">RM89</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 w-3/4"></div>
              </div>
            </div>
            
            <div className="bg-gray-800/80 rounded-lg xs:rounded-xl p-2 xs:p-3 border border-gray-700">
              <div className="flex justify-between items-center mb-1 xs:mb-2">
                <span className="text-amber-300 text-xs xs:text-sm font-medium">Brake Service</span>
                <span className="text-white text-xs font-bold">RM150</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-600 w-1/2"></div>
              </div>
            </div>
          </div>
          
          <button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-2 xs:py-3 rounded-lg xs:rounded-xl font-semibold text-xs xs:text-sm hover:from-yellow-600 hover:to-amber-700 transition-all shadow-lg">
            Book Service Now
          </button>
        </div>
      )
    },
    {
      id: 2,
      title: "Real-time Service Tracking",
      description: "Track your vehicle's repair progress with live updates and technician notes.",
      icon: "📍",
      gradient: "from-amber-500 to-yellow-600",
      screenContent: (
        <div className="p-3 xs:p-4 h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-center mb-3 xs:mb-4">
            <div className="text-white font-semibold text-sm xs:text-base mb-1">Service Status</div>
            <div className="text-amber-400 text-xs xs:text-sm">Toyota Vios • WXY1234</div>
          </div>
          
          <div className="space-y-2 xs:space-y-3 flex-1">
            <div className="flex items-center space-x-2 xs:space-x-3 bg-gray-800/80 rounded-lg xs:rounded-xl p-2 xs:p-3 border border-amber-500/30">
              <div className="w-6 h-6 xs:w-8 xs:h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-amber-400 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1">
                <div className="text-amber-300 text-xs xs:text-sm font-medium">Vehicle Inspection</div>
                <div className="text-gray-400 text-xs">In progress • 30 min</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 xs:space-x-3 bg-gray-800/80 rounded-lg xs:rounded-xl p-2 xs:p-3 border border-yellow-500/30">
              <div className="w-6 h-6 xs:w-8 xs:h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <div className="text-yellow-400 text-base xs:text-lg">⏳</div>
              </div>
              <div className="flex-1">
                <div className="text-yellow-300 text-xs xs:text-sm font-medium">Parts Replacement</div>
                <div className="text-gray-400 text-xs">Scheduled • Genuine Parts</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-2 xs:p-3 mt-3 xs:mt-4 border border-gray-700">
            <div className="text-gray-300 text-xs text-center">Estimated completion: 1h 45m</div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Service History & Records",
      description: "Access your complete vehicle service history and maintenance records anytime.",
      icon: "📝",
      gradient: "from-yellow-600 to-amber-700",
      screenContent: (
        <div className="p-3 xs:p-4 h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-white font-semibold text-center text-sm xs:text-base mb-3 xs:mb-4">Service History</div>
          
          <div className="space-y-2 xs:space-y-3 flex-1">
            <div className="bg-gray-800/80 rounded-lg xs:rounded-xl p-2 xs:p-3 border border-amber-500/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-amber-300 text-xs xs:text-sm font-medium">15 Jan 2024</span>
                <span className="text-green-400 text-xs">Completed</span>
              </div>
              <div className="text-gray-300 text-xs">Regular Maintenance • RM89</div>
            </div>
            
            <div className="bg-gray-800/80 rounded-lg xs:rounded-xl p-2 xs:p-3 border border-yellow-500/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-yellow-300 text-xs xs:text-sm font-medium">20 Dec 2023</span>
                <span className="text-green-400 text-xs">Completed</span>
              </div>
              <div className="text-gray-300 text-xs">Brake Service • RM150</div>
            </div>
            
            <div className="bg-gray-800/80 rounded-lg xs:rounded-xl p-2 xs:p-3 border border-amber-500/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-amber-300 text-xs xs:text-sm font-medium">05 Nov 2023</span>
                <span className="text-green-400 text-xs">Completed</span>
              </div>
              <div className="text-gray-300 text-xs">Tire Rotation • RM40</div>
            </div>
          </div>
          
          <div className="flex space-x-1 xs:space-x-2 mt-2">
            <button className="flex-1 bg-gray-700/50 text-gray-300 py-1 xs:py-2 rounded text-xs border border-gray-600 hover:border-amber-500/50 transition-colors">
              View All
            </button>
            <button className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-1 xs:py-2 rounded text-xs hover:from-yellow-600 hover:to-amber-700 transition-all">
              Download
            </button>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Instant WhatsApp Updates",
      description: "Receive real-time service updates and completion notifications via WhatsApp.",
      icon: "💬",
      gradient: "from-amber-600 to-yellow-700",
      screenContent: (
        <div className="p-3 xs:p-4 h-full flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-4xl xs:text-6xl mb-3 xs:mb-4">📱</div>
          <div className="text-center">
            <div className="text-amber-300 text-lg xs:text-xl font-semibold mb-1 xs:mb-2">WhatsApp Updates</div>
            <div className="text-gray-300 text-xs xs:text-sm mb-2">Real-time service notifications</div>
            <div className="text-gray-400 text-xs mb-3">Get instant updates on your phone</div>
          </div>
          
          <div className="w-full max-w-[120px] xs:max-w-[160px] bg-gray-700 rounded-full h-2 xs:h-3 mt-2 xs:mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-600 h-full rounded-full animate-pulse" style={{width: '100%'}}></div>
          </div>
          <div className="text-gray-400 text-xs mt-2 xs:mt-3">Active • Connected</div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (!isAutoRotating) return;

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev % features.length) + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoRotating, features.length]);

  const handleFeatureClick = (id: number) => {
    setActiveFeature(id);
    setIsAutoRotating(false);
    setTimeout(() => setIsAutoRotating(true), 10000);
  };

  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 bg-black relative overflow-hidden">
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
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-float hidden sm:block ${
              i % 2 === 0 ? 'bg-gradient-to-r from-yellow-400/10 to-amber-500/10' : 'bg-gradient-to-r from-amber-400/10 to-yellow-500/10'
            }`}
            style={{
              width: `${Math.random() * 60 + 30}px`,
              height: `${Math.random() * 60 + 30}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${Math.random() * 25 + 25}s`,
              filter: 'blur(30px)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Customer <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto px-2">
            Experience convenient car service management with Chong Meng AutoService
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
          {/* Feature Cards with Outline Style */}
          <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-500 cursor-pointer border-2 backdrop-blur-sm ${
                    activeFeature === feature.id
                      ? 'bg-gray-900/80 scale-105 border-amber-500/60 shadow-2xl shadow-amber-500/20'
                      : 'bg-gray-900/40 border-gray-700 hover:border-amber-500/30 hover:bg-gray-900/60'
                  }`}
                  onMouseEnter={() => handleFeatureClick(feature.id)}
                  onClick={() => handleFeatureClick(feature.id)}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-lg sm:text-xl shadow-lg flex-shrink-0`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 transition-colors ${
                        activeFeature === feature.id ? 'text-amber-400' : 'text-white'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Realistic Phone Mockup */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <div className="relative w-64 xs:w-72 sm:w-80 h-[500px] xs:h-[550px] sm:h-[600px]"> {/* Responsive phone size */}
              {/* Phone Frame */}
              <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2rem] sm:rounded-[3rem] p-3 sm:p-4 shadow-2xl border-4 border-gray-700">
                {/* Screen */}
                <div className="w-full h-full bg-black rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden relative border-2 border-gray-600">
                  {/* Dynamic Screen Content */}
                  <div className="absolute inset-0">
                    {features.map((feature) => (
                      <div
                        key={feature.id}
                        className={`absolute inset-0 transition-all duration-700 ${
                          activeFeature === feature.id 
                            ? 'opacity-100 scale-100' 
                            : 'opacity-0 scale-95'
                        }`}
                      >
                        {feature.screenContent}
                      </div>
                    ))}
                  </div>
                  
                  {/* Status Bar */}
                  <div className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-sm px-4 sm:px-6 py-1 sm:py-2 flex justify-between items-center text-xs sm:text-sm text-gray-300">
                    <span>2:30</span>
                    <div className="flex space-x-1 sm:space-x-2 items-center">
                      <span className="text-xs">📶</span>
                      <span className="text-xs">📡</span>
                      <span className="text-xs">🔋</span>
                    </div>
                  </div>
                  
                  {/* Home Indicator */}
                  <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-0.5 sm:h-1 bg-gray-600 rounded-full"></div>
                </div>
                
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 sm:w-40 h-4 sm:h-6 bg-gray-800 rounded-b-xl sm:rounded-b-2xl z-10 border-l-2 border-r-2 border-b-2 border-gray-700"></div>
                
                {/* Physical Buttons */}
                <div className="absolute left-0 top-1/4 h-12 sm:h-16 w-0.5 sm:w-1 bg-gray-700 rounded-r"></div>
                <div className="absolute left-0 top-2/4 h-12 sm:h-16 w-0.5 sm:w-1 bg-gray-700 rounded-r"></div>
                <div className="absolute right-0 top-1/3 h-16 sm:h-20 w-0.5 sm:w-1 bg-gray-700 rounded-l"></div>
              </div>

              {/* Reflection Effect */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 h-3 sm:h-4 bg-gradient-to-b from-white/5 to-transparent rounded-t-[1.5rem] sm:rounded-t-[2.5rem] pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Auto-rotation Indicator */}
        <div className="text-center mt-8 sm:mt-12">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gray-800/80 backdrop-blur-sm border-2 border-gray-700 text-gray-300 hover:text-amber-400 hover:border-amber-500/50 transition-all text-sm"
          >
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isAutoRotating ? 'bg-amber-400 animate-pulse' : 'bg-gray-600'}`}></div>
            <span className="text-xs sm:text-sm font-medium">Auto Demo: {isAutoRotating ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
        }
        .animate-float { animation: float 35s ease-in-out infinite; }
        
        /* Extra small devices optimization */
        @media (max-width: 359px) {
          .phone-container {
            transform: scale(0.9);
          }
        }
      `}</style>
    </section>
  );
};

export default Features;