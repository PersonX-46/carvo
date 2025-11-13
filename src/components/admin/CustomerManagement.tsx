'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  totalVehicles: number;
  totalBookings: number;
  lastServiceDate: string | null;
  createdAt: string;
}

interface Vehicle {
  id: number;
  customerId: number;
  model: string;
  registrationNumber: string;
  year: number | null;
  type: string | null;
}

interface Booking {
  id: number;
  customerId: number;
  vehicleId: number;
  bookingDate: string;
  status: string;
  reportedIssue: string | null;
  estimatedCost: number | null;
}

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'active'>('all');

  // Simulated data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockCustomers: Customer[] = [
          {
            id: 1,
            name: 'Ahmad bin Ismail',
            email: 'ahmad@email.com',
            phone: '+6012-345-6789',
            address: '123 Jalan Merdeka, Seremban',
            totalVehicles: 2,
            totalBookings: 5,
            lastServiceDate: '2024-01-15',
            createdAt: '2023-05-20'
          },
          {
            id: 2,
            name: 'Siti Nurhaliza',
            email: 'siti@email.com',
            phone: '+6013-456-7890',
            address: '456 Taman Bahagia, Seremban',
            totalVehicles: 1,
            totalBookings: 3,
            lastServiceDate: '2024-01-10',
            createdAt: '2023-08-15'
          },
          {
            id: 3,
            name: 'Raj Kumar',
            email: 'raj@email.com',
            phone: '+6014-567-8901',
            address: '789 Jalan Sentosa, Seremban',
            totalVehicles: 1,
            totalBookings: 2,
            lastServiceDate: '2024-01-08',
            createdAt: '2023-11-30'
          },
          {
            id: 4,
            name: 'Mei Ling',
            email: 'meiling@email.com',
            phone: '+6015-678-9012',
            address: '321 Taman Mewah, Seremban',
            totalVehicles: 3,
            totalBookings: 8,
            lastServiceDate: '2024-01-12',
            createdAt: '2023-03-10'
          },
          {
            id: 5,
            name: 'John Lim',
            email: 'john@email.com',
            phone: '+6016-789-0123',
            address: null,
            totalVehicles: 1,
            totalBookings: 1,
            lastServiceDate: null,
            createdAt: '2024-01-05'
          }
        ];

        setCustomers(mockCustomers);
        setIsLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const fetchCustomerDetails = async (customerId: number) => {
    setIsLoading(true);
    
    // Simulate API calls for customer details
    setTimeout(() => {
      const mockVehicles: Vehicle[] = [
        {
          id: 1,
          customerId: customerId,
          model: 'Toyota Vios',
          registrationNumber: 'ABC1234',
          year: 2020,
          type: 'Sedan'
        },
        {
          id: 2,
          customerId: customerId,
          model: 'Honda Civic',
          registrationNumber: 'DEF5678',
          year: 2022,
          type: 'Sedan'
        }
      ];

      const mockBookings: Booking[] = [
        {
          id: 1,
          customerId: customerId,
          vehicleId: 1,
          bookingDate: '2024-01-15',
          status: 'Completed',
          reportedIssue: 'Engine oil change and general maintenance',
          estimatedCost: 120.00
        },
        {
          id: 2,
          customerId: customerId,
          vehicleId: 2,
          bookingDate: '2024-01-20',
          status: 'Pending',
          reportedIssue: 'Brake system check',
          estimatedCost: 80.00
        }
      ];

      setCustomerVehicles(mockVehicles);
      setCustomerBookings(mockBookings);
      setIsLoading(false);
    }, 500);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode('details');
    fetchCustomerDetails(customer.id);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCustomer(null);
    setCustomerVehicles([]);
    setCustomerBookings([]);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const getStatusBadge = (customer: Customer) => {
    if (customer.totalBookings === 0) return { text: 'New', color: 'bg-blue-500/20 text-blue-400' };
    if (customer.totalBookings >= 5) return { text: 'Regular', color: 'bg-green-500/20 text-green-400' };
    return { text: 'Active', color: 'bg-amber-500/20 text-amber-400' };
  };

  if (viewMode === 'details' && selectedCustomer) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="p-2 text-gray-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-gray-800/50"
            >
              <span className="text-lg">←</span>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">{selectedCustomer.name}</h2>
              <p className="text-gray-400">Customer Details</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-gray-700">
              ✏️ Edit
            </button>
            <button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105">
              📅 New Booking
            </button>
          </div>
        </div>

        {/* Customer Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Vehicles</p>
            <p className="text-2xl font-bold text-white">{selectedCustomer.totalVehicles}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Bookings</p>
            <p className="text-2xl font-bold text-white">{selectedCustomer.totalBookings}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Last Service</p>
            <p className="text-lg font-bold text-white">
              {selectedCustomer.lastServiceDate ? new Date(selectedCustomer.lastServiceDate).toLocaleDateString() : 'Never'}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Member Since</p>
            <p className="text-lg font-bold text-white">
              {new Date(selectedCustomer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">📞</span>
              Contact Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{selectedCustomer.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white">{selectedCustomer.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Address</p>
                <p className="text-white">
                  {selectedCustomer.address || 'No address provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicles */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <span className="mr-2">🚗</span>
                Vehicles ({customerVehicles.length})
              </h3>
              <button className="text-amber-400 hover:text-amber-300 text-sm">
                + Add Vehicle
              </button>
            </div>
            <div className="space-y-3">
              {customerVehicles.map(vehicle => (
                <div key={vehicle.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{vehicle.model}</p>
                      <p className="text-gray-400 text-sm">{vehicle.registrationNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 text-sm">{vehicle.year || 'N/A'}</p>
                      <p className="text-gray-400 text-xs">{vehicle.type || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Recent Bookings
          </h3>
          <div className="space-y-3">
            {customerBookings.map(booking => (
              <div key={booking.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {booking.reportedIssue || 'No issue reported'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      booking.status === 'Completed' 
                        ? 'bg-green-500/20 text-green-400'
                        : booking.status === 'In Progress'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {booking.status}
                    </span>
                    {booking.estimatedCost && (
                      <p className="text-amber-400 font-semibold mt-1">
                        RM {booking.estimatedCost.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Customer Management</h2>
          <p className="text-gray-400">Manage all customer accounts and their vehicles</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/customers/add"
            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
          >
            ➕ Add Customer
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
            <span className="absolute right-3 top-3 text-gray-400">🔍</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('recent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'recent'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'active'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Active
          </button>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-2">Loading customers...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredCustomers.map((customer) => {
              const status = getStatusBadge(customer);
              return (
                <div
                  key={customer.id}
                  className="p-4 hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => handleViewCustomer(customer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <span className="text-amber-400 font-semibold">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{customer.name}</h3>
                        <p className="text-gray-400 text-sm">{customer.email}</p>
                        <p className="text-gray-400 text-sm">{customer.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-white font-bold">{customer.totalVehicles}</p>
                            <p className="text-gray-400 text-xs">Vehicles</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-bold">{customer.totalBookings}</p>
                            <p className="text-gray-400 text-xs">Bookings</p>
                          </div>
                        </div>
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      <div className="text-gray-400">→</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && filteredCustomers.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400">No customers found matching your search.</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{customers.length}</p>
          <p className="text-gray-400 text-sm">Total Customers</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {customers.reduce((sum, customer) => sum + customer.totalVehicles, 0)}
          </p>
          <p className="text-gray-400 text-sm">Total Vehicles</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {customers.reduce((sum, customer) => sum + customer.totalBookings, 0)}
          </p>
          <p className="text-gray-400 text-sm">Total Bookings</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;