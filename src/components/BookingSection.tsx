// components/BookingSection.tsx
const BookingSection: React.FC = () => {
  return (
    <section id="booking" className="py-20 bg-gradient-to-r from-teal-500 to-blue-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Ready to Book Your Service?
        </h2>
        <p className="text-xl text-teal-100 mb-8">
          Schedule your appointment online or call us directly. Same-day service available!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="tel:+15551234567" 
            className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <span>📞</span> Call Now: (555) 123-4567
          </a>
          <button className="border-2 border-white text-white hover:bg-white hover:text-teal-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all">
            Book Online
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl mb-2">🚗</div>
            <h3 className="text-white font-semibold mb-2">Free Pickup & Delivery</h3>
            <p className="text-teal-100 text-sm">Within 10 miles of our location</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="text-white font-semibold mb-2">Same-Day Service</h3>
            <p className="text-teal-100 text-sm">For most repairs and maintenance</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl mb-2">🛡️</div>
            <h3 className="text-white font-semibold mb-2">12-Month Warranty</h3>
            <p className="text-teal-100 text-sm">On all parts and labor</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;