'use client';
// components/Features.tsx
import { useState, useEffect } from 'react';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const Features: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<number>(1);

  const features: Feature[] = [
    {
      id: 1,
      title: "Easy Booking",
      description: "Book car services in just a few clicks. Choose your preferred workshop, service type, and time slot.",
      icon: "📅",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      title: "Real-time Tracking",
      description: "Track your vehicle's repair progress in real-time with live updates and notifications.",
      icon: "📍",
      color: "from-green-500 to-teal-500"
    },
    {
      id: 3,
      title: "Workshop Management",
      description: "Manage appointments, inventory, and mechanics efficiently with our dashboard.",
      icon: "⚙️",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 4,
      title: "Mobile App",
      description: "Coming soon! Manage everything on the go with our Flutter mobile application.",
      icon: "📱",
      color: "from-orange-500 to-red-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev % features.length) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose <span className="text-teal-500">Carvo</span>?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Revolutionizing car repair services with technology that puts you in control
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Feature cards */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`p-6 rounded-2xl transition-all duration-500 cursor-pointer ${
                  activeFeature === feature.id
                    ? 'bg-gradient-to-r shadow-xl scale-105 border-l-4 border-teal-500'
                    : 'bg-gray-50 dark:bg-gray-800 shadow-md hover:shadow-lg'
                }`}
                onMouseEnter={() => setActiveFeature(feature.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold mb-2 ${
                      activeFeature === feature.id ? 'text-teal-600 dark:text-teal-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Animated showcase */}
          <div className="relative h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-gray-800 dark:to-teal-900/20 rounded-3xl flex items-center justify-center">
              {/* Animated phone mockup */}
              <div className="relative w-64 h-96 bg-gray-900 rounded-[2rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-gray-800 rounded-[1.5rem] overflow-hidden relative">
                  {/* Screen content based on active feature */}
                  <div className="absolute inset-0 transition-opacity duration-500">
                    {features.map((feature) => (
                      <div
                        key={feature.id}
                        className={`absolute inset-0 p-4 transition-opacity duration-500 ${
                          activeFeature === feature.id ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <div className={`h-8 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-700 rounded"></div>
                          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="h-10 rounded-lg bg-teal-500 flex items-center justify-center">
                            <span className="text-white font-medium">Book Now</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl"></div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-teal-500/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;