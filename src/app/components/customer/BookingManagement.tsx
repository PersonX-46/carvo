"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import PriceApproval from "./PriceApproval";
import PaymentButton from "./PaymentButton";

interface ServiceBooking {
  id: number;
  customerId: number;
  vehicleId: number;
  serviceId?: number;
  bookingDate: string;
  status: "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled";
  reportedIssue: string | null;
  estimatedCost: number | null;
  confirmed: boolean;
  duration: number | null;
  createdAt: string;
  // Add price approval fields
  priceApproved?: boolean | null;
  priceRejected?: boolean | null;
  rejectionReason?: string | null;
  vehicle: {
    model: string;
    registrationNumber: string;
    year: number | null;
    type: string | null;
  };
  service?: {
    serviceStatus: string;
    repairNotes: string | null;
    serviceCost: number | null;
    spareParts: string | null;
    completionDate: string | null;
    duration: number | null;
    worker?: {
      id: number;
      name: string;
      phone: string | null;
      email: string;
      position: string;
      specialization: string | null;
      rating: number | null;
      totalServices: number;
      hireDate: string;
    };
  };
}

interface CustomerVehicle {
  id: number;
  model: string;
  registrationNumber: string;
  year: number | null;
  type: string | null;
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  bookings: ServiceBooking[];
}

