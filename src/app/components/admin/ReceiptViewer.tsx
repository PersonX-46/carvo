"use client";
import { useState } from "react";
import { Download, Printer, ZoomIn, ZoomOut, RotateCw, X } from "lucide-react";

interface ReceiptViewerProps {
  receipt: {
    url: string;
    fileName: string;
    fileType: string;
    uploadedAt: string;
    verified: boolean;
  };
  paymentDetails: {
    customerName: string;
    amount: number;
    transactionId: string;
    date: string;
  };
  onClose: () => void;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  receipt,
  paymentDetails,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = receipt.url;
    link.download = receipt.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open(receipt.url, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const isImage = receipt.fileType.startsWith("image/");
  const isPDF = receipt.fileType === "application/pdf";

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">Receipt Viewer</h3>
            <p className="text-gray-400 text-sm">
              {paymentDetails.customerName} • {paymentDetails.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Payment Summary */}
        <div className="p-4 bg-gray-800/50 border-b border-gray-800">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Transaction ID</p>
              <p className="text-white font-mono">{paymentDetails.transactionId}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Amount</p>
              <p className="text-amber-400 font-bold">
                RM {paymentDetails.amount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">File Type</p>
              <p className="text-white">{receipt.fileType}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                  receipt.verified
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {receipt.verified ? "✅ Verified" : "⏳ Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-gray-800 bg-gray-800/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(zoom + 0.1)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setRotation((rotation + 90) % 360)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              title="Rotate"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center text-sm text-gray-400">
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={handlePrint}
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-800/20">
          <div className="flex justify-center items-center min-h-[400px]">
            {isImage ? (
              <div
                className="bg-white rounded-lg shadow-2xl overflow-hidden"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
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
                <p className="text-gray-300">Preview not available for this file type</p>
                <p className="text-gray-400 text-sm mt-2">
                  File type: {receipt.fileType}
                </p>
                <button
                  onClick={handleDownload}
                  className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                >
                  Download File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              <p>
                Uploaded: {new Date(receipt.uploadedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (confirm("Mark this receipt as verified?")) {
                    // API call to verify receipt
                    alert("Receipt marked as verified");
                  }
                }}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
              >
                ✅ Mark as Verified
              </button>
              <button
                onClick={() => {
                  const reason = prompt("Enter rejection reason:");
                  if (reason) {
                    // API call to reject receipt
                    alert(`Receipt rejected: ${reason}`);
                  }
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
              >
                ❌ Reject Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewer;