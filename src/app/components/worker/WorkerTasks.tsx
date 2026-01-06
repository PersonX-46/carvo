"use client";
import { useState, useEffect } from "react";

interface PendingBooking {
  id: number;
  customerId: number;
  vehicleId: number;
  workerId: number | null;
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
  estimatedMinCost?: number | null;
  estimatedMaxCost?: number | null;
  finalCost?: number | null;
  confirmed: boolean;
  duration: number | null;
  priceApproved?: boolean | null;
  priceRejected?: boolean | null;
  rejectionReason?: string | null;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  vehicle: {
    model: string;
    registrationNumber: string;
    year: number | null;
    type: string | null;
    mileage: number | null;
  };
  service?: {
    id: number;
    serviceStatus: string;
    repairNotes: string | null;
    serviceCost: number | null;
    spareParts: string | null;
    completionDate: string | null;
    duration: number | null;
    worker?: {
      id: number;
      name: string;
    };
  };
}

const WorkerTasks: React.FC = () => {
  const [assignedBookings, setAssignedBookings] = useState<PendingBooking[]>(
    []
  );
  const [pricePendingBookings, setPricePendingBookings] = useState<
    PendingBooking[]
  >([]);
  const [priceApprovedBookings, setPriceApprovedBookings] = useState<
    PendingBooking[]
  >([]);
  const [priceRejectedBookings, setPriceRejectedBookings] = useState<
    PendingBooking[]
  >([]);
  const [inProgressBookings, setInProgressBookings] = useState<
    PendingBooking[]
  >([]);
  const [completedBookings, setCompletedBookings] = useState<PendingBooking[]>(
    []
  );

  const [selectedBooking, setSelectedBooking] = useState<PendingBooking | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    | "assigned"
    | "pricePending"
    | "priceApproved"
    | "priceRejected"
    | "inProgress"
    | "completed"
  >("assigned");

  const [isPriceRangeModalOpen, setIsPriceRangeModalOpen] = useState(false);
  const [isFinalPriceModalOpen, setIsFinalPriceModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [bookingToReject, setBookingToReject] = useState<number | null>(null);

  // Price RANGE form state (for initial estimate)
  const [priceRangeEstimate, setPriceRangeEstimate] = useState({
    minCost: 0,
    maxCost: 0,
    estimatedDuration: 1,
    spareParts: [] as string[],
    repairNotes: "",
  });

  // FINAL price form state (after completion)
  const [finalPrice, setFinalPrice] = useState({
    laborCost: 0,
    partsCost: 0,
    totalCost: 0,
    actualPartsUsed: [] as string[],
    finalNotes: "",
  });

  // Fetch worker's bookings
  useEffect(() => {
    fetchWorkerBookings();
    const intervalId = setInterval(fetchWorkerBookings, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchWorkerBookings = async () => {
    try {
      setIsLoading(true);
      setError("");

      const workerId = localStorage.getItem("workerId") || "1";

      const response = await fetch(
        `/api/worker/bookings?workerId=${workerId}&t=${Date.now()}`
      );
      if (!response.ok) throw new Error("Failed to fetch bookings");

      const data = await response.json();

      setAssignedBookings(data.assignedBookings || []);
      setPricePendingBookings(data.pricePendingBookings || []);
      setPriceApprovedBookings(data.priceApprovedBookings || []);
      setPriceRejectedBookings(data.priceRejectedBookings || []);
      setInProgressBookings(data.inProgressBookings || []);
      setCompletedBookings(data.completedBookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load your tasks");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit PRICE RANGE estimate (initial estimate)
  const handleSubmitPriceRangeEstimate = async () => {
    if (!selectedBooking) return;

    try {
      setIsActionLoading(true);
      const workerId = localStorage.getItem("workerId") || "1";

      // Calculate average for display
      const averageCost =
        (priceRangeEstimate.minCost + priceRangeEstimate.maxCost) / 2;

      const response = await fetch(
        `/api/worker/bookings/${selectedBooking.id}/estimate-range`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            minCost: priceRangeEstimate.minCost,
            maxCost: priceRangeEstimate.maxCost,
            estimatedDuration: priceRangeEstimate.estimatedDuration,
            repairNotes: priceRangeEstimate.repairNotes,
            workerId: parseInt(workerId),
            // Add this to update booking status properly
            updateStatus: true,
            newStatus: "Confirmed", // Set to Confirmed for customer side
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to submit price estimate");

      // Move from assigned to price pending
      setAssignedBookings((prev) =>
        prev.filter((b) => b.id !== selectedBooking.id)
      );
      setPricePendingBookings((prev) => [
        ...prev,
        {
          ...selectedBooking,
          estimatedMinCost: priceRangeEstimate.minCost,
          estimatedMaxCost: priceRangeEstimate.maxCost,
          estimatedCost: averageCost, // Store average for display
          duration: priceRangeEstimate.estimatedDuration,
          status: "Price Pending",
        },
      ]);

      setIsPriceRangeModalOpen(false);
      setSelectedBooking(null);
      alert("Price range estimate submitted. Waiting for customer approval.");
    } catch (error) {
      console.error("Error submitting price estimate:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to submit price estimate"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // In your WorkerTasks component, update the handleSubmitFinalPrice function:

  const handleSubmitFinalPrice = async () => {
    if (!selectedBooking) return;

    try {
      setIsActionLoading(true);
      const workerId = localStorage.getItem("workerId") || "1";

      const response = await fetch(
        `/api/worker/bookings/${selectedBooking.id}/final-price`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            laborCost: finalPrice.laborCost,
            partsCost: finalPrice.partsCost,
            totalCost: finalPrice.totalCost,
            actualPartsUsed: finalPrice.actualPartsUsed,
            finalNotes: finalPrice.finalNotes,
            workerId: parseInt(workerId),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to submit final price");

      // Update completed booking with final price from service
      setCompletedBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id
            ? {
                ...booking,
                finalCost: data.finalPrice?.totalCost || finalPrice.totalCost,
                estimatedCost:
                  data.finalPrice?.totalCost || finalPrice.totalCost,
                service: booking.service
                  ? {
                      ...booking.service,
                      serviceCost:
                        data.finalPrice?.totalCost || finalPrice.totalCost,
                      repairNotes: finalPrice.finalNotes,
                    }
                  : booking.service,
              }
            : booking
        )
      );

      setIsFinalPriceModalOpen(false);
      setSelectedBooking(null);
      alert("Final price submitted successfully!");

      setTimeout(() => fetchWorkerBookings(), 1000);
    } catch (error) {
      console.error("Error submitting final price:", error);
      alert(
        error instanceof Error ? error.message : "Failed to submit final price"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // Start work on price approved booking
  const handleStartWork = async (bookingId: number) => {
    try {
      setIsActionLoading(true);
      const workerId = localStorage.getItem("workerId") || "1";

      const response = await fetch(`/api/worker/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "In Progress",
          workerId: parseInt(workerId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to start work: ${response.statusText}`
        );
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to start work");
      }

      // Find the booking
      const booking = priceApprovedBookings.find((b) => b.id === bookingId);
      if (booking) {
        setPriceApprovedBookings((prev) =>
          prev.filter((b) => b.id !== bookingId)
        );
        setInProgressBookings((prev) => [
          ...prev,
          {
            ...booking,
            status: "In Progress",
          },
        ]);

        alert("Work started successfully!");
      }
    } catch (error) {
      console.error("Error starting work:", error);
      alert(error instanceof Error ? error.message : "Failed to start work.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Mark booking as completed
  const handleCompleteWork = async (bookingId: number) => {
    if (!confirm("Are you sure you want to mark this booking as completed?")) {
      return;
    }

    try {
      setIsActionLoading(true);
      const workerId = localStorage.getItem("workerId") || "1";

      const response = await fetch(`/api/worker/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Completed",
          workerId: parseInt(workerId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to mark as completed: ${response.statusText}`
        );
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to mark as completed");
      }

      // Find the booking
      const booking = inProgressBookings.find((b) => b.id === bookingId);
      if (booking) {
        setInProgressBookings((prev) => prev.filter((b) => b.id !== bookingId));
        setCompletedBookings((prev) => [
          {
            ...booking,
            status: "Completed",
          },
          ...prev,
        ]);

        sendWhatsAppCompletionNotification(booking);
        alert("✅ Booking marked as completed successfully!");

        setTimeout(() => fetchWorkerBookings(), 1000);
      }
    } catch (error) {
      console.error("Error completing work:", error);
      alert(
        error instanceof Error ? error.message : "Failed to mark as completed."
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const sendWhatsAppCompletionNotification = (booking: PendingBooking) => {
    try {
      if (!booking.customer.phone) return;

      const phoneNumber = booking.customer.phone.replace(/\D/g, "");
      const completionDate = new Date().toLocaleDateString("en-MY", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Show price range if available, otherwise show estimated cost
      const priceInfo =
        booking.estimatedMinCost && booking.estimatedMaxCost
          ? `RM ${booking.estimatedMinCost.toFixed(
              2
            )} - RM ${booking.estimatedMaxCost.toFixed(2)}`
          : `RM ${booking.estimatedCost?.toFixed(2) || "0.00"}`;

      const message = `Hello ${booking.customer.name}! 🚗

🎉 Your vehicle service is now COMPLETED!

📋 Service Details:
• Vehicle: ${booking.vehicle.model} (${booking.vehicle.registrationNumber})
• Estimated Price Range: ${priceInfo}
• Completed On: ${completionDate}

✅ Your vehicle is ready for collection!
The final invoice will be provided when you collect your vehicle.

Thank you for choosing Cheng Service! 😊

Best regards,
Cheng Service Team`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/6${phoneNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, "_blank");
    } catch (error) {
      console.error("Error sending WhatsApp notification:", error);
    }
  };

  // Revise price for rejected bookings
  const handleRevisePrice = (booking: PendingBooking) => {
    setSelectedBooking(booking);
    setPriceRangeEstimate({
      minCost: booking.estimatedMinCost || booking.estimatedCost || 0,
      maxCost:
        booking.estimatedMaxCost ||
        (booking.estimatedCost ? booking.estimatedCost * 1.2 : 0),
      estimatedDuration: booking.duration || 1,
      spareParts: [],
      repairNotes: booking.reportedIssue || "",
    });
    setIsPriceRangeModalOpen(true);
  };

  // Set final price for completed bookings
  const handleSetFinalPrice = (booking: PendingBooking) => {
    setSelectedBooking(booking);
    // Start with price range as reference
    const minCost = booking.estimatedMinCost || booking.estimatedCost || 0;
    const maxCost =
      booking.estimatedMaxCost ||
      (booking.estimatedCost ? booking.estimatedCost * 1.2 : 0);

    setFinalPrice({
      laborCost: ((minCost + maxCost) / 2) * 0.7, // 70% labor as default
      partsCost: ((minCost + maxCost) / 2) * 0.3, // 30% parts as default
      totalCost: (minCost + maxCost) / 2,
      actualPartsUsed: [],
      finalNotes: `Final service completed for ${booking.vehicle.model}.`,
    });
    setIsFinalPriceModalOpen(true);
  };

  // Reject assigned booking
  const handleRejectAssignment = async (bookingId: number) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setIsActionLoading(true);
      const response = await fetch(
        `/api/worker/bookings/${bookingId}/reject-assignment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: rejectionReason,
            workerId: localStorage.getItem("workerId") || "1",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject assignment");

      setAssignedBookings((prev) => prev.filter((b) => b.id !== bookingId));
      setIsRejectModalOpen(false);
      setBookingToReject(null);
      setRejectionReason("");
      alert("Booking assignment rejected");
    } catch (error) {
      console.error("Error rejecting assignment:", error);
      alert("Failed to reject assignment");
    } finally {
      setIsActionLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "Pending":
        case "Assigned":
          return "bg-orange-500/20 text-orange-400 border-orange-500/30";
        case "Confirmed":
        case "Price Pending":
          return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        case "In Progress":
          return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
        case "Completed":
          return "bg-green-500/20 text-green-400 border-green-500/30";
        case "Cancelled":
        case "Price Rejected":
          return "bg-red-500/20 text-red-400 border-red-500/30";
        default:
          return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      }
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
          status
        )}`}
      >
        {status}
      </span>
    );
  };

  // Calculate total cost automatically for final price
  useEffect(() => {
    const total = finalPrice.laborCost + finalPrice.partsCost;
    setFinalPrice((prev) => ({ ...prev, totalCost: total }));
  }, [finalPrice.laborCost, finalPrice.partsCost]);

  // Format price display with range
  const formatPriceDisplay = (booking: PendingBooking) => {
    if (booking.finalCost) {
      return `RM ${booking.finalCost.toFixed(2)} (Final)`;
    } else if (booking.estimatedMinCost && booking.estimatedMaxCost) {
      return `RM ${booking.estimatedMinCost.toFixed(
        2
      )} - RM ${booking.estimatedMaxCost.toFixed(2)}`;
    } else if (booking.estimatedCost) {
      return `RM ${booking.estimatedCost.toFixed(2)}`;
    }
    return "Price not set";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">My Tasks</h2>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading tasks...</p>
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
          <h2 className="text-2xl font-bold text-white">My Service Tasks</h2>
          <p className="text-gray-400">Manage bookings assigned to you</p>
        </div>

        {/* Stats */}
        <div className="flex gap-2 flex-wrap">
          <div className="bg-gray-800/50 rounded-xl p-2 border border-gray-700 text-center min-w-[80px]">
            <div className="text-xl font-bold text-orange-400">
              {assignedBookings.length}
            </div>
            <div className="text-gray-400 text-xs">Assigned</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-2 border border-gray-700 text-center min-w-[80px]">
            <div className="text-xl font-bold text-blue-400">
              {pricePendingBookings.length}
            </div>
            <div className="text-gray-400 text-xs">Awaiting</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-2 border border-gray-700 text-center min-w-[80px]">
            <div className="text-xl font-bold text-green-400">
              {priceApprovedBookings.length}
            </div>
            <div className="text-gray-400 text-xs">Approved</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-2 border border-gray-700 text-center min-w-[80px]">
            <div className="text-xl font-bold text-yellow-400">
              {inProgressBookings.length}
            </div>
            <div className="text-gray-400 text-xs">Progress</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-2 border border-gray-700 text-center min-w-[80px]">
            <div className="text-xl font-bold text-purple-400">
              {completedBookings.length}
            </div>
            <div className="text-gray-400 text-xs">Completed</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
          <div className="flex items-center">
            <span className="text-red-400 mr-2">⚠️</span>
            <p className="text-red-400">{error}</p>
          </div>
          <button
            onClick={fetchWorkerBookings}
            className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap bg-gray-800/50 rounded-lg border border-gray-700 p-1 gap-1">
        <button
          onClick={() => setActiveTab("assigned")}
          className={`px-3 py-2 rounded text-sm font-medium transition-all ${
            activeTab === "assigned"
              ? "bg-orange-500 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Assigned ({assignedBookings.length})
        </button>
        <button
          onClick={() => setActiveTab("pricePending")}
          className={`px-3 py-2 rounded text-sm font-medium transition-all ${
            activeTab === "pricePending"
              ? "bg-blue-500 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Awaiting ({pricePendingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab("priceApproved")}
          className={`px-3 py-2 rounded text-sm font-medium transition-all ${
            activeTab === "priceApproved"
              ? "bg-green-500 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Approved ({priceApprovedBookings.length})
        </button>
        <button
          onClick={() => setActiveTab("priceRejected")}
          className={`px-3 py-2 rounded text-sm font-medium transition-all ${
            activeTab === "priceRejected"
              ? "bg-red-500 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Rejected ({priceRejectedBookings.length})
        </button>
        <button
          onClick={() => setActiveTab("inProgress")}
          className={`px-3 py-2 rounded text-sm font-medium transition-all ${
            activeTab === "inProgress"
              ? "bg-yellow-500 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Progress ({inProgressBookings.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-3 py-2 rounded text-sm font-medium transition-all ${
            activeTab === "completed"
              ? "bg-purple-500 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Completed ({completedBookings.length})
        </button>
      </div>

      {/* Assigned Bookings Tab */}
      {activeTab === "assigned" && (
        <div className="space-y-4">
          {assignedBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                No Assigned Bookings
              </h3>
              <p className="text-gray-400">
                You don't have any bookings assigned to you yet.
              </p>
            </div>
          ) : (
            assignedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 hover:border-orange-500/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-xl mb-1">
                          {booking.vehicle.model}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {booking.vehicle.registrationNumber}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Customer</p>
                        <p className="text-white font-medium">
                          {booking.customer.name}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {booking.customer.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Booking Date</p>
                        <p className="text-white font-medium">
                          {new Date(booking.bookingDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-2">
                        Reported Issue
                      </p>
                      <p className="text-white bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                        {booking.reportedIssue || "No specific issue reported"}
                      </p>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-3 min-w-[200px]">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsDetailsModalOpen(true);
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setPriceRangeEstimate({
                          minCost: 0,
                          maxCost: 0,
                          estimatedDuration: booking.duration || 1,
                          spareParts: [],
                          repairNotes: booking.reportedIssue || "",
                        });
                        setIsPriceRangeModalOpen(true);
                      }}
                      disabled={isActionLoading}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white px-4 py-2 rounded-xl font-medium"
                    >
                      Set Price Range
                    </button>
                    <button
                      onClick={() => {
                        setBookingToReject(booking.id);
                        setIsRejectModalOpen(true);
                      }}
                      disabled={isActionLoading}
                      className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-4 py-2 rounded-xl font-medium"
                    >
                      Reject Assignment
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Price Pending Tab (with price ranges) */}
      {activeTab === "pricePending" && (
        <div className="space-y-4">
          {pricePendingBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
              <div className="text-gray-400 text-6xl mb-4">⏳</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                No Bookings Awaiting Approval
              </h3>
              <p className="text-gray-400">
                All price estimates have been sent to customers.
              </p>
            </div>
          ) : (
            pricePendingBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-blue-500/10 rounded-2xl border border-blue-500/30 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-xl mb-1">
                          {booking.vehicle.model}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {booking.vehicle.registrationNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status="Awaiting Approval" />
                        <div className="text-center">
                          <div className="text-yellow-400 font-bold text-lg">
                            {booking.estimatedMinCost &&
                            booking.estimatedMaxCost ? (
                              <>
                                RM {booking.estimatedMinCost.toFixed(2)} - RM{" "}
                                {booking.estimatedMaxCost.toFixed(2)}
                                <div className="text-gray-300 text-xs">
                                  Estimated Range
                                </div>
                              </>
                            ) : (
                              `RM ${
                                booking.estimatedCost?.toFixed(2) || "0.00"
                              }`
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-blue-300 font-medium mb-2">
                        ⏳ Waiting for customer to approve the price range
                      </p>
                      <p className="text-gray-300 text-sm">
                        Customer will be notified via WhatsApp/Email
                      </p>
                    </div>

                    <button
                      onClick={() => handleRevisePrice(booking)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium"
                    >
                      Revise Price Range
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Price Approved Tab */}
      {activeTab === "priceApproved" && (
        <div className="space-y-4">
          {priceApprovedBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
              <div className="text-gray-400 text-6xl mb-4">✅</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                No Approved Bookings
              </h3>
              <p className="text-gray-400">
                Start work on bookings once customers approve prices.
              </p>
            </div>
          ) : (
            priceApprovedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-green-500/10 rounded-2xl border border-green-500/30 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-xl mb-1">
                          {booking.vehicle.model}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {booking.vehicle.registrationNumber}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status="Price Approved" />
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-xl">
                            {booking.estimatedMinCost &&
                            booking.estimatedMaxCost ? (
                              <>
                                RM {booking.estimatedMinCost.toFixed(2)} - RM{" "}
                                {booking.estimatedMaxCost.toFixed(2)}
                              </>
                            ) : (
                              <>RM {booking.estimatedCost?.toFixed(2)}</>
                            )}
                          </div>
                          <div className="text-green-300 text-sm">
                            ✓ Customer Approved
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-green-300 font-medium mb-2">
                        ✅ Customer has approved the price range
                      </p>
                      <p className="text-gray-300">
                        You can now start working on this vehicle.
                      </p>
                    </div>

                    <button
                      onClick={() => handleStartWork(booking.id)}
                      disabled={isActionLoading}
                      className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-white px-4 py-2 rounded-xl font-medium"
                    >
                      {isActionLoading ? "Starting..." : "Start Work"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Price Rejected Tab */}
      {activeTab === "priceRejected" && (
        <div className="space-y-4">
          {priceRejectedBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
              <div className="text-gray-400 text-6xl mb-4">❌</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                No Rejected Prices
              </h3>
              <p className="text-gray-400">
                All price estimates have been approved.
              </p>
            </div>
          ) : (
            priceRejectedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-red-500/10 rounded-2xl border border-red-500/30 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-xl mb-1">
                          {booking.vehicle.model}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {booking.vehicle.registrationNumber}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status="Price Rejected" />
                        <span className="text-red-400 font-bold text-lg">
                          {booking.estimatedMinCost &&
                          booking.estimatedMaxCost ? (
                            <>
                              RM {booking.estimatedMinCost.toFixed(2)} - RM{" "}
                              {booking.estimatedMaxCost.toFixed(2)}
                            </>
                          ) : (
                            <>RM {booking.estimatedCost?.toFixed(2)}</>
                          )}
                        </span>
                      </div>
                    </div>

                    {booking.rejectionReason && (
                      <div className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                        <p className="text-red-300 font-medium mb-1">
                          Customer's Feedback:
                        </p>
                        <p className="text-gray-200">
                          {booking.rejectionReason}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRevisePrice(booking)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium"
                      >
                        Revise Price Range
                      </button>
                      <button
                        onClick={() =>
                          window.open(
                            `https://wa.me/${booking.customer.phone.replace(
                              /\D/g,
                              ""
                            )}`,
                            "_blank"
                          )
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium"
                      >
                        Contact Customer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* In Progress Tab */}
      {activeTab === "inProgress" && (
        <div className="space-y-4">
          {inProgressBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
              <div className="text-gray-400 text-6xl mb-4">🔧</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                No Vehicles In Progress
              </h3>
              <p className="text-gray-400">Start work on approved bookings.</p>
            </div>
          ) : (
            inProgressBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-yellow-500/10 rounded-2xl border border-yellow-500/30 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-xl mb-1">
                          {booking.vehicle.model}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {booking.vehicle.registrationNumber}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status="In Progress" />
                        <span className="text-yellow-400 font-bold text-xl">
                          {formatPriceDisplay(booking)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCompleteWork(booking.id)}
                        disabled={isActionLoading}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-4 py-2 rounded-xl font-medium"
                      >
                        {isActionLoading
                          ? "Completing..."
                          : "Mark as Completed"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Completed Tab with Final Price Setting */}
      {activeTab === "completed" && (
        <div className="space-y-4">
          {completedBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
              <div className="text-gray-400 text-6xl mb-4">🏁</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                No Completed Services
              </h3>
              <p className="text-gray-400">
                Complete your in-progress bookings first.
              </p>
            </div>
          ) : (
            completedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-purple-500/10 rounded-2xl border border-purple-500/30 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-xl mb-1">
                          {booking.vehicle.model}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {booking.vehicle.registrationNumber}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status="Completed" />
                        <div className="text-right">
                          <div
                            className={`font-bold text-xl ${
                              booking.finalCost
                                ? "text-purple-400"
                                : "text-amber-400"
                            }`}
                          >
                            {booking.finalCost ? (
                              <>RM {booking.finalCost.toFixed(2)} (Final)</>
                            ) : booking.estimatedMinCost &&
                              booking.estimatedMaxCost ? (
                              <>
                                RM {booking.estimatedMinCost.toFixed(2)} - RM{" "}
                                {booking.estimatedMaxCost.toFixed(2)}
                              </>
                            ) : (
                              <>
                                RM {booking.estimatedCost?.toFixed(2) || "0.00"}
                              </>
                            )}
                          </div>
                          {!booking.finalCost && (
                            <div className="text-amber-300 text-sm">
                              ⚠️ Final price needed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-green-300 font-medium mb-4">
                      ✅ Service completed successfully
                    </p>

                    {!booking.finalCost ? (
                      <button
                        onClick={() => handleSetFinalPrice(booking)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium"
                      >
                        Set Final Price
                      </button>
                    ) : (
                      <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30">
                        <p className="text-green-300">
                          ✓ Final price has been set
                        </p>
                        <p className="text-gray-300 text-sm mt-1">
                          Customer can now make payment
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Price Range Modal (for initial estimate) */}
      {isPriceRangeModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Set Price Range Estimate
                </h3>
                <button
                  onClick={() => setIsPriceRangeModalOpen(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
                <p className="text-white font-medium mb-2">
                  {selectedBooking.vehicle.model} (
                  {selectedBooking.vehicle.registrationNumber})
                </p>
                <p className="text-gray-300">
                  Customer: {selectedBooking.customer.name} •{" "}
                  {selectedBooking.customer.phone}
                </p>
                <p className="text-gray-300">
                  Issue: {selectedBooking.reportedIssue}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Minimum Estimated Cost (RM)
                    </label>
                    <input
                      type="number"
                      value={priceRangeEstimate.minCost}
                      onChange={(e) =>
                        setPriceRangeEstimate((prev) => ({
                          ...prev,
                          minCost: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Maximum Estimated Cost (RM)
                    </label>
                    <input
                      type="number"
                      value={priceRangeEstimate.maxCost}
                      onChange={(e) =>
                        setPriceRangeEstimate((prev) => ({
                          ...prev,
                          maxCost: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 200"
                    />
                  </div>
                </div>

                <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                  <div className="text-center">
                    <div className="text-amber-400 font-bold text-xl mb-1">
                      Estimated Range: RM{" "}
                      {priceRangeEstimate.minCost.toFixed(2)} - RM{" "}
                      {priceRangeEstimate.maxCost.toFixed(2)}
                    </div>
                    <div className="text-amber-300 text-sm">
                      Average: RM{" "}
                      {(
                        (priceRangeEstimate.minCost +
                          priceRangeEstimate.maxCost) /
                        2
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Estimated Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={priceRangeEstimate.estimatedDuration}
                    onChange={(e) =>
                      setPriceRangeEstimate((prev) => ({
                        ...prev,
                        estimatedDuration: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Repair Notes & Recommendations
                  </label>
                  <textarea
                    value={priceRangeEstimate.repairNotes}
                    onChange={(e) =>
                      setPriceRangeEstimate((prev) => ({
                        ...prev,
                        repairNotes: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    placeholder="Describe the required repairs, parts needed, and any recommendations..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsPriceRangeModalOpen(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPriceRangeEstimate}
                    disabled={
                      isActionLoading ||
                      priceRangeEstimate.minCost <= 0 ||
                      priceRangeEstimate.maxCost <= 0 ||
                      priceRangeEstimate.minCost >= priceRangeEstimate.maxCost
                    }
                    className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                  >
                    {isActionLoading ? "Submitting..." : "Submit Price Range"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Price Modal (after completion) */}
      {isFinalPriceModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Set Final Price
                </h3>
                <button
                  onClick={() => setIsFinalPriceModalOpen(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
                <p className="text-white font-medium mb-2">
                  {selectedBooking.vehicle.model} (
                  {selectedBooking.vehicle.registrationNumber})
                </p>
                <p className="text-gray-300">
                  Customer: {selectedBooking.customer.name}
                </p>
                {selectedBooking.estimatedMinCost &&
                  selectedBooking.estimatedMaxCost && (
                    <p className="text-amber-300">
                      Approved Price Range: RM{" "}
                      {selectedBooking.estimatedMinCost.toFixed(2)} - RM{" "}
                      {selectedBooking.estimatedMaxCost.toFixed(2)}
                    </p>
                  )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Actual Labor Cost (RM)
                    </label>
                    <input
                      type="number"
                      value={finalPrice.laborCost}
                      onChange={(e) =>
                        setFinalPrice((prev) => ({
                          ...prev,
                          laborCost: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Actual Parts Cost (RM)
                    </label>
                    <input
                      type="number"
                      value={finalPrice.partsCost}
                      onChange={(e) =>
                        setFinalPrice((prev) => ({
                          ...prev,
                          partsCost: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Total Final Cost (RM)
                  </label>
                  <input
                    type="number"
                    value={finalPrice.totalCost}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white font-bold text-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Actual Parts Used
                  </label>
                  <textarea
                    value={finalPrice.actualPartsUsed.join(", ")}
                    onChange={(e) =>
                      setFinalPrice((prev) => ({
                        ...prev,
                        actualPartsUsed: e.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter((item) => item),
                      }))
                    }
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    placeholder="List parts used, separated by commas..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Final Service Notes
                  </label>
                  <textarea
                    value={finalPrice.finalNotes}
                    onChange={(e) =>
                      setFinalPrice((prev) => ({
                        ...prev,
                        finalNotes: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    placeholder="Describe the actual work done, any issues encountered, and final recommendations..."
                  />
                </div>

                {selectedBooking.estimatedMinCost &&
                  selectedBooking.estimatedMaxCost && (
                    <div
                      className={`rounded-lg p-4 border ${
                        finalPrice.totalCost >=
                          selectedBooking.estimatedMinCost &&
                        finalPrice.totalCost <= selectedBooking.estimatedMaxCost
                          ? "bg-green-500/10 border-green-500/20"
                          : "bg-red-500/10 border-red-500/20"
                      }`}
                    >
                      <div className="text-center">
                        <div
                          className={`font-bold text-lg ${
                            finalPrice.totalCost >=
                              selectedBooking.estimatedMinCost &&
                            finalPrice.totalCost <=
                              selectedBooking.estimatedMaxCost
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {finalPrice.totalCost >=
                            selectedBooking.estimatedMinCost &&
                          finalPrice.totalCost <=
                            selectedBooking.estimatedMaxCost ? (
                            <>✅ Within approved price range</>
                          ) : (
                            <>⚠️ Outside approved price range</>
                          )}
                        </div>
                        <div className="text-gray-300 text-sm mt-1">
                          Approved: RM{" "}
                          {selectedBooking.estimatedMinCost.toFixed(2)} - RM{" "}
                          {selectedBooking.estimatedMaxCost.toFixed(2)}
                          <br />
                          Final: RM {finalPrice.totalCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsFinalPriceModalOpen(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitFinalPrice}
                    disabled={isActionLoading || finalPrice.totalCost <= 0}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                  >
                    {isActionLoading ? "Submitting..." : "Submit Final Price"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {isRejectModalOpen && bookingToReject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-4">
                Reject Assignment
              </h3>
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Reason for rejecting this assignment
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  placeholder="Provide a reason for rejecting this booking assignment..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setBookingToReject(null);
                    setRejectionReason("");
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectAssignment(bookingToReject)}
                  disabled={isActionLoading || !rejectionReason.trim()}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {isActionLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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

export default WorkerTasks;
