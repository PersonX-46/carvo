"use client";
import { useState, useEffect } from "react";
import ReceiptGenerator from "./ReceiptGenerator";

interface PaymentRecord {
  id: number;
  bookingId: number;
  customerId: number;
  customerName: string;
  vehicleModel: string;
  registrationNumber: string;
  amount: number;
  paymentMethod: string;
  status: string; // pending, processing, completed, failed, refunded
  transactionId: string | null;
  paymentDate: string;
  completedDate: string | null;
  paymentDetails: string | null;
}

interface PaymentStats {
  totalRevenue: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  monthlyRevenue: number;
  averagePayment: number;
}

type PaymentFilter =
  | "all"
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "today";

type TimeFilter = "today" | "week" | "month" | "year" | "all";

const PaymentTracking: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0,
    monthlyRevenue: 0,
    averagePayment: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] =
    useState<PaymentRecord | null>(null);

  // Fetch payment data
  const fetchPaymentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [paymentsResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/payments?timeRange=${timeFilter}`),
        fetch("/api/admin/payments/stats"),
      ]);

      if (!paymentsResponse.ok || !statsResponse.ok) {
        throw new Error("Failed to fetch payment data");
      }

      const [paymentsData, statsData] = await Promise.all([
        paymentsResponse.json(),
        statsResponse.json(),
      ]);

      setPayments(paymentsData.payments || []);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching payment data:", err);
      setError("Failed to load payment data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, [timeFilter]);

  // Apply filters
  useEffect(() => {
    let result = payments;

    // Apply status filter
    if (filter !== "all") {
      result = result.filter((payment) => payment.status === filter);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (payment) =>
          payment.customerName.toLowerCase().includes(query) ||
          payment.vehicleModel.toLowerCase().includes(query) ||
          payment.registrationNumber.toLowerCase().includes(query) ||
          payment.transactionId?.toLowerCase().includes(query) ||
          payment.paymentMethod.toLowerCase().includes(query)
      );
    }

    setFilteredPayments(result);
  }, [payments, filter, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-MY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "processing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "refunded":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "✅";
      case "pending":
        return "⏳";
      case "processing":
        return "🔄";
      case "failed":
        return "❌";
      case "refunded":
        return "💸";
      default:
        return "💰";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "credit_card":
        return "💳";
      case "debit_card":
        return "💳";
      case "online_banking":
        return "🏦";
      case "cash":
        return "💵";
      case "ewallet":
        return "📱";
      default:
        return "💰";
    }
  };

  const handleRefresh = () => {
    fetchPaymentData();
  };

  const handleExportCSV = () => {
    // Simple CSV export
    const headers = [
      "Transaction ID",
      "Customer",
      "Vehicle",
      "Amount",
      "Payment Method",
      "Status",
      "Payment Date",
      "Completed Date",
    ];

    const csvData = filteredPayments.map((payment) => [
      payment.transactionId || "N/A",
      payment.customerName,
      `${payment.vehicleModel} (${payment.registrationNumber})`,
      payment.amount.toFixed(2),
      payment.paymentMethod,
      payment.status,
      payment.paymentDate,
      payment.completedDate || "N/A",
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    alert("CSV exported successfully!");
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">
            {isLoading ? (
              <div className="h-8 w-20 bg-gray-700 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className="text-amber-400 text-xs font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`text-3xl p-3 rounded-xl bg-gray-700/50 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const FilterBadge = ({ filterType, label, count }: any) => (
    <button
      onClick={() => setFilter(filterType)}
      className={`px-4 py-2 rounded-xl font-medium transition-all ${
        filter === filterType
          ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
          : "bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-white"
      }`}
    >
      {label} {count > 0 && `(${count})`}
    </button>
  );

  const TimeFilterButton = ({ value, label }: any) => (
    <button
      onClick={() => setTimeFilter(value)}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        timeFilter === value
          ? "bg-blue-500 text-white"
          : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  const PaymentDetailsModal = () => {
    if (!selectedPayment) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white">Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400">
                    Payment Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Transaction ID</p>
                      <p className="text-white font-mono font-medium">
                        {selectedPayment.transactionId || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Amount</p>
                      <p className="text-amber-400 text-2xl font-bold">
                        {formatCurrency(selectedPayment.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Payment Method</p>
                      <p className="text-white font-medium flex items-center gap-2">
                        <span>
                          {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                        </span>
                        {selectedPayment.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedPayment.status
                        )}`}
                      >
                        <span className="mr-1">
                          {getStatusIcon(selectedPayment.status)}
                        </span>
                        {selectedPayment.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400">
                    Customer & Vehicle
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Customer</p>
                      <p className="text-white font-medium">
                        {selectedPayment.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Vehicle</p>
                      <p className="text-white font-medium">
                        {selectedPayment.vehicleModel}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Registration</p>
                      <p className="text-white font-medium">
                        {selectedPayment.registrationNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Booking ID</p>
                      <p className="text-white font-medium">
                        #{selectedPayment.bookingId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-amber-400">
                  Payment Timeline
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-400">💰</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        Payment Initiated
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formatDate(selectedPayment.paymentDate)} at{" "}
                        {formatTime(selectedPayment.paymentDate)}
                      </p>
                    </div>
                  </div>

                  {selectedPayment.completedDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-green-400">✅</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          Payment Completed
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatDate(selectedPayment.completedDate)} at{" "}
                          {formatTime(selectedPayment.completedDate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              {selectedPayment.paymentDetails && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400">
                    Payment Details
                  </h4>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                      {JSON.stringify(
                        JSON.parse(selectedPayment.paymentDetails),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-800">
                <button
                  onClick={() => {
                    // Mark as completed
                    // Implement your API call here
                    alert(`Marking payment ${selectedPayment.id} as completed`);
                    setSelectedPayment(null);
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  ✅ Mark as Completed
                </button>
                <button
                  onClick={() => {
                    // Refund payment
                    // Implement your API call here
                    alert(`Refunding payment ${selectedPayment.id}`);
                    setSelectedPayment(null);
                  }}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  💸 Process Refund
                </button>
                <button
                  onClick={() => {
                    setSelectedPaymentForReceipt(selectedPayment);
                    setShowReceipt(true);
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all border border-gray-700 flex items-center justify-center gap-2"
                >
                  <span>🧾</span>
                  Generate Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">⚠️ {error}</div>
          <button
            onClick={handleRefresh}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Payment Tracking</h2>
          <p className="text-gray-400">
            Monitor and manage all customer payments
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-colors border border-gray-700 flex items-center space-x-2"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105 disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Time Filter */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-white">Time Period</h3>
          <div className="flex flex-wrap gap-2">
            <TimeFilterButton value="today" label="Today" />
            <TimeFilterButton value="week" label="This Week" />
            <TimeFilterButton value="month" label="This Month" />
            <TimeFilterButton value="year" label="This Year" />
            <TimeFilterButton value="all" label="All Time" />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon="💰"
          color="text-green-400"
          subtitle={`${filteredPayments.length} payments`}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon="📅"
          color="text-blue-400"
          subtitle="Current month"
        />
        <StatCard
          title="Average Payment"
          value={formatCurrency(stats.averagePayment)}
          icon="📊"
          color="text-purple-400"
          subtitle="Per transaction"
        />
        <StatCard
          title="Completed"
          value={stats.completedPayments}
          icon="✅"
          color="text-green-400"
          subtitle="Successful payments"
        />
        <StatCard
          title="Pending"
          value={stats.pendingPayments}
          icon="⏳"
          color="text-yellow-400"
          subtitle="Awaiting processing"
        />
        <StatCard
          title="Failed"
          value={stats.failedPayments}
          icon="❌"
          color="text-red-400"
          subtitle="Requires attention"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by customer, vehicle, or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
              <div className="absolute left-4 top-3.5 text-gray-400">🔍</div>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <FilterBadge
              filterType="all"
              label="All Payments"
              count={payments.length}
            />
            <FilterBadge
              filterType="completed"
              label="Completed"
              count={payments.filter((p) => p.status === "completed").length}
            />
            <FilterBadge
              filterType="pending"
              label="Pending"
              count={payments.filter((p) => p.status === "pending").length}
            />
            <FilterBadge
              filterType="processing"
              label="Processing"
              count={payments.filter((p) => p.status === "processing").length}
            />
            <FilterBadge
              filterType="failed"
              label="Failed"
              count={payments.filter((p) => p.status === "failed").length}
            />
            <FilterBadge
              filterType="refunded"
              label="Refunded"
              count={payments.filter((p) => p.status === "refunded").length}
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900/80 border-b border-gray-700/50">
                <th className="py-4 px-6 text-left text-gray-400 font-medium">
                  Transaction
                </th>
                <th className="py-4 px-6 text-left text-gray-400 font-medium">
                  Customer & Vehicle
                </th>
                <th className="py-4 px-6 text-left text-gray-400 font-medium">
                  Amount
                </th>
                <th className="py-4 px-6 text-left text-gray-400 font-medium">
                  Method
                </th>
                <th className="py-4 px-6 text-left text-gray-400 font-medium">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-gray-400 font-medium">
                  Date
                </th>
                <th className="py-4 px-6 text-left text-gray-400 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-gray-700/30">
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                        <div className="h-3 bg-gray-700 rounded w-20 animate-pulse"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-6 bg-gray-700 rounded w-20 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white font-medium">
                          {payment.transactionId || "N/A"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Booking #{payment.bookingId}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white font-medium">
                          {payment.customerName}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {payment.vehicleModel} ({payment.registrationNumber})
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-amber-400 font-bold text-lg">
                        {formatCurrency(payment.amount)}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span>
                          {getPaymentMethodIcon(payment.paymentMethod)}
                        </span>
                        <span className="text-white">
                          {payment.paymentMethod.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        <span className="mr-1">
                          {getStatusIcon(payment.status)}
                        </span>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white text-sm">
                          {formatDate(payment.paymentDate)}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {formatTime(payment.paymentDate)}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="text-gray-400 text-xl mb-2">📭</div>
                    <p className="text-gray-400">
                      No payments found{searchQuery && ` for "${searchQuery}"`}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-2 text-amber-400 hover:text-amber-300 text-sm"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination/Info */}
        <div className="p-4 border-t border-gray-700/50 flex justify-between items-center">
          <p className="text-gray-400 text-sm">
            Showing{" "}
            <span className="text-white font-medium">
              {filteredPayments.length}
            </span>{" "}
            of <span className="text-white font-medium">{payments.length}</span>{" "}
            payments
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-gray-800/50 text-gray-400 rounded-lg text-sm hover:bg-gray-700/50 hover:text-white transition-colors disabled:opacity-50">
              ← Previous
            </button>
            <button className="px-3 py-1.5 bg-gray-800/50 text-gray-400 rounded-lg text-sm hover:bg-gray-700/50 hover:text-white transition-colors disabled:opacity-50">
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      <PaymentDetailsModal />
      {/* Receipt Generator Modal */}
      {showReceipt && selectedPaymentForReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Generate Receipt
                </h3>
                <button
                  onClick={() => {
                    setShowReceipt(false);
                    setSelectedPaymentForReceipt(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>
              <ReceiptGenerator
                payment={selectedPaymentForReceipt}
                onClose={() => {
                  setShowReceipt(false);
                  setSelectedPaymentForReceipt(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTracking;
