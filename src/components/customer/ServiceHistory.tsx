'use client';
import { useState, useEffect } from 'react';

interface ServiceHistory {
  id: number;
  date: string;
  serviceType: string;
  cost: number;
  status: string;
  vehicle: string;
  workDone: string;
  vehicleModel: string;
  registrationNumber: string;
  assignedWorker?: string;
  duration: number;
  spareParts?: string;
  repairNotes?: string;
  rating?: number;
  feedback?: string;
}

const ServiceHistory: React.FC = () => {
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'last-month' | 'last-3-months' | 'last-year'>('all');
  const [selectedService, setSelectedService] = useState<ServiceHistory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'vehicle'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Simulated data fetch
  useEffect(() => {
    const fetchServiceHistory = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockServiceHistory: ServiceHistory[] = [
          {
            id: 1,
            date: '2024-01-15',
            serviceType: 'Regular Maintenance',
            cost: 120,
            status: 'Completed',
            vehicle: 'Toyota Vios',
            vehicleModel: 'Toyota Vios',
            registrationNumber: 'ABC1234',
            workDone: 'Oil change, filter replacement, brake inspection, tire rotation',
            assignedWorker: 'Ali bin Ahmad',
            duration: 1.5,
            spareParts: 'Engine oil, oil filter, air filter',
            repairNotes: 'Vehicle in good condition. Recommended next service in 3 months.',
            rating: 5,
            feedback: 'Excellent service! Very professional and thorough.'
          },
          {
            id: 2,
            date: '2024-01-10',
            serviceType: 'Tire Rotation',
            cost: 40,
            status: 'Completed',
            vehicle: 'Honda City',
            vehicleModel: 'Honda City',
            registrationNumber: 'XYZ5678',
            workDone: 'Tire rotation, pressure check, wheel balancing',
            assignedWorker: 'Muthu Kumar',
            duration: 1,
            spareParts: 'None',
            repairNotes: 'Tires in good condition. Pressure adjusted to manufacturer specifications.',
            rating: 4,
            feedback: 'Quick and efficient service. Will come again.'
          },
          {
            id: 3,
            date: '2023-12-20',
            serviceType: 'AC Service',
            cost: 180,
            status: 'Completed',
            vehicle: 'Toyota Vios',
            vehicleModel: 'Toyota Vios',
            registrationNumber: 'ABC1234',
            workDone: 'AC gas refill, system cleaning, compressor check',
            assignedWorker: 'Chen Wei',
            duration: 2,
            spareParts: 'AC gas, cleaning solution',
            repairNotes: 'AC system working optimally. No leaks detected.',
            rating: 5,
            feedback: 'AC is cooling much better now. Great job!'
          },
          {
            id: 4,
            date: '2023-11-15',
            serviceType: 'Brake Service',
            cost: 250,
            status: 'Completed',
            vehicle: 'Honda City',
            vehicleModel: 'Honda City',
            registrationNumber: 'XYZ5678',
            workDone: 'Brake pad replacement, rotor resurfacing, fluid flush',
            assignedWorker: 'Ali bin Ahmad',
            duration: 2.5,
            spareParts: 'Brake pads, brake fluid',
            repairNotes: 'Brake system fully serviced. Safe for driving.',
            rating: 4,
            feedback: 'Brakes feel much more responsive now.'
          },
          {
            id: 5,
            date: '2023-10-05',
            serviceType: 'Full Service',
            cost: 350,
            status: 'Completed',
            vehicle: 'Proton Saga',
            vehicleModel: 'Proton Saga',
            registrationNumber: 'DEF9012',
            workDone: 'Complete vehicle inspection, engine tune-up, fluid changes',
            assignedWorker: 'Muthu Kumar',
            duration: 3,
            spareParts: 'Engine oil, filters, spark plugs, coolant',
            repairNotes: 'Vehicle in excellent condition. All systems functioning properly.',
            rating: 5,
            feedback: 'Very comprehensive service. Car runs like new!'
          },
          {
            id: 6,
            date: '2023-09-20',
            serviceType: 'Wheel Alignment',
            cost: 60,
            status: 'Completed',
            vehicle: 'Toyota Vios',
            vehicleModel: 'Toyota Vios',
            registrationNumber: 'ABC1234',
            workDone: 'Four-wheel alignment, camber adjustment',
            assignedWorker: 'Chen Wei',
            duration: 1,
            spareParts: 'None',
            repairNotes: 'Alignment corrected. Vehicle tracks straight.',
            rating: 4,
            feedback: 'Steering feels much better now.'
          },
          {
            id: 7,
            date: '2023-08-10',
            serviceType: 'Battery Replacement',
            cost: 200,
            status: 'Completed',
            vehicle: 'Honda City',
            vehicleModel: 'Honda City',
            registrationNumber: 'XYZ5678',
            workDone: 'Battery testing, replacement, terminal cleaning',
            assignedWorker: 'Ali bin Ahmad',
            duration: 1,
            spareParts: 'Car battery',
            repairNotes: 'New battery installed. Electrical system checked.',
            rating: 5,
            feedback: 'Quick battery replacement. No more starting issues.'
          },
          {
            id: 8,
            date: '2023-07-25',
            serviceType: 'Transmission Service',
            cost: 280,
            status: 'Completed',
            vehicle: 'Proton Saga',
            vehicleModel: 'Proton Saga',
            registrationNumber: 'DEF9012',
            workDone: 'Transmission fluid change, filter replacement',
            assignedWorker: 'Muthu Kumar',
            duration: 2,
            spareParts: 'Transmission fluid, filter kit',
            repairNotes: 'Transmission shifting smoothly. No issues detected.',
            rating: 4,
            feedback: 'Gear changes are much smoother after service.'
          }
        ];

        setServiceHistory(mockServiceHistory);
        setIsLoading(false);
      }, 1500);
    };

    fetchServiceHistory();
  }, []);

  // Filter and sort service history
  const filteredAndSortedHistory = serviceHistory
    .filter(service => {
      // Time filter
      const serviceDate = new Date(service.date);
      const now = new Date();
      
      if (filter === 'last-month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return serviceDate >= lastMonth;
      } else if (filter === 'last-3-months') {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        return serviceDate >= threeMonthsAgo;
      } else if (filter === 'last-year') {
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return serviceDate >= oneYearAgo;
      }
      return true;
    })
    .filter(service => {
      // Search filter
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        service.serviceType.toLowerCase().includes(term) ||
        service.vehicleModel.toLowerCase().includes(term) ||
        service.registrationNumber.toLowerCase().includes(term) ||
        service.workDone.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      // Sort
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'cost') {
        return sortOrder === 'desc' ? b.cost - a.cost : a.cost - b.cost;
      } else if (sortBy === 'vehicle') {
        return sortOrder === 'desc' 
          ? b.vehicleModel.localeCompare(a.vehicleModel)
          : a.vehicleModel.localeCompare(b.vehicleModel);
      }
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '✅';
      case 'in progress': return '🔧';
      case 'cancelled': return '❌';
      default: return '📝';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-amber-400' : 'text-gray-600'
            }`}
          >
            ★
          </span>
        ))}
        <span className="text-amber-400 ml-2 font-semibold">{rating}.0</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalSpent = filteredAndSortedHistory.reduce((sum, service) => sum + service.cost, 0);
  const totalServices = filteredAndSortedHistory.length;
  const averageRating = filteredAndSortedHistory.length > 0 
    ? filteredAndSortedHistory.reduce((sum, service) => sum + (service.rating || 0), 0) / filteredAndSortedHistory.length
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Service History</h2>
            <p className="text-gray-400">Complete record of all your vehicle services</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading service history...</p>
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
          <h2 className="text-2xl font-bold text-white">Service History</h2>
          <p className="text-gray-400">Complete record of all your vehicle services</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Total Services</p>
              <p className="text-3xl font-bold text-white">{totalServices}</p>
            </div>
            <div className="text-3xl p-3 rounded-xl bg-gray-700/50 text-blue-400">
              🔧
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Total Spent</p>
              <p className="text-3xl font-bold text-amber-400">RM {totalSpent}</p>
            </div>
            <div className="text-3xl p-3 rounded-xl bg-gray-700/50 text-green-400">
              💰
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Average Rating</p>
              <div className="flex items-center space-x-2">
                {renderStars(Math.round(averageRating))}
              </div>
            </div>
            <div className="text-3xl p-3 rounded-xl bg-gray-700/50 text-yellow-400">
              ⭐
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'all'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setFilter('last-month')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'last-month'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setFilter('last-3-months')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'last-3-months'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Last 3 Months
          </button>
          <button
            onClick={() => setFilter('last-year')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'last-year'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Last Year
          </button>
        </div>

        <div className="flex gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="date">Sort by Date</option>
            <option value="cost">Sort by Cost</option>
            <option value="vehicle">Sort by Vehicle</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white hover:bg-gray-700 transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 min-w-48"
          />
        </div>
      </div>

      {/* Service History List */}
      <div className="space-y-4">
        {filteredAndSortedHistory.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-12 border border-gray-700/50 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-white mb-2">No service history found</h3>
            <p className="text-gray-400">
              {searchTerm 
                ? `No services match "${searchTerm}"` 
                : `No services found for the selected period.`}
            </p>
          </div>
        ) : (
          filteredAndSortedHistory.map((service) => (
            <div
              key={service.id}
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedService(service)}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-xl mb-1">
                        {service.serviceType}
                      </h3>
                      <p className="text-amber-400 text-lg">
                        {service.vehicleModel} • {service.registrationNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        <span className="mr-1">{getStatusIcon(service.status)}</span>
                        {service.status}
                      </span>
                      <p className="text-amber-400 text-2xl font-bold mt-2">
                        RM {service.cost}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Service Date</p>
                      <p className="text-white font-medium">{formatDate(service.date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Duration</p>
                      <p className="text-white font-medium">{service.duration} hours</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Assigned Technician</p>
                      <p className="text-blue-400 font-medium">{service.assignedWorker || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Your Rating</p>
                      {service.rating ? (
                        renderStars(service.rating)
                      ) : (
                        <p className="text-gray-400 text-sm">Not rated</p>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm">
                    <span className="text-gray-400">Work Done:</span> {service.workDone}
                  </p>

                  {service.spareParts && (
                    <p className="text-gray-300 text-sm mt-2">
                      <span className="text-gray-400">Spare Parts:</span> {service.spareParts}
                    </p>
                  )}
                </div>

                <div className="flex lg:flex-col gap-2">
                  <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold transition-all text-sm whitespace-nowrap">
                    View Details
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-all border border-gray-600 text-sm whitespace-nowrap">
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white">Service Details</h3>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                      <span className="mr-2">🚗</span>
                      Vehicle Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Vehicle Model</p>
                        <p className="text-white font-medium">{selectedService.vehicleModel}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Registration Number</p>
                        <p className="text-white font-medium">{selectedService.registrationNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Service Type</p>
                        <p className="text-white font-medium">{selectedService.serviceType}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                      <span className="mr-2">📅</span>
                      Service Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Status</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedService.status)}`}>
                          <span className="mr-1">{getStatusIcon(selectedService.status)}</span>
                          {selectedService.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Service Date</p>
                        <p className="text-white font-medium">{formatDate(selectedService.date)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Duration</p>
                        <p className="text-white font-medium">{selectedService.duration} hours</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Cost</p>
                        <p className="text-amber-400 text-xl font-bold">RM {selectedService.cost}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                    <span className="mr-2">🔧</span>
                    Service Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Work Performed</p>
                      <p className="text-white p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        {selectedService.workDone}
                      </p>
                    </div>
                    <div className="space-y-4">
                      {selectedService.assignedWorker && (
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Assigned Technician</p>
                          <p className="text-blue-400 font-medium">{selectedService.assignedWorker}</p>
                        </div>
                      )}
                      {selectedService.spareParts && (
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Spare Parts Used</p>
                          <p className="text-white font-medium">{selectedService.spareParts}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Technician Notes */}
                {selectedService.repairNotes && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                      <span className="mr-2">📝</span>
                      Technician Notes
                    </h4>
                    <p className="text-white p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      {selectedService.repairNotes}
                    </p>
                  </div>
                )}

                {/* Feedback */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                    <span className="mr-2">⭐</span>
                    Your Feedback
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Rating</p>
                      {selectedService.rating ? (
                        renderStars(selectedService.rating)
                      ) : (
                        <p className="text-gray-400">Not rated</p>
                      )}
                    </div>
                    {selectedService.feedback && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Comments</p>
                        <p className="text-white p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                          {selectedService.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-800">
                  <button className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105">
                    Download Service Report
                  </button>
                  <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all border border-gray-700">
                    Book Similar Service
                  </button>
                  <button className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-3 px-6 rounded-xl font-semibold transition-all border border-blue-500/30">
                    Contact Technician
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceHistory;