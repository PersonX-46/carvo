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
}

const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<number>(1);

  const services: Service[] = [
    {
      id: 1,
      name: "Oil Change & Filter",
      description: "Complete oil change with premium filter replacement. Includes fluid level check and tire pressure adjustment.",
      price: "$49.99",
      duration: "30 min",
      popular: true,
      icon: "🛢️"
    },
    {
      id: 2,
      name: "Brake Service",
      description: "Comprehensive brake inspection, pad replacement, and rotor resurfacing. Safety certified.",
      price: "$129.99",
      duration: "2 hours",
      icon: "🛑"
    },
    {
      id: 3,
      name: "Engine Diagnostics",
      description: "Advanced computer diagnostics to identify engine issues. Includes detailed report and recommendations.",
      price: "$79.99",
      duration: "1 hour",
      icon: "🔧"
    },
    {
      id: 4,
      name: "Tire Rotation & Balance",
      description: "Professional tire rotation, balance, and inspection. Extends tire life and improves safety.",
      price: "$39.99",
      duration: "45 min",
      icon: "🌀"
    },
    {
      id: 5,
      name: "AC Service",
      description: "AC system inspection, refrigerant recharge, and component testing. Stay cool all year round.",
      price: "$99.99",
      duration: "1.5 hours",
      icon: "❄️"
    },
    {
      id: 6,
      name: "Full Service Package",
      description: "Complete vehicle inspection and maintenance. Oil change, filter, fluids, brakes, and more.",
      price: "$199.99",
      duration: "3 hours",
      popular: true,
      icon: "⭐"
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Our <span className="text-teal-500">Services</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Professional automotive services with a 12-month warranty on all repairs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className={`relative p-6 rounded-2xl transition-all duration-300 cursor-pointer group ${
                selectedService === service.id
                  ? 'bg-white dark:bg-gray-900 shadow-xl scale-105 border-l-4 border-teal-500'
                  : 'bg-white/70 dark:bg-gray-900/70 shadow-lg hover:shadow-xl'
              }`}
              onMouseEnter={() => setSelectedService(service.id)}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {service.name}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                  {service.description}
                </p>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {service.price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {service.duration}
                  </span>
                </div>
                
                <button className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-medium transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300">
            💡 All services include free 12-point inspection and complimentary car wash
          </p>
        </div>
      </div>
    </section>
  );
};

export default Services;