'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  duration: number;
  serviceType: string;
}

interface CustomerVehicle {
  id: number;
  model: string;
  registrationNumber: string;
  year: number;
  type: string;
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  bookings: ServiceBooking[];
}

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentWeek, setCurrentWeek] = useState(0);

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
            type: 'Sedan'
          },
          {
            id: 2,
            model: 'Honda City',
            registrationNumber: 'XYZ5678',
            year: 2019,
            type: 'Sedan'
          },
          {
            id: 3,
            model: 'Proton Saga',
            registrationNumber: 'DEF9012',
            year: 2021,
            type: 'Sedan'
          }
        ];

        const mockBookings: ServiceBooking[] = [
          {
            id: 1,
            vehicleId: 1,
            bookingDate: '2024-01-15 09:00',
            status: 'In Progress',
            reportedIssue: 'Regular maintenance and oil change',
            estimatedCost: 120,
            serviceStatus: 'Diagnostics Complete',
            assignedWorker: 'Ali bin Ahmad',
            duration: 1.5,
            serviceType: 'Regular Maintenance'
          },
          {
            id: 2,
            vehicleId: 2,
            bookingDate: '2024-01-20 14:00',
            status: 'Confirmed',
            reportedIssue: 'Brake system inspection',
            estimatedCost: 80,
            serviceStatus: 'Scheduled',
            duration: 2,
            serviceType: 'Brake Service'
          },
          {
            id: 3,
            vehicleId: 1,
            bookingDate: '2024-01-25 11:00',
            status: 'Pending',
            reportedIssue: 'AC not cooling properly',
            estimatedCost: 180,
            duration: 2.5,
            serviceType: 'AC Service'
          },
          {
            id: 4,
            vehicleId: 3,
            bookingDate: '2024-01-10 10:30',
            status: 'Completed',
            reportedIssue: 'Tire rotation and general checkup',
            estimatedCost: 40,
            serviceStatus: 'Service Completed',
            assignedWorker: 'Muthu Kumar',
            completionDate: '2024-01-10',
            duration: 1,
            serviceType: 'Tire Rotation'
          },
          {
            id: 5,
            vehicleId: 2,
            bookingDate: '2024-02-01 08:00',
            status: 'Confirmed',
            reportedIssue: 'Full vehicle service',
            estimatedCost: 350,
            serviceStatus: 'Parts Ordered',
            assignedWorker: 'Chen Wei',
            duration: 3,
            serviceType: 'Full Service'
          },
          {
            id: 6,
            vehicleId: 1,
            bookingDate: '2024-01-18 13:00',
            status: 'Completed',
            reportedIssue: 'Wheel alignment',
            estimatedCost: 60,
            serviceStatus: 'Service Completed',
            assignedWorker: 'Ali bin Ahmad',
            completionDate: '2024-01-18',
            duration: 1,
            serviceType: 'Wheel Alignment'
          },
          {
            id: 7,
            vehicleId: 3,
            bookingDate: '2024-01-22 16:00',
            status: 'In Progress',
            reportedIssue: 'Battery replacement',
            estimatedCost: 200,
            serviceStatus: 'Waiting for Parts',
            assignedWorker: 'Muthu Kumar',
            duration: 1.5,
            serviceType: 'Battery Service'
          }
        ];

        setVehicles(mockVehicles);
        setBookings(mockBookings);
        setIsLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

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
        const slotBookings = bookings.filter(booking => {
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
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'In Progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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

  const getVehicleInfo = (vehicleId: number) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  const StatusBadge = ({ status }: { status: string }) => {
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

  const days = getDaysInMonth(currentDate);
  const weekDays = getDaysInWeek(currentDate, currentWeek);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">My Bookings</h2>
            <p className="text-gray-400">Manage your service appointments and track progress</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading your bookings...</p>
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
          <h2 className="text-2xl font-bold text-white">My Bookings Calendar</h2>
          <p className="text-gray-400">View and manage all your service appointments</p>
        </div>
        <Link 
          href="/book-service"
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center space-x-2"
        >
          <span>📅</span>
          <span>New Booking</span>
        </Link>
      </div>

      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {view === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            {view === 'week' && `Week of ${weekDays[0].toLocaleDateString()} - ${weekDays[6].toLocaleDateString()}`}
            {view === 'day' && selectedDate && `${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
          </h2>
          <p className="text-gray-400 text-sm">Your personal service schedule</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-800/50 rounded-lg border border-gray-700 p-1">
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
                      {getBookingsForDate(date).slice(0, 3).map(booking => {
                        const vehicle = getVehicleInfo(booking.vehicleId);
                        return (
                          <div
                            key={booking.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(booking);
                            }}
                            className={`p-1 rounded border text-xs cursor-pointer transition-all hover:scale-105 ${getStatusColor(booking.status)}`}
                          >
                            <div className="font-medium truncate">{formatTime(booking.bookingDate)}</div>
                            <div className="truncate">{vehicle?.model}</div>
                          </div>
                        );
                      })}
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
                    const bookingsForSlot = bookings.filter(booking => {
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
                        {bookingsForSlot.map(booking => {
                          const vehicle = getVehicleInfo(booking.vehicleId);
                          return (
                            <div
                              key={booking.id}
                              className={`p-2 rounded border text-xs cursor-pointer transition-all hover:scale-105 ${getStatusColor(booking.status)}`}
                            >
                              <div className="font-medium truncate">{vehicle?.model}</div>
                              <div className="truncate text-amber-400">{booking.serviceType}</div>
                            </div>
                          );
                        })}
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
                  {slot.bookings.map(booking => {
                    const vehicle = getVehicleInfo(booking.vehicleId);
                    return (
                      <div
                        key={booking.id}
                        className={`p-3 rounded-lg border mb-2 last:mb-0 cursor-pointer transition-all hover:scale-105 ${getStatusColor(booking.status)}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-white">{vehicle?.model}</div>
                            <div className="text-sm text-gray-300">{vehicle?.registrationNumber}</div>
                            <div className="text-sm text-amber-400 mt-1">{booking.serviceType}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-amber-400 font-bold">RM {booking.estimatedCost}</div>
                            <div className="text-xs text-gray-400">{booking.duration}h</div>
                            {booking.assignedWorker && (
                              <div className="text-xs text-gray-400 mt-1">{booking.assignedWorker}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

              {(() => {
                const vehicle = getVehicleInfo(selectedBooking.vehicleId);
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                          <span className="mr-2">🚗</span>
                          Vehicle Information
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-gray-400 text-sm">Vehicle Model</p>
                            <p className="text-white font-medium">{vehicle?.model}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Registration Number</p>
                            <p className="text-white font-medium">{vehicle?.registrationNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Service Type</p>
                            <p className="text-white font-medium">{selectedBooking.serviceType}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                          <span className="mr-2">📅</span>
                          Booking Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-gray-400 text-sm">Status</p>
                            <StatusBadge status={selectedBooking.status} />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Scheduled Date & Time</p>
                            <p className="text-white font-medium">
                              {new Date(selectedBooking.bookingDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-amber-400 font-medium">
                              {formatTime(selectedBooking.bookingDate)} • {selectedBooking.duration} hours
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Estimated Cost</p>
                            <p className="text-amber-400 text-xl font-bold">RM {selectedBooking.estimatedCost}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                        <span className="mr-2">🔧</span>
                        Service Details
                      </h4>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Reported Issue</p>
                        <p className="text-white p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                          {selectedBooking.reportedIssue}
                        </p>
                      </div>
                      {selectedBooking.serviceStatus && (
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Current Status</p>
                          <p className="text-amber-400 font-medium">{selectedBooking.serviceStatus}</p>
                        </div>
                      )}
                      {selectedBooking.assignedWorker && (
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Assigned Technician</p>
                          <p className="text-blue-400 font-medium">{selectedBooking.assignedWorker}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-800">
                      <button className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105">
                        Track Service Progress
                      </button>
                      <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all border border-gray-700">
                        Reschedule Booking
                      </button>
                      <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 px-6 rounded-xl font-semibold transition-all border border-red-500/30">
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;