'use client'
// components/Services.tsx
import { useState } from 'react';

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: string;
  popular?: boolean;
  icon: string;
  gradient: string;
  features: string[];
}

const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<number>(1);
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const services: Service[] = [
    {
      id: 1,
      name: "Regular Maintenance",
      description: "Complete vehicle check-up including oil change, filter replacement, and basic inspection to keep your car running smoothly.",
      price: "From RM89",
      duration: "45 min",
      popular: true,
      icon: "🛠️",
      gradient: "from-yellow-500 to-amber-600",
      features: ["Oil Change", "Filter Replacement", "Fluid Check", "Basic Inspection"]
    },
    {
      id: 2,
      name: "Brake System Service",
      description: "Comprehensive brake inspection, pad replacement, and rotor servicing to ensure your safety on the road.",
      price: "From RM150",
      duration: "2 hours",
      icon: "🛑",
      gradient: "from-amber-500 to-yellow-600",
      features: ["Brake Inspection", "Pad Replacement", "Rotor Service", "Safety Check"]
    },
    {
      id: 3,
      name: "Engine Diagnostics",
      description: "Advanced computer diagnostics to identify engine issues and provide detailed repair recommendations.",
      price: "From RM80",
      duration: "1 hour",
      icon: "🔍",
      gradient: "from-yellow-600 to-amber-700",
      features: ["Computer Scan", "Fault Detection", "Detailed Report", "Repair Advice"]
    },
    {
      id: 4,
      name: "Tire Services",
      description: "Professional tire rotation, balancing, alignment, and replacement services for optimal performance.",
      price: "From RM40",
      duration: "30 min",
      icon: "🌀",
      gradient: "from-amber-600 to-yellow-700",
      features: ["Tire Rotation", "Wheel Balancing", "Alignment", "Replacement"]
    },
    {
      id: 5,
      name: "AC System Service",
      description: "Complete air conditioning system inspection, refrigerant recharge, and component testing for comfort.",
      price: "From RM120",
      duration: "1.5 hours",
      icon: "❄️",
      gradient: "from-yellow-500 to-amber-600",
      features: ["AC Inspection", "Refrigerant Recharge", "Component Test", "Cooling Check"]
    },
    {
      id: 6,
      name: "Full Service Package",
      description: "Comprehensive vehicle service including all major systems inspection and maintenance for complete peace of mind.",
      price: "From RM250",
      duration: "3 hours",
      popular: true,
      icon: "⭐",
      gradient: "from-amber-500 to-yellow-600",
      features: ["Full Inspection", "All Fluids", "Brake Check", "Engine Service"]
    }
  ];

  return (
    <section id="services" className="py-12 sm:py-16 lg:py-20 bg-black relative overflow-hidden">
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
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${Math.random() * 20 + 20}s`,
              filter: 'blur(20px)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Our <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl lg:max-w-3xl mx-auto px-2">
            Professional automotive services at Chong Meng AutoService Seremban. Book online and track your vehicle's progress in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className={`relative p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl transition-all duration-500 cursor-pointer border-2 backdrop-blur-sm ${
                selectedService === service.id
                  ? 'bg-gray-900/80 scale-105 border-amber-500/60 shadow-2xl shadow-amber-500/20'
                  : 'bg-gray-900/40 border-gray-700 hover:border-amber-500/40 hover:bg-gray-900/60'
              }`}
              onMouseEnter={() => {
                setSelectedService(service.id);
                setHoveredService(service.id);
              }}
              onMouseLeave={() => setHoveredService(null)}
              onClick={() => setSelectedService(service.id)}
            >
              {service.popular && (
                <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium shadow-lg whitespace-nowrap">
                    ⭐ Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center relative">
                {/* Icon with gradient background */}
                <div className={`relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-r ${service.gradient} flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3 sm:mb-4 transition-transform duration-300 ${
                  hoveredService === service.id ? 'scale-110 rotate-12' : 'scale-100'
                }`}>
                  {service.icon}
                  {/* Glow effect */}
                  <div className={`absolute inset-0 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-r ${service.gradient} opacity-50 blur-md transition-opacity duration-300 ${
                    hoveredService === service.id ? 'opacity-70' : 'opacity-0'
                  }`}></div>
                </div>
                
                {/* Service Name */}
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 leading-tight">
                  {service.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed min-h-[50px] sm:min-h-[60px]">
                  {service.description}
                </p>
                
                {/* Features List */}
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700">
                  <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-1 text-amber-400">
                        <span>✓</span>
                        <span className="text-gray-300 text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price and Duration */}
                <div className="flex justify-between items-center mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700">
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                    {service.price}
                  </span>
                  <span className="text-gray-400 text-xs sm:text-sm font-medium">
                    {service.duration}
                  </span>
                </div>
                
                {/* Book Button */}
                <button className={`w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 border-2 ${
                  selectedService === service.id
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-transparent hover:from-yellow-600 hover:to-amber-700'
                    : 'bg-transparent text-amber-400 border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50'
                }`}>
                  {selectedService === service.id ? 'Book This Service 🚀' : 'Select Service'}
                </button>

                {/* Warranty Badge */}
                <div className="mt-2 sm:mt-3 flex items-center justify-center space-x-1 text-xs text-gray-400">
                  <span>🛡️</span>
                  <span className="text-xs">Quality Guaranteed</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8 sm:mt-12">
          <div className="inline-flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 bg-gray-900/50 backdrop-blur-sm border-2 border-amber-500/30 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 max-w-2xl mx-auto">
            <div className="flex items-center space-x-2 text-amber-400">
              <span>💡</span>
              <span className="font-semibold text-sm sm:text-base">All services include:</span>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300">
              <span className="flex items-center space-x-1 justify-center sm:justify-start">
                <span>📱</span>
                <span>Real-time Tracking</span>
              </span>
              <span className="flex items-center space-x-1 justify-center sm:justify-start">
                <span>🔧</span>
                <span>Expert Technicians</span>
              </span>
              <span className="flex items-center space-x-1 justify-center sm:justify-start">
                <span>💬</span>
                <span>WhatsApp Updates</span>
              </span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-6 sm:mt-8">
          <button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base w-full sm:w-auto">
            📞 Need Help? Contact Our Service Team
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(120deg); }
          66% { transform: translateY(4px) rotate(240deg); }
        }
        .animate-float { animation: float 30s ease-in-out infinite; }
        
        /* Touch device optimizations */
        @media (hover: none) {
          .service-card:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
};

export default Services;