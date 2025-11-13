'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import VehicleManagement from './VehicleManagement';
import BookingManagement from './BookingManagement';
import ServiceHistory from './ServiceHistory';
import Profile from './Profile';
import CustomerSupport from './CustomerSupport';

interface CustomerVehicle {
  id: number;
  model: string;
  registrationNumber: string;
  year: number;
  type: string;
  lastService?: string;
  nextService?: string;
}

interface ServiceBooking {
  id: number;
  vehicleId: number;
  bookingDate: string;
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  reportedIssue: string;
  estimatedCost: number;
  serviceStatus?: string;
  completionDate?: string;
  assignedWorker?: string;
}

interface ServiceHistory {
  id: number;
  date: string;
  serviceType: string;
  cost: number;
  status: string;
  vehicle: string;
  workDone: string;
}

const CustomerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [customerData, setCustomerData] = useState({
    name: 'Ahmad bin Ismail',
    email: 'ahmad@demo.com',
    phone: '+60 12-345 6789',
    address: '123 Jalan Seremban, Negeri Sembilan',
    joinDate: '2023-05-15'
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
          type: 'Sedan',
          lastService: '2024-01-10',
          nextService: '2024-04-10'
        },
        {
          id: 2,
          model: 'Honda City',
          registrationNumber: 'XYZ5678',
          year: 2019,
          type: 'Sedan',
          lastService: '2024-01-05',
          nextService: '2024-04-05'
        }
      ]);

      setActiveBookings([
        {
          id: 1,
          vehicleId: 1,
          bookingDate: '2024-01-15 09:00',
          status: 'In Progress',
          reportedIssue: 'Regular maintenance and oil change',
          estimatedCost: 120,
          serviceStatus: 'Diagnostics Complete',
          assignedWorker: 'Ali bin Ahmad'
        },
        {
          id: 2,
          vehicleId: 2,
          bookingDate: '2024-01-20 14:00',
          status: 'Confirmed',
          reportedIssue: 'Brake system inspection',
          estimatedCost: 80,
          serviceStatus: 'Scheduled'
        }
      ]);

      setServiceHistory([
        {
          id: 1,
          date: '2023-12-10',
          serviceType: 'Full Service',
          cost: 250,
          status: 'Completed',
          vehicle: 'Toyota Vios (ABC1234)',
          workDone: 'Oil change, filter replacement, brake inspection'
        },
        {
          id: 2,
          date: '2023-11-05',
          serviceType: 'Tire Rotation',
          cost: 40,
          status: 'Completed',
          vehicle: 'Honda City (XYZ5678)',
          workDone: 'Tire rotation and pressure check'
        },
        {
          id: 3,
          date: '2023-10-15',
          serviceType: 'AC Service',
          cost: 120,
          status: 'Completed',
          vehicle: 'Toyota Vios (ABC1234)',
          workDone: 'AC gas refill and system check'
        }
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'completed': return 'bg-green-500/20 text-green-400 border border-green-500/30';
        case 'in progress': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
        case 'confirmed': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
        case 'pending': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
        case 'cancelled': return 'bg-red-500/20 text-red-400 border border-red-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status.toLowerCase()) {
        case 'completed': return '✅';
        case 'in progress': return '🔧';
        case 'confirmed': return '📅';
        case 'pending': return '⏳';
        case 'cancelled': return '❌';
        default: return '📝';
      }
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        <span className="mr-1">{getStatusIcon(status)}</span>
        {status}
      </span>
    );
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">
            {isLoading ? "..." : value}
          </p>
          {subtitle && (
            <p className="text-amber-400 text-xs font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`text-3xl p-3 rounded-xl bg-gray-700/50 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const NavigationItem = ({ id, icon, label, isActive }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 group ${
        isActive
          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25"
          : "bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-white"
      }`}
    >
      <span className="text-xl">{icon}</span>
      
      {/* Tooltip */}
      <div className="absolute left-14 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-nowrap shadow-xl border border-gray-700">
        {label}
        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
      </div>
    </button>
  );

  const navigationItems = [
    { id: "overview", icon: "📊", label: "Dashboard" },
    { id: "vehicles", icon: "🚗", label: "My Vehicles" },
    { id: "bookings", icon: "📅", label: "Bookings" },
    { id: "history", icon: "📝", label: "History" },
    { id: "profile", icon: "👤", label: "Profile" },
    { id: "support", icon: "💬", label: "Support" },
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  ChengService Customer
                </h1>
                <p className="text-gray-400 text-sm">Auto Service Portal</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Book Button */}
              <Link 
                href="/book-service" 
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-amber-500/25 flex items-center space-x-2"
              >
                <span>📅</span>
                <span>Book Service</span>
              </Link>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {customerData.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-white">{customerData.name}</p>
                  <p className="text-gray-400 text-xs">Customer since {new Date(customerData.joinDate).getFullYear()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-8">
          {/* Floating Sidebar Navigation */}
          <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-30 hidden lg:block">
            <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-3 border border-gray-700/50 shadow-2xl">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <NavigationItem
                    key={item.id}
                    id={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={activeTab === item.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 lg:ml-20">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Welcome back, {customerData.name}! 👋
                      </h2>
                      <p className="text-gray-400">
                        Your vehicles are in good hands with ChengService AutoService experts.
                      </p>
                    </div>
                    <div className="text-5xl">🚗</div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard
                    title="My Vehicles"
                    value={vehicles.length}
                    icon="🚗"
                    color="text-blue-400"
                  />
                  <StatCard
                    title="Active Bookings"
                    value={activeBookings.length}
                    icon="📅"
                    color="text-orange-400"
                  />
                  <StatCard
                    title="Services Completed"
                    value={serviceHistory.length}
                    icon="✅"
                    color="text-green-400"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Active Bookings */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <span className="text-amber-400 mr-3">🔄</span>
                        Active Bookings
                      </h3>
                      <Link
                        href="/customer/bookings"
                        className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                      >
                        View All →
                      </Link>
                    </div>

                    <div className="space-y-4">
                      {activeBookings.map((booking) => {
                        const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                        return (
                          <div
                            key={booking.id}
                            className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-amber-500/30 transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-white font-semibold text-lg mb-1">
                                  {vehicle?.model}
                                </h4>
                                <p className="text-gray-400 text-sm mb-2">
                                  {vehicle?.registrationNumber}
                                </p>
                                <StatusBadge status={booking.status} />
                              </div>
                              <div className="text-right">
                                <p className="text-amber-400 font-bold text-xl">
                                  RM {booking.estimatedCost}
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-gray-300 text-sm mb-3">
                              {booking.reportedIssue}
                            </p>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div className="text-gray-400">
                                <span className="text-amber-400">📅</span> {new Date(booking.bookingDate).toLocaleDateString()} at {formatTime(booking.bookingDate)}
                              </div>
                              {booking.assignedWorker && (
                                <div className="text-blue-400">
                                  👨‍🔧 {booking.assignedWorker}
                                </div>
                              )}
                            </div>
                            
                            {booking.serviceStatus && (
                              <div className="mt-3 p-2 bg-gray-600/30 rounded-lg">
                                <p className="text-amber-400 text-sm">
                                  🛠️ {booking.serviceStatus}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Service History */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                      <span className="text-amber-400 mr-3">📝</span>
                      Recent Services
                    </h3>

                    <div className="space-y-4">
                      {serviceHistory.slice(0, 3).map((service) => (
                        <div
                          key={service.id}
                          className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-green-500/30 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-white font-semibold mb-1">
                                {service.serviceType}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                {service.vehicle}
                              </p>
                            </div>
                            <StatusBadge status={service.status} />
                          </div>
                          
                          <p className="text-gray-300 text-sm mb-2">
                            {service.workDone}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">
                              📅 {new Date(service.date).toLocaleDateString()}
                            </span>
                            <span className="text-green-400 font-semibold">
                              RM {service.cost}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                    <span className="text-amber-400 mr-3">⚡</span>
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link 
                      href="/book-service"
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-3"
                    >
                      <span className="text-xl">📅</span>
                      <span>Book New Service</span>
                    </Link>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all border border-gray-600 flex items-center justify-center space-x-3">
                      <span className="text-xl">🚗</span>
                      <span>Add New Vehicle</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            

            {activeTab === "bookings" && <BookingManagement />}

            {activeTab === "history" && <ServiceHistory />}

            {activeTab === "profile" && <Profile />}
            
            {activeTab === "support" && <CustomerSupport />}

            {activeTab === "vehicles" && <VehicleManagement />}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50 p-4 z-40">
        <div className="grid grid-cols-5 gap-1">
          {navigationItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                activeTab === item.id
                  ? "text-amber-400 bg-amber-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
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