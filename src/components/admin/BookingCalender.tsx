'use client'
// components/BookingCalendar.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Booking {
  id: number;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  registrationNumber: string;
  bookingDate: string;
  serviceType: string;
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  estimatedCost: number;
  reportedIssue: string;
  assignedWorker?: string;
}

const BookingCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [view, setView] = useState<'month' | 'week'>('month');

  // Sample bookings data
  useEffect(() => {
    const sampleBookings: Booking[] = [
      {
        id: 1,
        customerName: "Ahmad bin Ismail",
        customerPhone: "+60 12-345 6789",
        vehicleModel: "Toyota Vios",
        registrationNumber: "ABC1234",
        bookingDate: "2024-01-15",
        serviceType: "Regular Maintenance",
        status: "In Progress",
        estimatedCost: 120,
        reportedIssue: "Oil change and general checkup",
        assignedWorker: "Ali bin Ahmad"
      },
      {
        id: 2,
        customerName: "Siti Nurhaliza",
        customerPhone: "+60 13-456 7890",
        vehicleModel: "Honda City",
        registrationNumber: "XYZ5678",
        bookingDate: "2024-01-15",
        serviceType: "Brake Service",
        status: "Confirmed",
        estimatedCost: 250,
        reportedIssue: "Brake pads replacement",
        assignedWorker: "Muthu Kumar"
      },
      {
        id: 3,
        customerName: "Raj Kumar",
        customerPhone: "+60 14-567 8901",
        vehicleModel: "Proton Saga",
        registrationNumber: "DEF9012",
        bookingDate: "2024-01-16",
        serviceType: "AC Service",
        status: "Pending",
        estimatedCost: 180,
        reportedIssue: "AC not cooling properly"
      },
      {
        id: 4,
        customerName: "Mei Ling",
        customerPhone: "+60 16-789 0123",
        vehicleModel: "Perodua Myvi",
        registrationNumber: "GHI3456",
        bookingDate: "2024-01-18",
        serviceType: "Tire Rotation",
        status: "Completed",
        estimatedCost: 40,
        reportedIssue: "Regular tire maintenance",
        assignedWorker: "Ali bin Ahmad"
      },
      {
        id: 5,
        customerName: "John Lim",
        customerPhone: "+60 17-890 1234",
        vehicleModel: "Mazda CX-5",
        registrationNumber: "JKL7890",
        bookingDate: "2024-01-20",
        serviceType: "Full Service",
        status: "Confirmed",
        estimatedCost: 350,
        reportedIssue: "Complete vehicle inspection",
        assignedWorker: "Muthu Kumar"
      }
    ];
    setBookings(sampleBookings);
  }, []);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
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

  const days = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <p className="text-gray-400 text-sm">Manage and view all service bookings</p>
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
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
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
              className={`min-h-[120px] border-r border-b border-gray-800 last:border-r-0 p-2 ${
                !date ? 'bg-gray-900/20' : 
                date.toDateString() === new Date().toDateString() ? 'bg-amber-500/10' : 
                'bg-gray-800/20 hover:bg-gray-700/30'
              } transition-colors`}
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
                    {getBookingsForDate(date).map(booking => (
                      <div
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-all hover:scale-105 ${getStatusColor(booking.status)}`}
                      >
                        <div className="font-medium truncate">{booking.customerName}</div>
                        <div className="truncate">{booking.vehicleModel}</div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-amber-400 font-semibold">RM {booking.estimatedCost}</span>
                          <span className="capitalize">{booking.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

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
                      <p className="text-white font-medium">{selectedBooking.customerName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Phone Number</label>
                      <p className="text-white font-medium">{selectedBooking.customerPhone}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Booking Date</label>
                      <p className="text-white font-medium">
                        {new Date(selectedBooking.bookingDate).toLocaleDateString('en-MY', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
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
                      <p className="text-white font-medium">{selectedBooking.vehicleModel}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Registration Number</label>
                      <p className="text-white font-medium">{selectedBooking.registrationNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Service Type</label>
                      <p className="text-white font-medium">{selectedBooking.serviceType}</p>
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
                        {selectedBooking.reportedIssue}
                      </p>
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
                        <p className="text-amber-400 text-xl font-bold">RM {selectedBooking.estimatedCost}</p>
                      </div>
                      {selectedBooking.assignedWorker && (
                        <div>
                          <label className="text-sm text-gray-400">Assigned Worker</label>
                          <p className="text-white font-medium">{selectedBooking.assignedWorker}</p>
                        </div>
                      )}
                    </div>
                  </div>
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
                <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 px-6 rounded-xl font-semibold transition-all border border-red-500/30">
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;