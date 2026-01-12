"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Mail,
} from "lucide-react";

interface PaymentRecord {
  id: number;
  bookingId: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  vehicleModel: string;
  registrationNumber: string;
  amount: number;
  paymentMethod: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  transactionId: string | null;
  paymentDate: string;
  completedDate: string | null;
  paymentDetails: string | null;
  receiptUrl?: string;
  uploadedReceipt?: {
    url: string;
    fileName: string;
    fileType: string;
    uploadedAt: string;
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    rejectionReason?: string;
  };
}

interface PaymentStats {
  totalRevenue: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  monthlyRevenue: number;
  averagePayment: number;
  receiptsUploaded: number;
  receiptsVerified: number;
  receiptsPending: number;
}

type PaymentFilter =
  | "all"
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "has_receipt"
  | "no_receipt";
type TimeFilter = "today" | "week" | "month" | "year" | "all";

const PaymentTracking: React.FC = () => {
  // State
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0,
    monthlyRevenue: 0,
    averagePayment: 0,
    receiptsUploaded: 0,
    receiptsVerified: 0,
    receiptsPending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(
    null
  );

  // Receipt viewer state
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(
    null
  );
  const [receiptZoom, setReceiptZoom] = useState(1);
  const [receiptRotation, setReceiptRotation] = useState(0);
  const [isVerifyingReceipt, setIsVerifyingReceipt] = useState(false);

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

  // Load initial data
  useEffect(() => {
    fetchPaymentData();
  }, [timeFilter]);

  // Apply filters and search
  useEffect(() => {
    let result = payments;

    // Apply status filter
    if (filter !== "all") {
      switch (filter) {
        case "has_receipt":
          result = result.filter((payment) => payment.uploadedReceipt);
          break;
        case "no_receipt":
          result = result.filter((payment) => !payment.uploadedReceipt);
          break;
        default:
          result = result.filter((payment) => payment.status === filter);
      }
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
          payment.paymentMethod.toLowerCase().includes(query) ||
          payment.customerEmail.toLowerCase().includes(query)
      );
    }

    setFilteredPayments(result);
  }, [payments, filter, searchQuery]);

  // Format helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-MY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-MY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status helpers
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
      refunded: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      completed: "✅",
      pending: "⏳",
      processing: "🔄",
      failed: "❌",
      refunded: "💸",
    };
    return icons[status] || "💰";
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      credit_card: "💳",
      debit_card: "💳",
      online_banking: "🏦",
      cash: "💵",
      duitnow: "📱",
      fpx: "🏦",
      touchngo: "📲",
      grabpay: "🚗",
    };
    return icons[method] || "💰";
  };

  const getPaymentMethodName = (method: string) => {
    const names: Record<string, string> = {
      credit_card: "Credit Card",
      debit_card: "Debit Card",
      online_banking: "Online Banking",
      cash: "Cash",
      duitnow: "DuitNow",
      fpx: "FPX",
      touchngo: "Touch 'n Go",
      grabpay: "GrabPay",
    };
    return names[method] || method.replace("_", " ").toUpperCase();
  };

  // Actions
  const handleRefresh = () => {
    fetchPaymentData();
  };

  const handleExportCSV = () => {
    const headers = [
      "Transaction ID",
      "Customer",
      "Email",
      "Vehicle",
      "Amount",
      "Payment Method",
      "Status",
      "Payment Date",
      "Receipt Status",
      "Receipt Verified",
    ];

    const csvData = filteredPayments.map((payment) => [
      payment.transactionId || "N/A",
      payment.customerName,
      payment.customerEmail,
      `${payment.vehicleModel} (${payment.registrationNumber})`,
      payment.amount.toFixed(2),
      getPaymentMethodName(payment.paymentMethod),
      payment.status,
      formatDateTime(payment.paymentDate),
      payment.uploadedReceipt ? "Uploaded" : "No Receipt",
      payment.uploadedReceipt?.verified ? "Yes" : "No",
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Send email notification
  const sendEmailNotification = (payment: PaymentRecord, isVerified: boolean, rejectionReason?: string) => {
    const customerEmail = payment.customerEmail || "";
    const formattedAmount = formatCurrency(payment.amount);
    const verificationDate = new Date().toLocaleDateString('en-MY');
    
    const subject = isVerified 
      ? `Payment Receipt Verified - CarWorks Service`
      : `Action Required: Receipt Rejected - CarWorks Service`;
    
    let body = `Dear ${payment.customerName},\n\n`;
    
    if (isVerified) {
      body += `Your payment receipt has been verified successfully.\n\n`;
    } else {
      body += `Your payment receipt has been rejected.\n\n`;
    }
    
    body += `Payment Details:\n`;
    body += `----------------\n`;
    body += `Transaction ID: ${payment.transactionId || 'N/A'}\n`;
    body += `Amount: ${formattedAmount}\n`;
    body += `Vehicle: ${payment.vehicleModel}\n`;
    body += `Registration: ${payment.registrationNumber}\n`;
    body += `Booking ID: ${payment.bookingId}\n`;
    body += `Date: ${verificationDate}\n\n`;
    
    if (!isVerified && rejectionReason) {
      body += `Reason for Rejection:\n`;
      body += `${rejectionReason}\n\n`;
      
      body += `Next Steps:\n`;
      body += `Please upload a new receipt by:\n`;
      body += `1. Logging into your account\n`;
      body += `2. Going to "My Payments"\n`;
      body += `3. Finding this transaction\n`;
      body += `4. Uploading a clear receipt photo\n\n`;
    }
    
    if (isVerified) {
      body += `Your booking is now confirmed. Thank you!\n\n`;
    }
    
    body += `Best regards,\n`;
    body += `CarWorks Service Team\n`;
    body += `support@carworks.com`;
    
    if (!customerEmail) {
      alert(`Customer email not found. Please contact ${payment.customerName} at their registered email.\n\nEmail Content:\n\n${body}`);
      return;
    }
    
    const mailtoLink = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    
    setTimeout(() => {
      alert(`Email opened for ${customerEmail}. Please review and send.`);
    }, 100);
  };

  const handleVerifyReceipt = async (paymentId: number) => {
    try {
      setIsVerifyingReceipt(true);

      const response = await fetch(
        `/api/admin/payments/${paymentId}/verify-receipt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verified: true,
            verifiedBy: "Admin",
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchPaymentData();

        if (selectedReceipt?.id === paymentId) {
          setSelectedReceipt(null);
        }
        if (selectedPayment?.id === paymentId) {
          setSelectedPayment(null);
        }

        const payment = payments.find(p => p.id === paymentId);
        if (payment) {
          sendEmailNotification(payment, true);
        }
        
        alert("Receipt verified! Email notification opened.");
      } else {
        throw new Error(data.error || "Failed to verify receipt");
      }
    } catch (err) {
      console.error("Error verifying receipt:", err);
      alert(err instanceof Error ? err.message : "Failed to verify receipt");
    } finally {
      setIsVerifyingReceipt(false);
    }
  };

  const handleRejectReceipt = async (paymentId: number) => {
    const reason = prompt("Please provide reason for rejecting this receipt:");
    if (!reason || reason.trim() === "") {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setIsVerifyingReceipt(true);

      const response = await fetch(
        `/api/admin/payments/${paymentId}/reject-receipt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rejectionReason: reason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await fetchPaymentData();

        if (selectedReceipt?.id === paymentId) {
          setSelectedReceipt(null);
        }
        if (selectedPayment?.id === paymentId) {
          setSelectedPayment(null);
        }

        const payment = payments.find(p => p.id === paymentId);
        if (payment) {
          sendEmailNotification(payment, false, reason.trim());
        }
        
        alert("Receipt rejected! Email notification opened.");
      } else {
        throw new Error(data.error || "Failed to reject receipt");
      }
    } catch (err) {
      console.error("Error rejecting receipt:", err);
      alert(err instanceof Error ? err.message : "Failed to reject receipt");
    } finally {
      setIsVerifyingReceipt(false);
    }
  };

  const handleDownloadReceipt = (receiptUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = receiptUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReceipt = (receiptUrl: string) => {
    const printWindow = window.open(receiptUrl, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  // Components
  const StatCard = ({
    title,
    value,
    icon,
    color,
    subtitle,
    isLoading,
  }: any) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 hover:border-amber-500/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
          )}
          {subtitle && (
            <p className="text-amber-400 text-xs font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`text-2xl p-3 rounded-lg bg-gray-700/50 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
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
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400">
                    Payment Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Transaction ID</p>
                      <p className="text-white font-mono">
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
                        {getPaymentMethodName(selectedPayment.paymentMethod)}
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
                        {selectedPayment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-400">
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Customer</p>
                      <p className="text-white font-medium">
                        {selectedPayment.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-blue-400 font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedPayment.customerEmail}
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
                  </div>
                </div>
              </div>

              {selectedPayment.uploadedReceipt && (
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <h4 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Uploaded Receipt
                  </h4>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-xl">📎</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {selectedPayment.uploadedReceipt.fileName}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {selectedPayment.uploadedReceipt.fileType} •
                            Uploaded:{" "}
                            {formatDateTime(
                              selectedPayment.uploadedReceipt.uploadedAt
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                            selectedPayment.uploadedReceipt.verified
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {selectedPayment.uploadedReceipt.verified ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </>
                          )}
                        </span>
                        {selectedPayment.uploadedReceipt.verifiedBy && (
                          <p className="text-gray-400 text-xs">
                            By: {selectedPayment.uploadedReceipt.verifiedBy}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedReceipt(selectedPayment)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Receipt
                      </button>
                      <button
                        onClick={() =>
                          handleDownloadReceipt(
                            selectedPayment.uploadedReceipt!.url,
                            selectedPayment.uploadedReceipt!.fileName
                          )
                        }
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg font-medium transition-colors border border-gray-700 flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>

                    {!selectedPayment.uploadedReceipt.verified && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <h5 className="text-white font-semibold mb-3">
                          Receipt Verification
                        </h5>
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              handleVerifyReceipt(selectedPayment.id)
                            }
                            disabled={isVerifyingReceipt}
                            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {isVerifyingReceipt
                              ? "Processing..."
                              : "Verify Receipt"}
                          </button>
                          <button
                            onClick={() =>
                              handleRejectReceipt(selectedPayment.id)
                            }
                            disabled={isVerifyingReceipt}
                            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject Receipt
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedPayment.uploadedReceipt.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">
                          <strong>Rejection Reason:</strong>{" "}
                          {selectedPayment.uploadedReceipt.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!selectedPayment.uploadedReceipt && (
                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                  <div className="text-center">
                    <div className="text-gray-400 text-4xl mb-3">📄</div>
                    <p className="text-gray-300">
                      No receipt uploaded for this payment
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Customer needs to upload receipt after payment
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ReceiptViewerModal = () => {
    if (!selectedReceipt || !selectedReceipt.uploadedReceipt) return null;

    const receipt = selectedReceipt.uploadedReceipt;
    const isImage = receipt.fileType.startsWith("image/");
    const isPDF = receipt.fileType === "application/pdf";

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
        <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Receipt Viewer</h3>
              <p className="text-gray-400 text-sm">
                {selectedReceipt.customerName} •{" "}
                {formatDate(selectedReceipt.paymentDate)} •{" "}
                {formatCurrency(selectedReceipt.amount)}
              </p>
            </div>
            <button
              onClick={() => setSelectedReceipt(null)}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
            >
              ✕
            </button>
          </div>

          <div className="p-3 border-b border-gray-800 bg-gray-800/30 flex items-center gap-3">
            <button
              onClick={() => setReceiptZoom(receiptZoom + 0.1)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setReceiptZoom(Math.max(0.5, receiptZoom - 0.1))}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setReceiptRotation((receiptRotation + 90) % 360)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              title="Rotate"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center text-sm text-gray-400">
              Zoom: {Math.round(receiptZoom * 100)}% • {receipt.fileName}
            </div>
            <button
              onClick={() => handlePrintReceipt(receipt.url)}
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={() =>
                handleDownloadReceipt(receipt.url, receipt.fileName)
              }
              className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-gray-800/20">
            <div className="flex justify-center items-center min-h-[400px]">
              {isImage ? (
                <div
                  className="bg-white rounded-lg shadow-2xl overflow-hidden"
                  style={{
                    transform: `scale(${receiptZoom}) rotate(${receiptRotation}deg)`,
                    transition: "transform 0.2s ease",
                  }}
                >
                  <img
                    src={receipt.url}
                    alt="Receipt"
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </div>
              ) : isPDF ? (
                <iframe
                  src={receipt.url}
                  className="w-full h-[70vh] rounded-lg border border-gray-700"
                  title="Receipt PDF"
                />
              ) : (
                <div className="text-center p-8">
                  <div className="text-gray-400 text-6xl mb-4">📄</div>
                  <p className="text-gray-300">
                    Preview not available for this file type
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    File type: {receipt.fileType}
                  </p>
                  <button
                    onClick={() =>
                      handleDownloadReceipt(receipt.url, receipt.fileName)
                    }
                    className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-800 bg-gray-900/50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                <p>
                  Uploaded: {formatDateTime(receipt.uploadedAt)} • Status:{" "}
                  {receipt.verified ? (
                    <span className="text-green-400">✅ Verified</span>
                  ) : (
                    <span className="text-yellow-400">⏳ Pending</span>
                  )}
                </p>
                <p className="mt-1">
                  Customer: {selectedReceipt.customerName} • Email:{" "}
                  {selectedReceipt.customerEmail}
                </p>
              </div>
              {!receipt.verified && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleVerifyReceipt(selectedReceipt.id)}
                    disabled={isVerifyingReceipt}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-lg font-medium"
                  >
                    {isVerifyingReceipt ? "Processing..." : "✅ Verify Receipt"}
                  </button>
                  <button
                    onClick={() => handleRejectReceipt(selectedReceipt.id)}
                    disabled={isVerifyingReceipt}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-lg font-medium"
                  >
                    ❌ Reject Receipt
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Payment Tracking</h2>
            <p className="text-gray-400">Loading payment data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 animate-pulse"
            >
              <div className="h-4 bg-gray-700 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-700 rounded w-32 mb-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Payment Tracking</h2>
          <p className="text-gray-400">
            Monitor customer payments and receipt verifications
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors border border-gray-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleRefresh}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2"
          >
            <span>🔄</span>
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-white">Time Period</h3>
          <div className="flex flex-wrap gap-2">
            {(["today", "week", "month", "year", "all"] as TimeFilter[]).map(
              (period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeFilter === period
                      ? "bg-blue-500 text-white"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon="💰"
          color="text-green-400"
          subtitle={`${payments.length} payments`}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon="📅"
          color="text-blue-400"
          subtitle="Current month"
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
          title="Receipts Uploaded"
          value={stats.receiptsUploaded}
          icon="📄"
          color="text-blue-400"
          subtitle="Customer uploaded"
        />
        <StatCard
          title="Receipts Verified"
          value={stats.receiptsVerified}
          icon="✅"
          color="text-green-400"
          subtitle="Verified by admin"
        />
        <StatCard
          title="Receipts Pending"
          value={stats.receiptsPending}
          icon="⏳"
          color="text-yellow-400"
          subtitle="Awaiting verification"
        />
        <StatCard
          title="Average Payment"
          value={formatCurrency(stats.averagePayment)}
          icon="📊"
          color="text-purple-400"
          subtitle="Per transaction"
        />
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search payments by customer, vehicle, email, or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "all"
                  ? "bg-amber-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              All Payments
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "completed"
                  ? "bg-green-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter("has_receipt")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "has_receipt"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              With Receipt
            </button>
            <button
              onClick={() => setFilter("no_receipt")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "no_receipt"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              No Receipt
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("failed")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "failed"
                  ? "bg-red-500 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              Failed
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/80">
              <tr className="border-b border-gray-700/50">
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
                  Receipt
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
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="text-gray-400 text-4xl mb-3">📭</div>
                    <p className="text-gray-400 text-lg">No payments found</p>
                    {searchQuery && (
                      <p className="text-gray-500 mt-1">
                        No results for "{searchQuery}"
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
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
                        <p className="text-gray-400 text-xs">
                          Booking #{payment.bookingId}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white font-medium">
                          {payment.customerName}
                        </p>
                        <p className="text-blue-400 text-sm flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {payment.customerEmail}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {payment.vehicleModel}
                        </p>
                        <p className="text-gray-500 text-xs font-mono">
                          {payment.registrationNumber}
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
                        <span className="text-xl">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                        </span>
                        <span className="text-white text-sm">
                          {getPaymentMethodName(payment.paymentMethod)}
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
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {payment.uploadedReceipt ? (
                        <div className="flex items-center gap-2">
                          {payment.uploadedReceipt.verified ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-400" />
                          )}
                          <span className="text-sm text-gray-300">
                            {payment.uploadedReceipt.verified
                              ? "Verified"
                              : "Pending"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          No receipt
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white text-sm">
                          {formatDate(payment.paymentDate)}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(payment.paymentDate).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {payment.uploadedReceipt && (
                          <button
                            onClick={() => setSelectedReceipt(payment)}
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            title="View Receipt"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredPayments.length > 0 && (
          <div className="p-4 border-t border-gray-700/50 flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              Showing{" "}
              <span className="text-white font-medium">
                {filteredPayments.length}
              </span>{" "}
              of{" "}
              <span className="text-white font-medium">{payments.length}</span>{" "}
              payments
            </p>
            <div className="text-sm text-gray-400">
              Total:{" "}
              {formatCurrency(
                filteredPayments.reduce((sum, p) => sum + p.amount, 0)
              )}
            </div>
          </div>
        )}
      </div>

      <PaymentDetailsModal />
      <ReceiptViewerModal />

      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <span className="text-red-400">⚠️</span>
            </div>
            <div>
              <p className="text-red-400 font-medium">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-red-300 hover:text-red-200 text-sm mt-1"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTracking;