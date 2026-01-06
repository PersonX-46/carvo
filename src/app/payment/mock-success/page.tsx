"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const billplzId = searchParams.get("billplz[id]");

    if (sessionId || billplzId) {
      // Verify payment and fetch details
      fetchPaymentDetails(sessionId || billplzId || "");
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchPaymentDetails = async (reference: string) => {
    try {
      const response = await fetch(`/api/payments/verify?reference=${reference}`);
      const data = await response.json();
      if (data.success) {
        setPaymentDetails(data.payment);
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
          <p className="text-white">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-green-500/30 max-w-lg w-full p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-green-400 text-4xl">✓</span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-gray-300 mb-6">
            Thank you for your payment. Your service has been fully processed.
          </p>

          {paymentDetails && (
            <div className="bg-gray-700/30 rounded-xl p-6 mb-6 border border-gray-600">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount Paid</span>
                  <span className="text-green-400 font-bold text-xl">
                    RM {paymentDetails.amount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Method</span>
                  <span className="text-white capitalize">
                    {paymentDetails.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="text-gray-300 text-sm">
                    {paymentDetails.reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date</span>
                  <span className="text-gray-300">
                    {new Date().toLocaleDateString('en-MY', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Link
              href="/customer"
              className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold transition-all"
            >
              Go to Dashboard
            </Link>
            
            <button
              onClick={() => window.print()}
              className="block w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all"
            >
              Print Receipt
            </button>

            <div className="text-sm text-gray-400 pt-4">
              A receipt has been sent to your email.
              <br />
              Need help?{" "}
              <a 
                href="https://wa.me/60123456789" 
                target="_blank" 
                className="text-green-400 hover:text-green-300"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}