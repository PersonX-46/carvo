'use client'
// components/Footer.tsx
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const x = (clientX / window.innerWidth - 0.5) * 2;
      const y = (clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate floating bubbles - reduced count for mobile
  const bubbles = Array.from({ length: typeof window !== 'undefined' && window.innerWidth < 768 ? 8 : 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 40 + 15,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 15,
    duration: Math.random() * 25 + 20,
    gradient: Math.random() > 0.5 ? 'from-yellow-400/10 to-amber-500/10' : 'from-amber-400/10 to-yellow-500/10'
  }));

  return (
    <footer className="bg-black relative overflow-hidden pt-12 sm:pt-16 pb-6 sm:pb-8 border-t border-gray-800">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#fbbf24 1px, transparent 1px),
                             linear-gradient(90deg, #fbbf24 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
            transform: `translate(${mousePosition.x * -5}px, ${mousePosition.y * -5}px)`
          }}
        />
      </div>

      {/* Floating Gradient Bubbles */}
      <div className="absolute inset-0">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className={`absolute rounded-full bg-gradient-to-r ${bubble.gradient} animate-float hidden sm:block`}
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              top: `${bubble.top}%`,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${bubble.duration}s`,
              filter: 'blur(20px)',
              transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl sm:text-2xl">C</span>
              </div>
              <span className="ml-2 sm:ml-3 text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                CARVO
              </span>
            </div>
            <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-sm">
              Chong Meng AutoService Seremban's online booking system. 
              Professional automotive care with real-time service tracking and expert technicians.
            </p>
            <div className="flex space-x-2 sm:space-x-4">
              {[
                { icon: '📘', label: 'Facebook', href: '#' },
                { icon: '📷', label: 'Instagram', href: '#' },
                { icon: '📞', label: 'WhatsApp', href: '#' },
                { icon: '🗺️', label: 'Google Maps', href: '#' }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-400 hover:border-amber-500/50 hover:bg-gray-800/80 transition-all duration-300"
                  aria-label={social.label}
                >
                  <span className="text-base sm:text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full mr-2 animate-pulse"></span>
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { name: 'Our Services', href: '#services' },
                { name: 'Book Service', href: '#booking' },
                { name: 'Service Status', href: '/track' },
                { name: 'Service History', href: '/history' },
                { name: 'Contact Workshop', href: '#contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-amber-400 transition-all duration-300 flex items-center group text-xs sm:text-sm"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full mr-2 sm:mr-3 group-hover:bg-amber-400 transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
              Our Services
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {[
                'Regular Maintenance',
                'Brake System Service',
                'Engine Diagnostics',
                'AC System Service',
                'Tire Services',
                'Full Service Package'
              ].map((service) => (
                <li key={service}>
                  <a 
                    href="#services" 
                    className="text-gray-400 hover:text-amber-400 transition-all duration-300 flex items-center group text-xs sm:text-sm"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full mr-2 sm:mr-3 group-hover:bg-yellow-400 transition-colors"></span>
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full mr-2 animate-pulse"></span>
              Workshop Info
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {[
                { icon: '📍', content: 'Chong Meng AutoService\nSeremban, Negeri Sembilan' },
                { icon: '📞', content: '+60 12-345 6789', href: 'tel:+60123456789' },
                { icon: '✉️', content: 'service@chongmeng.com', href: 'mailto:service@chongmeng.com' },
                { icon: '🕒', content: 'Mon - Sat: 8:00 AM - 6:00 PM\nSunday: Closed' }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-2 sm:space-x-3 group">
                  <span className="text-amber-400 text-base sm:text-lg mt-0.5 group-hover:scale-110 transition-transform flex-shrink-0">{item.icon}</span>
                  {item.href ? (
                    <a 
                      href={item.href} 
                      className="text-gray-400 hover:text-amber-400 transition-colors text-xs sm:text-sm leading-relaxed break-words"
                    >
                      {item.content.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs sm:text-sm leading-relaxed break-words">
                      {item.content.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex-1 text-center lg:text-left">
              <h4 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Service Reminders</h4>
              <p className="text-gray-400 text-xs sm:text-sm">Get maintenance reminders and service promotions</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="px-3 sm:px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors text-sm w-full sm:w-auto"
              />
              <button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <div className="flex items-center space-x-2 text-gray-400 text-xs sm:text-sm text-center md:text-left">
            <span>© {currentYear} Chong Meng AutoService Seremban.</span>
            <span className="text-amber-400">All rights reserved.</span>
          </div>
          <div className="flex flex-wrap justify-center space-x-4 sm:space-x-6 gap-2 sm:gap-0">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a 
                key={item}
                href="#" 
                className="text-gray-400 hover:text-amber-400 text-xs sm:text-sm transition-colors hover:scale-105 transform"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Workshop Certification Badge */}
        <div className="text-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-800">
          <div className="inline-flex items-center space-x-1 sm:space-x-2 bg-gray-800/30 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-2 border border-amber-500/20">
            <span className="text-amber-400 text-sm">🏆</span>
            <span className="text-gray-300 text-xs sm:text-sm">Trusted AutoService Since 2010</span>
            <span className="text-amber-400 text-sm">⭐</span>
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
        
        /* Mobile optimizations */
        @media (max-width: 639px) {
          .footer-grid {
            gap: 1.5rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;