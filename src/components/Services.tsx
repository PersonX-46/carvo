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
}

const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<number>(1);
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const services: Service[] = [
    {
      id: 1,
      name: "Oil Change & Filter",
      description: "Complete oil change with premium BMW filter replacement. Includes fluid level check and tire pressure adjustment.",
      price: "$89.99",
      duration: "30 min",
      popular: true,
      icon: "🛢️",
      gradient: "from-teal-500 to-blue-600"
    },
    {
      id: 2,
      name: "Brake Service",
      description: "Comprehensive brake inspection, pad replacement, and rotor resurfacing. BMW safety certified.",
      price: "$249.99",
      duration: "2 hours",
      icon: "🛑",
      gradient: "from-blue-500 to-teal-600"
    },
    {
      id: 3,
      name: "Engine Diagnostics",
      description: "Advanced BMW computer diagnostics to identify engine issues. Includes detailed report.",
      price: "$129.99",
      duration: "1 hour",
      icon: "🔧",
      gradient: "from-teal-600 to-blue-700"
    },
    {
      id: 4,
      name: "Tire Services",
      description: "Professional tire rotation, balance, and inspection. Extends tire life and improves safety.",
      price: "$79.99",
      duration: "45 min",
      icon: "🌀",
      gradient: "from-blue-600 to-teal-700"
    },
    {
      id: 5,
      name: "AC Service",
      description: "BMW AC system inspection, refrigerant recharge, and component testing. Stay cool all year.",
      price: "$179.99",
      duration: "1.5 hours",
      icon: "❄️",
      gradient: "from-teal-500 to-blue-600"
    },
    {
      id: 6,
      name: "Full Service Package",
      description: "Complete BMW inspection and maintenance. Oil, filter, fluids, brakes, and comprehensive check.",
      price: "$399.99",
      duration: "3 hours",
      popular: true,
      icon: "⭐",
      gradient: "from-blue-500 to-teal-600"
    }
  ];

  return (
    <section id="services" className="py-20 bg-black relative overflow-hidden">
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
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-float ${
              i % 2 === 0 ? 'bg-gradient-to-r from-teal-400/10 to-blue-500/10' : 'bg-gradient-to-r from-blue-400/10 to-teal-500/10'
            }`}
            style={{
              width: `${Math.random() * 60 + 30}px`,
              height: `${Math.random() * 60 + 30}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${Math.random() * 20 + 20}s`,
              filter: 'blur(25px)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            BMW <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Premium automotive services with genuine BMW parts and 12-month warranty
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className={`relative p-6 rounded-2xl transition-all duration-500 cursor-pointer border-2 backdrop-blur-sm ${
                selectedService === service.id
                  ? 'bg-gray-900/80 scale-105 border-teal-500/60 shadow-2xl shadow-teal-500/20'
                  : 'bg-gray-900/40 border-gray-700 hover:border-teal-500/40 hover:bg-gray-900/60'
              }`}
              onMouseEnter={() => {
                setSelectedService(service.id);
                setHoveredService(service.id);
              }}
              onMouseLeave={() => setHoveredService(null)}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    ⭐ Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center relative">
                {/* Icon with gradient background */}
                <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-r ${service.gradient} flex items-center justify-center text-3xl mx-auto mb-4 transition-transform duration-300 ${
                  hoveredService === service.id ? 'scale-110 rotate-12' : 'scale-100'
                }`}>
                  {service.icon}
                  {/* Glow effect */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${service.gradient} opacity-50 blur-md transition-opacity duration-300 ${
                    hoveredService === service.id ? 'opacity-70' : 'opacity-0'
                  }`}></div>
                </div>
                
                {/* Service Name */}
                <h3 className="text-xl font-semibold text-white mb-3">
                  {service.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-300 text-sm mb-4 leading-relaxed min-h-[60px]">
                  {service.description}
                </p>
                
                {/* Price and Duration */}
                <div className="flex justify-between items-center mb-4 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                  <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                    {service.price}
                  </span>
                  <span className="text-gray-400 text-sm font-medium">
                    {service.duration}
                  </span>
                </div>
                
                {/* Book Button */}
                <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 border-2 ${
                  selectedService === service.id
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white border-transparent hover:from-teal-600 hover:to-blue-700'
                    : 'bg-transparent text-teal-400 border-teal-500/30 hover:bg-teal-500/10 hover:border-teal-500/50'
                }`}>
                  {selectedService === service.id ? 'Book Now 🚀' : 'Select Service'}
                </button>

                {/* Warranty Badge */}
                <div className="mt-3 flex items-center justify-center space-x-1 text-xs text-gray-400">
                  <span>🛡️</span>
                  <span>12-month warranty included</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 bg-gray-900/50 backdrop-blur-sm border-2 border-teal-500/30 rounded-2xl px-6 py-4">
            <div className="flex items-center space-x-2 text-teal-400">
              <span>💡</span>
              <span className="font-semibold">All services include:</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-300">
              <span className="flex items-center space-x-1">
                <span>🔍</span>
                <span>Free 12-point inspection</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>🚗</span>
                <span>Complimentary car wash</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>🏢</span>
                <span>Genuine BMW parts</span>
              </span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-8">
          <button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg">
            📞 Need Help Choosing? Contact Our Experts
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(120deg); }
          66% { transform: translateY(6px) rotate(240deg); }
        }
        .animate-float { animation: float 30s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default Services;