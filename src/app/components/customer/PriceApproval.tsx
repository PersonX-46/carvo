// components/PriceApproval.tsx
"use client";
import { useState, useEffect } from "react";

interface PriceApprovalBooking {
  id: number;
  estimatedCost: number | null;
  status: string;
  bookingDate: string;
  vehicle: {
    model: string;
    registrationNumber: string;
    year: number | null;
  };
  service?: {
    repairNotes: string | null;
    spareParts: string | null;
    serviceStatus: string;
    worker?: {
      name: string;
      rating: number | null;
      totalServices: number;
    };
  };
  priceApproved?: boolean | null;
  priceRejected?: boolean | null;
  rejectionReason?: string | null;
}

interface PriceApprovalProps {
  customerId: number;
}

const PriceApproval: React.FC<PriceApprovalProps> = ({ customerId }) => {
  const [pendingApprovals, setPendingApprovals] = useState<PriceApprovalBooking[]>([]);
  const [approvedBookings, setApprovedBookings] = useState<PriceApprovalBooking[]>([]);
  const [rejectedBookings, setRejectedBookings] = useState<PriceApprovalBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<PriceApprovalBooking | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPriceApprovals();
  }, [customerId]);

  const fetchPriceApprovals = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await fetch(`/api/customer/${customerId}/price-approvals`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch price approvals");
      }
      
      const data = await response.json();
      setPendingApprovals(data.pendingApprovals || []);
      setApprovedBookings(data.approvedBookings || []);
      setRejectedBookings(data.rejectedBookings || []);
      
    } catch (error) {
      console.error("Error fetching price approvals:", error);
      setError("Failed to load price approvals");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceApproval = async (bookingId: number, approved: boolean, reason?: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/customer/bookings/${bookingId}/price-approval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approved,
          reason: reason || null
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update price approval");
      }

      // Update local state
      const bookingToUpdate = pendingApprovals.find(b => b.id === bookingId);
      if (bookingToUpdate) {
        if (approved) {
          setPendingApprovals(prev => prev.filter(b => b.id !== bookingId));
          setApprovedBookings(prev => [...prev, { ...bookingToUpdate, priceApproved: true }]);
        } else {
          setPendingApprovals(prev => prev.filter(b => b.id !== bookingId));
          setRejectedBookings(prev => [...prev, { 
            ...bookingToUpdate, 
            priceRejected: true,
            rejectionReason: reason 
          }]);
        }
      }

      setIsRejectModalOpen(false);
      setSelectedBooking(null);
      setRejectionReason("");
      
      alert(approved ? "Price approved successfully!" : "Price rejected. The technician will contact you with a revised estimate.");
      
    } catch (error) {
      console.error("Error updating price approval:", error);
      alert(error instanceof Error ? error.message : "Failed to update price approval");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRejectModal = (booking: PriceApprovalBooking) => {
    setSelectedBooking(booking);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const PriceApprovalBadge = ({ booking }: { booking: PriceApprovalBooking }) => {
    if (booking.priceApproved) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          ✅ Approved
        </span>
      );
    }
    if (booking.priceRejected) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
          ❌ Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
        ⏳ Awaiting Approval
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading price approvals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
        <div className="text-center py-4">
          <div className="text-red-400 text-lg mb-4">⚠️ {error}</div>
          <button
            onClick={fetchPriceApprovals}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>💰</span>
              Price Approvals
            </h3>
            <p className="text-gray-400 text-sm">
              Review and approve price estimates for your services
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "pending"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-400 hover:text-white"
              }`}
            >
              Pending ({pendingApprovals.length})
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "approved"
                  ? "bg-green-500 text-white"
                  : "bg-gray-700 text-gray-400 hover:text-white"
              }`}
            >
              Approved ({approvedBookings.length})
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "rejected"
                  ? "bg-red-500 text-white"
                  : "bg-gray-700 text-gray-400 hover:text-white"
              }`}
            >
              Rejected ({rejectedBookings.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-6xl mb-4">✅</div>
                <h4 className="text-white font-semibold text-lg mb-2">
                  No Pending Price Approvals
                </h4>
                <p className="text-gray-400">
                  All price estimates have been processed.
                </p>
              </div>
            ) : (
              pendingApprovals.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-white font-semibold text-lg mb-1">
                            {booking.vehicle.model}
                          </h4>
                          <p className="text-gray-300 text-sm">
                            {booking.vehicle.registrationNumber}
                          </p>
                        </div>
                        <PriceApprovalBadge booking={booking} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">Scheduled Date</p>
                          <p className="text-white font-medium">
                            {formatDate(booking.bookingDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Estimated Cost</p>
                          <p className="text-amber-400 text-2xl font-bold">
                            RM {booking.estimatedCost?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      </div>

                      {booking.service?.repairNotes && (
                        <div className="mb-4">
                          <p className="text-gray-400 text-sm mb-2">Technician Notes</p>
                          <p className="text-white bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                            {booking.service.repairNotes}
                          </p>
                        </div>
                      )}

                      {booking.service?.worker && (
                        <div className="mb-4 p-3 bg-gray-700/30 rounded-lg">
                          <p className="text-gray-400 text-sm mb-1">Assigned Technician</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">
                                {booking.service.worker.name}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {booking.service.worker.totalServices} services completed
                                {booking.service.worker.rating && (
                                  <span className="ml-2">
                                    ⭐ {booking.service.worker.rating.toFixed(1)}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => handlePriceApproval(booking.id, true)}
                          disabled={isSubmitting}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Processing...
                            </div>
                          ) : (
                            "✅ Approve Price"
                          )}
                        </button>
                        <button
                          onClick={() => openRejectModal(booking)}
                          disabled={isSubmitting}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                        >
                          ❌ Reject Price
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "approved" && (
          <div className="space-y-4">
            {approvedBookings.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h4 className="text-white font-semibold text-lg mb-2">
                  No Approved Prices
                </h4>
                <p className="text-gray-400">
                  You haven't approved any price estimates yet.
                </p>
              </div>
            ) : (
              approvedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-green-500/10 border border-green-500/30 rounded-xl p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-white font-semibold text-lg mb-1">
                            {booking.vehicle.model}
                          </h4>
                          <p className="text-gray-300 text-sm">
                            {booking.vehicle.registrationNumber}
                          </p>
                        </div>
                        <PriceApprovalBadge booking={booking} />
                      </div>
                      <div className="text-green-400 mb-4">
                        ✅ You approved this price on {formatDate(booking.bookingDate)}
                      </div>
                      <p className="text-amber-400 text-2xl font-bold">
                        RM {booking.estimatedCost?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "rejected" && (
          <div className="space-y-4">
            {rejectedBookings.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h4 className="text-white font-semibold text-lg mb-2">
                  No Rejected Prices
                </h4>
                <p className="text-gray-400">
                  You haven't rejected any price estimates.
                </p>
              </div>
            ) : (
              rejectedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-white font-semibold text-lg mb-1">
                            {booking.vehicle.model}
                          </h4>
                          <p className="text-gray-300 text-sm">
                            {booking.vehicle.registrationNumber}
                          </p>
                        </div>
                        <PriceApprovalBadge booking={booking} />
                      </div>
                      <div className="text-red-400 mb-4">
                        ❌ You rejected this price on {formatDate(booking.bookingDate)}
                      </div>
                      {booking.rejectionReason && (
                        <div className="mb-4">
                          <p className="text-gray-400 text-sm mb-2">Your Feedback:</p>
                          <p className="text-white bg-red-500/20 rounded-lg p-3 border border-red-500/30">
                            {booking.rejectionReason}
                          </p>
                        </div>
                      )}
                      <p className="text-amber-400 text-2xl font-bold">
                        RM {booking.estimatedCost?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {isRejectModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-red-500/30 max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Reject Price Estimate</h3>
              <p className="text-gray-300 mb-6">
                Please provide a reason for rejecting this price estimate. The technician will review your feedback and provide a revised estimate.
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
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setSelectedBooking(null);
                    setRejectionReason("");
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all border border-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePriceApproval(selectedBooking.id, false, rejectionReason)}
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

export default PriceApproval;