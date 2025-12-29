"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";

interface PaymentButtonProps {
  bookingId: number;
  amount: number;
  vehicleModel: string;
  registrationNumber: string;
  customerId: number;
  className?: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  bookingId,
  amount,
  vehicleModel,
  registrationNumber,
  customerId,
  className = "",
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handlePayment = async (method: string) => {
    setIsLoading(true);
    setPaymentMethod(method);
    
    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          amount,
          paymentMethod: method,
          customerId,
          description: `Service for ${vehicleModel} (${registrationNumber})`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      // Handle different payment methods
      switch (method) {
        case "tng":
          // Redirect to Touch 'n Go payment page
          window.location.href = data.paymentUrl;
          break;
        
        case "fpx":
          // Redirect to FPX payment page
          window.location.href = data.paymentUrl;
          break;
        
        case "card":
          // Handle Stripe payment
          const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
          if (stripe && data.sessionId) {
            await stripe.redirectToCheckout({ sessionId: data.sessionId });
          }
          break;
        
        default:
          throw new Error("Invalid payment method");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isLoading}
        className={`bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing...
          </div>
        ) : (
          <>
            💳 Pay Now - RM {amount.toFixed(2)}
          </>
        )}
      </button>

      {/* Payment Method Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-green-500/30 max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white">Select Payment Method</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="text-center mb-4">
                    <div className="text-green-400 text-2xl font-bold mb-2">
                      RM {amount.toFixed(2)}
                    </div>
                    <div className="text-gray-300 text-sm">
                      For {vehicleModel} ({registrationNumber})
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {/* Credit/Debit Card */}
                  <button
                    onClick={() => handlePayment("card")}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-xl text-left transition-all flex items-center justify-between disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold">💳</span>
                      </div>
                      <div>
                        <div className="font-semibold">Credit/Debit Card</div>
                        <div className="text-sm opacity-80">Visa, Mastercard, Amex</div>
                      </div>
                    </div>
                    <span className="text-2xl">→</span>
                  </button>

                  {/* Touch 'n Go */}
                  <button
                    onClick={() => handlePayment("tng")}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-4 rounded-xl text-left transition-all flex items-center justify-between disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-orange-600 font-bold">📱</span>
                      </div>
                      <div>
                        <div className="font-semibold">Touch 'n Go</div>
                        <div className="text-sm opacity-80">Pay with eWallet</div>
                      </div>
                    </div>
                    <span className="text-2xl">→</span>
                  </button>

                  {/* FPX */}
                  <button
                    onClick={() => handlePayment("fpx")}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-4 rounded-xl text-left transition-all flex items-center justify-between disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 font-bold">🏦</span>
                      </div>
                      <div>
                        <div className="font-semibold">FPX Online Banking</div>
                        <div className="text-sm opacity-80">Maybank, CIMB, Public Bank</div>
                      </div>
                    </div>
                    <span className="text-2xl">→</span>
                  </button>
                </div>

                <div className="text-xs text-gray-400 text-center mt-4">
                  🔒 All payments are secured and encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentButton;