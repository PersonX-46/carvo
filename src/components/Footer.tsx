// components/Footer.tsx
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="ml-2 text-xl font-bold">Carvo Auto Care</span>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Professional automotive repair and maintenance services with over 12 years of excellence. Your trusted partner for all car care needs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.25 14.816 3.76 13.665 3.76 12.368s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="#services" className="text-gray-400 hover:text-teal-400 transition-colors">Our Services</Link></li>
              <li><Link href="#booking" className="text-gray-400 hover:text-teal-400 transition-colors">Book Appointment</Link></li>
              <li><Link href="#about" className="text-gray-400 hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link href="#testimonials" className="text-gray-400 hover:text-teal-400 transition-colors">Testimonials</Link></li>
              <li><Link href="#contact" className="text-gray-400 hover:text-teal-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Oil Change</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Brake Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Engine Repair</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">AC Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Tire Services</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-teal-400 mr-3">📍</span>
                <span className="text-gray-400">123 Auto Street<br />Downtown, City 12345</span>
              </div>
              <div className="flex items-center">
                <span className="text-teal-400 mr-3">📞</span>
                <a href="tel:+15551234567" className="text-gray-400 hover:text-teal-400 transition-colors">
                  (555) 123-4567
                </a>
              </div>
              <div className="flex items-center">
                <span className="text-teal-400 mr-3">✉️</span>
                <a href="mailto:info@carvoautocare.com" className="text-gray-400 hover:text-teal-400 transition-colors">
                  info@carvoautocare.com
                </a>
              </div>
              <div className="flex items-center">
                <span className="text-teal-400 mr-3">🕒</span>
                <span className="text-gray-400">Mon - Sat: 8AM - 6PM<br />Sunday: Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Carvo Auto Care. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;