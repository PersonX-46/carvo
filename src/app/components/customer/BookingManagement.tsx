"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import PaymentButton from "@/app/components/customer/PaymentButton";
import PaymentSystem from "./PaymentSystem";

interface ServiceBooking {
  id: number;
  customerId: number;
  vehicleId: number;
  serviceId?: number;
  bookingDate: string;
  status:
    | "Pending"
    | "Confirmed"
    | "In Progress"
    | "Completed"
    | "Cancelled"
    | "Price Pending";
  reportedIssue: string | null;
  estimatedCost: number | null;
  estimatedMinCost: number | null;
  estimatedMaxCost: number | null;
  finalCost: number | null;
  confirmed: boolean;
  duration: number | null;
  createdAt: string;
  priceApproved: boolean | null;
  priceRejected: boolean | null;
  rejectionReason: string | null;
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
  paymentStatus?: string;
  amountPaid?: number;
  balanceDue?: number;
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
  const [view, setView] = useState<"calendar" | "list">("list");
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">(
    "month"
  );
  const [currentWeek, setCurrentWeek] = useState(0);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [filteredBookings, setFilteredBookings] = useState<ServiceBooking[]>(
    []
  );
  const [isPriceApprovalModalOpen, setIsPriceApprovalModalOpen] =
    useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeActionBooking, setActiveActionBooking] =
    useState<ServiceBooking | null>(null);
  const [priceApprovalCount, setPriceApprovalCount] = useState(0);
  const [customerId, setCustomerId] = useState<number>(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    switch (filter) {
      case "all":
        setFilteredBookings(bookings);
        break;
      case "active":
        setFilteredBookings(
          bookings.filter(
            (b) =>
              b.status === "Confirmed" ||
              b.status === "In Progress" ||
              b.status === "Price Pending"
          )
        );
        break;
      case "completed":
        setFilteredBookings(bookings.filter((b) => b.status === "Completed"));
        break;
      case "pending":
        setFilteredBookings(bookings.filter((b) => b.status === "Pending"));
        break;
      case "cancelled":
        setFilteredBookings(bookings.filter((b) => b.status === "Cancelled"));
        break;
      case "priceApproval":
        const needsApproval = bookings.filter(
          (b) =>
            (b.status === "Confirmed" || b.status === "Price Pending") &&
            (b.estimatedCost !== null || b.estimatedMinCost !== null) &&
            b.priceApproved === false &&
            b.priceRejected === false
        );
        setFilteredBookings(needsApproval);
        break;
      default:
        setFilteredBookings(bookings);
    }
  }, [filter, bookings]);

  useEffect(() => {
    const count = bookings.filter(needsPriceApproval).length;
    setPriceApprovalCount(count);
  }, [bookings]);

  const needsPriceApproval = (booking: ServiceBooking): boolean => {
    const isEligibleStatus =
      booking.status === "Confirmed" || booking.status === "Price Pending";
    const hasPriceEstimate =
      booking.estimatedCost !== null ||
      booking.estimatedMinCost !== null ||
      booking.estimatedMaxCost !== null;
    const needsApproval =
      booking.priceApproved === false && booking.priceRejected === false;
    return isEligibleStatus && hasPriceEstimate && needsApproval;
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [bookingsResponse, vehiclesResponse] = await Promise.all([
        fetch("/api/customer/bookings"),
        fetch("/api/customer/vehicles"),
      ]);
      if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings");
      const bookingsResult = await bookingsResponse.json();
      setBookings(bookingsResult.bookings || []);
      if (vehiclesResponse.ok) {
        const vehiclesResult = await vehiclesResponse.json();
        setVehicles(vehiclesResult.vehicles || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load booking data");
      setBookings([]);
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    fetchData();
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const days = [];
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

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
        slots.push({ time: timeString, hour, minute, bookings: slotBookings });
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
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "confirmed":
      case "price pending":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "in progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled":
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

  const getFilterCount = (filterType: BookingFilter) => {
    switch (filterType) {
      case "all":
        return bookings.length;
      case "active":
        return bookings.filter(
          (b) =>
            b.status === "Confirmed" ||
            b.status === "In Progress" ||
            b.status === "Price Pending"
        ).length;
      case "completed":
        return bookings.filter((b) => b.status === "Completed").length;
      case "pending":
        return bookings.filter((b) => b.status === "Pending" && !b.confirmed)
          .length;
      case "cancelled":
        return bookings.filter((b) => b.status === "Cancelled").length;
      case "priceApproval":
        return bookings.filter(
          (b) =>
            (b.status === "Confirmed" || b.status === "Price Pending") &&
            (b.estimatedCost !== null || b.estimatedMinCost !== null) &&
            b.priceApproved === false &&
            b.priceRejected === false
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

  const handlePriceApproval = async (
    bookingId: number,
    approved: boolean,
    reason?: string
  ) => {
    if (!approved && !reason?.trim()) {
      alert("Please provide a reason for rejecting the price");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/customer/bookings/${bookingId}/price-approval`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approved, reason: reason || null }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update price approval");
      }
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                priceApproved: approved,
                priceRejected: !approved,
                rejectionReason: !approved ? reason || null : null,
                status: approved ? "Confirmed" : "Pending",
              }
            : booking
        )
      );
      setIsPriceApprovalModalOpen(false);
      setActiveActionBooking(null);
      setRejectionReason("");
      alert(
        approved
          ? "✅ Price approved successfully! Service will begin shortly."
          : "❌ Price rejected. The technician will contact you with a revised estimate."
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
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const response = await fetch(`/api/customer/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      if (!response.ok) throw new Error("Failed to cancel booking");
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

  const StatusBadge = ({
    status,
    booking,
  }: {
    status: string;
    booking?: ServiceBooking;
  }) => {
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
        case "price pending":
          return "💰";
        default:
          return "📝";
      }
    };
    if (booking && needsPriceApproval(booking)) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse">
          <span className="mr-1">💰</span>
          Price Approval Needed
        </span>
      );
    }
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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

  const formatPriceDisplay = (booking: ServiceBooking) => {
    if (booking.estimatedMinCost && booking.estimatedMaxCost) {
      return `RM ${booking.estimatedMinCost.toFixed(
        2
      )} - RM ${booking.estimatedMaxCost.toFixed(2)}`;
    } else if (booking.estimatedCost) {
      return `RM ${booking.estimatedCost.toFixed(2)}`;
    }
    return "Price not set";
  };

  const PriceApprovalButtons = ({ booking }: { booking: ServiceBooking }) => {
    if (!needsPriceApproval(booking)) return null;
    return (
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-blue-400 font-semibold">
              Price Estimate Ready
            </h5>
            <p className="text-sm text-gray-300">
              {formatPriceDisplay(booking)} • Please approve to continue
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (
                  confirm(
                    `Approve price estimate of ${formatPriceDisplay(booking)}?`
                  )
                ) {
                  handlePriceApproval(booking.id, true);
                }
              }}
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
            >
              ✅ Approve
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveActionBooking(booking);
                setIsPriceApprovalModalOpen(true);
              }}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
            >
              ❌ Reject
            </button>
          </div>
        </div>
      </div>
    );
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
          <Link
            href="/book-service"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center space-x-2"
          >
            <span>📅</span>
            <span>New Booking</span>
          </Link>
        </div>
      </div>

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
            {getFilterCount("active")}
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
            {getFilterCount("completed")}
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
            {getFilterCount("pending")}
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
            {getFilterCount("cancelled")}
          </div>
          <div className="text-gray-400 text-sm">Cancelled</div>
        </div>
        <div
          className={`bg-gray-800/50 rounded-xl p-4 border transition-all cursor-pointer ${
            filter === "priceApproval"
              ? "border-purple-500 bg-purple-500/10"
              : "border-gray-700 hover:border-purple-500/30"
          }`}
          onClick={() => setFilter("priceApproval")}
        >
          <div className="text-2xl font-bold text-purple-400">
            {priceApprovalCount}
          </div>
          <div className="text-gray-400 text-sm">Price Approvals</div>
          {priceApprovalCount > 0 && (
            <div className="text-xs text-purple-300 mt-1 animate-pulse">
              ⚠️ Needs your attention
            </div>
          )}
        </div>
      </div>

      {view === "calendar" && (
        <>
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

          {calendarView === "month" && (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
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
                      <div className="p-3 border-r border-gray-800 text-sm text-gray-400 text-right">
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
                                {formatPriceDisplay(booking)}
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
                        <StatusBadge
                          status={booking.status}
                          booking={booking}
                        />
                        {booking.status === "Completed" && (
                          <div className="text-right">
                            {booking.finalCost && (
                              <>
                                <div className="text-amber-400 font-bold">
                                  RM {booking.finalCost.toFixed(2)}
                                </div>
                                <div className="text-xs">
                                  {booking.paymentStatus === "paid" ? (
                                    <span className="text-green-400">
                                      ✅ Paid
                                    </span>
                                  ) : booking.paymentStatus ===
                                    "partially_paid" ? (
                                    <span className="text-yellow-400">
                                      ⏳ Partial
                                    </span>
                                  ) : (
                                    <span className="text-red-400">
                                      💳 Pending
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        {(booking.estimatedCost || booking.estimatedMinCost) &&
                          booking.status !== "Completed" && (
                            <div className="text-right">
                              <span className="text-amber-400 font-bold">
                                {formatPriceDisplay(booking)}
                              </span>
                              {needsPriceApproval(booking) && (
                                <div className="text-xs text-purple-400 mt-1 animate-pulse">
                                  ⚠️ Needs approval
                                </div>
                              )}
                              {booking.priceApproved && (
                                <div className="text-xs text-green-400 mt-1">
                                  ✅ Approved
                                </div>
                              )}
                              {booking.priceRejected && (
                                <div className="text-xs text-red-400 mt-1">
                                  ❌ Rejected
                                </div>
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
                    {booking.status === "Completed" && booking.finalCost && (
                      <button
                        onClick={() => {
                          // Open payment modal
                          setSelectedBooking(booking);
                          setIsPaymentModalOpen(true);
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                      >
                        💳 Pay RM {booking.finalCost.toFixed(2)}
                      </button>
                    )}
                    <PriceApprovalButtons booking={booking} />
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

      {view === "list" && filter === "priceApproval" && (
        <div className="mt-4">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">
              Price Approvals Needed ({priceApprovalCount})
            </h3>
            <p className="text-gray-400">
              Review and approve price estimates from technicians before they
              can start work on your vehicle.
            </p>
          </div>
          {priceApprovalCount === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
              <div className="text-gray-400 text-6xl mb-4">✅</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                All Price Estimates Approved
              </h3>
              <p className="text-gray-400 mb-4">
                You don't have any pending price approvals.
              </p>
              <button
                onClick={() => setFilter("all")}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                View All Bookings
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 hover:border-purple-500/50 transition-all duration-300"
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
                          <StatusBadge
                            status={booking.status}
                            booking={booking}
                          />
                          <div className="text-right">
                            <div className="text-amber-400 font-bold text-2xl">
                              {formatPriceDisplay(booking)}
                            </div>
                            <div className="text-xs text-gray-400">
                              Technician's estimate
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">
                            Scheduled Time
                          </p>
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
                          {booking.service?.worker && (
                            <p className="text-gray-400 text-sm mt-1">
                              Technician: {booking.service.worker.name}
                            </p>
                          )}
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
                      {booking.service?.repairNotes && (
                        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <p className="text-gray-400 text-sm mb-2">
                            Technician's Assessment
                          </p>
                          <p className="text-white">
                            {booking.service.repairNotes}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex lg:flex-col gap-3 min-w-[250px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              `Approve price estimate of ${formatPriceDisplay(
                                booking
                              )}?`
                            )
                          ) {
                            handlePriceApproval(booking.id, true);
                          }
                        }}
                        disabled={isSubmitting}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </div>
                        ) : (
                          <>
                            <span className="mr-2">✅</span>
                            Approve Price
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveActionBooking(booking);
                          setIsPriceApprovalModalOpen(true);
                        }}
                        disabled={isSubmitting}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                      >
                        <>
                          <span className="mr-2">❌</span>
                          Reject Price
                        </>
                      </button>
                      {booking.service?.worker?.phone && (
                        <a
                          href={`https://wa.me/${booking.service.worker.phone.replace(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all text-center"
                        >
                          <span className="mr-2">💬</span>
                          Contact Technician
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
                      <span className="mr-2">🚗</span> Vehicle Information
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
                      <span className="mr-2">📅</span> Booking Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Status</p>
                        <StatusBadge
                          status={selectedBooking.status}
                          booking={selectedBooking}
                        />
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
                          {formatPriceDisplay(selectedBooking)}
                        </p>
                        {needsPriceApproval(selectedBooking) && (
                          <div className="text-sm mt-2 px-3 py-1 rounded-full inline-block bg-blue-500/20 text-blue-400">
                            ⏳ Needs Your Approval
                          </div>
                        )}
                        {selectedBooking.priceApproved && (
                          <div className="text-sm mt-2 px-3 py-1 rounded-full inline-block bg-green-500/20 text-green-400">
                            ✅ Price Approved
                          </div>
                        )}
                        {selectedBooking.priceRejected && (
                          <div className="text-sm mt-2 px-3 py-1 rounded-full inline-block bg-red-500/20 text-red-400">
                            ❌ Price Rejected
                            {selectedBooking.rejectionReason && (
                              <span>: {selectedBooking.rejectionReason}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {needsPriceApproval(selectedBooking) && (
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
                        onClick={() => {
                          if (
                            confirm(
                              `Approve price estimate of ${formatPriceDisplay(
                                selectedBooking
                              )}?`
                            )
                          ) {
                            handlePriceApproval(selectedBooking.id, true);
                          }
                        }}
                        disabled={isSubmitting}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-6 py-2 rounded-lg transition-all disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </div>
                        ) : (
                          `✅ Approve Price`
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setActiveActionBooking(selectedBooking);
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
                {selectedBooking.status === "Completed" &&
                  selectedBooking.finalCost && (
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-xl">
                      <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                        <span className="mr-2">💳</span>
                        Payment Information
                      </h4>
                      <div className="mb-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-300">Amount:</span>
                          <span className="text-amber-400 text-xl font-bold">
                            RM {selectedBooking.finalCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Status:</span>
                          <span
                            className={`font-medium ${
                              selectedBooking.paymentStatus === "paid"
                                ? "text-green-400"
                                : selectedBooking.paymentStatus ===
                                  "partially_paid"
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {selectedBooking.paymentStatus === "paid"
                              ? "✅ Paid"
                              : selectedBooking.paymentStatus ===
                                "partially_paid"
                              ? "⏳ Partially Paid"
                              : "💳 Payment Pending"}
                          </span>
                        </div>
                        {selectedBooking.amountPaid &&
                          selectedBooking.amountPaid > 0 && (
                            <div className="flex justify-between mt-1">
                              <span className="text-gray-300">
                                Amount Paid:
                              </span>
                              <span className="text-green-400">
                                RM {selectedBooking.amountPaid.toFixed(2)}
                              </span>
                            </div>
                          )}
                        {selectedBooking.balanceDue &&
                          selectedBooking.balanceDue > 0 && (
                            <div className="flex justify-between mt-1">
                              <span className="text-gray-300">
                                Balance Due:
                              </span>
                              <span className="text-red-400">
                                RM {selectedBooking.balanceDue.toFixed(2)}
                              </span>
                            </div>
                          )}
                      </div>

                      {selectedBooking.paymentStatus !== "paid" && (
                        <div className="mt-4">
                          <PaymentButton
                            booking={selectedBooking}
                            customerId={customerId}
                            onPaymentSuccess={() => {
                              handlePaymentSuccess();
                              setSelectedBooking(null);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400 flex items-center">
                    <span className="mr-2">🔧</span> Service Details
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
                <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-800">
                  {selectedBooking.status === "Completed" &&
                    selectedBooking.paymentStatus !== "paid" && (
                      <PaymentButton
                        booking={selectedBooking}
                        customerId={customerId}
                        onPaymentSuccess={() => {
                          handlePaymentSuccess();
                          setSelectedBooking(null);
                        }}
                      />
                    )}
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

      {isPriceApprovalModalOpen && activeActionBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-red-500/30 max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Reject Price Estimate
              </h3>
              <div className="mb-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-white font-medium">
                  {activeActionBooking.vehicle.model}
                </p>
                <p className="text-gray-400 text-sm">
                  {activeActionBooking.vehicle.registrationNumber}
                </p>
                <p className="text-amber-400 font-bold text-lg mt-2">
                  {formatPriceDisplay(activeActionBooking)}
                </p>
              </div>
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  placeholder="Please explain why you're rejecting this price estimate..."
                  required
                />
                <p className="text-gray-400 text-xs mt-2">
                  Your feedback will help the technician provide a better
                  estimate.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsPriceApprovalModalOpen(false);
                    setRejectionReason("");
                    setActiveActionBooking(null);
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
                      activeActionBooking.id,
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
                    "Submit Rejection"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPaymentModalOpen && selectedBooking && (
        <PaymentSystem
          booking={selectedBooking}
          customerId={customerId}
          onPaymentSuccess={() => {
            handlePaymentSuccess();
            setIsPaymentModalOpen(false);
            setSelectedBooking(null);
          }}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default BookingManagement;
