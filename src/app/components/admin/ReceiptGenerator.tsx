"use client";
import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ReceiptData {
  paymentId: number;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleModel: string;
  registrationNumber: string;
  bookingId: number;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  serviceType?: string;
  workerName?: string;
  spareParts?: string[];
  laborCost?: number;
  partsCost?: number;
  workshopInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxId?: string;
  };
}

interface ReceiptGeneratorProps {
  payment: {
    id: number;
    bookingId: number;
    customerId: number;
    customerName: string;
    vehicleModel: string;
    registrationNumber: string;
    amount: number;
    paymentMethod: string;
    transactionId: string | null;
    paymentDate: string;
  };
  onClose?: () => void;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({
  payment,
  onClose,
}) => {
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // A4 dimensions in mm: 210mm × 297mm
  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;
  const MARGIN_MM = 20; // 20mm margins on all sides
  const CONTENT_WIDTH_MM = A4_WIDTH_MM - (MARGIN_MM * 2); // 170mm

  // Default workshop info
  const defaultWorkshopInfo = {
    name: "ChengService Auto Workshop",
    address: "123 Jalan Service, Seremban, Negeri Sembilan, 70100",
    phone: "+6012-345 6789",
    email: "info@chengservice.com",
    website: "www.chengservice.com",
    taxId: "T1234567890"
  };

  // Fetch additional receipt data
  const fetchReceiptData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch booking details
      const bookingResponse = await fetch(
        `/api/admin/bookings/${payment.bookingId}`
      );
      if (!bookingResponse.ok) throw new Error("Failed to fetch booking details");
      const bookingData = await bookingResponse.json();

      // Fetch customer details
      const customerResponse = await fetch(
        `/api/admin/customers/${payment.customerId}`
      );
      const customerData = customerResponse.ok
        ? await customerResponse.json()
        : { email: "", phone: "" };

      // Fetch service details if available
      let serviceType = "General Service";
      let workerName = "";
      let spareParts = [];
      let laborCost = 0;
      let partsCost = 0;
      
      if (bookingData.serviceId) {
        const serviceResponse = await fetch(
          `/api/admin/services/${bookingData.serviceId}`
        );
        if (serviceResponse.ok) {
          const serviceData = await serviceResponse.json();
          serviceType = serviceData.repairNotes || "General Service";
          workerName = serviceData.worker?.name || "";
          
          // Parse spare parts if available
          if (serviceData.spareParts) {
            try {
              spareParts = JSON.parse(serviceData.spareParts);
            } catch (e) {
              spareParts = serviceData.spareParts.split(',').map((part: string) => part.trim());
            }
          }
          
          // Calculate costs
          if (bookingData.finalCost) {
            laborCost = bookingData.finalCost * 0.7; // 70% labor, 30% parts
            partsCost = bookingData.finalCost * 0.3;
          } else if (bookingData.estimatedCost) {
            laborCost = bookingData.estimatedCost * 0.7;
            partsCost = bookingData.estimatedCost * 0.3;
          }
        }
      }

      // Generate receipt number
      const receiptNumber = `RC-${payment.id.toString().padStart(6, "0")}-${new Date()
        .getFullYear()
        .toString()
        .slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, "0")}`;

      const receipt: ReceiptData = {
        paymentId: payment.id,
        transactionId: payment.transactionId || receiptNumber,
        customerName: payment.customerName,
        customerEmail: customerData.email || "N/A",
        customerPhone: customerData.phone || "N/A",
        vehicleModel: payment.vehicleModel,
        registrationNumber: payment.registrationNumber,
        bookingId: payment.bookingId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
        serviceType,
        workerName,
        spareParts,
        laborCost,
        partsCost,
        workshopInfo: defaultWorkshopInfo,
      };

      setReceiptData(receipt);
    } catch (err) {
      console.error("Error fetching receipt data:", err);
      setError("Failed to load receipt data. Using basic information.");

      // Fallback to basic data
      const receipt: ReceiptData = {
        paymentId: payment.id,
        transactionId:
          payment.transactionId ||
          `TRX-${payment.id}-${Date.now().toString().slice(-6)}`,
        customerName: payment.customerName,
        customerEmail: "N/A",
        customerPhone: "N/A",
        vehicleModel: payment.vehicleModel,
        registrationNumber: payment.registrationNumber,
        bookingId: payment.bookingId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
        serviceType: "General Service",
        workerName: "N/A",
        spareParts: [],
        laborCost: payment.amount * 0.7,
        partsCost: payment.amount * 0.3,
        workshopInfo: defaultWorkshopInfo,
      };

      setReceiptData(receipt);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceiptData();
  }, [payment]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-MY", {
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      setIsGeneratingPDF(true);

      // Set fixed dimensions for A4
      const receiptElement = receiptRef.current;
      receiptElement.style.width = `${CONTENT_WIDTH_MM}mm`;
      receiptElement.style.minHeight = `${A4_HEIGHT_MM - (MARGIN_MM * 2)}mm`;

