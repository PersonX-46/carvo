"use client";
import { useState, useEffect } from "react";

interface PriceApprovalBooking {
  id: number;
  vehicleId: number;
  bookingDate: string;
  status: string;
  reportedIssue: string | null;
  estimatedCost: number | null;
  estimatedMinCost: number | null;
  estimatedMaxCost: number | null;
  duration: number | null;
  priceApproved: boolean | null;
  priceRejected: boolean | null;
  rejectionReason: string | null;
  vehicle: {
    model: string;
    registrationNumber: string;
    year: number | null;
  };
  service?: {
    serviceStatus: string;
    repairNotes: string | null;
    worker?: {
      name: string;
      specialization: string | null;
      phone?: string | null;
    };
  };
}

interface PriceApprovalProps {
  customerId: number;
}

const PriceApproval: React.FC<PriceApprovalProps> = ({ customerId }) => {
  const [bookings, setBookings] = useState<PriceApprovalBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<PriceApprovalBooking | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  useEffect(() => {
    fetchPriceApprovalBookings();
  }, [customerId]);

  const fetchPriceApprovalBookings = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Fetch bookings that need price approval
      const response = await fetch(`/api/customer/bookings?needsApproval=true`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch price approval bookings");
      }
      
      const data = await response.json();
      setBookings(data.bookings || []);
      
    } catch (error) {
      console.error("Error fetching price approval bookings:", error);
      setError("Failed to load price approval requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePrice = async (bookingId: number) => {
    if (!confirm("Are you sure you want to approve this price estimate? Once approved, the technician can start work on your vehicle.")) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/customer/bookings/${bookingId}/price-approval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approved: true,
          reason: null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve price");
      }

      // Update local state
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      setSelectedBooking(null);
      
      alert("✅ Price approved successfully! The technician will now start work on your vehicle.");
      
    } catch (error) {
      console.error("Error approving price:", error);
      alert(error instanceof Error ? error.message : "Failed to approve price");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectPrice = async (bookingId: number, reason: string) => {
    if (!reason.trim()) {
      alert("Please provide a reason for rejecting the price");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/customer/bookings/${bookingId}/price-approval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approved: false,
          reason: reason.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reject price");
      }

      // Update local state
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      setSelectedBooking(null);
      setIsRejectModalOpen(false);
      setRejectionReason("");
      
      alert("❌ Price rejected. The technician will contact you with a revised estimate.");
      
    } catch (error) {
      console.error("Error rejecting price:", error);
      alert(error instanceof Error ? error.message : "Failed to reject price");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-MY", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPriceDisplay = (booking: PriceApprovalBooking) => {
    if (booking.estimatedMinCost && booking.estimatedMaxCost) {
      return `RM ${booking.estimatedMinCost.toFixed(2)} - RM ${booking.estimatedMaxCost.toFixed(2)}`;
    } else if (booking.estimatedCost) {
      return `RM ${booking.estimatedCost.toFixed(2)}`;
    }
    return "Price not set";
  };

  const needsPriceApproval = (booking: PriceApprovalBooking): boolean => {
    return (
      booking.status === "Confirmed" &&
      (booking.estimatedCost !== null || booking.estimatedMinCost !== null) &&
      booking.priceApproved === false &&
      booking.priceRejected === false
    );
  };

  // Filter only bookings that actually need approval
  const bookingsNeedingApproval = bookings.filter(needsPriceApproval);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <p className="text-gray-400 mt-4">Loading price approvals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-400 font-medium">Error loading price approvals</p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={fetchPriceApprovalBookings}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (bookingsNeedingApproval.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
        <div className="text-gray-400 text-6xl mb-4">✅</div>
        <h3 className="text-white font-semibold text-lg mb-2">No Price Approvals Needed</h3>
        <p className="text-gray-400">All price estimates have been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center">
          <span className="text-purple-400 text-2xl mr-3">⚠️</span>
          <div>
            <h4 className="text-white font-semibold">Action Required</h4>
            <p className="text-gray-300 text-sm">
              You have {bookingsNeedingApproval.length} price estimate{bookingsNeedingApproval.length !== 1 ? "s" : ""} to review before work can begin on your vehicle{bookingsNeedingApproval.length !== 1 ? "s" : ""}.
            </p>
          </div>
        </div>
      </div>

      {bookingsNeedingApproval.map((booking) => (
        <div key={booking.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 hover:border-purple-500/50 transition-all">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-xl mb-1">{booking.vehicle.model}</h3>
                  <p className="text-gray-400 text-sm">
                    {booking.vehicle.registrationNumber} • {booking.vehicle.year}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-purple-400 font-bold text-2xl mb-1">
                    {formatPriceDisplay(booking)}
                  </div>
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full animate-pulse">
                    ⏳ Awaiting Your Approval
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Scheduled Service</p>
                  <p className="text-white font-medium">{formatDate(booking.bookingDate)}</p>
                  <p className="text-gray-400 text-sm">Duration: {booking.duration || 1} hours</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Assigned Technician</p>
                  <p className="text-white font-medium">
                    {booking.service?.worker?.name || "Not assigned yet"}
                  </p>
                  {booking.service?.worker?.specialization && (
                    <p className="text-gray-400 text-sm">{booking.service.worker.specialization}</p>
                  )}
                </div>
              </div>

              {booking.reportedIssue && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">Reported Issue</p>
                  <p className="text-white bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                    {booking.reportedIssue}
                  </p>
                </div>
              )}

              {booking.service?.repairNotes && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">Technician's Assessment</p>
                  <p className="text-white bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                    {booking.service.repairNotes}
                  </p>
                </div>
              )}

              {/* Price Breakdown */}
              {booking.estimatedMinCost && booking.estimatedMaxCost && (
                <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20 mb-4">
                  <h4 className="text-amber-400 font-semibold mb-2">Price Breakdown</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Minimum Estimate</p>
                      <p className="text-white font-bold">RM {booking.estimatedMinCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Maximum Estimate</p>
                      <p className="text-white font-bold">RM {booking.estimatedMaxCost.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-amber-500/20">
                    <p className="text-gray-400 text-sm">Average Expected Cost</p>
                    <p className="text-amber-400 font-bold text-xl">
                      RM {((booking.estimatedMinCost! + booking.estimatedMaxCost!) / 2).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex lg:flex-col gap-3 min-w-[200px]">
              <button
                onClick={() => handleApprovePrice(booking.id)}
                disabled={isSubmitting}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-4 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
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
                onClick={() => {
                  setSelectedBooking(booking);
                  setIsRejectModalOpen(true);
                }}
                disabled={isSubmitting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-4 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
              >
                <>
                  <span className="mr-2">❌</span>
                  Reject Price
                </>
              </button>
              {booking.service?.worker?.phone && (
                <a
                  href={`https://wa.me/${booking.service.worker.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold transition-all text-center"
                >
                  <>
                    <span className="mr-2">💬</span>
                    Contact Technician
                  </>
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Rejection Modal */}
      {isRejectModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-red-500/30 max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Reject Price Estimate</h3>
              
              <div className="mb-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-white font-medium">{selectedBooking.vehicle.model}</p>
                <p className="text-gray-400 text-sm">{selectedBooking.vehicle.registrationNumber}</p>
                <p className="text-amber-400 font-bold text-lg mt-2">
                  {formatPriceDisplay(selectedBooking)}
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
                  placeholder="Please explain why you're rejecting this price estimate (e.g., too expensive, need cheaper parts, want additional quotes...)"
                  required
                />
                <p className="text-gray-400 text-xs mt-2">
                  Your feedback will help the technician provide a better estimate.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setRejectionReason("");
                    setSelectedBooking(null);
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all border border-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectPrice(selectedBooking.id, rejectionReason)}
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
    </div>
  );
};

export default PriceApproval;