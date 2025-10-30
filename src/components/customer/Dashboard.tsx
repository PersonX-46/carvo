'use client'
// components/CustomerDashboard.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CustomerVehicle {
  id: number;
  model: string;
  registrationNumber: string;
  year: number;
  type: string;
}

interface ServiceBooking {
  id: number;
  vehicleId: number;
  bookingDate: string;
  status: string;
  reportedIssue: string;
  estimatedCost: number;
  serviceStatus?: string;
  completionDate?: string;
}

interface ServiceHistory {
  id: number;
  date: string;
  serviceType: string;
  cost: number;
  status: string;
  vehicle: string;
}

const CustomerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [customerData, setCustomerData] = useState({
    name: 'Ahmad bin Ismail',
    email: 'ahmad@demo.com',
    phone: '+60 12-345 6789',
    address: '123 Jalan Seremban, Negeri Sembilan'
  });
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [activeBookings, setActiveBookings] = useState<ServiceBooking[]>([]);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setVehicles([
        {
          id: 1,
          model: 'Toyota Vios',
          registrationNumber: 'ABC1234',
          year: 2020,
          type: 'Sedan'
        },
        {
          id: 2,
          model: 'Honda City',
          registrationNumber: 'XYZ5678',
          year: 2019,
          type: 'Sedan'
        }
      ]);

      setActiveBookings([
        {
          id: 1,
          vehicleId: 1,
          bookingDate: '2024-01-15',
          status: 'In Progress',
          reportedIssue: 'Regular maintenance and oil change',
          estimatedCost: 120,
          serviceStatus: 'Diagnostics Complete'
        },
        {
          id: 2,
          vehicleId: 2,
          bookingDate: '2024-01-20',
          status: 'Pending',
          reportedIssue: 'Brake system inspection',
          estimatedCost: 80,
          serviceStatus: 'Awaiting Parts'
        }
      ]);

      setServiceHistory([
        {
          id: 1,
          date: '2023-12-10',
          serviceType: 'Full Service',
          cost: 250,
          status: 'Completed',
          vehicle: 'Toyota Vios (ABC1234)'
        },
        {
          id: 2,
          date: '2023-11-05',
          serviceType: 'Tire Rotation',
          cost: 40,
          status: 'Completed',
          vehicle: 'Honda City (XYZ5678)'
        },
        {
          id: 3,
          date: '2023-10-15',
          serviceType: 'AC Service',
          cost: 120,
          status: 'Completed',
          vehicle: 'Toyota Vios (ABC1234)'
        }
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'completed': return 'bg-green-500/20 text-green-400';
        case 'in progress': return 'bg-yellow-500/20 text-yellow-400';
        case 'pending': return 'bg-orange-500/20 text-orange-400';
        default: return 'bg-gray-500/20 text-gray-400';
      }
    };

    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg xs:rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl xs:text-2xl">C</span>
              </div>
              <div>
                <h1 className="text-lg xs:text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  CARVO Customer
                </h1>
                <p className="text-gray-400 text-xs">Welcome back, {customerData.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 xs:space-x-4">
              <Link 
                href="/book-service" 
                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-3 xs:px-4 py-2 rounded-lg text-xs xs:text-sm font-semibold transition-all transform hover:scale-105"
              >
                📅 Book Service
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 xs:w-10 xs:h-10 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {customerData.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6">
        <div className="flex flex-col lg:flex-row gap-6 xs:gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 xs:p-5 h-fit lg:sticky lg:top-24">
            <nav className="space-y-2">
              {[
                { id: 'overview', name: '📊 Overview', icon: '📊' },
                { id: 'vehicles', name: '🚗 My Vehicles', icon: '🚗' },
                { id: 'bookings', name: '📅 My Bookings', icon: '📅' },
                { id: 'history', name: '📝 Service History', icon: '📝' },
                { id: 'profile', name: '👤 Profile', icon: '👤' },
                { id: 'support', name: '💬 Support', icon: '💬' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3 xs:px-4 py-2 xs:py-3 rounded-lg transition-all duration-300 text-sm ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-yellow-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <h3 className="text-xs xs:text-sm font-semibold text-amber-400 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link 
                  href="/book-service"
                  className="block w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-2 px-3 rounded-lg text-xs xs:text-sm font-semibold transition-all transform hover:scale-105 text-center"
                >
                  📅 Book New Service
                </Link>
                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-xs xs:text-sm font-semibold transition-all border border-gray-700">
                  🚗 Add Vehicle
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6 xs:space-y-8">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-amber-600/10 backdrop-blur-sm rounded-xl border border-amber-500/30 p-4 xs:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg xs:text-xl font-semibold text-white mb-2">
                        Welcome back, {customerData.name}! 👋
                      </h2>
                      <p className="text-amber-200 text-sm">
                        Your vehicle services are being handled by Chong Meng AutoService experts.
                      </p>
                    </div>
                    <div className="text-4xl xs:text-5xl">🚗</div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xs:gap-5">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 xs:p-5 border border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl xs:text-3xl text-blue-400 mb-2">🚗</div>
                      <p className="text-gray-400 text-xs xs:text-sm">My Vehicles</p>
                      <p className="text-2xl xs:text-3xl font-bold text-white">{vehicles.length}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 xs:p-5 border border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl xs:text-3xl text-orange-400 mb-2">📅</div>
                      <p className="text-gray-400 text-xs xs:text-sm">Active Bookings</p>
                      <p className="text-2xl xs:text-3xl font-bold text-white">{activeBookings.length}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 xs:p-5 border border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl xs:text-3xl text-green-400 mb-2">✅</div>
                      <p className="text-gray-400 text-xs xs:text-sm">Services Done</p>
                      <p className="text-2xl xs:text-3xl font-bold text-white">{serviceHistory.length}</p>
                    </div>
                  </div>
                </div>

                {/* Active Bookings */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 xs:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg xs:text-xl font-semibold text-white flex items-center">
                      <span className="mr-2">🔄</span>
                      Active Service Bookings
                    </h2>
                    <Link href="/customer/bookings" className="text-amber-400 hover:text-amber-300 text-xs xs:text-sm">
                      View All →
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {activeBookings.map((booking) => (
                      <div key={booking.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-white font-semibold text-sm xs:text-base">
                                {vehicles.find(v => v.id === booking.vehicleId)?.model}
                              </h3>
                              <StatusBadge status={booking.status} />
                            </div>
                            <p className="text-gray-400 text-xs xs:text-sm mb-2">{booking.reportedIssue}</p>
                            <p className="text-amber-400 text-xs">📅 Booked: {new Date(booking.bookingDate).toLocaleDateString()}</p>
                            {booking.serviceStatus && (
                              <p className="text-blue-400 text-xs mt-1">🛠️ {booking.serviceStatus}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-amber-400 font-semibold text-lg">RM {booking.estimatedCost}</p>
                            <button className="mt-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-xs transition-colors">
                              Track Service
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Service History */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 xs:p-5">
                  <h2 className="text-lg xs:text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">📝</span>
                    Recent Service History
                  </h2>
                  
                  <div className="space-y-3">
                    {serviceHistory.slice(0, 3).map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div>
                          <p className="text-white text-sm font-medium">{service.serviceType}</p>
                          <p className="text-gray-400 text-xs">{service.vehicle}</p>
                          <p className="text-gray-400 text-xs">📅 {new Date(service.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={service.status} />
                          <p className="text-amber-400 text-sm font-semibold mt-1">RM {service.cost}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vehicles' && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 xs:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg xs:text-xl font-semibold text-white">My Vehicles</h2>
                  <button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-3 xs:px-4 py-2 rounded-lg text-xs xs:text-sm font-semibold transition-all">
                    + Add Vehicle
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-gray-800/50 rounded-xl p-4 xs:p-5 border border-gray-700 hover:border-amber-500/30 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold text-lg">{vehicle.model}</h3>
                          <p className="text-amber-400 text-sm">{vehicle.registrationNumber}</p>
                        </div>
                        <div className="text-3xl">🚗</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs xs:text-sm">
                        <div>
                          <p className="text-gray-400">Year</p>
                          <p className="text-white">{vehicle.year}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Type</p>
                          <p className="text-white">{vehicle.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded text-xs transition-colors">
                          Book Service
                        </button>
                        <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-xs transition-colors">
                          View History
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 xs:p-5">
                <h2 className="text-lg xs:text-xl font-semibold text-white mb-4">My Service Bookings</h2>
                <p className="text-gray-400">All your service bookings and their current status...</p>
              </div>
            )}

            {/* Add other tabs content similarly */}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 p-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'overview', icon: '📊', label: 'Home' },
            { id: 'vehicles', icon: '🚗', label: 'Vehicles' },
            { id: 'bookings', icon: '📅', label: 'Bookings' },
            { id: 'profile', icon: '👤', label: 'Profile' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all text-xs ${
                activeTab === item.id
                  ? 'text-amber-400 bg-amber-500/20'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add padding for mobile bottom nav */}
      <div className="lg:hidden h-20"></div>
    </div>
  );
};

export default CustomerDashboard;