      const canvas = await html2canvas(receiptElement, {
        scale: 3, // Higher scale for better print quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: CONTENT_WIDTH_MM * 3.78, // Convert mm to pixels (1mm = 3.78px)
        height: (A4_HEIGHT_MM - (MARGIN_MM * 2)) * 3.78,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calculate image dimensions to fit A4 with margins
      const imgWidth = CONTENT_WIDTH_MM;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Center the content on A4
      const xPos = MARGIN_MM;
      const yPos = MARGIN_MM;

      pdf.addImage(imgData, "PNG", xPos, yPos, imgWidth, imgHeight);
      pdf.save(`Receipt-${receiptData?.transactionId || payment.id}.pdf`);

      // Reset styles
      receiptElement.style.width = '';
      receiptElement.style.minHeight = '';

      setIsGeneratingPDF(false);
      alert("✅ Receipt downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("❌ Failed to generate PDF. Please try again.");
      setIsGeneratingPDF(false);
    }
  };

  const handleEmailReceipt = async () => {
    if (!receiptData) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/receipts/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerEmail: receiptData.customerEmail,
          customerName: receiptData.customerName,
          receiptData: receiptData,
        }),
      });

      if (response.ok) {
        alert("✅ Receipt sent to customer's email!");
      } else {
        alert("❌ Failed to send email. Please check customer email.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("❌ Failed to send email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Preparing receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all"
        >
          Close
        </button>
      </div>
    );
  }

  if (!receiptData) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">No receipt data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Receipt Preview - A4 Sized */}
      <div className="bg-white rounded-2xl p-8 shadow-2xl print:shadow-none print:p-0 print:bg-transparent">
        <div 
          ref={receiptRef} 
          className="receipt-content bg-white p-8 print:p-0"
          style={{
            width: `${CONTENT_WIDTH_MM}mm`,
            minHeight: `${A4_HEIGHT_MM - (MARGIN_MM * 2)}mm`,
            margin: '0 auto'
          }}
        >
          {/* Header with Logo and Info */}
          <div className="mb-6 border-b-2 border-gray-300 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {receiptData.workshopInfo.name}
                </h1>
                <p className="text-sm text-gray-600">{receiptData.workshopInfo.address}</p>
                <p className="text-sm text-gray-600">
                  Tel: {receiptData.workshopInfo.phone} | Email: {receiptData.workshopInfo.email}
                </p>
                {receiptData.workshopInfo.taxId && (
                  <p className="text-sm text-gray-600">Tax ID: {receiptData.workshopInfo.taxId}</p>
                )}
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-900 mb-2">TAX INVOICE</h2>
                <p className="text-sm text-gray-600">Original Copy</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Bill To */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 border-b pb-1">Bill To</h3>
              <p className="font-medium mb-1">{receiptData.customerName}</p>
              <p className="text-sm text-gray-600 mb-1">Email: {receiptData.customerEmail}</p>
              <p className="text-sm text-gray-600">Phone: {receiptData.customerPhone}</p>
            </div>

            {/* Receipt Details */}
            <div className="text-right">
              <h3 className="text-lg font-bold text-gray-900 mb-2 border-b pb-1">Receipt Details</h3>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-gray-600">Receipt No:</span>{' '}
                  <span className="font-medium">{`RC-${receiptData.paymentId.toString().padStart(6, "0")}`}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Transaction ID:</span>{' '}
                  <span className="font-medium font-mono">{receiptData.transactionId}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Date:</span>{' '}
                  <span className="font-medium">{formatDate(receiptData.paymentDate)}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Time:</span>{' '}
                  <span className="font-medium">{formatTime(receiptData.paymentDate)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle & Service Info */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Vehicle Details</h4>
                <p className="text-sm">
                  <span className="text-gray-600">Model:</span>{' '}
                  <span className="font-medium">{receiptData.vehicleModel}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Reg No:</span>{' '}
                  <span className="font-medium font-mono">{receiptData.registrationNumber}</span>
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Service Details</h4>
                <p className="text-sm">
                  <span className="text-gray-600">Booking ID:</span>{' '}
                  <span className="font-medium">#{receiptData.bookingId}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Service Type:</span>{' '}
                  <span className="font-medium">{receiptData.serviceType}</span>
                </p>
                {receiptData.workerName && (
                  <p className="text-sm">
                    <span className="text-gray-600">Technician:</span>{' '}
                    <span className="font-medium">{receiptData.workerName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left font-bold text-gray-900">Description</th>
                  <th className="border border-gray-300 p-3 text-center font-bold text-gray-900">Quantity</th>
                  <th className="border border-gray-300 p-3 text-right font-bold text-gray-900">Unit Price</th>
                  <th className="border border-gray-300 p-3 text-right font-bold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Labor Cost */}
                <tr>
                  <td className="border border-gray-300 p-3 text-gray-900">Labor Charges</td>
                  <td className="border border-gray-300 p-3 text-center">1</td>
                  <td className="border border-gray-300 p-3 text-right">{formatCurrency(receiptData.laborCost || 0)}</td>
                  <td className="border border-gray-300 p-3 text-right font-medium">{formatCurrency(receiptData.laborCost || 0)}</td>
                </tr>
                
                {/* Spare Parts */}
                {receiptData.spareParts && receiptData.spareParts.length > 0 ? (
                  receiptData.spareParts.map((part: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-3 text-gray-900">
                        {typeof part === 'object' ? part.name || part.part : part}
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        {typeof part === 'object' ? part.quantity || 1 : 1}
                      </td>
                      <td className="border border-gray-300 p-3 text-right">
                        {formatCurrency(typeof part === 'object' ? part.price || receiptData.partsCost || 0 : receiptData.partsCost || 0)}
                      </td>
                      <td className="border border-gray-300 p-3 text-right font-medium">
                        {formatCurrency(typeof part === 'object' 
                          ? (part.price || receiptData.partsCost || 0) * (part.quantity || 1)
                          : receiptData.partsCost || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border border-gray-300 p-3 text-gray-900">Spare Parts</td>
                    <td className="border border-gray-300 p-3 text-center">1</td>
                    <td className="border border-gray-300 p-3 text-right">{formatCurrency(receiptData.partsCost || 0)}</td>
                    <td className="border border-gray-300 p-3 text-right font-medium">{formatCurrency(receiptData.partsCost || 0)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="mb-8">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(receiptData.amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Service Tax (0%):</span>
                  <span className="font-medium">RM 0.00</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">SST (0%):</span>
                  <span className="font-medium">RM 0.00</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                  <span className="text-lg font-bold text-gray-900">TOTAL:</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(receiptData.amount)}</span>
                </div>
                <div className="text-center mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="font-bold text-green-700">PAID</p>
                  <p className="text-sm text-green-600">Payment Method: {receiptData.paymentMethod.replace("_", " ")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-8 p-4 border border-gray-300 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-2">Payment Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><span className="text-gray-600">Payment Method:</span> {receiptData.paymentMethod.replace("_", " ")}</p>
                <p><span className="text-gray-600">Amount Paid:</span> {formatCurrency(receiptData.amount)}</p>
              </div>
              <div>
                <p><span className="text-gray-600">Payment Date:</span> {formatDate(receiptData.paymentDate)}</p>
                <p><span className="text-gray-600">Payment Time:</span> {formatTime(receiptData.paymentDate)}</p>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="border-t border-gray-300 pt-6">
            <div className="grid grid-cols-3 gap-6 text-xs text-gray-600 mb-4">
              <div>
                <p className="font-bold mb-1">Terms & Conditions:</p>
                <p>1. Warranty valid for 30 days from invoice date</p>
                <p>2. Warranty covers only replaced parts</p>
                <p>3. Original invoice must be presented</p>
              </div>
              <div>
                <p className="font-bold mb-1">Payment Instructions:</p>
                <p>1. All payments are non-refundable</p>
                <p>2. Payment must be made within 7 days</p>
                <p>3. Bank transfer details available on request</p>
              </div>
              <div>
                <p className="font-bold mb-1">Contact Information:</p>
                <p>Email: {receiptData.workshopInfo.email}</p>
                <p>Phone: {receiptData.workshopInfo.phone}</p>
                <p>Website: {receiptData.workshopInfo.website}</p>
              </div>
            </div>
            <div className="text-center pt-4 border-t border-gray-300">
              <p className="text-sm text-gray-600 mb-2">*** This is a computer-generated receipt. No signature required. ***</p>
              <p className="text-xs text-gray-500">Printed on: {new Date().toLocaleDateString('en-MY')} at {new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Hidden when printing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
        <button
          onClick={handlePrint}
          disabled={isGeneratingPDF}
          className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span className="text-xl">🖨️</span>
          Print Receipt
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGeneratingPDF ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <span className="text-xl">📥</span>
              Download PDF
            </>
          )}
        </button>
        <button
          onClick={handleEmailReceipt}
          disabled={isLoading || receiptData.customerEmail === "N/A"}
          className="bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Sending...
            </>
          ) : (
            <>
              <span className="text-xl">📧</span>
              Email to Customer
            </>
          )}
        </button>
      </div>

      {receiptData.customerEmail === "N/A" && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-400 text-sm print:hidden">
          ⚠️ Customer email not available. Update customer profile to enable email receipt.
        </div>
      )}

      {/* Close Button - Hidden when printing */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all print:hidden"
        >
          Close
        </button>
      )}

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-content, .receipt-content * {
            visibility: visible;
          }
          .receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            size: A4;
            margin: ${MARGIN_MM}mm;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptGenerator;