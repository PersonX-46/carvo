"use client";
import { ReactNode } from "react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  children,
  title = "Receipt"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl border border-green-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors text-2xl p-2 rounded-full hover:bg-gray-800"
              >
                ✕
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;