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
      title: "Easy Booking",
      description: "Book BMW services in just a few clicks. Choose your preferred time slot and service type.",
      icon: "📅",
      gradient: "from-teal-500 to-blue-600",
      screenContent: (
        <div className="p-4 h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div className="text-white text-lg font-semibold">Carvo</div>
            <div className="w-6 h-6 bg-gray-700 rounded"></div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="bg-gray-800/80 rounded-xl p-3 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-teal-300 text-sm font-medium">Oil Change</span>
                <span className="text-white text-xs font-bold">$89.99</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 w-3/4"></div>
              </div>
            </div>
            
            <div className="bg-gray-800/80 rounded-xl p-3 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-300 text-sm font-medium">Brake Service</span>
                <span className="text-white text-xs font-bold">$249.99</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-teal-600 w-1/2"></div>
              </div>
            </div>
          </div>
          
          <button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:from-teal-600 hover:to-blue-700 transition-all shadow-lg">
            Confirm Booking
          </button>
        </div>
      )
    },
    {
      id: 2,
      title: "Real-time Tracking",
      description: "Track your BMW's repair progress with live updates and technician notes.",
      icon: "📍",
      gradient: "from-blue-500 to-teal-600",
      screenContent: (
        <div className="p-4 h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-center mb-4">
            <div className="text-white font-semibold mb-1">Service Status</div>
            <div className="text-teal-400 text-sm">BMW X5 • WBA123456</div>
          </div>
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center space-x-3 bg-gray-800/80 rounded-xl p-3 border border-teal-500/30">
              <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1">
                <div className="text-teal-300 text-sm font-medium">Diagnostics</div>
                <div className="text-gray-400 text-xs">In progress • 45 min</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-gray-800/80 rounded-xl p-3 border border-blue-500/30">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <div className="text-blue-400 text-lg">⏳</div>
              </div>
              <div className="flex-1">
                <div className="text-blue-300 text-sm font-medium">Parts Installation</div>
                <div className="text-gray-400 text-xs">Scheduled • Genuine BMW</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-3 mt-4 border border-gray-700">
            <div className="text-gray-300 text-xs text-center">Estimated completion: 2h 15m</div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Workshop Management",
      description: "Advanced dashboard for workshop operations and mechanic scheduling.",
      icon: "⚙️",
      gradient: "from-teal-600 to-blue-700",
      screenContent: (
        <div className="p-4 h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-white font-semibold text-center mb-4">Workshop Dashboard</div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-800/80 rounded-xl p-3 text-center border border-teal-500/20">
              <div className="text-teal-300 text-xl font-bold mb-1">12</div>
              <div className="text-gray-400 text-xs">Today's Jobs</div>
            </div>
            <div className="bg-gray-800/80 rounded-xl p-3 text-center border border-blue-500/20">
              <div className="text-blue-300 text-xl font-bold mb-1">3</div>
              <div className="text-gray-400 text-xs">In Progress</div>
            </div>
            <div className="bg-gray-800/80 rounded-xl p-3 text-center border border-teal-500/20">
              <div className="text-teal-300 text-xl font-bold mb-1">8</div>
              <div className="text-gray-400 text-xs">Completed</div>
            </div>
            <div className="bg-gray-800/80 rounded-xl p-3 text-center border border-blue-500/20">
              <div className="text-blue-300 text-xl font-bold mb-1">1</div>
              <div className="text-gray-400 text-xs">Urgent</div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex-1 bg-gray-700/50 text-gray-300 py-2 rounded-lg text-xs border border-gray-600 hover:border-teal-500/50 transition-colors">
              Schedule
            </button>
            <button className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600 text-white py-2 rounded-lg text-xs hover:from-teal-600 hover:to-blue-700 transition-all">
              Reports
            </button>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Mobile App",
      description: "Full-featured mobile app for service management and vehicle tracking.",
      icon: "📱",
      gradient: "from-blue-600 to-teal-700",
      screenContent: (
        <div className="p-4 h-full flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-6xl mb-4">🚀</div>
          <div className="text-center">
            <div className="text-teal-300 text-xl font-semibold mb-2">Carvo 2.0</div>
            <div className="text-gray-300 text-sm mb-1">Coming Soon</div>
            <div className="text-gray-400 text-xs">iOS & Android</div>
          </div>
          
          <div className="w-full max-w-[120px] bg-gray-700 rounded-full h-2 mt-6 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 h-full rounded-full animate-pulse" style={{width: '85%'}}></div>
          </div>
          <div className="text-gray-400 text-xs mt-2">Development Progress</div>
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
    <section id="features" className="py-20 bg-black relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#00ffaa 1px, transparent 1px),
                             linear-gradient(90deg, #00ffaa 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Floating Gradient Bubbles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-float ${
              i % 2 === 0 ? 'bg-gradient-to-r from-teal-400/10 to-blue-500/10' : 'bg-gradient-to-r from-blue-400/10 to-teal-500/10'
            }`}
            style={{
              width: `${Math.random() * 80 + 40}px`,
              height: `${Math.random() * 80 + 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${Math.random() * 25 + 25}s`,
              filter: 'blur(30px)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Advanced <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of BMW service management
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Feature Cards with Outline Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`p-6 rounded-2xl transition-all duration-500 cursor-pointer border-2 backdrop-blur-sm ${
                  activeFeature === feature.id
                    ? 'bg-gray-900/80 scale-105 border-teal-500/60 shadow-2xl shadow-teal-500/20'
                    : 'bg-gray-900/40 border-gray-700 hover:border-teal-500/30 hover:bg-gray-900/60'
                }`}
                onMouseEnter={() => handleFeatureClick(feature.id)}
                onClick={() => handleFeatureClick(feature.id)}
                style={{
                  gridColumn: index % 2 === 0 ? '1' : '2',
                  gridRow: Math.floor(index / 2) + 1
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-xl shadow-lg`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                      activeFeature === feature.id ? 'text-teal-400' : 'text-white'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Realistic Phone Mockup */}
          <div className="flex items-center justify-center">
            <div className="relative w-80 h-[600px]"> {/* Larger phone */}
              {/* Phone Frame */}
              <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] p-4 shadow-2xl border-4 border-gray-700">
                {/* Screen */}
                <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative border-2 border-gray-600">
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
                  <div className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-sm px-6 py-2 flex justify-between items-center text-sm text-gray-300">
                    <span>9:41</span>
                    <div className="flex space-x-2 items-center">
                      <span className="text-xs">📶</span>
                      <span className="text-xs">📡</span>
                      <span className="text-xs">🔋</span>
                    </div>
                  </div>
                  
                  {/* Home Indicator */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full"></div>
                </div>
                
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-gray-800 rounded-b-2xl z-10 border-l-2 border-r-2 border-b-2 border-gray-700"></div>
                
                {/* Physical Buttons */}
                <div className="absolute left-0 top-1/4 h-16 w-1 bg-gray-700 rounded-r-lg"></div>
                <div className="absolute left-0 top-2/4 h-16 w-1 bg-gray-700 rounded-r-lg"></div>
                <div className="absolute right-0 top-1/3 h-20 w-1 bg-gray-700 rounded-l-lg"></div>
              </div>

              {/* Reflection Effect */}
              <div className="absolute top-4 left-4 right-4 h-4 bg-gradient-to-b from-white/5 to-transparent rounded-t-[2.5rem] pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Auto-rotation Indicator */}
        <div className="text-center mt-12">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gray-800/80 backdrop-blur-sm border-2 border-gray-700 text-gray-300 hover:text-teal-400 hover:border-teal-500/50 transition-all"
          >
            <div className={`w-3 h-3 rounded-full ${isAutoRotating ? 'bg-teal-400 animate-pulse' : 'bg-gray-600'}`}></div>
            <span className="text-sm font-medium">Auto Demo: {isAutoRotating ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(120deg); }
          66% { transform: translateY(8px) rotate(240deg); }
        }
        .animate-float { animation: float 35s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default Features;