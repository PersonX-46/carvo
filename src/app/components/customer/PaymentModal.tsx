"use client";
import { useState } from "react";
import Receipt from "./Receipt"; // Make sure to import your Receipt component

interface PaymentModalProps {
  booking: {
    id: number;
    finalCost: number | null;
    vehicle: {
      model: string;
      registrationNumber: string;
    };
  };
  customerId: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  booking,
  customerId,
  onClose,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>("online_banking");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [nameOnCard, setNameOnCard] = useState<string>("");
  const [bankName, setBankName] = useState<string>("Maybank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Simulate card number formatting
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(formatExpiryDate(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsProcessing(true);

    try {
      // ... existing validation code ...

      // Call payment API
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.finalCost,
          paymentMethod: paymentMethod,
          paymentDetails: {
            cardNumber: paymentMethod.includes("card")
              ? cardNumber.replace(/\s/g, "")
              : null,
            expiryDate: paymentMethod.includes("card") ? expiryDate : null,
            bankName: paymentMethod === "online_banking" ? bankName : null,
          },
          customerId: customerId,
        }),
      });

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Parse response
      const data = await response.json();

      // Check if data exists and has success property
      if (!data || data.success === false) {
        throw new Error(data?.error || "Payment failed without error message");
      }

      // Store receipt data and show receipt
      setReceiptData(
        data.receipt || {
          transactionId: data.payment?.transactionId || `TRX-${Date.now()}`,
          amount: booking.finalCost,
          paymentMethod: paymentMethod,
          paymentDate: new Date().toISOString(),
        }
      );

      // CRITICAL: Call onPaymentSuccess to update parent component
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }

      setShowReceipt(true);
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err instanceof Error ? err.message : "Payment failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };
  const handleCloseWithReceipt = () => {
    setShowReceipt(false);
    onPaymentSuccess(); // Refresh bookings
    onClose(); // Close modal
  };

  const banks = [
    "Maybank",
    "CIMB",
    "Public Bank",
    "RHB Bank",
    "Hong Leong Bank",
    "AmBank",
    "Bank Islam",
    "Bank Rakyat",
    "BSN",
    "Affin Bank",
  ];

  // Show receipt if payment succeeded
  if (showReceipt && receiptData) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-9999">
        <div className="bg-gray-900 rounded-2xl border border-green-500/30 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Payment Receipt</h3>
              <button
                onClick={handleCloseWithReceipt}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>
            <Receipt
              bookingId={booking.id}
              transactionId={receiptData.transactionId}
              onClose={handleCloseWithReceipt}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Complete Payment</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
              disabled={isProcessing}
            >
              ✕
            </button>
          </div>

          <div className="mb-6 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <h4 className="text-lg font-semibold text-amber-400 mb-2">
              Booking Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Vehicle:</span>
                <span className="text-white font-medium">
                  {booking.vehicle.model} ({booking.vehicle.registrationNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Amount Due:</span>
                <span className="text-amber-400 text-xl font-bold">
                  RM {booking.finalCost?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Method Selection */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Select Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "online_banking", label: "Online Banking", icon: "🏦" },
                  { id: "credit_card", label: "Credit Card", icon: "💳" },
                  { id: "debit_card", label: "Debit Card", icon: "💳" },
                  { id: "cash", label: "Cash (In-person)", icon: "💵" },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      paymentMethod === method.id
                        ? "bg-amber-500/20 border-amber-500 text-amber-400"
                        : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-amber-500/30"
                    }`}
                  >
                    <span className="text-2xl mb-1">{method.icon}</span>
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Details (for credit/debit card) */}
            {(paymentMethod === "credit_card" ||
              paymentMethod === "debit_card") && (
              <div className="space-y-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                <h4 className="text-lg font-semibold text-white">
                  Card Details
                </h4>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Expiry Date (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={handleExpiryDateChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="mr-2">🔒</span>
                    <span>
                      Your payment is secured with 256-bit SSL encryption
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Online Banking Details */}
            {paymentMethod === "online_banking" && (
              <div className="space-y-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                <h4 className="text-lg font-semibold text-white">
                  Online Banking
                </h4>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Select Bank
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    {banks.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    You will be redirected to your bank's secure login page to
                    complete the payment.
                  </p>
                </div>
              </div>
            )}

            {/* Cash Payment Note */}
            {paymentMethod === "cash" && (
              <div className="space-y-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                <h4 className="text-lg font-semibold text-white">
                  Cash Payment
                </h4>
                <p className="text-gray-300">
                  Please visit our workshop to make cash payment. Bring this
                  booking reference:
                </p>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 font-mono font-bold">
                    Booking #{booking.id}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <span className="text-2xl">💳</span>
                    Pay RM {booking.finalCost?.toFixed(2)}
                  </>
                )}
              </button>
              <p className="text-center text-gray-400 text-sm mt-3">
                By completing payment, you agree to our Terms of Service
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
