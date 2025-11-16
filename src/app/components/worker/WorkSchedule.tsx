'use client';
import { useState, useEffect } from 'react';

interface WorkerSchedule {
  id: number;
  bookingId: number;
  vehicleModel: string;
  registrationNumber: string;
  serviceType: string;
  customerName: string;
  customerPhone: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedWorker: string;
  location: 'bay-1' | 'bay-2' | 'bay-3' | 'bay-4';
  notes?: string;
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  bookings: WorkerSchedule[];
}

const WorkerSchedule: React.FC = () => {
  const [schedule, setSchedule] = useState<WorkerSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'week' | 'day'>('week');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<WorkerSchedule | null>(null);

  // Simulated data fetch
  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockSchedule: WorkerSchedule[] = [
          {
            id: 1,
            bookingId: 1001,
            vehicleModel: 'Toyota Vios',
            registrationNumber: 'ABC1234',
            serviceType: 'Regular Maintenance',
            customerName: 'Ahmad bin Ismail',
            customerPhone: '+60 12-345 6789',
            scheduledDate: '2024-01-15',
            scheduledTime: '09:00',
            duration: 1.5,
            status: 'in-progress',
            priority: 'medium',
            assignedWorker: 'Ali bin Ahmad',
            location: 'bay-1',
            notes: 'Oil change and general checkup'
          },
          {
            id: 2,
            bookingId: 1002,
            vehicleModel: 'Honda City',
            registrationNumber: 'XYZ5678',
            serviceType: 'Brake Service',
            customerName: 'Siti Nurhaliza',
            customerPhone: '+60 13-456 7890',
            scheduledDate: '2024-01-15',
            scheduledTime: '10:30',
            duration: 2,
            status: 'scheduled',
            priority: 'high',
            assignedWorker: 'Ali bin Ahmad',
            location: 'bay-2',
            notes: 'Brake pads replacement - waiting for parts'
          },
          {
            id: 3,
            bookingId: 1003,
            vehicleModel: 'Proton Saga',
            registrationNumber: 'DEF9012',
            serviceType: 'AC Service',
            customerName: 'Raj Kumar',
            customerPhone: '+60 14-567 8901',
            scheduledDate: '2024-01-15',
            scheduledTime: '13:00',
            duration: 2.5,
            status: 'scheduled',
            priority: 'medium',
            assignedWorker: 'Ali bin Ahmad',
            location: 'bay-3'
          },
          {
            id: 4,
            bookingId: 1004,
            vehicleModel: 'Perodua Myvi',
            registrationNumber: 'GHI3456',
            serviceType: 'Tire Rotation',
            customerName: 'Mei Ling',
            customerPhone: '+60 16-789 0123',
            scheduledDate: '2024-01-16',
            scheduledTime: '08:00',
            duration: 1,
            status: 'scheduled',
            priority: 'low',
            assignedWorker: 'Ali bin Ahmad',
            location: 'bay-1'
          },
          {
            id: 5,
            bookingId: 1005,
            vehicleModel: 'Mazda CX-5',
            registrationNumber: 'JKL7890',
            serviceType: 'Full Service',
            customerName: 'John Lim',
            customerPhone: '+60 17-890 1234',
            scheduledDate: '2024-01-16',
            scheduledTime: '11:00',
            duration: 3,
            status: 'scheduled',
            priority: 'medium',
            assignedWorker: 'Ali bin Ahmad',
            location: 'bay-2'
          },
          {
            id: 6,
            bookingId: 1006,
            vehicleModel: 'Nissan Almera',
            registrationNumber: 'MNO1234',
            serviceType: 'Engine Diagnostic',
            customerName: 'Sarah Tan',
            customerPhone: '+60 18-901 2345',
            scheduledDate: '2024-01-17',
            scheduledTime: '14:00',
            duration: 1.5,
            status: 'scheduled',
            priority: 'high',
            assignedWorker: 'Ali bin Ahmad',
            location: 'bay-1'
          },
          {
            id: 7,
            bookingId: 1007,
            vehicleModel: 'Hyundai Tucson',
            registrationNumber: 'PQR5678',
            serviceType: 'Transmission Service',
            customerName: 'David Chen',
            customerPhone: '+60 19-012 3456',
            scheduledDate: '2024-01-18',
            scheduledTime: '09:30',
            duration: 2.5,
            status: 'scheduled',
            priority: 'medium',
            assignedWorker: 'Ali bin Ahmad',
            location: 'bay-3'
          }
        ];

        setSchedule(mockSchedule);
        setIsLoading(false);
      }, 1000);
    };

    fetchSchedule();
  }, []);

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
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotBookings = schedule.filter(booking => {
          const bookingDate = new Date(booking.scheduledDate);
          return bookingDate.toDateString() === date.toDateString() && 
                 booking.scheduledTime === timeString;
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
    return schedule.filter(booking => {
      const bookingDate = new Date(booking.scheduledDate);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getLocationColor = (location: string) => {
    switch (location) {
      case 'bay-1': return 'bg-purple-500/20 text-purple-400';
      case 'bay-2': return 'bg-indigo-500/20 text-indigo-400';
      case 'bay-3': return 'bg-pink-500/20 text-pink-400';
      case 'bay-4': return 'bg-teal-500/20 text-teal-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => prev + (direction === 'next' ? 1 : -1));
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
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

  const weekDays = getDaysInWeek(currentDate, currentWeek);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Work Schedule</h2>
            <p className="text-gray-400">View your upcoming assignments and schedule</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading schedule...</p>
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
          <h2 className="text-2xl font-bold text-white">Work Schedule</h2>
          <p className="text-gray-400">View your upcoming assignments and schedule</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-800/50 rounded-lg border border-gray-700 p-1">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                view === 'week' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Week View
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
              Day View
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => navigateWeek('prev')}
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
              onClick={() => navigateWeek('next')}
              className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-4 border border-gray-700/50 text-center">
          <p className="text-2xl font-bold text-white">
            {schedule.filter(s => s.status === 'scheduled').length}
          </p>
          <p className="text-gray-400 text-sm">Scheduled</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-4 border border-gray-700/50 text-center">
          <p className="text-2xl font-bold text-orange-400">
            {schedule.filter(s => s.status === 'in-progress').length}
          </p>
          <p className="text-gray-400 text-sm">In Progress</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-4 border border-gray-700/50 text-center">
          <p className="text-2xl font-bold text-blue-400">
            {schedule.reduce((total, s) => total + s.duration, 0)}h
          </p>
          <p className="text-gray-400 text-sm">Total Hours</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-4 border border-gray-700/50 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {[...new Set(schedule.map(s => s.scheduledDate))].length}
          </p>
          <p className="text-gray-400 text-sm">Working Days</p>
        </div>
      </div>

      {/* Week View */}
      {view === 'week' && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
          {/* Days Header */}
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
                  {getBookingsForDate(date).length} jobs
                </div>
              </div>
            ))}
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {Array.from({ length: 22 }, (_, i) => 8 + Math.floor(i / 2) + (i % 2 === 0 ? 0 : 0.5)).map((time, index) => {
              const hour = Math.floor(time);
              const minute = time % 1 === 0 ? '00' : '30';
              const timeString = `${hour.toString().padStart(2, '0')}:${minute}`;
              
              return (
                <div key={index} className="grid grid-cols-8 border-b border-gray-800 last:border-b-0">
                  <div className="p-3 border-r border-gray-800 text-sm text-gray-400 text-right pr-4">
                    {formatTime(timeString)}
                  </div>
                  {weekDays.map((date, dayIndex) => {
                    const bookingsForSlot = schedule.filter(booking => {
                      const bookingDate = new Date(booking.scheduledDate);
                      return bookingDate.toDateString() === date.toDateString() && 
                             booking.scheduledTime === timeString;
                    });

                    return (
                      <div 
                        key={dayIndex} 
                        className="p-1 border-r border-gray-800 last:border-r-0 min-h-[80px] bg-gray-800/10 hover:bg-gray-700/20 transition-colors"
                        onClick={() => {
                          if (bookingsForSlot.length > 0) {
                            setSelectedBooking(bookingsForSlot[0]);
                          }
                        }}
                      >
                        {bookingsForSlot.map(booking => (
                          <div
                            key={booking.id}
                            className={`p-2 rounded border text-xs cursor-pointer transition-all hover:scale-105 ${getStatusColor(booking.status)} mb-1 last:mb-0`}
                          >
                            <div className="font-medium truncate">{booking.vehicleModel}</div>
                            <div className="truncate text-amber-400">{booking.serviceType}</div>
                            <div className="flex justify-between items-center mt-1">
                              <span className={`px-1 rounded text-xs ${getLocationColor(booking.location)}`}>
                                {booking.location}
                              </span>
                              <span className="text-gray-400">{booking.duration}h</span>
                            </div>
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
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {fullDayNames[selectedDate.getDay()]}, {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <p className="text-gray-400 text-sm">
                  {getBookingsForDate(selectedDate).length} jobs scheduled • Total {getBookingsForDate(selectedDate).reduce((total, job) => total + job.duration, 0)} hours
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Service Bays:</span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">Bay 1</span>
                <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-xs">Bay 2</span>
                <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded text-xs">Bay 3</span>
                <span className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded text-xs">Bay 4</span>
              </div>
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {getTimeSlots(selectedDate).map((slot, index) => (
              <div key={index} className="flex border-b border-gray-800 last:border-b-0">
                <div className="w-24 p-4 border-r border-gray-800 text-sm text-gray-400 text-right">
                  {formatTime(slot.time)}
                </div>
                <div 
                  className="flex-1 p-2 min-h-[100px] cursor-pointer hover:bg-gray-800/30 transition-colors"
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
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityColor(booking.priority)}`}>
                              {booking.priority}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getLocationColor(booking.location)}`}>
                              {booking.location}
                            </span>
                            <span className="text-gray-400 text-xs">{booking.duration}h</span>
                          </div>
                          
                          <div className="font-semibold text-white">{booking.vehicleModel}</div>
                          <div className="text-sm text-gray-300">{booking.registrationNumber}</div>
                          <div className="text-sm text-amber-400 mt-1">{booking.serviceType}</div>
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                            <span>👤 {booking.customerName}</span>
                            <span>📞 {booking.customerPhone}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-amber-400 font-bold">#{booking.bookingId}</div>
                          {booking.notes && (
                            <div className="text-xs text-gray-400 mt-1 max-w-[150px] truncate">
                              💡 {booking.notes}
                            </div>
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
                <h3 className="text-xl font-bold text-white">Service Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehicle Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                      <span className="mr-2">🚗</span>
                      Vehicle Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Vehicle Model</p>
                        <p className="text-white font-medium">{selectedBooking.vehicleModel}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Registration Number</p>
                        <p className="text-white font-medium">{selectedBooking.registrationNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Service Type</p>
                        <p className="text-white font-medium">{selectedBooking.serviceType}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Service Bay</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getLocationColor(selectedBooking.location)}`}>
                          {selectedBooking.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                      <span className="mr-2">📅</span>
                      Schedule Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Status</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                          {selectedBooking.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Priority</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedBooking.priority)}`}>
                          {selectedBooking.priority}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Scheduled Date & Time</p>
                        <p className="text-white font-medium">{formatDate(selectedBooking.scheduledDate)}</p>
                        <p className="text-amber-400 font-medium">
                          {formatTime(selectedBooking.scheduledTime)} • {selectedBooking.duration} hours
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Booking ID</p>
                        <p className="text-white font-medium">#{selectedBooking.bookingId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                    <span className="mr-2">👤</span>
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm">Customer Name</p>
                      <p className="text-white font-medium">{selectedBooking.customerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Phone Number</p>
                      <p className="text-white font-medium">{selectedBooking.customerPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                      <span className="mr-2">📝</span>
                      Additional Notes
                    </h4>
                    <p className="text-white p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-800">
                  <button className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105">
                    Start Service
                  </button>
                  <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all border border-gray-700">
                    Update Status
                  </button>
                  <button className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-3 px-6 rounded-xl font-semibold transition-all border border-blue-500/30">
                    Contact Customer
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

export default WorkerSchedule;