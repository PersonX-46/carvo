// app/components/customer/PaymentSystem.tsx
"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle,
  CreditCard,
  Smartphone,
  QrCode,
  Upload,
  Receipt,
  Banknote,
  Download,
  Printer,
} from "lucide-react";

interface PaymentSystemProps {
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
  onPaymentSuccess: () => void;
  onClose?: () => void;
}

type PaymentMethod =
  | "card"
  | "duitnow"
  | "fpx"
  | "touchngo"
  | "grabpay"
  | "cash";

interface ReceiptUpload {
  file: File | null;
  preview: string | null;
  paymentMethod: string;
  amount: number;
  date: string;
}

const PaymentSystem: React.FC<PaymentSystemProps> = ({
  booking,
  customerId,
  onPaymentSuccess,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState<
    "method" | "payment" | "upload" | "receipt"
  >("method");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const [uploadedReceipt, setUploadedReceipt] = useState<ReceiptUpload | null>(
    null
  );
  const [generatedReceipt, setGeneratedReceipt] = useState<any>(null);
  const [error, setError] = useState<string>("");

  // Card payment state
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  // DuitNow state
  const [duitnowReference, setDuitnowReference] = useState<string>("");

  // Payment methods configuration
  const paymentMethods = [
    {
      id: "card" as PaymentMethod,
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, Amex",
      fee: "No additional fee",
    },
    {
      id: "duitnow" as PaymentMethod,
      name: "DuitNow",
      icon: Smartphone,
      description: "QR Code or Bank Transfer",
      fee: "No additional fee",
    },
    {
      id: "fpx" as PaymentMethod,
      name: "FPX",
      icon: Banknote,
      description: "Online Banking",
      fee: "RM 1.00",
    },
    {
      id: "touchngo" as PaymentMethod,
      name: "Touch 'n Go",
      icon: QrCode,
      description: "eWallet Payment",
      fee: "No additional fee",
    },
    {
      id: "grabpay" as PaymentMethod,
      name: "GrabPay",
      icon: Smartphone,
      description: "Grab eWallet",
      fee: "No additional fee",
    },
    {
      id: "cash" as PaymentMethod,
      name: "Cash",
      icon: Banknote,
      description: "In-person payment",
      fee: "No fee",
    },
  ];

  // Generate DuitNow QR and reference number
  useEffect(() => {
    if (paymentMethod === "duitnow" && !duitnowReference) {
      // Generate a random reference number
      const ref = `DNT${Date.now().toString().slice(-8)}${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;
      setDuitnowReference(ref);
    }
  }, [paymentMethod, duitnowReference]);

  const handleCardInputChange = (
    field: keyof typeof cardDetails,
    value: string
  ) => {
    let formattedValue = value;

    switch (field) {
      case "number":
        formattedValue = value
          .replace(/\D/g, "")
          .replace(/(\d{4})(?=\d)/g, "$1 ")
          .slice(0, 19);
        break;
      case "expiry":
        formattedValue = value
          .replace(/\D/g, "")
          .replace(/(\d{2})(?=\d{2})/, "$1/")
          .slice(0, 5);
        break;
      case "cvv":
        formattedValue = value.replace(/\D/g, "").slice(0, 4);
        break;
    }

    setCardDetails((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const simulatePayment = async () => {
    setPaymentStatus("processing");
    setError("");

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate payment processing
      const success = Math.random() > 0.1; // 90% success rate for demo

      if (success) {
        setPaymentStatus("success");

        // For DuitNow, move to upload step
        if (paymentMethod === "duitnow") {
          setActiveStep("upload");
        } else {
          // For other methods, generate receipt immediately
          await generateReceipt();
        }
      } else {
        throw new Error("Payment failed. Please try again.");
      }
    } catch (err) {
      setPaymentStatus("failed");
      setError(err instanceof Error ? err.message : "Payment failed");
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|pdf)$/)) {
      setError("Please upload JPG, PNG or PDF files only");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }

    const preview = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null;

    setUploadedReceipt({
      file,
      preview,
      paymentMethod: paymentMethod.toUpperCase(),
      amount: booking.finalCost || 0,
      date: new Date().toISOString(),
    });

    setError("");
  };

  const submitReceipt = async () => {
    if (!uploadedReceipt || !uploadedReceipt.file) {
      setError("Please upload a receipt first");
      return;
    }

    setPaymentStatus("processing");

    try {
      // 1. Upload the file
      const formData = new FormData();
      formData.append("receipt", uploadedReceipt.file);
      formData.append("bookingId", booking.id.toString());
      formData.append("customerId", customerId.toString());

      if (generatedReceipt?.payment?.id) {
        formData.append("paymentId", generatedReceipt.payment.id.toString());
      }

      const uploadResponse = await fetch("/api/upload/receipt", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const uploadData = await uploadResponse.json();
      console.log("Receipt uploaded:", uploadData);

      // 2. Create or update payment record
      const paymentResponse = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          customerId: customerId,
          amount: booking.finalCost,
          paymentMethod: paymentMethod,
          transactionId:
            paymentMethod === "duitnow"
              ? duitnowReference
              : `PAY-${Date.now()}`,
          receiptUrl: uploadData.fileUrl,
          paymentDetails: {
            receiptFileName: uploadData.fileName,
            receiptFileType: uploadedReceipt.file.type,
            receiptFileSize: uploadedReceipt.file.size,
            uploadedAt: new Date().toISOString(),
          },
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error("Failed to create payment record");
      }

      const data = await paymentResponse.json();
      setGeneratedReceipt(data);
      setActiveStep("receipt");
      setPaymentStatus("success");
    } catch (err) {
      setPaymentStatus("failed");
      setError(err instanceof Error ? err.message : "Failed to upload receipt");
    }
  };

  const generateReceipt = async () => {
    setPaymentStatus("processing");

    try {
      // Call your API to create payment record
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          customerId: customerId,
          amount: booking.finalCost,
          paymentMethod: paymentMethod,
          transactionId:
            paymentMethod === "duitnow"
              ? duitnowReference
              : `PAY-${Date.now()}`,
          receiptUploaded: uploadedReceipt ? true : false,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate receipt");

      const data = await response.json();
      setGeneratedReceipt(data);
      setActiveStep("receipt");
      setPaymentStatus("success");
    } catch (err) {
      setPaymentStatus("failed");
      setError(
        err instanceof Error ? err.message : "Failed to generate receipt"
      );
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    if (!generatedReceipt) return;

    const receiptContent = `
      ===============================
      CHENG SERVICE WORKSHOP RECEIPT
      ===============================
      Transaction ID: ${generatedReceipt.transactionId}
      Booking ID: #${booking.id}
      Date: ${new Date().toLocaleDateString()}
      Time: ${new Date().toLocaleTimeString()}
      
      Vehicle: ${booking.vehicle.model}
      Registration: ${booking.vehicle.registrationNumber}
      
      Payment Method: ${
        paymentMethods.find((m) => m.id === paymentMethod)?.name
      }
      Amount: RM ${booking.finalCost?.toFixed(2)}
      Status: PAID
      
      Thank you for your payment!
      ===============================
      Cheng Service Workshop
      123 Jalan Service, Seremban
      Phone: +6012-345 6789
      Email: info@chengservice.com
      ===============================
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {["method", "payment", "upload", "receipt"].map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
            ${
              activeStep === step
                ? "bg-amber-500 border-amber-500 text-white"
                : step === "receipt" && generatedReceipt
                ? "bg-green-500 border-green-500 text-white"
                : index <
                  ["method", "payment", "upload", "receipt"].indexOf(activeStep)
                ? "bg-green-500 border-green-500 text-white"
                : "border-gray-600 text-gray-400"
            }`}
          >
            {step === "method"
              ? "1"
              : step === "payment"
              ? "2"
              : step === "upload"
              ? "3"
              : "✅"}
          </div>
          {index < 3 && (
            <div
              className={`w-16 h-1 ${
                index <
                ["method", "payment", "upload", "receipt"].indexOf(activeStep)
                  ? "bg-green-500"
                  : "bg-gray-600"
              }`}
            />
          )}
        </div>
      ))}
      <div className="ml-6 text-sm text-gray-400">
        {activeStep === "method" && "Select Payment Method"}
        {activeStep === "payment" && "Make Payment"}
        {activeStep === "upload" && "Upload Receipt"}
        {activeStep === "receipt" && "Receipt Generated"}
      </div>
    </div>
  );

  // Step 1: Payment Method Selection
  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Payment Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Vehicle:</span>
            <span className="text-white">{booking.vehicle.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Amount Due:</span>
            <span className="text-2xl font-bold text-amber-400">
              RM {booking.finalCost?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => setPaymentMethod(method.id)}
            className={`p-4 rounded-xl border transition-all ${
              paymentMethod === method.id
                ? "bg-amber-500/20 border-amber-500 text-amber-400"
                : "bg-gray-800/50 border-gray-700 hover:border-amber-500/30"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <method.icon className="w-8 h-8 mb-2" />
              <span className="font-semibold mb-1">{method.name}</span>
              <span className="text-xs text-gray-400">
                {method.description}
              </span>
              <span className="text-xs mt-1">{method.fee}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button
          onClick={() => onClose?.()}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors border border-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={() => setActiveStep("payment")}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-semibold transition-all"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );

  // Step 2: Payment Process
  const renderPaymentProcess = () => {
    if (paymentMethod === "card") {
      return (
        <div className="space-y-6">
          <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6">
              Card Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) =>
                    handleCardInputChange("number", e.target.value)
                  }
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) =>
                      handleCardInputChange("expiry", e.target.value)
                    }
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      handleCardInputChange("cvv", e.target.value)
                    }
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Name on Card
                </label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) =>
                    handleCardInputChange("name", e.target.value)
                  }
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-400 p-4 border border-gray-700 rounded-xl">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <span>
              Secure 256-bit SSL encryption. Your card details are safe.
            </span>
          </div>
        </div>
      );
    }

    if (paymentMethod === "duitnow") {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                DuitNow Payment
              </h3>
              <p className="text-gray-300">Scan QR code or use bank transfer</p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              {/* QR Code Display */}
              <div className="bg-white p-4 rounded-xl">
                <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  {/* In real app, generate actual QR code */}
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <p className="text-sm text-gray-600 font-mono">
                      DuitNow QR
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Scan with your bank app
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank Transfer Details */}
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <h4 className="font-semibold text-white mb-3">
                    Bank Transfer Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Bank Name</p>
                      <p className="text-white font-semibold">
                        Cheng Service Account
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Account Number</p>
                      <p className="text-white font-mono font-bold text-xl">
                        1234-5678-9012
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Reference Number</p>
                      <p className="text-purple-400 font-mono font-bold">
                        {duitnowReference}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Amount</p>
                      <p className="text-2xl font-bold text-amber-400">
                        RM {booking.finalCost?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-400 p-3 bg-gray-800/30 rounded-lg">
                  💡 <strong>Important:</strong> Include the reference number in
                  your transfer description
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Other payment methods would have similar implementations
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">
          {paymentMethod === "fpx" && "🏦"}
          {paymentMethod === "touchngo" && "📱"}
          {paymentMethod === "grabpay" && "🚗"}
          {paymentMethod === "cash" && "💵"}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">
          {paymentMethods.find((m) => m.id === paymentMethod)?.name}
        </h3>
        <p className="text-gray-300 mb-8">
          {paymentMethod === "cash"
            ? "Please visit our workshop to complete cash payment"
            : "You will be redirected to complete your payment"}
        </p>
      </div>
    );
  };

  // Step 3: Receipt Upload (for DuitNow)
  const renderReceiptUpload = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border border-blue-500/30">
        <div className="text-center mb-6">
          <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Upload Payment Receipt
          </h3>
          <p className="text-gray-300">
            Upload your bank transfer receipt for verification
          </p>
        </div>

        {!uploadedReceipt ? (
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="receipt-upload"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleReceiptUpload}
            />
            <label htmlFor="receipt-upload" className="cursor-pointer">
              <div className="text-4xl mb-4">📎</div>
              <p className="text-white font-semibold mb-2">
                Click to upload receipt
              </p>
              <p className="text-gray-400 text-sm">JPG, PNG or PDF (max 5MB)</p>
            </label>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {uploadedReceipt.preview && (
                  <img
                    src={uploadedReceipt.preview}
                    alt="Receipt preview"
                    className="w-16 h-16 object-cover rounded-lg mr-4"
                  />
                )}
                <div>
                  <p className="text-white font-semibold">
                    {uploadedReceipt.file?.name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Uploaded • {(uploadedReceipt.file?.size || 0) / 1024} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUploadedReceipt(null)}
                className="text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-800/30 rounded-xl">
          <h4 className="font-semibold text-white mb-2">
            Verification Guidelines:
          </h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Receipt must clearly show transaction details</li>
            <li>• Reference number must be visible</li>
            <li>• Amount must match RM {booking.finalCost?.toFixed(2)}</li>
            <li>• Verification takes 1-2 business hours</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Step 4: Generated Receipt
  // In the PaymentSystem component, update the generated receipt section:

  // Step 4: Generated Receipt (with verification status)
  const renderGeneratedReceipt = () => {
    // Check if payment requires verification
    const requiresVerification =
      paymentMethod === "duitnow" || paymentMethod === "cash";

    return (
      <div className="space-y-6">
        <div
          className={`rounded-xl p-8 border ${
            requiresVerification
              ? "bg-blue-900/20 border-blue-500/30"
              : "bg-green-900/20 border-green-500/30"
          }`}
        >
          <div className="text-center mb-8">
            {requiresVerification ? (
              <>
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">⏳</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  Payment Submitted
                </h3>
                <p className="text-gray-300">
                  Your payment receipt is pending verification
                </p>
              </>
            ) : (
              <>
                <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-white mb-2">
                  Payment Successful!
                </h3>
                <p className="text-gray-300">
                  Your payment has been processed successfully
                </p>
              </>
            )}
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 mb-6">
            <div className="space-y-4">
              {/* Transaction details */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                <span className="text-gray-300">Transaction ID:</span>
                <span className="font-mono font-bold text-white">
                  {generatedReceipt?.transactionId || "TRX-123456789"}
                </span>
              </div>

              {/* ... other receipt details ... */}

              {/* Verification Status */}
              {requiresVerification && (
                <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">!</span>
                    </div>
                    <span className="text-blue-400 font-semibold">
                      Verification Required
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Your receipt has been submitted for verification. Once
                    verified by admin, you will be able to print the official
                    receipt. This usually takes 1-2 business hours.
                  </p>
                </div>
              )}

              {!requiresVerification && (
                <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold">
                      Payment Verified Automatically
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">
                    Your payment has been verified and receipt is ready.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Show download/print buttons only if verified or doesn't require verification */}
          {!requiresVerification || generatedReceipt?.receiptVerified ? (
            <div className="flex gap-4">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print Receipt
              </button>
              <button
                onClick={handleDownloadReceipt}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Receipt
              </button>
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-gray-400">
                Receipt will be available after admin verification
              </p>
            </div>
          )}
        </div>

        <div className="text-center text-gray-400 text-sm">
          {requiresVerification ? (
            <>
              <p>You will receive an email once your receipt is verified</p>
              <p>Check your booking status for verification updates</p>
            </>
          ) : (
            <>
              <p>A copy of this receipt has been sent to your email</p>
              <p>Your booking status will be updated automatically</p>
            </>
          )}
        </div>
      </div>
    );
  };

  // Action buttons for each step
  const renderActionButtons = () => {
    if (activeStep === "receipt") {
      return (
        <div className="flex justify-center">
          <button
            onClick={() => {
              onPaymentSuccess();
              onClose?.();
            }}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all"
          >
            Done
          </button>
        </div>
      );
    }

    if (activeStep === "upload") {
      return (
        <div className="flex justify-between gap-3">
          <button
            onClick={() => setActiveStep("payment")}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors border border-gray-700"
          >
            Back
          </button>
          <button
            onClick={submitReceipt}
            disabled={!uploadedReceipt || paymentStatus === "processing"}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            {paymentStatus === "processing" ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Submit Receipt
              </>
            )}
          </button>
        </div>
      );
    }

    if (activeStep === "payment") {
      return (
        <div className="flex justify-between gap-3">
          <button
            onClick={() => setActiveStep("method")}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors border border-gray-700"
          >
            Back
          </button>
          <button
            onClick={simulatePayment}
            disabled={
              paymentStatus === "processing" ||
              (paymentMethod === "card" && !cardDetails.number)
            }
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            {paymentStatus === "processing" ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              `Pay RM ${booking.finalCost?.toFixed(2)}`
            )}
          </button>
        </div>
      );
    }

    return null;
  };

  // Error display
  const renderError = () => {
    if (!error || paymentStatus !== "failed") return null;

    return (
      <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mr-3">
            <span className="text-red-400">⚠️</span>
          </div>
          <div>
            <p className="text-red-400 font-semibold">Payment Failed</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setError("");
            setPaymentStatus("idle");
          }}
          className="mt-3 text-sm text-red-300 hover:text-red-200"
        >
          Try Again
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Payment</h2>
              <p className="text-gray-400 text-sm">
                {booking.vehicle.model} • {booking.vehicle.registrationNumber}
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                disabled={paymentStatus === "processing"}
                className="text-gray-400 hover:text-white transition-colors text-2xl p-2 rounded-full hover:bg-gray-800"
              >
                ✕
              </button>
            )}
          </div>

          {/* Progress indicator */}
          {getStepIndicator()}

          {/* Error display */}
          {renderError()}

          {/* Content based on step */}
          <div className="mb-8">
            {activeStep === "method" && renderMethodSelection()}
            {activeStep === "payment" && renderPaymentProcess()}
            {activeStep === "upload" && renderReceiptUpload()}
            {activeStep === "receipt" && renderGeneratedReceipt()}
          </div>

          {/* Action buttons */}
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
};

export default PaymentSystem;
