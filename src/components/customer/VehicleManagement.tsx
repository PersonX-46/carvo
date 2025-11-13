'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CustomerVehicle {
  id: number;
  model: string;
  registrationNumber: string;
  year: number;
  type: string;
  color?: string;
  engineCapacity?: string;
  lastService?: string;
  nextService?: string;
  mileage?: number;
  insuranceExpiry?: string;
  roadTaxExpiry?: string;
}

interface ServiceRecord {
  id: number;
  vehicleId: number;
  date: string;
  serviceType: string;
  cost: number;
  workDone: string;
  mileage: number;
  nextServiceDue: string;
}

const VehicleManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<CustomerVehicle | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'add' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    model: '',
    registrationNumber: '',
    year: new Date().getFullYear(),
    type: 'sedan',
    color: '',
    engineCapacity: '',
    mileage: '',
    insuranceExpiry: '',
    roadTaxExpiry: ''
  });

  // Simulated data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockVehicles: CustomerVehicle[] = [
          {
            id: 1,
            model: 'Toyota Vios',
            registrationNumber: 'ABC1234',
            year: 2020,
            type: 'Sedan',
            color: 'Silver',
            engineCapacity: '1.5L',
            lastService: '2024-01-10',
            nextService: '2024-04-10',
            mileage: 45230,
            insuranceExpiry: '2024-12-31',
            roadTaxExpiry: '2024-12-31'
          },
          {
            id: 2,
            model: 'Honda City',
            registrationNumber: 'XYZ5678',
            year: 2019,
            type: 'Sedan',
            color: 'White',
            engineCapacity: '1.5L',
            lastService: '2024-01-05',
            nextService: '2024-04-05',
            mileage: 38760,
            insuranceExpiry: '2024-11-30',
            roadTaxExpiry: '2024-11-30'
          },
          {
            id: 3,
            model: 'Proton Saga',
            registrationNumber: 'DEF9012',
            year: 2021,
            type: 'Sedan',
            color: 'Red',
            engineCapacity: '1.3L',
            lastService: '2024-01-15',
            nextService: '2024-04-15',
            mileage: 21500,
            insuranceExpiry: '2025-01-31',
            roadTaxExpiry: '2025-01-31'
          }
        ];

        const mockServiceHistory: ServiceRecord[] = [
          {
            id: 1,
            vehicleId: 1,
            date: '2024-01-10',
            serviceType: 'Regular Maintenance',
            cost: 120,
            workDone: 'Oil change, filter replacement, tire rotation',
            mileage: 45000,
            nextServiceDue: '2024-04-10'
          },
          {
            id: 2,
            vehicleId: 1,
            date: '2023-10-15',
            serviceType: 'Full Service',
            cost: 250,
            workDone: 'Complete vehicle inspection and maintenance',
            mileage: 40000,
            nextServiceDue: '2024-01-10'
          },
          {
            id: 3,
            vehicleId: 1,
            date: '2023-07-20',
            serviceType: 'Brake Service',
            cost: 180,
            workDone: 'Brake pads replacement and fluid change',
            mileage: 35000,
            nextServiceDue: '2023-10-15'
          }
        ];

        setVehicles(mockVehicles);
        setServiceHistory(mockServiceHistory);
        setIsLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const handleViewVehicle = (vehicle: CustomerVehicle) => {
    setSelectedVehicle(vehicle);
    setViewMode('details');
    // In a real app, you would fetch service history for this specific vehicle
  };

  const handleAddVehicle = () => {
    setFormData({
      model: '',
      registrationNumber: '',
      year: new Date().getFullYear(),
      type: 'sedan',
      color: '',
      engineCapacity: '',
      mileage: '',
      insuranceExpiry: '',
      roadTaxExpiry: ''
    });
    setViewMode('add');
  };

  const handleEditVehicle = (vehicle: CustomerVehicle) => {
    setFormData({
      model: vehicle.model,
      registrationNumber: vehicle.registrationNumber,
      year: vehicle.year,
      type: vehicle.type.toLowerCase(),
      color: vehicle.color || '',
      engineCapacity: vehicle.engineCapacity || '',
      mileage: vehicle.mileage?.toString() || '',
      insuranceExpiry: vehicle.insuranceExpiry || '',
      roadTaxExpiry: vehicle.roadTaxExpiry || ''
    });
    setSelectedVehicle(vehicle);
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedVehicle(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form data:', formData);
    // Simulate API call
    setTimeout(() => {
      setViewMode('list');
    }, 1000);
  };

  const handleDeleteVehicle = (vehicleId: number) => {
    if (confirm('Are you sure you want to remove this vehicle?')) {
      // Handle delete operation
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    }
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (dateString: string) => {
    const daysUntil = getDaysUntil(dateString);
    if (daysUntil < 0) return { status: 'Expired', color: 'text-red-400 bg-red-500/20' };
    if (daysUntil <= 30) return { status: 'Soon', color: 'text-orange-400 bg-orange-500/20' };
    return { status: 'Valid', color: 'text-green-400 bg-green-500/20' };
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (viewMode === 'details' && selectedVehicle) {
    const insuranceStatus = getExpiryStatus(selectedVehicle.insuranceExpiry || '');
    const roadTaxStatus = getExpiryStatus(selectedVehicle.roadTaxExpiry || '');
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="p-2 text-gray-400 hover:text-amber-400 transition-colors rounded-xl hover:bg-gray-800/50"
            >
              <span className="text-lg">←</span>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">{selectedVehicle.model}</h2>
              <p className="text-amber-400">{selectedVehicle.registrationNumber}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => handleEditVehicle(selectedVehicle)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-colors border border-gray-700"
            >
              ✏️ Edit
            </button>
            <Link
              href={`/book-service?vehicle=${selectedVehicle.id}`}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105"
            >
              📅 Book Service
            </Link>
          </div>
        </div>

        {/* Vehicle Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm">Mileage</p>
            <p className="text-2xl font-bold text-white">{selectedVehicle.mileage?.toLocaleString()} km</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm">Last Service</p>
            <p className="text-lg font-bold text-white">
              {selectedVehicle.lastService ? new Date(selectedVehicle.lastService).toLocaleDateString() : 'Never'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm">Next Service</p>
            <p className="text-lg font-bold text-amber-400">
              {selectedVehicle.nextService ? new Date(selectedVehicle.nextService).toLocaleDateString() : 'Not scheduled'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-4 border border-gray-700/50">
            <p className="text-gray-400 text-sm">Vehicle Age</p>
            <p className="text-lg font-bold text-white">
              {new Date().getFullYear() - selectedVehicle.year} years
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Details */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-3">🚗</span>
              Vehicle Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Registration No.</p>
                <p className="text-white font-medium">{selectedVehicle.registrationNumber}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Year</p>
                <p className="text-white font-medium">{selectedVehicle.year}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Type</p>
                <p className="text-white font-medium">{selectedVehicle.type}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Color</p>
                <p className="text-white font-medium">{selectedVehicle.color || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Engine Capacity</p>
                <p className="text-white font-medium">{selectedVehicle.engineCapacity || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Document Status */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-3">📄</span>
              Document Status
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Insurance</p>
                  <p className="text-gray-400 text-sm">
                    Expires: {selectedVehicle.insuranceExpiry ? new Date(selectedVehicle.insuranceExpiry).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${insuranceStatus.color}`}>
                  {insuranceStatus.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Road Tax</p>
                  <p className="text-gray-400 text-sm">
                    Expires: {selectedVehicle.roadTaxExpiry ? new Date(selectedVehicle.roadTaxExpiry).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${roadTaxStatus.color}`}>
                  {roadTaxStatus.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Service History */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-3">🔧</span>
            Service History
          </h3>
          <div className="space-y-4">
            {serviceHistory.filter(service => service.vehicleId === selectedVehicle.id).map(service => (
              <div key={service.id} className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-semibold">{service.serviceType}</h4>
                    <p className="text-gray-400 text-sm">
                      {new Date(service.date).toLocaleDateString()} • {service.mileage.toLocaleString()} km
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-400 font-bold text-lg">RM {service.cost}</p>
                    <p className="text-green-400 text-sm">Completed</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{service.workDone}</p>
                <div className="flex justify-between items-center mt-3 text-sm">
                  <span className="text-gray-400">
                    Next service: {new Date(service.nextServiceDue).toLocaleDateString()}
                  </span>
                  <button className="text-amber-400 hover:text-amber-300 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="p-2 text-gray-400 hover:text-amber-400 transition-colors rounded-xl hover:bg-gray-800/50"
            >
              <span className="text-lg">←</span>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {viewMode === 'add' ? 'Add New Vehicle' : 'Edit Vehicle'}
              </h2>
              <p className="text-gray-400">
                {viewMode === 'add' ? 'Add a new vehicle to your account' : `Editing ${selectedVehicle?.model}`}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Form */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vehicle Model *
                </label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="e.g., Toyota Vios, Honda City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="e.g., ABC1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Year *
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                >
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vehicle Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="mpv">MPV</option>
                  <option value="pickup">Pickup Truck</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="e.g., Red, Blue, Black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Engine Capacity
                </label>
                <input
                  type="text"
                  value={formData.engineCapacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, engineCapacity: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="e.g., 1.5L, 2.0L"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Mileage (km)
                </label>
                <input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="e.g., 45000"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={handleBackToList}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors border border-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-medium transition-all transform hover:scale-105"
              >
                {viewMode === 'add' ? 'Add Vehicle' : 'Update Vehicle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">My Vehicles</h2>
          <p className="text-gray-400">Manage your vehicles and service schedules</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddVehicle}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search vehicles by model or registration number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          />
          <span className="absolute right-3 top-3 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Vehicles Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading your vehicles...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => {
            const insuranceStatus = getExpiryStatus(vehicle.insuranceExpiry || '');
            const needsService = vehicle.nextService && getDaysUntil(vehicle.nextService) <= 30;
            
            return (
              <div
                key={vehicle.id}
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300 cursor-pointer group"
                onClick={() => handleViewVehicle(vehicle)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-xl mb-1 group-hover:text-amber-400 transition-colors">
                      {vehicle.model}
                    </h3>
                    <p className="text-amber-400 text-lg font-medium">
                      {vehicle.registrationNumber}
                    </p>
                  </div>
                  <div className="text-3xl">🚗</div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Year</span>
                    <span className="text-white">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Type</span>
                    <span className="text-white">{vehicle.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Mileage</span>
                    <span className="text-white">{vehicle.mileage?.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Insurance</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${insuranceStatus.color}`}>
                      {insuranceStatus.status}
                    </span>
                  </div>
                </div>

                {needsService && (
                  <div className="mb-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-amber-400 text-sm font-medium">
                      ⚠️ Service due soon
                    </p>
                    <p className="text-amber-300 text-xs">
                      Next service: {vehicle.nextService ? new Date(vehicle.nextService).toLocaleDateString() : ''}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Link 
                    href={`/book-service?vehicle=${vehicle.id}`}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl font-semibold transition-all text-center text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Book Service
                  </Link>
                  <button 
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-xl font-semibold transition-all border border-gray-600 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditVehicle(vehicle);
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && filteredVehicles.length === 0 && (
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-12 border border-gray-700/50 text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-2xl font-bold text-white mb-2">No vehicles found</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm ? 'No vehicles match your search.' : 'Get started by adding your first vehicle.'}
          </p>
          <button
            onClick={handleAddVehicle}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
          >
            Add Your First Vehicle
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;