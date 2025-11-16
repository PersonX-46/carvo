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
  joinDate: string;
}

interface Vehicle {
  id: number;
  customerId: number;
  model: string;
  registrationNumber: string;
  year: number | null;
  type: string | null;
  color: string | null;
  engineCapacity: string | null;
  mileage: number | null;
}

interface Booking {
  id: number;
  customerId: number;
  vehicleId: number;
  vehicleModel: string;
  registrationNumber: string;
  bookingDate: string;
  status: string;
  reportedIssue: string | null;
  estimatedCost: number | null;
  serviceStatus: string | null;
}

interface CustomerStats {
  totalCustomers: number;
  totalVehicles: number;
  totalBookings: number;
  recentCustomers: number;
  activeCustomers: number;
}

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats>({
    totalCustomers: 0,
    totalVehicles: 0,
    totalBookings: 0,
    recentCustomers: 0,
    activeCustomers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'active'>('all');
  const [error, setError] = useState<string | null>(null);

  // Fetch customers list
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (activeFilter !== 'all') queryParams.append('filter', activeFilter);

      const response = await fetch(`/api/admin/customers?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch customer stats
  const fetchCustomerStats = async () => {
    try {
      const response = await fetch('/api/admin/customers/stats');
      if (response.ok) {
        const stats = await response.json();
        setCustomerStats(stats);
      }
    } catch (err) {
      console.error('Error fetching customer stats:', err);
    }
  };

  // Fetch customer details
  const fetchCustomerDetails = async (customerId: number) => {
    try {
      setIsLoadingDetails(true);
      setError(null);

      const response = await fetch(`/api/admin/customers/${customerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }

      const customerData = await response.json();
      
      setCustomerVehicles(customerData.vehicles || []);
      setCustomerBookings(customerData.bookings || []);
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError('Failed to load customer details. Please try again.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCustomers();
    fetchCustomerStats();
  }, [activeFilter]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode('details');
    await fetchCustomerDetails(customer.id);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCustomer(null);
    setCustomerVehicles([]);
    setCustomerBookings([]);
    setError(null);
  };

  const refreshData = () => {
    if (viewMode === 'list') {
      fetchCustomers();
      fetchCustomerStats();
    } else if (selectedCustomer) {
      fetchCustomerDetails(selectedCustomer.id);
    }
  };

  const getStatusBadge = (customer: Customer) => {
    if (customer.totalBookings === 0) return { text: 'New', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' };
    if (customer.totalBookings >= 5) return { text: 'Regular', color: 'bg-green-500/20 text-green-400 border border-green-500/30' };
    if (customer.totalBookings >= 3) return { text: 'Active', color: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' };
    return { text: 'Occasional', color: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' };
  };

  // Loading skeleton for customer list
  const CustomerListSkeleton = () => (
    <div className="animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-700 rounded w-20"></div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="h-4 bg-gray-700 rounded w-8 mb-1 mx-auto"></div>
                  <div className="h-3 bg-gray-700 rounded w-12"></div>
                </div>
                <div className="text-center">
                  <div className="h-4 bg-gray-700 rounded w-8 mb-1 mx-auto"></div>
                  <div className="h-3 bg-gray-700 rounded w-12"></div>
                </div>
              </div>
              <div className="w-6 h-6 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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
            <button 
              onClick={refreshData}
              disabled={isLoadingDetails}
              className="p-2 text-gray-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-gray-800/50 disabled:opacity-50"
              title="Refresh"
            >
              <span className="text-lg">🔄</span>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-gray-700">
              ✏️ Edit
            </button>
            <button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105">
              📅 New Booking
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={refreshData}
                className="text-red-400 hover:text-red-300"
              >
                Retry
              </button>
            </div>
          </div>
        )}

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
              {selectedCustomer.lastServiceDate 
                ? new Date(selectedCustomer.lastServiceDate).toLocaleDateString() 
                : 'Never'
              }
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Member Since</p>
            <p className="text-lg font-bold text-white">
              {new Date(selectedCustomer.joinDate).toLocaleDateString()}
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
              {isLoadingDetails ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                      <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-24"></div>
                    </div>
                  ))}
                </div>
              ) : customerVehicles.length > 0 ? (
                customerVehicles.map(vehicle => (
                  <div key={vehicle.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{vehicle.model}</p>
                        <p className="text-gray-400 text-sm">{vehicle.registrationNumber}</p>
                        {vehicle.year && (
                          <p className="text-gray-400 text-xs">Year: {vehicle.year}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-amber-400 text-sm">{vehicle.type || 'Not specified'}</p>
                        {vehicle.color && (
                          <p className="text-gray-400 text-xs">Color: {vehicle.color}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No vehicles registered</p>
              )}
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
            {isLoadingDetails ? (
              <div className="animate-pulse space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-48"></div>
                  </div>
                ))}
              </div>
            ) : customerBookings.length > 0 ? (
              customerBookings.map(booking => (
                <div key={booking.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">
                        {new Date(booking.bookingDate).toLocaleDateString()} - {booking.vehicleModel}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {booking.registrationNumber} - {booking.reportedIssue || 'No issue reported'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        booking.status === 'Completed' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : booking.status === 'In Progress'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : booking.status === 'Confirmed'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
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
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No bookings found</p>
            )}
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
          <button 
            onClick={refreshData}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-gray-800/50 disabled:opacity-50"
            title="Refresh"
          >
            <span className="text-lg">🔄</span>
          </button>
          <Link
            href="/admin/customers/add"
            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
          >
            ➕ Add Customer
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={refreshData}
              className="text-red-400 hover:text-red-300"
            >
              Retry
            </button>
          </div>
        </div>
      )}

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

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{customerStats.totalCustomers}</p>
          <p className="text-gray-400 text-sm">Total Customers</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{customerStats.totalVehicles}</p>
          <p className="text-gray-400 text-sm">Total Vehicles</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{customerStats.totalBookings}</p>
          <p className="text-gray-400 text-sm">Total Bookings</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{customerStats.activeCustomers}</p>
          <p className="text-gray-400 text-sm">Active Customers</p>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <CustomerListSkeleton />
        ) : (
          <div className="divide-y divide-gray-800">
            {customers.map((customer) => {
              const status = getStatusBadge(customer);
              return (
                <div
                  key={customer.id}
                  className="p-4 hover:bg-gray-800/30 transition-colors cursor-pointer group"
                  onClick={() => handleViewCustomer(customer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                        <span className="text-amber-400 font-semibold">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold group-hover:text-amber-400 transition-colors">
                          {customer.name}
                        </h3>
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
                      <div className="text-gray-400 group-hover:text-amber-400 transition-colors">→</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && customers.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400">No customers found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;