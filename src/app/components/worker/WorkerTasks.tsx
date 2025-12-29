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

  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [bookingToReject, setBookingToReject] = useState<number | null>(null);

  // Price estimate form state
  const [priceEstimate, setPriceEstimate] = useState({
    laborCost: 0,
    partsCost: 0,
    totalCost: 0,
    estimatedDuration: 1,
    spareParts: [] as string[],
    repairNotes: "",
  });

  // Fetch worker's bookings
  useEffect(() => {
    fetchWorkerBookings();
    const intervalId = setInterval(fetchWorkerBookings, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalId);
  }, []);

  const fetchWorkerBookings = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Get worker ID from localStorage or auth context
      const workerId = localStorage.getItem("workerId") || "1";

      const response = await fetch(
        `/api/worker/bookings?workerId=${workerId}&t=${Date.now()}`
      );
      if (!response.ok) throw new Error("Failed to fetch bookings");

      const data = await response.json();

      // Update all booking lists
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

  // Submit price estimate for an assigned booking
  const handleSubmitPriceEstimate = async () => {
    if (!selectedBooking) return;

    try {
      setIsActionLoading(true);
      const workerId = localStorage.getItem("workerId") || "1";

      const response = await fetch(
        `/api/worker/bookings/${selectedBooking.id}/estimate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...priceEstimate,
            workerId: parseInt(workerId),
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
          estimatedCost: priceEstimate.totalCost,
          duration: priceEstimate.estimatedDuration,
          status: "Price Pending",
        },
      ]);

      setIsPriceModalOpen(false);
      setSelectedBooking(null);
      alert("Price estimate submitted. Waiting for customer approval.");
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

  // Start work on price approved booking
  // In your WorkerTasks component, update the handleStartWork function:

  // Start work on price approved booking
  const handleStartWork = async (bookingId: number) => {
    try {
      setIsActionLoading(true);

      // Get worker ID from localStorage
      const workerId = localStorage.getItem("workerId") || "1";

      console.log(
        `Starting work on booking ${bookingId} for worker ${workerId}`
      );

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
        console.error("API Error:", data);
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
        // Remove from price approved
        setPriceApprovedBookings((prev) =>
          prev.filter((b) => b.id !== bookingId)
        );
        // Add to in progress
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
      alert(
        error instanceof Error
          ? error.message
          : "Failed to start work. Please check the console for details."
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // Mark booking as completed
  // In your WorkerTasks component, update the handleCompleteWork function:

// Mark booking as completed
  const handleCompleteWork = async (bookingId: number) => {
    if (!confirm("Are you sure you want to mark this booking as completed?")) {
      return;
    }

    try {
      setIsActionLoading(true);
      
      // Get worker ID from localStorage
      const workerId = localStorage.getItem("workerId") || "1";
      
      console.log(`📝 Attempting to complete booking ${bookingId} for worker ${workerId}`);
      
      const response = await fetch(`/api/worker/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "Completed",
          workerId: parseInt(workerId)
        }),
      });

      const data = await response.json();
      
      console.log("API Response:", data);
      
      if (!response.ok) {
        console.error("❌ API Error Response:", data);
        throw new Error(data.error || `Failed to mark as completed: ${response.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to mark as completed");
      }

      // Find the booking in inProgressBookings
      const booking = inProgressBookings.find(b => b.id === bookingId);
      if (booking) {
        // Remove from in progress
        setInProgressBookings(prev => prev.filter(b => b.id !== bookingId));
        // Add to completed
        setCompletedBookings(prev => [{ 
          ...booking, 
          status: "Completed" 
        }, ...prev]); // Add to beginning of array
        
        // Send WhatsApp notification
        sendWhatsAppCompletionNotification(booking);
        
        alert("✅ Booking marked as completed successfully!");
        
        // Refresh data after successful completion
        setTimeout(() => fetchWorkerBookings(), 1000);
      } else {
        // Also check priceApprovedBookings in case booking wasn't in inProgress
        const approvedBooking = priceApprovedBookings.find(b => b.id === bookingId);
        if (approvedBooking) {
          setPriceApprovedBookings(prev => prev.filter(b => b.id !== bookingId));
          setCompletedBookings(prev => [{ ...approvedBooking, status: "Completed" }, ...prev]);
          sendWhatsAppCompletionNotification(approvedBooking);
          alert("✅ Booking marked as completed successfully!");
          setTimeout(() => fetchWorkerBookings(), 1000);
        }
      }
      
    } catch (error) {
      console.error("❌ Error completing work:", error);
      alert(error instanceof Error ? error.message : "Failed to mark as completed. Please check the console for details.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Also update the sendWhatsAppCompletionNotification function:
  const sendWhatsAppCompletionNotification = (booking: PendingBooking) => {
    try {
      if (!booking.customer.phone) {
        console.warn("⚠️ Customer phone number not available for WhatsApp notification");
        return;
      }

      const phoneNumber = booking.customer.phone.replace(/\D/g, "");
      
      // Format the date nicely
      const completionDate = new Date().toLocaleDateString('en-MY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const message = `Hello ${booking.customer.name}! 🚗

  🎉 Your vehicle service is now COMPLETED!

  📋 Service Details:
  • Vehicle: ${booking.vehicle.model} (${booking.vehicle.registrationNumber})
  • Total Cost: RM ${booking.estimatedCost?.toFixed(2) || "0.00"}
  • Completed On: ${completionDate}

  ✅ Your vehicle is ready for collection!
  📍 Location: Cheng Service Workshop
  ⏰ Operating Hours: 9:00 AM - 6:00 PM (Mon-Sat)

  Please bring your service invoice when collecting your vehicle.

  Thank you for choosing Cheng Service! We appreciate your business. 😊

  Best regards,
  Cheng Service Team`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/6${phoneNumber}?text=${encodedMessage}`;
      
      console.log("📱 Opening WhatsApp notification:", whatsappUrl);
      window.open(whatsappUrl, "_blank");
      
    } catch (error) {
      console.error("❌ Error sending WhatsApp notification:", error);
      // Don't alert the user about WhatsApp failure, just log it
    }
  };

  // Revise price for rejected bookings
  const handleRevisePrice = (booking: PendingBooking) => {
    setSelectedBooking(booking);
    setPriceEstimate({
      laborCost: booking.estimatedCost ? booking.estimatedCost * 0.7 : 0,
      partsCost: booking.estimatedCost ? booking.estimatedCost * 0.3 : 0,
      totalCost: booking.estimatedCost || 0,
      estimatedDuration: booking.duration || 1,
      spareParts: [],
      repairNotes: booking.reportedIssue || "",
    });
    setIsPriceModalOpen(true);
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

      // Remove from assigned bookings
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

  // Calculate total cost automatically
  useEffect(() => {
    const total = priceEstimate.laborCost + priceEstimate.partsCost;
    setPriceEstimate((prev) => ({ ...prev, totalCost: total }));
  }, [priceEstimate.laborCost, priceEstimate.partsCost]);

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
          Awaiting Approval ({pricePendingBookings.length})
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
          In Progress ({inProgressBookings.length})
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
                        setPriceEstimate({
                          laborCost: 0,
                          partsCost: 0,
                          totalCost: 0,
                          estimatedDuration: booking.duration || 1,
                          spareParts: [],
                          repairNotes: booking.reportedIssue || "",
                        });
                        setIsPriceModalOpen(true);
                      }}
                      disabled={isActionLoading}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white px-4 py-2 rounded-xl font-medium"
                    >
                      Set Price
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

      {/* Price Pending Tab */}
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
                        <span className="text-yellow-400 font-bold text-lg">
                          RM {booking.estimatedCost?.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-blue-300 font-medium mb-2">
                        ⏳ Waiting for customer to approve the price
                      </p>
                      <p className="text-gray-300 text-sm">
                        Customer will be notified via WhatsApp/Email
                      </p>
                    </div>

                    <button
                      onClick={() => handleRevisePrice(booking)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium"
                    >
                      Revise Price Estimate
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
                        <span className="text-green-400 font-bold text-xl">
                          RM {booking.estimatedCost?.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-green-300 font-medium mb-2">
                        ✅ Customer has approved the price
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
                          RM {booking.estimatedCost?.toFixed(2)}
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
                        Revise Price
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
                          RM {booking.estimatedCost?.toFixed(2)}
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
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsDetailsModalOpen(true);
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium"
                      >
                        Update Notes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Completed Tab */}
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
                        <span className="text-purple-400 font-bold text-xl">
                          RM {booking.estimatedCost?.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <p className="text-green-300 font-medium">
                      ✅ Service completed successfully
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Price Estimate Modal */}
      {isPriceModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {selectedBooking.estimatedCost
                    ? "Revise Price Estimate"
                    : "Set Price Estimate"}
                </h3>
                <button
                  onClick={() => setIsPriceModalOpen(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  &times;
                </button>
              </div>

              {/* Booking Info */}
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
                      Labor Cost (RM)
                    </label>
                    <input
                      type="number"
                      value={priceEstimate.laborCost}
                      onChange={(e) =>
                        setPriceEstimate((prev) => ({
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
                      Parts Cost (RM)
                    </label>
                    <input
                      type="number"
                      value={priceEstimate.partsCost}
                      onChange={(e) =>
                        setPriceEstimate((prev) => ({
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
                    Total Cost (RM)
                  </label>
                  <input
                    type="number"
                    value={priceEstimate.totalCost}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white font-bold text-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Estimated Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={priceEstimate.estimatedDuration}
                    onChange={(e) =>
                      setPriceEstimate((prev) => ({
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
                    value={priceEstimate.repairNotes}
                    onChange={(e) =>
                      setPriceEstimate((prev) => ({
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
                    onClick={() => setIsPriceModalOpen(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPriceEstimate}
                    disabled={isActionLoading || priceEstimate.totalCost <= 0}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                  >
                    {isActionLoading
                      ? "Submitting..."
                      : "Submit Price Estimate"}
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
