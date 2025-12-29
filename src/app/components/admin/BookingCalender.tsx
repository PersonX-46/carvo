'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Worker {
  id: number;
  name: string;
  position: string;
  specialization: string | null;
  currentWorkload: number;
  status: string;
}

interface Booking {
  id: number;
  customerId: number;
  vehicleId: number;
  workerId: number | null;
  bookingDate: string;
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'Price Pending';
  reportedIssue: string;
  estimatedCost: number | null;
  confirmed: boolean;
  duration: number;
  priceApproved: boolean | null;
  priceRejected: boolean | null;
  rejectionReason: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  vehicle: {
    model: string;
    registrationNumber: string;
    type: string | null;
  };
  service?: {
    serviceStatus: string;
    repairNotes: string | null;
    serviceCost: number | null;
    worker?: {
      id: number;
      name: string;
      position: string;
    };
  };
  assignedWorker?: Worker | null;
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  bookings: Booking[];
}

const BookingCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('list');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all'); // 'all', 'unassigned', 'assigned', 'new', 'pending', 'in-progress', 'completed', 'cancelled', 'price-pending'
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real bookings and workers from API
  useEffect(() => {
    fetchBookings();
    fetchWorkers();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError('');

      const url = `/api/admin/bookings${filter !== 'all' ? `?filter=${filter}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const result = await response.json();
      setBookings(result.bookings || []);

    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await fetch('/api/admin/workers?status=active');
      if (!response.ok) {
        throw new Error('Failed to fetch workers');
      }
      const result = await response.json();
      setWorkers(result.workers || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const updateBookingStatus = async (bookingId: number, status: Booking['status']) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status } : booking
      ));
      
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, status } : null);
      }

      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      return false;
    }
  };

  const assignWorkerToBooking = async (bookingId: number, workerId: number) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign worker');
      }

      // Update local state
      const updatedBooking = await response.json();
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, ...updatedBooking } : booking
      ));
      
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, ...updatedBooking } : null);
      }

      setShowAssignModal(false);
      setSelectedWorkerId(null);
      return true;
    } catch (error) {
      console.error('Error assigning worker:', error);
      return false;
    }
  };

  const handleStatusChange = async (bookingId: number, newStatus: Booking['status']) => {
    const success = await updateBookingStatus(bookingId, newStatus);
    if (success) {
      alert(`Booking status updated to ${newStatus}`);
    } else {
      alert('Failed to update booking status');
    }
  };

  const handleAssignWorker = async (bookingId: number) => {
    if (!selectedWorkerId) {
      alert('Please select a worker');
      return;
    }

    const success = await assignWorkerToBooking(bookingId, selectedWorkerId);
    if (success) {
      alert('Worker assigned successfully');
    } else {
      alert('Failed to assign worker');
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    const success = await updateBookingStatus(bookingId, 'Cancelled');
    if (success) {
      setSelectedBooking(null);
      alert('Booking cancelled successfully');
    } else {
      alert('Failed to cancel booking');
    }
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter(booking => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      booking.customer.name.toLowerCase().includes(query) ||
      booking.customer.phone.toLowerCase().includes(query) ||
      booking.vehicle.model.toLowerCase().includes(query) ||
      booking.vehicle.registrationNumber.toLowerCase().includes(query) ||
      booking.reportedIssue.toLowerCase().includes(query)
    );
  });

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    const startDay = firstDay.getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Get days in week
  const getDaysInWeek = (date: Date, weekOffset: number = 0) => {
    const startDate = new Date(date);
    const day = startDate.getDay();
    startDate.setDate(startDate.getDate() - day + (weekOffset * 7));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      days.push(currentDate);
    }
    return days;
  };

  // Get time slots for a day
  const getTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotBookings = filteredBookings.filter(booking => {
          const bookingDate = new Date(booking.bookingDate);
          return bookingDate.toDateString() === date.toDateString() && 
                 bookingDate.getHours() === hour && 
                 bookingDate.getMinutes() === minute;
        });
        
        slots.push({
          time: timeString,
          hour,
          minute,
          bookings: slotBookings
        });
      }
    }
    return slots;
  };

  const getBookingsForDate = (date: Date) => {
    return filteredBookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Price Pending': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'In Progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getFilterCount = (filterType: string) => {
    switch (filterType) {
      case 'unassigned': return bookings.filter(b => !b.workerId && b.status !== 'Cancelled').length;
      case 'assigned': return bookings.filter(b => b.workerId && b.status !== 'Cancelled').length;
      case 'new': return bookings.filter(b => b.status === 'Pending').length;
      case 'pending': return bookings.filter(b => b.status === 'Pending').length;
      case 'in-progress': return bookings.filter(b => b.status === 'In Progress').length;
      case 'completed': return bookings.filter(b => b.status === 'Completed').length;
      case 'cancelled': return bookings.filter(b => b.status === 'Cancelled').length;
      case 'price-pending': return bookings.filter(b => b.status === 'Price Pending' || !b.priceApproved).length;
      default: return bookings.length;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => prev + (direction === 'next' ? 1 : -1));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getServiceType = (booking: Booking) => {
    if (booking.reportedIssue?.toLowerCase().includes('oil')) return 'Oil Change';
    if (booking.reportedIssue?.toLowerCase().includes('brake')) return 'Brake Service';
    if (booking.reportedIssue?.toLowerCase().includes('ac')) return 'AC Service';
    if (booking.reportedIssue?.toLowerCase().includes('tire')) return 'Tire Service';
    if (booking.reportedIssue?.toLowerCase().includes('battery')) return 'Battery Service';
    return 'General Service';
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = getDaysInWeek(currentDate, currentWeek);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-red-400 text-lg mb-4">⚠️ {error}</div>
            <button 
              onClick={fetchBookings}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {view === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            {view === 'week' && `Week of ${weekDays[0].toLocaleDateString()} - ${weekDays[6].toLocaleDateString()}`}
            {view === 'day' && selectedDate && `${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
            {view === 'list' && 'All Bookings'}
          </h2>
          <p className="text-gray-400 text-sm">
            {filteredBookings.length} bookings • Manage and view all service bookings
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-800/50 rounded-lg border border-gray-700 p-1">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                view === 'list' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                view === 'month' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                view === 'week' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => {
                setView('day');
                setSelectedDate(new Date());
              }}
              className={`px-3 py-1 rounded text-sm transition-all ${
                view === 'day' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Day
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (view === 'month') navigateMonth('prev');
                if (view === 'week') navigateWeek('prev');
                if (view === 'day' && selectedDate) {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setSelectedDate(newDate);
                }
              }}
              className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => {
                setCurrentDate(new Date());
                setCurrentWeek(0);
                setSelectedDate(new Date());
              }}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                if (view === 'month') navigateMonth('next');
                if (view === 'week') navigateWeek('next');
                if (view === 'day' && selectedDate) {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 1);
                  setSelectedDate(newDate);
                }
              }}
              className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by customer name, phone, vehicle, or issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-3 text-gray-400">
              🔍
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="all">All Bookings ({getFilterCount('all')})</option>
            <option value="unassigned">Unassigned ({getFilterCount('unassigned')})</option>
            <option value="assigned">Assigned ({getFilterCount('assigned')})</option>
            <option value="new">New ({getFilterCount('new')})</option>
            <option value="pending">Pending ({getFilterCount('pending')})</option>
            <option value="in-progress">In Progress ({getFilterCount('in-progress')})</option>
            <option value="completed">Completed ({getFilterCount('completed')})</option>
            <option value="cancelled">Cancelled ({getFilterCount('cancelled')})</option>
            <option value="price-pending">Price Pending ({getFilterCount('price-pending')})</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div 
          onClick={() => setFilter('all')}
          className="bg-gray-800/50 rounded-xl p-3 border border-gray-700 cursor-pointer hover:border-amber-500/30 transition-colors"
        >
          <div className="text-xl font-bold text-white">{bookings.length}</div>
          <div className="text-gray-400 text-xs">Total</div>
        </div>
        <div 
          onClick={() => setFilter('unassigned')}
          className="bg-gray-800/50 rounded-xl p-3 border border-gray-700 cursor-pointer hover:border-amber-500/30 transition-colors"
        >
          <div className="text-xl font-bold text-purple-400">
            {getFilterCount('unassigned')}
          </div>
          <div className="text-gray-400 text-xs">Unassigned</div>
        </div>
        <div 
          onClick={() => setFilter('new')}
          className="bg-gray-800/50 rounded-xl p-3 border border-gray-700 cursor-pointer hover:border-amber-500/30 transition-colors"
        >
          <div className="text-xl font-bold text-orange-400">
            {getFilterCount('new')}
          </div>
          <div className="text-gray-400 text-xs">New</div>
        </div>
        <div 
          onClick={() => setFilter('in-progress')}
          className="bg-gray-800/50 rounded-xl p-3 border border-gray-700 cursor-pointer hover:border-amber-500/30 transition-colors"
        >
          <div className="text-xl font-bold text-yellow-400">
            {getFilterCount('in-progress')}
          </div>
          <div className="text-gray-400 text-xs">In Progress</div>
        </div>
        <div 
          onClick={() => setFilter('completed')}
          className="bg-gray-800/50 rounded-xl p-3 border border-gray-700 cursor-pointer hover:border-amber-500/30 transition-colors"
        >
          <div className="text-xl font-bold text-green-400">
            {getFilterCount('completed')}
          </div>
          <div className="text-gray-400 text-xs">Completed</div>
        </div>
        <div 
          onClick={() => setFilter('price-pending')}
          className="bg-gray-800/50 rounded-xl p-3 border border-gray-700 cursor-pointer hover:border-amber-500/30 transition-colors"
        >
          <div className="text-xl font-bold text-blue-400">
            {getFilterCount('price-pending')}
          </div>
          <div className="text-gray-400 text-xs">Price Pending</div>
        </div>
      </div>

      {/* List View (Default) */}
      {view === 'list' && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Booking ID</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Customer</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Vehicle</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Date & Time</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Worker</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Cost</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-amber-400 font-mono">#{booking.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-white">{booking.customer.name}</div>
                        <div className="text-sm text-gray-400">{booking.customer.phone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-white">{booking.vehicle.model}</div>
                        <div className="text-sm text-gray-400">{booking.vehicle.registrationNumber}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-white">
                          {new Date(booking.bookingDate).toLocaleDateString('en-MY')}
                        </div>
                        <div className="text-sm text-amber-400">
                          {formatTime(booking.bookingDate)}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {booking.service?.worker ? (
                        <div className="text-white">{booking.service.worker.name}</div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowAssignModal(true);
                          }}
                          className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                        >
                          Assign Worker
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-amber-400 font-bold">
                        RM {booking.estimatedCost || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowAssignModal(true);
                          }}
                          disabled={!!booking.service?.worker}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            booking.service?.worker
                              ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                              : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {booking.service?.worker ? 'Assigned' : 'Assign'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No bookings found</div>
                <p className="text-gray-500 text-sm mt-2">Try changing your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Month View */}
      {view === 'month' && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-800">
            {dayNames.map(day => (
              <div key={day} className="p-4 text-center text-sm font-medium text-gray-400 border-r border-gray-800 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((date, index) => (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b border-gray-800 last:border-r-0 p-2 cursor-pointer ${
                  !date ? 'bg-gray-900/20' : 
                  date.toDateString() === new Date().toDateString() ? 'bg-amber-500/10' : 
                  'bg-gray-800/20 hover:bg-gray-700/30'
                } transition-colors`}
                onClick={() => {
                  if (date) {
                    setSelectedDate(date);
                    setView('day');
                  }
                }}
              >
                {date && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${
                        date.toDateString() === new Date().toDateString() 
                          ? 'text-amber-400' 
                          : 'text-gray-300'
                      }`}>
                        {date.getDate()}
                      </span>
                      {getBookingsForDate(date).length > 0 && (
                        <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      )}
                    </div>
                    
                    {/* Bookings for this day */}
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {getBookingsForDate(date).slice(0, 3).map(booking => (
                        <div
                          key={booking.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                          }}
                          className={`p-1 rounded border text-xs cursor-pointer transition-all hover:scale-105 ${getStatusColor(booking.status)}`}
                        >
                          <div className="font-medium truncate">{formatTime(booking.bookingDate)}</div>
                          <div className="truncate">{booking.customer.name}</div>
                        </div>
                      ))}
                      {getBookingsForDate(date).length > 3 && (
                        <div className="text-xs text-gray-400 text-center">
                          +{getBookingsForDate(date).length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
          <div className="grid grid-cols-8 border-b border-gray-800">
            <div className="p-4 border-r border-gray-800"></div>
            {weekDays.map((date, index) => (
              <div 
                key={index} 
                className={`p-4 text-center border-r border-gray-800 last:border-r-0 cursor-pointer ${
                  date.toDateString() === new Date().toDateString() ? 'bg-amber-500/10' : ''
                }`}
                onClick={() => {
                  setSelectedDate(date);
                  setView('day');
                }}
              >
                <div className="text-sm font-medium text-gray-400">{dayNames[date.getDay()]}</div>
                <div className={`text-lg font-bold ${
                  date.toDateString() === new Date().toDateString() ? 'text-amber-400' : 'text-white'
                }`}>
                  {date.getDate()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getBookingsForDate(date).length} bookings
                </div>
              </div>
            ))}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {Array.from({ length: 20 }, (_, i) => 8 + Math.floor(i / 2) + (i % 2 === 0 ? 0 : 0.5)).map((time, index) => {
              const hour = Math.floor(time);
              const minute = time % 1 === 0 ? '00' : '30';
              const timeString = `${hour.toString().padStart(2, '0')}:${minute}`;
              
              return (
                <div key={index} className="grid grid-cols-8 border-b border-gray-800 last:border-b-0">
                  <div className="p-3 border-r border-gray-800 text-sm text-gray-400 text-right pr-4">
                    {timeString}
                  </div>
                  {weekDays.map((date, dayIndex) => {
                    const bookingsForSlot = filteredBookings.filter(booking => {
                      const bookingDate = new Date(booking.bookingDate);
                      return bookingDate.toDateString() === date.toDateString() && 
                             bookingDate.getHours() === hour && 
                             bookingDate.getMinutes() === (minute === '00' ? 0 : 30);
                    });

                    return (
                      <div 
                        key={dayIndex} 
                        className="p-1 border-r border-gray-800 last:border-r-0 min-h-[60px]"
                        onClick={() => {
                          if (bookingsForSlot.length > 0) {
                            setSelectedBooking(bookingsForSlot[0]);
                          }
                        }}
                      >
                        {bookingsForSlot.map(booking => (
                          <div
                            key={booking.id}
                            className={`p-2 rounded border text-xs cursor-pointer transition-all hover:scale-105 ${getStatusColor(booking.status)}`}
                          >
                            <div className="font-medium truncate">{booking.customer.name}</div>
                            <div className="truncate text-amber-400">{getServiceType(booking)}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {view === 'day' && selectedDate && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">
              {fullDayNames[selectedDate.getDay()]}, {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <p className="text-gray-400 text-sm">
              {getBookingsForDate(selectedDate).length} bookings scheduled
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {getTimeSlots(selectedDate).map((slot, index) => (
              <div key={index} className="flex border-b border-gray-800 last:border-b-0">
                <div className="w-24 p-4 border-r border-gray-800 text-sm text-gray-400 text-right">
                  {slot.time}
                </div>
                <div 
                  className="flex-1 p-2 min-h-[80px] cursor-pointer hover:bg-gray-800/30 transition-colors"
                  onClick={() => {
                    if (slot.bookings.length > 0) {
                      setSelectedBooking(slot.bookings[0]);
                    }
                  }}
                >
                  {slot.bookings.map(booking => (
                    <div
                      key={booking.id}
                      className={`p-3 rounded-lg border mb-2 last:mb-0 cursor-pointer transition-all hover:scale-105 ${getStatusColor(booking.status)}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-white">{booking.customer.name}</div>
                          <div className="text-sm text-gray-300">{booking.vehicle.model} • {booking.vehicle.registrationNumber}</div>
                          <div className="text-sm text-amber-400 mt-1">{getServiceType(booking)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-amber-400 font-bold">RM {booking.estimatedCost || '0'}</div>
                          <div className="text-xs text-gray-400">{booking.duration || 1}h</div>
                          {booking.service?.worker && (
                            <div className="text-xs text-gray-400 mt-1">{booking.service.worker.name}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white">Booking Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                    <span className="mr-2">👤</span>
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Customer Name</label>
                      <p className="text-white font-medium">{selectedBooking.customer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Phone Number</label>
                      <p className="text-white font-medium">{selectedBooking.customer.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white font-medium">{selectedBooking.customer.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Booking Date & Time</label>
                      <p className="text-white font-medium">
                        {new Date(selectedBooking.bookingDate).toLocaleDateString('en-MY', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-amber-400 font-medium">
                        {formatTime(selectedBooking.bookingDate)} • {selectedBooking.duration || 1} hours
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                    <span className="mr-2">🚗</span>
                    Vehicle Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Vehicle Model</label>
                      <p className="text-white font-medium">{selectedBooking.vehicle.model}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Registration Number</label>
                      <p className="text-white font-medium">{selectedBooking.vehicle.registrationNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Vehicle Type</label>
                      <p className="text-white font-medium">{selectedBooking.vehicle.type || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Service Type</label>
                      <p className="text-white font-medium">{getServiceType(selectedBooking)}</p>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                    <span className="mr-2">🔧</span>
                    Service Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-gray-400">Reported Issue</label>
                      <p className="text-white mt-1 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        {selectedBooking.reportedIssue || 'No specific issue reported'}
                      </p>
                      {selectedBooking.rejectionReason && (
                        <div className="mt-3">
                          <label className="text-sm text-gray-400">Rejection Reason</label>
                          <p className="text-red-400 mt-1 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                            {selectedBooking.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Status</label>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(selectedBooking.status)}`}>
                          {selectedBooking.status}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Estimated Cost</label>
                        <p className="text-amber-400 text-xl font-bold">RM {selectedBooking.estimatedCost || '0'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Duration</label>
                        <p className="text-white font-medium">{selectedBooking.duration || 1} hours</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Price Status</label>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedBooking.priceApproved ? (
                            <span className="text-green-400">✓ Approved</span>
                          ) : selectedBooking.priceRejected ? (
                            <span className="text-red-400">✗ Rejected</span>
                          ) : (
                            <span className="text-yellow-400">Pending</span>
                          )}
                        </div>
                      </div>
                      {selectedBooking.service?.worker && (
                        <div>
                          <label className="text-sm text-gray-400">Assigned Worker</label>
                          <p className="text-white font-medium">{selectedBooking.service.worker.name}</p>
                          <p className="text-gray-400 text-sm">{selectedBooking.service.worker.position}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Worker Assignment Section */}
              <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-white font-semibold">Worker Assignment</h4>
                  {!selectedBooking.service?.worker && (
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Assign Worker
                    </button>
                  )}
                </div>
                
                {selectedBooking.service?.worker ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">{selectedBooking.service.worker.name}</p>
                      <p className="text-gray-400 text-sm">{selectedBooking.service.worker.position}</p>
                    </div>
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Change Worker
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No worker assigned yet. Click "Assign Worker" to assign.</p>
                )}
              </div>

              {/* Status Update Actions */}
              <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <h4 className="text-white font-semibold mb-3">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {(['Confirmed', 'In Progress', 'Completed'] as Booking['status'][]).map((status) => (
                    selectedBooking.status !== status && (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedBooking.id, status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          status === 'Confirmed' ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30' :
                          status === 'In Progress' ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30' :
                          'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                        }`}
                      >
                        Mark as {status}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-800">
                <Link
                  href={`/admin/bookings/${selectedBooking.id}`}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 text-center"
                >
                  View Full Details
                </Link>
                <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all border border-gray-700">
                  Edit Booking
                </button>
                {selectedBooking.status !== 'Cancelled' && selectedBooking.status !== 'Completed' && (
                  <button 
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 px-6 rounded-xl font-semibold transition-all border border-red-500/30"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Worker Assignment Modal */}
      {showAssignModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white">Assign Worker</h3>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedWorkerId(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Select a Worker
                  </label>
                  <select
                    value={selectedWorkerId || ''}
                    onChange={(e) => setSelectedWorkerId(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Select a worker...</option>
                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name} ({worker.position}) - Workload: {worker.currentWorkload} jobs
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-2">Booking Information:</h4>
                  <p className="text-gray-300">Customer: {selectedBooking.customer.name}</p>
                  <p className="text-gray-300">Vehicle: {selectedBooking.vehicle.model}</p>
                  <p className="text-gray-300">Service: {getServiceType(selectedBooking)}</p>
                  <p className="text-amber-400">Date: {new Date(selectedBooking.bookingDate).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedWorkerId(null);
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAssignWorker(selectedBooking.id)}
                    disabled={!selectedWorkerId}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                      selectedWorkerId
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Assign Worker
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

export default BookingCalendar;