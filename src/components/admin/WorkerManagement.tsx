'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Worker {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  position: string;
  status: 'active' | 'inactive' | 'on_leave';
  specialization: string[];
  totalServices: number;
  currentWorkload: number;
  rating: number;
  hireDate: string;
  salary: number;
}

interface Service {
  id: number;
  workerId: number;
  bookingId: number;
  serviceStatus: string;
  repairNotes: string | null;
  serviceCost: number | null;
  completionDate: string | null;
  customerName: string;
  vehicleModel: string;
}

const WorkerManagement: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [workerServices, setWorkerServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'add' | 'edit'>('list');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive' | 'on_leave'>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');

  // Form states for add/edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'mechanic',
    specialization: [] as string[],
    status: 'active' as 'active' | 'inactive' | 'on_leave',
    salary: ''
  });

  // Simulated data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockWorkers: Worker[] = [
          {
            id: 1,
            name: 'Ali bin Ahmad',
            email: 'ali@chongmeng.com',
            phone: '+6012-345-6789',
            position: 'Senior Mechanic',
            status: 'active',
            specialization: ['Engine Repair', 'Transmission', 'Electrical'],
            totalServices: 156,
            currentWorkload: 3,
            rating: 4.8,
            hireDate: '2021-03-15',
            salary: 3500
          },
          {
            id: 2,
            name: 'Siti Fatimah',
            email: 'siti@chongmeng.com',
            phone: '+6013-456-7890',
            position: 'Service Advisor',
            status: 'active',
            specialization: ['Customer Service', 'Booking Management'],
            totalServices: 89,
            currentWorkload: 5,
            rating: 4.9,
            hireDate: '2022-01-10',
            salary: 2800
          },
          {
            id: 3,
            name: 'Rajesh Kumar',
            email: 'rajesh@chongmeng.com',
            phone: '+6014-567-8901',
            position: 'Mechanic',
            status: 'active',
            specialization: ['Brakes', 'Suspension', 'Tires'],
            totalServices: 92,
            currentWorkload: 2,
            rating: 4.6,
            hireDate: '2022-06-20',
            salary: 2500
          },
          {
            id: 4,
            name: 'Chen Wei',
            email: 'chen@chongmeng.com',
            phone: '+6015-678-9012',
            position: 'Electrical Specialist',
            status: 'on_leave',
            specialization: ['Electrical Systems', 'ECU Programming'],
            totalServices: 67,
            currentWorkload: 0,
            rating: 4.7,
            hireDate: '2023-02-28',
            salary: 3200
          },
          {
            id: 5,
            name: 'Ahmad Firdaus',
            email: 'ahmad@chongmeng.com',
            phone: null,
            position: 'Trainee',
            status: 'active',
            specialization: ['General Maintenance'],
            totalServices: 15,
            currentWorkload: 1,
            rating: 4.2,
            hireDate: '2024-01-05',
            salary: 1800
          },
          {
            id: 6,
            name: 'Maria Rodriguez',
            email: 'maria@chongmeng.com',
            phone: '+6016-789-0123',
            position: 'Painter',
            status: 'inactive',
            specialization: ['Bodywork', 'Painting'],
            totalServices: 45,
            currentWorkload: 0,
            rating: 4.5,
            hireDate: '2022-11-15',
            salary: 0
          }
        ];

        setWorkers(mockWorkers);
        setIsLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const fetchWorkerServices = async (workerId: number) => {
    setIsLoading(true);
    
    // Simulate API call for worker services
    setTimeout(() => {
      const mockServices: Service[] = [
        {
          id: 1,
          workerId: workerId,
          bookingId: 101,
          serviceStatus: 'Completed',
          repairNotes: 'Engine oil change, filter replacement',
          serviceCost: 120.00,
          completionDate: '2024-01-15',
          customerName: 'Ahmad bin Ismail',
          vehicleModel: 'Toyota Vios'
        },
        {
          id: 2,
          workerId: workerId,
          bookingId: 102,
          serviceStatus: 'In Progress',
          repairNotes: 'Brake system inspection and repair',
          serviceCost: 250.00,
          completionDate: null,
          customerName: 'Siti Nurhaliza',
          vehicleModel: 'Honda City'
        },
        {
          id: 3,
          workerId: workerId,
          bookingId: 103,
          serviceStatus: 'Pending',
          repairNotes: 'Electrical system diagnosis',
          serviceCost: null,
          completionDate: null,
          customerName: 'Raj Kumar',
          vehicleModel: 'Proton Saga'
        }
      ];

      setWorkerServices(mockServices);
      setIsLoading(false);
    }, 500);
  };

  const handleViewWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setViewMode('details');
    fetchWorkerServices(worker.id);
  };

  const handleAddWorker = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: 'mechanic',
      specialization: [],
      status: 'active',
      salary: ''
    });
    setViewMode('add');
  };

  const handleEditWorker = (worker: Worker) => {
    setFormData({
      name: worker.name,
      email: worker.email,
      phone: worker.phone || '',
      position: worker.position.toLowerCase().replace(' ', '_'),
      specialization: worker.specialization,
      status: worker.status,
      salary: worker.salary.toString()
    });
    setSelectedWorker(worker);
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedWorker(null);
    setWorkerServices([]);
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

  const handleSpecializationChange = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(specialization)
        ? prev.specialization.filter(s => s !== specialization)
        : [...prev.specialization, specialization]
    }));
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = activeFilter === 'all' || worker.status === activeFilter;
    const matchesPosition = positionFilter === 'all' || 
      worker.position.toLowerCase().includes(positionFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesPosition;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { text: 'Active', color: 'bg-green-500/20 text-green-400' },
      inactive: { text: 'Inactive', color: 'bg-red-500/20 text-red-400' },
      on_leave: { text: 'On Leave', color: 'bg-yellow-500/20 text-yellow-400' }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  };

  const getPositionOptions = () => {
    const positions = [...new Set(workers.map(worker => worker.position))];
    return positions;
  };

  const specializationOptions = [
    'Engine Repair',
    'Transmission',
    'Electrical',
    'Brakes',
    'Suspension',
    'Tires',
    'AC Repair',
    'Bodywork',
    'Painting',
    'Customer Service',
    'Booking Management',
    'ECU Programming',
    'General Maintenance'
  ];

  if (viewMode === 'details' && selectedWorker) {
    const status = getStatusBadge(selectedWorker.status);
    
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
              <h2 className="text-2xl font-bold text-white">{selectedWorker.name}</h2>
              <p className="text-gray-400">{selectedWorker.position}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => handleEditWorker(selectedWorker)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-gray-700"
            >
              ✏️ Edit
            </button>
            <button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105">
              📊 Performance
            </button>
          </div>
        </div>

        {/* Worker Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Services</p>
            <p className="text-2xl font-bold text-white">{selectedWorker.totalServices}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Current Workload</p>
            <p className="text-2xl font-bold text-white">{selectedWorker.currentWorkload}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Rating</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-white">{selectedWorker.rating}</p>
              <span className="text-amber-400">⭐</span>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Status</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs ${status.color}`}>
              {status.text}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Personal Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{selectedWorker.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white">{selectedWorker.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Hire Date</p>
                <p className="text-white">{new Date(selectedWorker.hireDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Salary</p>
                <p className="text-white">RM {selectedWorker.salary.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🔧</span>
              Specializations
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedWorker.specialization.map(spec => (
                <span
                  key={spec}
                  className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Current Services */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Current Services ({workerServices.length})
          </h3>
          <div className="space-y-3">
            {workerServices.map(service => (
              <div key={service.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{service.customerName}</p>
                    <p className="text-gray-400 text-sm">{service.vehicleModel}</p>
                    <p className="text-gray-400 text-sm mt-1">{service.repairNotes}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      service.serviceStatus === 'Completed' 
                        ? 'bg-green-500/20 text-green-400'
                        : service.serviceStatus === 'In Progress'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {service.serviceStatus}
                    </span>
                    {service.serviceCost && (
                      <p className="text-amber-400 font-semibold mt-1">
                        RM {service.serviceCost.toFixed(2)}
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

  if (viewMode === 'add' || viewMode === 'edit') {
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
              <h2 className="text-2xl font-bold text-white">
                {viewMode === 'add' ? 'Add New Worker' : 'Edit Worker'}
              </h2>
              <p className="text-gray-400">
                {viewMode === 'add' ? 'Create a new worker account' : `Editing ${selectedWorker?.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Worker Form */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Position *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                >
                  <option value="mechanic">Mechanic</option>
                  <option value="senior_mechanic">Senior Mechanic</option>
                  <option value="electrical_specialist">Electrical Specialist</option>
                  <option value="service_advisor">Service Advisor</option>
                  <option value="painter">Painter</option>
                  <option value="trainee">Trainee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'on_leave' }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Salary (RM) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter monthly salary"
                />
              </div>
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Specializations
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {specializationOptions.map(spec => (
                  <label key={spec} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.specialization.includes(spec)}
                      onChange={() => handleSpecializationChange(spec)}
                      className="w-4 h-4 text-amber-500 bg-gray-800 border-gray-700 rounded focus:ring-amber-500"
                    />
                    <span className="text-gray-300 text-sm">{spec}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={handleBackToList}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors border border-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-xl font-medium transition-all transform hover:scale-105"
              >
                {viewMode === 'add' ? 'Add Worker' : 'Update Worker'}
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
          <h2 className="text-2xl font-bold text-white">Worker Management</h2>
          <p className="text-gray-400">Manage workshop staff and their assignments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddWorker}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
          >
            ➕ Add Worker
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search workers by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
            <span className="absolute right-3 top-3 text-gray-400">🔍</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          >
            <option value="all">All Positions</option>
            {getPositionOptions().map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
              activeFilter === 'active'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveFilter('on_leave')}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
              activeFilter === 'on_leave'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            On Leave
          </button>
        </div>
      </div>

      {/* Workers List */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-2">Loading workers...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredWorkers.map((worker) => {
              const status = getStatusBadge(worker.status);
              return (
                <div
                  key={worker.id}
                  className="p-4 hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => handleViewWorker(worker)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <span className="text-amber-400 font-semibold">
                          {worker.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{worker.name}</h3>
                        <p className="text-gray-400 text-sm">{worker.position}</p>
                        <p className="text-gray-400 text-sm">{worker.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-white font-bold">{worker.totalServices}</p>
                            <p className="text-gray-400 text-xs">Services</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-bold">{worker.currentWorkload}</p>
                            <p className="text-gray-400 text-xs">Workload</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-bold">{worker.rating}</p>
                            <p className="text-gray-400 text-xs">Rating</p>
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

        {!isLoading && filteredWorkers.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400">No workers found matching your search.</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{workers.length}</p>
          <p className="text-gray-400 text-sm">Total Workers</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {workers.filter(w => w.status === 'active').length}
          </p>
          <p className="text-gray-400 text-sm">Active Workers</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {workers.reduce((sum, worker) => sum + worker.currentWorkload, 0)}
          </p>
          <p className="text-gray-400 text-sm">Total Workload</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {workers.reduce((sum, worker) => sum + worker.totalServices, 0)}
          </p>
          <p className="text-gray-400 text-sm">Total Services</p>
        </div>
      </div>
    </div>
  );
};

export default WorkerManagement;