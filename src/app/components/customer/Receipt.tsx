"use client";
import { useEffect, useState } from "react";

interface ReceiptProps {
  bookingId: number;
  transactionId?: string;
  onClose?: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ bookingId, transactionId, onClose }) => {
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch receipt data from API
    // For now, we'll simulate it
    const simulateReceipt = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock receipt data
      setReceiptData({
        bookingId: bookingId,
        transactionId: transactionId || `TRX-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        amount: 250.00, // This would come from API
        paymentMethod: "Credit Card",
        status: "Completed"
      });
      setIsLoading(false);
    };

    simulateReceipt();
  }, [bookingId, transactionId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Receipt downloaded (simulated)");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Generating receipt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 max-w-lg mx-auto print:shadow-none print:p-4 z-9999">
      {/* Header */}
      <div className="text-center mb-8 print:mb-4">
        <div className="text-4xl mb-2 print:text-3xl">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 print:text-xl">Payment Successful</h1>
        <p className="text-gray-600">Thank you for your payment</p>
      </div>

      {/* Receipt Details */}
      <div className="space-y-4 mb-8 print:mb-4">
        <div className="flex justify-between items-center pb-4 border-b">
          <span className="text-gray-600">Transaction ID:</span>
          <span className="font-mono font-bold text-gray-900">{receiptData.transactionId}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Booking ID:</span>
          <span className="font-medium text-gray-900">#{receiptData.bookingId}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium text-gray-900">{receiptData.date}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Time:</span>
          <span className="font-medium text-gray-900">{receiptData.time}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Payment Method:</span>
          <span className="font-medium text-gray-900">{receiptData.paymentMethod}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className="font-medium text-green-600">{receiptData.status}</span>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-900">Total Amount:</span>
            <span className="text-amber-600">RM {receiptData.amount}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mb-8 print:mb-4">
        <p>Cheng Service Workshop</p>
        <p>123 Jalan Service, Seremban, Negeri Sembilan</p>
        <p>Phone: +6012-345 6789 | Email: info@chengservice.com</p>
      </div>

      {/* Action Buttons (non-printable) */}
      <div className="flex gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          🖨️ Print Receipt
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          📥 Download PDF
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Close
          </button>
        )}
      </div>

      {/* Print-only message */}
      <div className="hidden print:block text-center text-gray-500 text-xs mt-8">
        <p>Thank you for choosing Cheng Service!</p>
        <p>This is a computer-generated receipt, no signature required.</p>
      </div>
    </div>
  );
};

export default Receipt;