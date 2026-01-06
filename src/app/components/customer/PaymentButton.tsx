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
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  className?: string;
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const PaymentButton: React.FC<PaymentButtonProps> = ({
  bookingId,
  amount,
  vehicleModel,
  registrationNumber,
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  className = "",
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>("maybank");
  const router = useRouter();

  // List of supported FPX banks
  const fpxBanks = [
    { code: "maybank", name: "Maybank2u", logo: "🏦" },
    { code: "cimb", name: "CIMB Clicks", logo: "🏦" },
    { code: "publicbank", name: "Public Bank", logo: "🏦" },
    { code: "rhb", name: "RHB Now", logo: "🏦" },
    { code: "hongleong", name: "Hong Leong Connect", logo: "🏦" },
    { code: "ambank", name: "AmBank", logo: "🏦" },
    { code: "affin", name: "Affin Bank", logo: "🏦" },
    { code: "bankislam", name: "Bank Islam", logo: "🕌" },
    { code: "bsn", name: "Bank Simpanan Nasional", logo: "🏛️" },
    { code: "uob", name: "UOB", logo: "🏦" },
  ];

  // List of supported eWallets
  const eWallets = [
    { code: "tng", name: "Touch 'n Go eWallet", logo: "📱" },
    { code: "grabpay", name: "GrabPay", logo: "🚗" },
    { code: "boost", name: "Boost", logo: "⚡" },
    { code: "shopee", name: "ShopeePay", logo: "🛍️" },
  ];

  const handlePayment = async (method: string, bankCode?: string) => {
    setIsLoading(true);
    setPaymentMethod(method);
    
    try {
      const paymentData = {
        bookingId,
        amount,
        paymentMethod: method,
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        vehicleModel,
        registrationNumber,
        description: `Car Service - ${vehicleModel} (${registrationNumber})`,
        ...(method === "fpx" && bankCode && { bankCode }),
      };

      console.log("Sending payment request:", paymentData);

      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Payment failed");
      }

      console.log("Payment response:", data);

      // Handle different payment methods
      if (data.paymentUrl) {
        // For FPX, Touch 'n Go, etc. - redirect to payment page
        window.location.href = data.paymentUrl;
      } else if (data.sessionId && method === "card") {
        // For Stripe card payments
        const stripe = await stripePromise;
        if (stripe) {
          const result = await stripe.redirectToCheckout({ 
            sessionId: data.sessionId 
          });
          if (result.error) {
            throw new Error(result.error.message);
          }
        }
      } else if (data.redirectUrl) {
        // Alternative redirect
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("No payment URL received");
      }

    } catch (error) {
      console.error("Payment error:", error);
      alert(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  // Format amount with thousands separator
  const formatAmount = (amount: number) => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isLoading || amount <= 0}
        className={`bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xl">💳</span>
            <span>Pay Now - RM {formatAmount(amount)}</span>
          </div>
        )}
      </button>

      {/* Payment Method Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 rounded-2xl border border-green-500/30 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Select Payment Method</h3>
                  <p className="text-gray-400 text-sm mt-1">Secure payment powered by Stripe</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  disabled={isLoading}
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {/* Amount Summary */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-xl p-4 border border-green-500/20 mb-6">
                <div className="text-center">
                  <div className="text-green-400 text-3xl font-bold mb-1">
                    RM {formatAmount(amount)}
                  </div>
                  <div className="text-gray-300 text-sm">
                    Service Payment
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {vehicleModel} • {registrationNumber}
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                {/* Credit/Debit Card */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-blue-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">💳</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">Credit/Debit Card</div>
                        <div className="text-gray-400 text-sm">Visa, Mastercard, Amex</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePayment("card")}
                      disabled={isLoading}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Pay
                    </button>
                  </div>
                </div>

                {/* Touch 'n Go & eWallets */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="text-orange-400">📱</span>
                    eWallet Payments
                  </h4>
                  <div className="space-y-2">
                    {eWallets.map((wallet) => (
                      <button
                        key={wallet.code}
                        onClick={() => handlePayment(wallet.code)}
                        disabled={isLoading}
                        className="w-full bg-gray-700/50 hover:bg-gray-700 text-white p-3 rounded-lg text-left transition-colors flex items-center justify-between disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{wallet.logo}</span>
                          <span className="font-medium">{wallet.name}</span>
                        </div>
                        <span className="text-gray-400">→</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* FPX Online Banking */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="text-purple-400">🏦</span>
                    Online Banking (FPX)
                  </h4>
                  
                  <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-2">Select Your Bank:</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      {fpxBanks.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.logo} {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handlePayment("fpx", selectedBank)}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>Pay with FPX</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Security Badges */}
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="text-green-400">🔒</span>
                    <span>SSL Secured</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="text-blue-400">🛡️</span>
                    <span>PCI DSS Compliant</span>
                  </div>
                </div>

                {/* Payment Help */}
                <div className="text-center">
                  <button 
                    onClick={() => window.open("https://wa.me/60123456789?text=Need%20help%20with%20payment", "_blank")}
                    className="text-green-400 hover:text-green-300 text-sm"
                  >
                    Need help? Contact Support
                  </button>
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