type BookingFilter =
  | "all"
  | "active"
  | "completed"
  | "pending"
  | "cancelled"
  | "priceApproval";

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">(
    "month"
  );
  const [currentWeek, setCurrentWeek] = useState(0);
  const [error, setError] = useState("");
  const [activeBookings, setActiveBookings] = useState<ServiceBooking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<ServiceBooking[]>(
    []
  );
  const [pendingBookings, setPendingBookings] = useState<ServiceBooking[]>([]);
  const [cancelledBookings, setCancelledBookings] = useState<ServiceBooking[]>(
    []
  );
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [filteredBookings, setFilteredBookings] = useState<ServiceBooking[]>(
    []
  );
  const [customerId, setCustomerId] = useState<number>(1); // Get from your auth system

  // Add state for price approval modal
  const [isPriceApprovalModalOpen, setIsPriceApprovalModalOpen] =
    useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real data from API
  useEffect(() => {
    fetchData();
    // In real app, get customerId from auth context or localStorage
    const storedCustomerId = localStorage.getItem("customerId");
    if (storedCustomerId) {
      setCustomerId(parseInt(storedCustomerId));
    }
  }, []);

  // Categorize bookings whenever bookings change
  useEffect(() => {
    const active = bookings.filter(
      (booking) =>
        booking.status === "Confirmed" || booking.status === "In Progress"
    );
    const completed = bookings.filter(
      (booking) => booking.status === "Completed"
    );
    const pending = bookings.filter((booking) => booking.status === "Pending");
    const cancelled = bookings.filter(
      (booking) => booking.status === "Cancelled"
    );

    setActiveBookings(active);
    setCompletedBookings(completed);
    setPendingBookings(pending);
    setCancelledBookings(cancelled);
  }, [bookings]);

  // Apply filter whenever bookings or filter changes
  useEffect(() => {
    switch (filter) {
      case "all":
        setFilteredBookings(bookings);
        break;
      case "active":
        setFilteredBookings(activeBookings);
        break;
      case "completed":
        setFilteredBookings(completedBookings);
        break;
      case "pending":
        setFilteredBookings(pendingBookings);
        break;
      case "cancelled":
        setFilteredBookings(cancelledBookings);
        break;
      case "priceApproval":
        // Show bookings that need price approval
        const needsApproval = bookings.filter(
          (booking) =>
            booking.status === "Confirmed" &&
            booking.estimatedCost &&
            !booking.priceApproved &&
            !booking.priceRejected
        );
        setFilteredBookings(needsApproval);
        break;
      default:
        setFilteredBookings(bookings);
    }
  }, [
    filter,
    bookings,
    activeBookings,
    completedBookings,
    pendingBookings,
    cancelledBookings,
  ]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Fetch both bookings and vehicles in parallel for better performance
      const [bookingsResponse, vehiclesResponse] = await Promise.all([
        fetch("/api/customer/bookings"),
        fetch("/api/customer/vehicles"),
      ]);

      // Handle bookings response
      if (!bookingsResponse.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const bookingsResult = await bookingsResponse.json();
      setBookings(bookingsResult.bookings || []);

      // Handle vehicles response
      if (vehiclesResponse.ok) {
        const vehiclesResult = await vehiclesResponse.json();
        setVehicles(vehiclesResult.vehicles || []);
      } else {
        console.warn("Failed to fetch vehicles, using empty array");
        setVehicles([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load booking data");
      // Set empty arrays to prevent further errors
      setBookings([]);
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle price approval
  const handlePriceApproval = async (
    bookingId: number,
    approved: boolean,
    reason?: string
  ) => {
    if (!approved && !reason) {
      alert("Please provide a reason for rejecting the price");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/customer/bookings/${bookingId}/price-approval`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            approved,
            reason: reason || null,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update price approval");
      }

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                priceApproved: approved,
                priceRejected: !approved,
                rejectionReason: !approved ? reason : null,
              }
            : booking
        )
      );

      // Close modal and reset
      setIsPriceApprovalModalOpen(false);
      setSelectedBooking(null);
      setRejectionReason("");

      alert(
        approved
          ? "Price approved successfully!"
          : "Price rejected. The technician will contact you with a revised estimate."
      );
    } catch (error) {
      console.error("Error updating price approval:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update price approval"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const response = await fetch(`/api/customer/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Cancelled",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "Cancelled" }
            : booking
        )
      );

      setSelectedBooking(null);
      alert("Booking cancelled successfully");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking");
    }
  };

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
    startDate.setDate(startDate.getDate() - day + weekOffset * 7);

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
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const slotBookings = bookings.filter((booking) => {
          const bookingDate = new Date(booking.bookingDate);
          return (
            bookingDate.toDateString() === date.toDateString() &&
            bookingDate.getHours() === hour &&
            bookingDate.getMinutes() === minute
          );
        });

        slots.push({
          time: timeString,
          hour,
          minute,
          bookings: slotBookings,
        });
      }
    }
    return slots;
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Confirmed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "In Progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) => prev + (direction === "next" ? 1 : -1));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusIcon = (status: string) => {
      switch (status.toLowerCase()) {
        case "completed":
          return "✅";
        case "in progress":
          return "🔧";
        case "confirmed":
          return "📅";
        case "pending":
          return "⏳";
        case "cancelled":
          return "❌";
        default:
          return "📝";
      }
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
          status
        )}`}
      >
        <span className="mr-1">{getStatusIcon(status)}</span>
        {status}
      </span>
    );
  };

  const getServiceType = (booking: ServiceBooking) => {
    if (booking.reportedIssue?.toLowerCase().includes("oil"))
      return "Oil Change";
    if (booking.reportedIssue?.toLowerCase().includes("brake"))
      return "Brake Service";
    if (booking.reportedIssue?.toLowerCase().includes("ac"))
      return "AC Service";
    if (booking.reportedIssue?.toLowerCase().includes("tire"))
      return "Tire Service";
    if (booking.reportedIssue?.toLowerCase().includes("battery"))
      return "Battery Service";
    return "General Service";
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = getDaysInWeek(currentDate, currentWeek);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fullDayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getFilterCount = (filterType: BookingFilter) => {
    switch (filterType) {
      case "all":
        return bookings.length;
      case "active":
        return activeBookings.length;
      case "completed":
        return completedBookings.length;
      case "pending":
        return pendingBookings.length;
      case "cancelled":
        return cancelledBookings.length;
      case "priceApproval":
        // Count bookings that need price approval
        return bookings.filter(
          (booking) =>
            booking.status === "Confirmed" &&
            booking.estimatedCost &&
            !booking.priceApproved &&
            !booking.priceRejected
        ).length;
      default:
        return 0;
    }
  };

  const getFilterLabel = (filterType: BookingFilter) => {
    switch (filterType) {
      case "all":
        return "All Bookings";
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      case "priceApproval":
        return "Price Approval";
      default:
        return "All";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">My Bookings</h2>
            <p className="text-gray-400">
              Manage your service appointments and track progress
            </p>
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">My Bookings</h2>
            <p className="text-gray-400">
              Manage your service appointments and track progress
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-red-400 text-lg mb-4">⚠️ {error}</div>
            <button
              onClick={fetchData}
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {view === "calendar" ? "Booking Calendar" : "My Bookings"}
          </h2>
          <p className="text-gray-400">
            {view === "calendar"
              ? "View and manage all your service appointments"
              : "Track your services and contact your technician"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-800/50 rounded-lg border border-gray-700 p-1">
            <button
              onClick={() => setView("calendar")}
              className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                view === "calendar"
                  ? "bg-amber-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              📅 Calendar
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                view === "list"
                  ? "bg-amber-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              📋 List View
            </button>
          </div>

          {/* New Booking Button */}
          <Link
            href="/book-service"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center space-x-2"
          >
            <span>📅</span>
            <span>New Booking</span>
          </Link>
        </div>
      </div>

      {/* Stats Overview - UPDATED with 6th column for Price Approvals */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div
          className={`bg-gray-800/50 rounded-xl p-4 border transition-all cursor-pointer ${
            filter === "all"
              ? "border-amber-500 bg-amber-500/10"
              : "border-gray-700 hover:border-amber-500/30"
          }`}
          onClick={() => setFilter("all")}
        >
          <div className="text-2xl font-bold text-white">{bookings.length}</div>
          <div className="text-gray-400 text-sm">All Bookings</div>
        </div>
        <div
          className={`bg-gray-800/50 rounded-xl p-4 border transition-all cursor-pointer ${
            filter === "active"
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 hover:border-blue-500/30"
          }`}
          onClick={() => setFilter("active")}
        >
          <div className="text-2xl font-bold text-blue-400">
            {activeBookings.length}
          </div>
          <div className="text-gray-400 text-sm">Active</div>
        </div>
        <div
          className={`bg-gray-800/50 rounded-xl p-4 border transition-all cursor-pointer ${
            filter === "completed"
              ? "border-green-500 bg-green-500/10"
              : "border-gray-700 hover:border-green-500/30"
          }`}
          onClick={() => setFilter("completed")}
        >
          <div className="text-2xl font-bold text-green-400">
            {completedBookings.length}
          </div>
          <div className="text-gray-400 text-sm">Completed</div>
        </div>
        <div
          className={`bg-gray-800/50 rounded-xl p-4 border transition-all cursor-pointer ${
            filter === "pending"
              ? "border-orange-500 bg-orange-500/10"
              : "border-gray-700 hover:border-orange-500/30"
          }`}
          onClick={() => setFilter("pending")}
        >
          <div className="text-2xl font-bold text-orange-400">
            {pendingBookings.length}
          </div>
          <div className="text-gray-400 text-sm">Pending</div>
        </div>
        <div
          className={`bg-gray-800/50 rounded-xl p-4 border transition-all cursor-pointer ${
            filter === "cancelled"
              ? "border-red-500 bg-red-500/10"
              : "border-gray-700 hover:border-red-500/30"
          }`}
          onClick={() => setFilter("cancelled")}
        >
          <div className="text-2xl font-bold text-red-400">
            {cancelledBookings.length}
          </div>
          <div className="text-gray-400 text-sm">Cancelled</div>
        </div>
        {/* Price Approval Stats Card */}
        <div
          className={`bg-gray-800/50 rounded-xl p-4 border transition-all cursor-pointer ${
            filter === "priceApproval"
              ? "border-purple-500 bg-purple-500/10"
              : "border-gray-700 hover:border-purple-500/30"
          }`}
          onClick={() => setFilter("priceApproval")}
        >
          <div className="text-2xl font-bold text-purple-400">
            {getFilterCount("priceApproval")}
          </div>
          <div className="text-gray-400 text-sm">Price Approvals</div>
          {filter === "priceApproval" && (
            <div className="text-xs text-purple-300 mt-1">
              Needs your attention
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs (List View Only) - UPDATED with Price Approval */}
      {view === "list" && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              "all",
              "active",
              "completed",
              "pending",
              "cancelled",
              "priceApproval",
            ] as BookingFilter[]
          ).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === filterType
                  ? (() => {
                      switch (filterType) {
                        case "active":
                          return "bg-blue-500 text-white";
                        case "completed":
                          return "bg-green-500 text-white";
                        case "pending":
                          return "bg-orange-500 text-white";
                        case "cancelled":
                          return "bg-red-500 text-white";
                        case "priceApproval":
                          return "bg-purple-500 text-white";
                        default:
                          return "bg-amber-500 text-white";
                      }
                    })()
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {getFilterLabel(filterType)} ({getFilterCount(filterType)})
            </button>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {view === "calendar" && (
        <>
          {/* Calendar Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {calendarView === "month" &&
                  `${
                    monthNames[currentDate.getMonth()]
                  } ${currentDate.getFullYear()}`}
                {calendarView === "week" &&
                  `Week of ${weekDays[0].toLocaleDateString()} - ${weekDays[6].toLocaleDateString()}`}
                {calendarView === "day" &&
                  selectedDate &&
                  `${selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`}
              </h2>
              <p className="text-gray-400 text-sm">
                Your personal service schedule
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-800/50 rounded-lg border border-gray-700 p-1">
                <button
                  onClick={() => setCalendarView("month")}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    calendarView === "month"
                      ? "bg-amber-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setCalendarView("week")}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    calendarView === "week"
                      ? "bg-amber-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => {
                    setCalendarView("day");
                    setSelectedDate(new Date());
                  }}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    calendarView === "day"
                      ? "bg-amber-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Day
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (calendarView === "month") navigateMonth("prev");
                    if (calendarView === "week") navigateWeek("prev");
                    if (calendarView === "day" && selectedDate) {
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
                    if (calendarView === "month") navigateMonth("next");
                    if (calendarView === "week") navigateWeek("next");
                    if (calendarView === "day" && selectedDate) {
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
          {calendarView === "month" && (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-gray-800">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="p-4 text-center text-sm font-medium text-gray-400 border-r border-gray-800 last:border-r-0"
                  >
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
                      !date
                        ? "bg-gray-900/20"
                        : date.toDateString() === new Date().toDateString()
                        ? "bg-amber-500/10"
                        : "bg-gray-800/20 hover:bg-gray-700/30"
                    } transition-colors`}
                    onClick={() => {
                      if (date) {
                        setSelectedDate(date);
                        setCalendarView("day");
                      }
                    }}
                  >
                    {date && (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <span
                            className={`text-sm font-medium ${
                              date.toDateString() === new Date().toDateString()
                                ? "text-amber-400"
                                : "text-gray-300"
                            }`}
                          >
                            {date.getDate()}
                          </span>
                          {getBookingsForDate(date).length > 0 && (
                            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                          )}
                        </div>

                        {/* Bookings for this day */}
                        <div className="space-y-1 max-h-20 overflow-y-auto">
                          {getBookingsForDate(date)
                            .slice(0, 3)
                            .map((booking) => (
                              <div
                                key={booking.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBooking(booking);
                                }}
                                className={`p-1 rounded border text-xs cursor-pointer transition-all hover:scale-105 ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                <div className="font-medium truncate">
                                  {formatTime(booking.bookingDate)}
                                </div>
                                <div className="truncate">
                                  {booking.vehicle.model}
                                </div>
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
          {calendarView === "week" && (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
              <div className="grid grid-cols-8 border-b border-gray-800">
                <div className="p-4 border-r border-gray-800"></div>
                {weekDays.map((date, index) => (
                  <div
                    key={index}
                    className={`p-4 text-center border-r border-gray-800 last:border-r-0 cursor-pointer ${
                      date.toDateString() === new Date().toDateString()
                        ? "bg-amber-500/10"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedDate(date);
                      setCalendarView("day");
                    }}
                  >
                    <div className="text-sm font-medium text-gray-400">
                      {dayNames[date.getDay()]}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        date.toDateString() === new Date().toDateString()
                          ? "text-amber-400"
                          : "text-white"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getBookingsForDate(date).length} bookings
                    </div>
                  </div>
                ))}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {Array.from(
                  { length: 20 },
                  (_, i) => 8 + Math.floor(i / 2) + (i % 2 === 0 ? 0 : 0.5)
                ).map((time, index) => {
                  const hour = Math.floor(time);
                  const minute = time % 1 === 0 ? "00" : "30";
                  const timeString = `${hour
                    .toString()
                    .padStart(2, "0")}:${minute}`;

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-8 border-b border-gray-800 last:border-b-0"
                    >
                      <div className="p-3 border-r border-gray-800 text-sm text-gray-400 text-right pr-4">
                        {timeString}
                      </div>
                      {weekDays.map((date, dayIndex) => {
                        const bookingsForSlot = bookings.filter((booking) => {
                          const bookingDate = new Date(booking.bookingDate);
                          return (
                            bookingDate.toDateString() ===
                              date.toDateString() &&
                            bookingDate.getHours() === hour &&
                            bookingDate.getMinutes() ===
                              (minute === "00" ? 0 : 30)
                          );
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
                            {bookingsForSlot.map((booking) => (
                              <div
                                key={booking.id}
                                className={`p-2 rounded border text-xs cursor-pointer transition-all hover:scale-105 ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                <div className="font-medium truncate">
                                  {booking.vehicle.model}
                                </div>
                                <div className="truncate text-amber-400">
                                  {getServiceType(booking)}
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
          {calendarView === "day" && selectedDate && (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">
                  {fullDayNames[selectedDate.getDay()]},{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
                <p className="text-gray-400 text-sm">
                  {getBookingsForDate(selectedDate).length} bookings scheduled
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {getTimeSlots(selectedDate).map((slot, index) => (
                  <div
                    key={index}
                    className="flex border-b border-gray-800 last:border-b-0"
                  >
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
                      {slot.bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`p-3 rounded-lg border mb-2 last:mb-0 cursor-pointer transition-all hover:scale-105 ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-white">
                                {booking.vehicle.model}
                              </div>
                              <div className="text-sm text-gray-300">
                                {booking.vehicle.registrationNumber}
                              </div>
                              <div className="text-sm text-amber-400 mt-1">
                                {getServiceType(booking)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-amber-400 font-bold">
                                RM {booking.estimatedCost || "0"}
                              </div>
                              <div className="text-xs text-gray-400">
                                {booking.duration || 1}h
                              </div>
                              {booking.service?.worker && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {booking.service.worker.name}
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
        </>
      )}

      {/* List View with Filters */}
      {view === "list" && filter !== "priceApproval" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              {getFilterLabel(filter)} ({filteredBookings.length})
            </h3>
            <div className="text-sm text-gray-400">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
              <div className="text-gray-400 text-6xl mb-4">
                {filter === "all"
                  ? "📋"
                  : filter === "active"
                  ? "🔧"
                  : filter === "completed"
                  ? "✅"
                  : filter === "pending"
                  ? "⏳"
                  : "❌"}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                No {getFilterLabel(filter).toLowerCase()}
              </h3>
              <p className="text-gray-400 mb-4">
                {filter === "all"
                  ? "You don't have any bookings yet."
                  : `You don't have any ${getFilterLabel(
                      filter
                    ).toLowerCase()} bookings.`}
              </p>
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors mr-3"
                >
                  View All Bookings
                </button>
              )}
              <Link
                href="/book-service"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Book a New Service
              </Link>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 hover:border-blue-500/30 transition-all duration-300"
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-xl mb-1">
                          {booking.vehicle.model}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {booking.vehicle.registrationNumber} •{" "}
                          {booking.vehicle.year}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={booking.status} />
                        {booking.estimatedCost && (
                          <div className="flex flex-col items-end">
                            <span className="text-green-400 font-bold">
                              RM {booking.estimatedCost.toFixed(2)}
                            </span>
                            {/* Show price approval status */}
                            {booking.estimatedCost &&
                              booking.status === "Confirmed" && (
                                <span
                                  className={`text-xs px-2 py-1 rounded-full mt-1 ${
                                    booking.priceApproved
                                      ? "bg-green-500/20 text-green-400"
                                      : booking.priceRejected
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-blue-500/20 text-blue-400"
                                  }`}
                                >
                                  {booking.priceApproved
                                    ? "✅ Approved"
                                    : booking.priceRejected
                                    ? "❌ Rejected"
                                    : "⏳ Needs Approval"}
                                </span>
                              )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Scheduled Time</p>
                        <p className="text-white font-medium">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </p>
                        <p className="text-amber-400 text-sm">
                          {formatTime(booking.bookingDate)} •{" "}
                          {booking.duration || 1}h
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Service Type</p>
                        <p className="text-white font-medium">
                          {getServiceType(booking)}
                        </p>
                      </div>
                    </div>

                    {booking.reportedIssue && (
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm mb-2">
                          Reported Issue
                        </p>
                        <p className="text-white bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                          {booking.reportedIssue}
                        </p>
                      </div>
                    )}

                    {/* Worker Contact Section in List View */}
                    {booking.service?.worker &&
                      booking.status !== "Pending" && (
                        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                          <h4 className="text-blue-400 font-semibold mb-3 flex items-center">
                            <span className="mr-2">👨‍🔧</span>
                            Assigned Technician
                            {booking.service.worker.position && (
                              <span className="ml-2 text-sm bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                {booking.service.worker.position}
                              </span>
                            )}
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-400 text-sm">Name</p>
                              <p className="text-white font-medium">
                                {booking.service.worker.name}
                              </p>
                              {booking.service.worker.rating && (
                                <div className="flex items-center mt-1">
                                  <span className="text-yellow-400 mr-1">
                                    ⭐
                                  </span>
                                  <span className="text-gray-300 text-sm">
                                    {booking.service.worker.rating.toFixed(1)}{" "}
                                    rating
                                  </span>
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="text-gray-400 text-sm mb-2">
                                Quick Contact
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {booking.service.worker.phone && (
                                  <>
                                    <a
                                      href={`tel:${booking.service.worker.phone}`}
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <span>📞</span>
                                      Call
                                    </a>
                                    <a
                                      href={`https://wa.me/${booking.service.worker.phone.replace(
                                        /\D/g,
                                        ""
                                      )}`}
                                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                                      onClick={(e) => e.stopPropagation()}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <span>💬</span>
                                      WhatsApp
                                    </a>
                                  </>
                                )}
                                <a
                                  href={`mailto:${booking.service.worker.email}`}
                                  className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span>✉️</span>
                                  Email
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Repair Notes */}
                    {booking.service?.repairNotes && (
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm mb-2">
                          Technician Notes
                        </p>
                        <p className="text-white bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                          {booking.service.repairNotes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-400">
                      <span>
                        📅 Booked on{" "}
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(booking);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                    >
                      View Details
                    </button>
                    {booking.status !== "Cancelled" &&
                      booking.status !== "Completed" &&
                      booking.status !== "Pending" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelBooking(booking.id);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                        >
                          Cancel Booking
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Price Approval Section (when filter is priceApproval) */}
      {view === "list" && filter === "priceApproval" && (
        <div className="mt-4">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">
              Price Approvals Needed
            </h3>
            <p className="text-gray-400">
              Review and approve price estimates from technicians before they
              can start work on your vehicle.
            </p>
          </div>

          {/* You can either use the PriceApproval component or show your own list */}
          <PriceApproval customerId={customerId} />
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white">
                  Booking Details
                </h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

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
                        <p className="text-white font-medium">
                          {selectedBooking.vehicle.model}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">
                          Registration Number
                        </p>
                        <p className="text-white font-medium">
                          {selectedBooking.vehicle.registrationNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Service Type</p>
                        <p className="text-white font-medium">
                          {getServiceType(selectedBooking)}
                        </p>
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
                        <p className="text-gray-400 text-sm">
                          Scheduled Date & Time
                        </p>
                        <p className="text-white font-medium">
                          {new Date(
                            selectedBooking.bookingDate
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-amber-400 font-medium">
                          {formatTime(selectedBooking.bookingDate)} •{" "}
                          {selectedBooking.duration || 1} hours
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Estimated Cost</p>
                        <p className="text-amber-400 text-xl font-bold">
                          RM {selectedBooking.estimatedCost || "0"}
                        </p>
                        {/* Price approval status in modal */}
                        {selectedBooking.estimatedCost &&
                          selectedBooking.status === "Confirmed" && (
                            <div
                              className={`text-sm mt-2 px-3 py-1 rounded-full inline-block ${
                                selectedBooking.priceApproved
                                  ? "bg-green-500/20 text-green-400"
                                  : selectedBooking.priceRejected
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {selectedBooking.priceApproved
                                ? "✅ Price Approved"
                                : selectedBooking.priceRejected
                                ? `❌ Price Rejected${
                                    selectedBooking.rejectionReason
                                      ? `: ${selectedBooking.rejectionReason}`
                                      : ""
                                  }`
                                : "⏳ Needs Your Approval"}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Price Approval Section in Modal */}
                {selectedBooking.estimatedCost &&
                  selectedBooking.status === "Confirmed" &&
                  !selectedBooking.priceApproved &&
                  !selectedBooking.priceRejected && (
                    <div className="space-y-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <h4 className="text-lg font-semibold text-blue-400">
                        Price Approval Required
                      </h4>
                      <p className="text-gray-300">
                        The technician has provided a price estimate for your
                        service. Please review and approve or reject it before
                        work can begin.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            handlePriceApproval(selectedBooking.id, true)
                          }
                          disabled={isSubmitting}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-6 py-2 rounded-lg transition-all disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Processing...
                            </div>
                          ) : (
                            `✅ Approve RM ${selectedBooking.estimatedCost.toFixed(
                              2
                            )}`
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsPriceApprovalModalOpen(true);
                          }}
                          disabled={isSubmitting}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-6 py-2 rounded-lg transition-all disabled:cursor-not-allowed"
                        >
                          ❌ Reject Price
                        </button>
                      </div>
                    </div>
                  )}
                {selectedBooking.status === "Completed" && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <h4 className="text-lg font-semibold text-green-400 mb-3">
                      Complete Payment
                    </h4>
                    <PaymentButton
                      bookingId={selectedBooking.id}
                      amount={selectedBooking.estimatedCost || 0}
                      vehicleModel={selectedBooking.vehicle.model}
                      registrationNumber={
                        selectedBooking.vehicle.registrationNumber
                      }
                      customerId={customerId}
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      Service completed successfully. Please complete payment to
                      receive your invoice.
                    </p>
                  </div>
                )}
                {/* Worker Contact Information */}
                {selectedBooking.service?.worker &&
                  selectedBooking.status !== "Pending" && (
                    <div className="space-y-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <h4 className="text-lg font-semibold text-blue-400 flex items-center">
                        <span className="mr-2">👨‍🔧</span>
                        Assigned Technician
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Name</p>
                          <p className="text-white font-medium text-lg">
                            {selectedBooking.service.worker.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">
                            Contact Information
                          </p>
                          <div className="space-y-2 mt-2">
                            {selectedBooking.service.worker.phone && (
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-3">📞</span>
                                <a
                                  href={`tel:${selectedBooking.service.worker.phone}`}
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  {selectedBooking.service.worker.phone}
                                </a>
                              </div>
                            )}
                            <div className="flex items-center">
                              <span className="text-gray-400 mr-3">✉️</span>
                              <a
                                href={`mailto:${selectedBooking.service.worker.email}`}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                {selectedBooking.service.worker.email}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        {selectedBooking.service.worker.phone && (
                          <a
                            href={`tel:${selectedBooking.service.worker.phone}`}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center"
                          >
                            <span className="mr-2">📞</span>
                            Call Technician
                          </a>
                        )}
                        <a
                          href={`mailto:${selectedBooking.service.worker.email}`}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center"
                        >
                          <span className="mr-2">✉️</span>
                          Send Email
                        </a>
                      </div>
                    </div>
                  )}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                    <span className="mr-2">🔧</span>
                    Service Details
                  </h4>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Reported Issue</p>
                    <p className="text-white p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      {selectedBooking.reportedIssue ||
                        "No specific issue reported"}
                    </p>
                  </div>
                  {selectedBooking.service?.serviceStatus && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">
                        Current Status
                      </p>
                      <p className="text-amber-400 font-medium">
                        {selectedBooking.service.serviceStatus}
                      </p>
                    </div>
                  )}
                  {selectedBooking.service?.repairNotes && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">
                        Technician Notes
                      </p>
                      <p className="text-white p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        {selectedBooking.service.repairNotes}
                      </p>
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
                  {selectedBooking.status !== "Cancelled" &&
                    selectedBooking.status !== "Completed" &&
                    selectedBooking.status !== "Pending" && (
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
        </div>
      )}

      {/* Price Rejection Modal */}
      {isPriceApprovalModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-red-500/30 max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Reject Price Estimate
              </h3>
              <p className="text-gray-300 mb-6">
                Please provide a reason for rejecting this price estimate. The
                technician will review your feedback and provide a revised
                estimate.
              </p>

              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  placeholder="E.g., Price is too high, need cheaper alternatives, want to remove some services..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsPriceApprovalModalOpen(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all border border-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!rejectionReason.trim()) {
                      alert("Please provide a reason for rejecting the price");
                      return;
                    }
                    handlePriceApproval(
                      selectedBooking.id,
                      false,
                      rejectionReason
                    );
                  }}
                  disabled={isSubmitting || !rejectionReason.trim()}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
