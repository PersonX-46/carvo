"use client";
import { useState } from "react";
import PaymentModal from "./PaymentModal";
import Receipt from "./Receipt";

interface PaymentButtonProps {
  booking: {
    id: number;
    finalCost: number | null;
    vehicle: {
      model: string;
      registrationNumber: string;
    };
    paymentStatus?: string;
    amountPaid?: number;
    balanceDue?: number;
  };
  customerId: number;
  onPaymentSuccess?: () => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ 
  booking, 
  customerId, 
  onPaymentSuccess 
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Don't show if no final cost
  if (!booking.finalCost) {
    return null;
  }

  // Determine button text and style based on payment status
  const getButtonConfig = () => {
    if (booking.paymentStatus === "paid") {
      return {
        text: `📄 View Receipt`,
        className: "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 cursor-pointer",
        disabled: false,
        showReceipt: true,
        action: "showReceipt"
      };
    }
    
    if (booking.paymentStatus === "partially_paid") {
      const balance = booking.balanceDue || booking.finalCost! - (booking.amountPaid || 0);
      return {
        text: `💳 Pay Balance: RM ${balance.toFixed(2)}`,
        className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
        disabled: false,
        showReceipt: false,
        action: "pay"
      };
    }
    
    return {
      text: `💳 Pay RM ${booking.finalCost!.toFixed(2)}`,
      className: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white",
      disabled: false,
      showReceipt: false,
      action: "pay"
    };
  };

  const buttonConfig = getButtonConfig();

  const handleClick = () => {
    if (buttonConfig.action === "showReceipt") {
      // Show receipt for paid bookings
      setShowReceiptModal(true);
      return;
    }
    
    // Otherwise open payment modal
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
    setShowPaymentModal(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${buttonConfig.className}`}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          buttonConfig.text
        )}
      </button>

      {/* Payment Modal - Fixed Overlay */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <PaymentModal
            booking={booking}
            customerId={customerId}
            onClose={() => setShowPaymentModal(false)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </div>
      )}

      {/* Receipt Modal - Fixed Overlay */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-gray-900 rounded-2xl border border-green-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Payment Receipt</h3>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl p-2"
                >
                  ✕
                </button>
              </div>
              <Receipt
                bookingId={booking.id}
                transactionId={`PAY-${booking.id}-${Date.now().toString().slice(-6)}`}
                onClose={() => setShowReceiptModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentButton;