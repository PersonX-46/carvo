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

  // Generate floating bubbles
  const bubbles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 15,
    duration: Math.random() * 25 + 20,
    gradient: Math.random() > 0.5 ? 'from-teal-400/10 to-blue-500/10' : 'from-blue-400/10 to-teal-500/10'
  }));

  return (
    <footer className="bg-black relative overflow-hidden pt-16 pb-8 border-t border-gray-800">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#00ffaa 1px, transparent 1px),
                             linear-gradient(90deg, #00ffaa 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: `translate(${mousePosition.x * -5}px, ${mousePosition.y * -5}px)`
          }}
        />
      </div>

      {/* Floating Gradient Bubbles */}
      <div className="absolute inset-0">
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
              filter: 'blur(25px)',
              transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">C</span>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Carvo
              </span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed text-sm">
              Professional BMW service specialists with over 12 years of excellence. 
              Your trusted partner for premium automotive care and maintenance.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: '📘', label: 'Facebook', href: '#' },
                { icon: '📷', label: 'Instagram', href: '#' },
                { icon: '🐦', label: 'Twitter', href: '#' },
                { icon: '💼', label: 'LinkedIn', href: '#' }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-teal-400 hover:border-teal-500/50 hover:bg-gray-800/80 transition-all duration-300"
                  aria-label={social.label}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-teal-400 rounded-full mr-2 animate-pulse"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Our Services', href: '#services' },
                { name: 'Book Appointment', href: '#booking' },
                { name: 'About Us', href: '#about' },
                { name: 'Testimonials', href: '#testimonials' },
                { name: 'Contact', href: '#contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-teal-400 transition-all duration-300 flex items-center group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full mr-3 group-hover:bg-teal-400 transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
              BMW Services
            </h3>
            <ul className="space-y-3">
              {[
                'Oil Change Service',
                'Brake System Repair',
                'Engine Diagnostics',
                'AC Maintenance',
                'Tire Services',
                'Full Service Package'
              ].map((service) => (
                <li key={service}>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-teal-400 transition-all duration-300 flex items-center group text-sm"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full mr-3 group-hover:bg-blue-400 transition-colors"></span>
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full mr-2 animate-pulse"></span>
              Contact Info
            </h3>
            <div className="space-y-4">
              {[
                { icon: '📍', content: '123 Auto Street\nDowntown, City 12345' },
                { icon: '📞', content: '(555) BMW-CARE', href: 'tel:+15551234567' },
                { icon: '✉️', content: 'info@carvo.com', href: 'mailto:info@carvo.com' },
                { icon: '🕒', content: 'Mon - Sat: 8AM - 6PM\nSunday: Closed' }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3 group">
                  <span className="text-teal-400 text-lg mt-0.5 group-hover:scale-110 transition-transform">{item.icon}</span>
                  {item.href ? (
                    <a 
                      href={item.href} 
                      className="text-gray-400 hover:text-teal-400 transition-colors text-sm leading-relaxed"
                    >
                      {item.content.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm leading-relaxed">
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
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-2">Stay Updated</h4>
              <p className="text-gray-400 text-sm">Get the latest BMW service tips and exclusive offers</p>
            </div>
            <div className="flex space-x-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors"
              />
              <button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <span>© {currentYear} Carvo BMW Specialists.</span>
            <span className="text-teal-400">All rights reserved.</span>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a 
                key={item}
                href="#" 
                className="text-gray-400 hover:text-teal-400 text-sm transition-colors hover:scale-105 transform"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* BMW Certification Badge */}
        <div className="text-center mt-8 pt-6 border-t border-gray-800">
          <div className="inline-flex items-center space-x-2 bg-gray-800/30 backdrop-blur-sm rounded-full px-4 py-2 border border-teal-500/20">
            <span className="text-teal-400">🏆</span>
            <span className="text-gray-300 text-sm">BMW Certified Service Center</span>
            <span className="text-teal-400">⭐</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
        }
        .animate-float { animation: float 35s ease-in-out infinite; }
      `}</style>
    </footer>
  );
};

export default Footer;