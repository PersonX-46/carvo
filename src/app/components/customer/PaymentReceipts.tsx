// app/components/admin/PaymentReceipts.tsx
"use client";
import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock } from "lucide-react";

interface PaymentReceipt {
  id: number;
  bookingId: number;
  customerName: string;
  vehicle: string;
  registrationNumber: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  date: string;
  status: "verified" | "pending" | "rejected";
  receiptUrl?: string;
  uploadedReceipt?: string;
  adminNotes?: string;
}

const PaymentReceipts: React.FC = () => {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<PaymentReceipt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const fetchReceipts = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReceipts: PaymentReceipt[] = [
        {
          id: 1,
          bookingId: 1001,
          customerName: "Ali bin Ahmad",
          vehicle: "Toyota Vios",
          registrationNumber: "ABC1234",
          amount: 350.50,
          paymentMethod: "DuitNow",
          transactionId: "DNT12345678",
          date: "2024-01-15 14:30:00",
          status: "verified",
          receiptUrl: "/receipts/receipt-1.pdf"
        },
        {
          id: 2,
          bookingId: 1002,
          customerName: "Siti Nurhaliza",
          vehicle: "Honda City",
          registrationNumber: "DEF5678",
          amount: 520.00,
          paymentMethod: "Credit Card",
          transactionId: "CCD87654321",
          date: "2024-01-14 11:20:00",
          status: "verified"
        },
        {
          id: 3,
          bookingId: 1003,
          customerName: "Muthu Krishnan",
          vehicle: "Proton X70",
          registrationNumber: "GHI9012",
          amount: 280.75,
          paymentMethod: "DuitNow",
          transactionId: "DNT23456789",
          date: "2024-01-15 09:15:00",
          status: "pending",
          uploadedReceipt: "/uploads/receipt-3.jpg"
        },
        {
          id: 4,
          bookingId: 1004,
          customerName: "Tan Wei Ling",
          vehicle: "Perodua Myvi",
          registrationNumber: "JKL3456",
          amount: 150.00,
          paymentMethod: "FPX",
          transactionId: "FPX34567890",
          date: "2024-01-13 16:45:00",
          status: "rejected",
          adminNotes: "Amount does not match"
        }
      ];
      
      setReceipts(mockReceipts);
      setFilteredReceipts(mockReceipts);
      setIsLoading(false);
    };

    fetchReceipts();
  }, []);

  // Filter receipts
  useEffect(() => {
    let filtered = receipts;

    if (searchTerm) {
      filtered = filtered.filter(receipt =>
        receipt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(receipt => receipt.status === statusFilter);
    }

    setFilteredReceipts(filtered);
  }, [searchTerm, statusFilter, receipts]);

  const handleVerifyReceipt = (receiptId: number) => {
    setReceipts(prev =>
      prev.map(receipt =>
        receipt.id === receiptId
          ? { ...receipt, status: "verified" as const }
          : receipt
      )
    );
    alert(`Receipt ${receiptId} verified successfully`);
  };

  const handleRejectReceipt = (receiptId: number) => {
    const reason = prompt("Please provide reason for rejection:");
    if (reason) {
      setReceipts(prev =>
        prev.map(receipt =>
          receipt.id === receiptId
            ? { ...receipt, status: "rejected" as const, adminNotes: reason }
            : receipt
        )
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "duitnow":
        return "📱";
      case "credit card":
      case "debit card":
        return "💳";
      case "fpx":
        return "🏦";
      case "touchngo":
        return "📲";
      case "grabpay":
        return "🚗";
      case "cash":
        return "💵";
      default:
        return "💰";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading payment receipts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Payment Receipts</h2>
          <p className="text-gray-400">View and verify customer payment receipts</p>
        </div>
        <div className="text-sm text-gray-400">
          Total: {receipts.length} receipts • Verified: {receipts.filter(r => r.status === "verified").length}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer, vehicle, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Customer & Vehicle
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Payment Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-mono text-sm font-semibold text-white">
                        {receipt.transactionId}
                      </div>
                      <div className="text-xs text-gray-400">
                        Booking #{receipt.bookingId}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {receipt.date}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">
                        {receipt.customerName}
                      </div>
                      <div className="text-sm text-gray-300">
                        {receipt.vehicle}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {receipt.registrationNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getPaymentMethodIcon(receipt.paymentMethod)}</span>
                      <span className="text-white">{receipt.paymentMethod}</span>
                    </div>
                    <div className="text-amber-400 font-bold text-lg">
                      RM {receipt.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(receipt.status)}
                    {receipt.adminNotes && receipt.status === "rejected" && (
                      <div className="text-xs text-red-400 mt-1 max-w-[200px]">
                        {receipt.adminNotes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReceipt(receipt)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {(receipt.receiptUrl || receipt.uploadedReceipt) && (
                        <a
                          href={receipt.receiptUrl || receipt.uploadedReceipt}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                          title="View Receipt"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      
                      {receipt.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleVerifyReceipt(receipt.id)}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                            title="Verify"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectReceipt(receipt.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {filteredReceipts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-white font-semibold text-lg mb-2">
            No receipts found
          </h3>
          <p className="text-gray-400">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "No payment receipts have been submitted yet"}
          </p>
        </div>
      )}

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-blue-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Receipt Details</h3>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Transaction Info */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Transaction Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Transaction ID</p>
                      <p className="font-mono font-bold text-white">{selectedReceipt.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Booking ID</p>
                      <p className="font-semibold text-white">#{selectedReceipt.bookingId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Date & Time</p>
                      <p className="text-white">{selectedReceipt.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      {getStatusBadge(selectedReceipt.status)}
                    </div>
                  </div>
                </div>

                {/* Customer & Vehicle */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Customer & Vehicle</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Customer Name</p>
                      <p className="font-semibold text-white">{selectedReceipt.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Vehicle</p>
                      <p className="text-white">{selectedReceipt.vehicle}</p>
                      <p className="text-sm text-gray-400 font-mono">{selectedReceipt.registrationNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Payment Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Payment Method:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getPaymentMethodIcon(selectedReceipt.paymentMethod)}</span>
                        <span className="text-white font-semibold">{selectedReceipt.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                      <span className="text-xl font-semibold text-white">Amount Paid:</span>
                      <span className="text-3xl font-bold text-amber-400">
                        RM {selectedReceipt.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                {selectedReceipt.adminNotes && (
                  <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                    <h4 className="text-lg font-semibold text-red-400 mb-2">Admin Notes</h4>
                    <p className="text-red-300">{selectedReceipt.adminNotes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {(selectedReceipt.receiptUrl || selectedReceipt.uploadedReceipt) && (
                    <a
                      href={selectedReceipt.receiptUrl || selectedReceipt.uploadedReceipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors text-center"
                    >
                      View Receipt Document
                    </a>
                  )}
                  {selectedReceipt.status === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          handleVerifyReceipt(selectedReceipt.id);
                          setSelectedReceipt(null);
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors"
                      >
                        Verify Payment
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Reason for rejection:");
                          if (reason) {
                            handleRejectReceipt(selectedReceipt.id);
                            setSelectedReceipt(null);
                          }
                        }}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors"
                      >
                        Reject Payment
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentReceipts;