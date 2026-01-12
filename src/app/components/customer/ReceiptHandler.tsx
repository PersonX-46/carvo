"use client";

import type { ServiceBooking } from "./BookingManagement"; // Import as type

export const handlePrintReceipt = async (booking: ServiceBooking) => {
  try {
    // Fetch receipt data from your API
    const response = await fetch(`/api/customer/bookings/${booking.id}/receipt`);
    const data = await response.json();

    // Check if receipt can be generated
    if (!response.ok || !data.canGenerateReceipt) {
      // Create a beautiful alert modal instead of default alert
      const alertMessage = data.status === "pending" 
        ? "⏳ Your payment receipt is pending verification by admin. You will be able to print the receipt once it is verified."
        : data.status === "rejected"
        ? `❌ Receipt rejected: ${data.rejectionReason || "No reason provided"}\n\nPlease contact admin for assistance.`
        : data.message || "Receipt verification required. Please contact admin.";
      
      showBeautifulAlert(alertMessage, data.status === "pending" ? "warning" : "error");
      return;
    }

    // Create a new window for viewing/printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showBeautifulAlert("Please allow popups to view receipt", "info");
      return;
    }

    // Create modern receipt HTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${booking.vehicle.registrationNumber}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, 
              #0a0a0a 0%, 
              #1a1a2e 50%, 
              #16213e 100%);
            color: #f1f5f9;
            min-height: 100vh;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
          }
          
          /* Animated background particles */
          body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
              radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.08) 0%, transparent 50%);
            pointer-events: none;
            z-index: -1;
          }
          
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            border: 1px solid rgba(251, 146, 60, 0.3);
            box-shadow: 
              0 25px 50px -12px rgba(0, 0, 0, 0.5),
              0 0 60px rgba(245, 158, 11, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
            overflow: hidden;
            position: relative;
            animation: fadeInUp 0.6s ease-out;
          }
          
          /* Animated gradient border effect */
          .receipt-container::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, 
              #f59e0b, 
              #3b82f6, 
              #10b981, 
              #f59e0b);
            border-radius: 26px;
            z-index: -1;
            filter: blur(20px);
            opacity: 0.5;
            animation: gradientShift 8s ease infinite;
            background-size: 400% 400%;
          }
          
          .receipt-header {
            background: linear-gradient(135deg, 
              #f59e0b 0%, 
              #d97706 100%);
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
            border-bottom: 2px solid rgba(251, 146, 60, 0.4);
          }
          
          .receipt-header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              45deg,
              transparent 30%,
              rgba(255, 255, 255, 0.1) 50%,
              transparent 70%
            );
            animation: shimmer 3s infinite;
          }
          
          .receipt-title {
            font-family: 'Poppins', sans-serif;
            font-size: 42px;
            font-weight: 800;
            color: white;
            margin-bottom: 8px;
            letter-spacing: 2px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            position: relative;
            display: inline-block;
          }
          
          .receipt-title::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 4px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 2px;
          }
          
          .receipt-subtitle {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.95);
            font-weight: 500;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 20px;
          }
          
          .verification-badge {
            background: rgba(34, 197, 94, 0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(34, 197, 94, 0.4);
            border-radius: 16px;
            padding: 12px 24px;
            display: inline-flex;
            align-items: center;
            gap: 12px;
            margin-top: 16px;
            animation: pulse 2s infinite;
            box-shadow: 0 8px 32px rgba(34, 197, 94, 0.2);
          }
          
          .verified-text {
            font-weight: 700;
            color: #22c55e;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
          }
          
          .verified-by {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.8);
            padding-left: 12px;
            border-left: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .receipt-content {
            padding: 40px;
          }
          
          .section {
            background: linear-gradient(145deg, 
              rgba(30, 41, 59, 0.7) 0%,
              rgba(15, 23, 42, 0.5) 100%);
            border-radius: 20px;
            padding: 28px;
            margin-bottom: 28px;
            border: 1px solid rgba(148, 163, 184, 0.15);
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .section:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
            border-color: rgba(245, 158, 11, 0.3);
          }
          
          .section-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 20px;
            font-weight: 700;
            color: #f59e0b;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
          }
          
          .section-title::before {
            content: '';
            display: block;
            width: 6px;
            height: 24px;
            background: linear-gradient(180deg, #f59e0b, #d97706);
            border-radius: 3px;
          }
          
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
            position: relative;
            transition: all 0.3s ease;
          }
          
          .info-row:hover {
            border-bottom-color: rgba(245, 158, 11, 0.3);
            background: rgba(245, 158, 11, 0.05);
            border-radius: 8px;
            padding: 12px;
            margin: -12px;
          }
          
          .info-label {
            font-size: 14px;
            color: #94a3b8;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .info-label::before {
            content: '→';
            color: #f59e0b;
            font-weight: bold;
          }
          
          .info-value {
            font-size: 15px;
            color: #f1f5f9;
            font-weight: 600;
          }
          
          .transaction-id {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: 800;
            color: #f59e0b;
            letter-spacing: 1px;
            text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
          }
          
          .booking-id {
            font-size: 18px;
            color: #f1f5f9;
            font-weight: 700;
            background: rgba(59, 130, 246, 0.2);
            padding: 4px 12px;
            border-radius: 8px;
            display: inline-block;
          }
          
          .customer-name {
            font-size: 22px;
            font-weight: 700;
            color: #f1f5f9;
            background: linear-gradient(45deg, #f59e0b, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .vehicle-info {
            font-size: 18px;
            color: #f1f5f9;
            font-weight: 600;
          }
          
          .registration {
            font-family: 'Courier New', monospace;
            font-size: 16px;
            color: #94a3b8;
            background: rgba(30, 41, 59, 0.5);
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid rgba(148, 163, 184, 0.2);
          }
          
          .payment-method {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 17px;
            font-weight: 600;
            background: rgba(59, 130, 246, 0.15);
            padding: 10px 18px;
            border-radius: 12px;
            border: 1px solid rgba(59, 130, 246, 0.3);
          }
          
          .amount {
            font-size: 42px;
            font-weight: 900;
            color: #f59e0b;
            text-align: right;
            background: linear-gradient(45deg, #f59e0b, #fbbf24);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 4px 20px rgba(245, 158, 11, 0.2);
            line-height: 1;
          }
          
          .separator {
            height: 2px;
            background: linear-gradient(90deg, 
              transparent, 
              rgba(245, 158, 11, 0.5), 
              transparent);
            margin: 32px 0;
            position: relative;
          }
          
          .separator::before {
            content: '✦';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #f59e0b;
            background: rgba(15, 23, 42, 0.9);
            padding: 0 12px;
            font-size: 18px;
          }
          
          .verification-section {
            background: linear-gradient(145deg, 
              rgba(34, 197, 94, 0.1) 0%,
              rgba(34, 197, 94, 0.05) 100%);
            border: 1px solid rgba(34, 197, 94, 0.3);
          }
          
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 1px;
          }
          
          .status-verified {
            background: linear-gradient(135deg, 
              rgba(34, 197, 94, 0.2) 0%, 
              rgba(34, 197, 94, 0.3) 100%);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.4);
            box-shadow: 0 8px 32px rgba(34, 197, 94, 0.2);
          }
          
          .footer {
            text-align: center;
            padding: 40px;
            background: linear-gradient(180deg, 
              transparent 0%,
              rgba(15, 23, 42, 0.8) 100%);
            border-top: 1px solid rgba(148, 163, 184, 0.1);
            position: relative;
          }
          
          .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 10%;
            right: 10%;
            height: 1px;
            background: linear-gradient(90deg, 
              transparent, 
              rgba(245, 158, 11, 0.5), 
              transparent);
          }
          
          .footer p {
            color: #94a3b8;
            font-size: 15px;
            margin: 6px 0;
          }
          
          .contact-info {
            display: flex;
            justify-content: center;
            gap: 32px;
            margin: 24px 0;
            flex-wrap: wrap;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #f59e5f;
            font-size: 14px;
            background: rgba(245, 158, 11, 0.1);
            padding: 8px 16px;
            border-radius: 10px;
            border: 1px solid rgba(245, 158, 11, 0.2);
            transition: all 0.3s ease;
          }
          
          .contact-item:hover {
            transform: translateY(-2px);
            background: rgba(245, 158, 11, 0.2);
            border-color: rgba(245, 158, 11, 0.4);
          }
          
          .button-container {
            position: fixed;
            bottom: 40px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: center;
            gap: 20px;
            padding: 0 20px;
            z-index: 100;
          }
          
          .print-button {
            background: linear-gradient(135deg, 
              #f59e0b 0%, 
              #d97706 100%);
            color: white;
            border: none;
            padding: 18px 36px;
            border-radius: 16px;
            font-size: 17px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 
              0 12px 30px rgba(245, 158, 11, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            align-items: center;
            gap: 12px;
            letter-spacing: 0.5px;
            position: relative;
            overflow: hidden;
          }
          
          .print-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.2),
              transparent
            );
            transition: left 0.6s;
          }
          
          .print-button:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 
              0 20px 40px rgba(245, 158, 11, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.2);
          }
          
          .print-button:hover::before {
            left: 100%;
          }
          
          .print-button:active {
            transform: translateY(-2px) scale(1.02);
          }
          
          /* Save PDF Button */
          .save-button {
            background: linear-gradient(135deg, 
              #3b82f6 0%, 
              #1d4ed8 100%);
            color: white;
            border: none;
            padding: 18px 36px;
            border-radius: 16px;
            font-size: 17px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 12px 30px rgba(59, 130, 246, 0.3);
            transition: all 0.4s ease;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .save-button:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 20px 40px rgba(59, 130, 246, 0.4);
          }
          
          /* Animations */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes gradientShift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          
          @keyframes shimmer {
            0% {
              transform: translateX(-100%) translateY(-100%) rotate(45deg);
            }
            100% {
              transform: translateX(100%) translateY(100%) rotate(45deg);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              box-shadow: 0 8px 32px rgba(34, 197, 94, 0.2);
            }
            50% {
              box-shadow: 0 8px 32px rgba(34, 197, 94, 0.4);
            }
          }
          
          /* Print styles */
          @media print {
            body {
              background: white !important;
              color: black !important;
              padding: 0 !important;
            }
            
            .receipt-container {
              max-width: 100% !important;
              margin: 0 !important;
              border: 2px solid #ddd !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              background: white !important;
            }
            
            .receipt-container::before,
            .receipt-header::before {
              display: none !important;
            }
            
            .receipt-header {
              background: #f59e0b !important;
              color: white !important;
            }
            
            .print-button, .save-button {
              display: none !important;
            }
            
            .section {
              background: white !important;
              color: black !important;
              border: 1px solid #ddd !important;
              break-inside: avoid;
            }
            
            .section-title {
              color: #d97706 !important;
            }
            
            .info-label {
              color: #666 !important;
            }
            
            .info-value, .customer-name, .vehicle-info {
              color: black !important;
            }
            
            .amount {
              color: #d97706 !important;
              background: none !important;
              -webkit-text-fill-color: #d97706 !important;
            }
            
            .verification-badge {
              background: #f0fdf4 !important;
              border: 1px solid #bbf7d0 !important;
            }
            
            .verified-text {
              color: #16a34a !important;
            }
            
            .contact-item {
              background: #fef3c7 !important;
              border: 1px solid #fde68a !important;
            }
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            .receipt-container {
              border-radius: 16px;
              margin: 10px;
            }
            
            .receipt-header {
              padding: 30px 20px;
            }
            
            .receipt-title {
              font-size: 32px;
            }
            
            .receipt-content {
              padding: 24px;
            }
            
            .grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }
            
            .amount {
              font-size: 36px;
            }
            
            .contact-info {
              flex-direction: column;
              gap: 12px;
              align-items: center;
            }
            
            .button-container {
              flex-direction: column;
              gap: 12px;
            }
            
            .print-button, .save-button {
              width: 100%;
              justify-content: center;
            }
          }
          
          /* Watermark */
          .watermark {
            position: fixed;
            bottom: 20px;
            right: 20px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.1);
            user-select: none;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <!-- Header with verification badge -->
          <div class="receipt-header">
            <h1 class="receipt-title">
              <i class="fas fa-car"></i> CHENG<span style="color: #1d4ed8">SERVICE</span>
            </h1>
            <p class="receipt-subtitle">
              <i class="fas fa-file-invoice-dollar"></i> OFFICIAL PAYMENT RECEIPT
            </p>
            <div class="verification-badge">
              <span class="verified-text">
                <i class="fas fa-shield-check"></i> VERIFIED RECEIPT
              </span>
              <span class="verified-by">
                <i class="fas fa-user-check"></i> Verified by: ${data.verifiedBy || "Admin"}
              </span>
            </div>
          </div>
          
          <!-- Content -->
          <div class="receipt-content">
            <!-- Transaction Info -->
            <div class="section">
              <h2 class="section-title">
                <i class="fas fa-receipt"></i> Transaction Information
              </h2>
              <div class="grid">
                <div>
                  <div class="info-row">
                    <span class="info-label">Transaction ID</span>
                    <span class="transaction-id">${data.transactionId || 'TRX-' + String(booking.id).padStart(8, '0')}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Booking ID</span>
                    <span class="booking-id">#${booking.id}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Invoice No.</span>
                    <span class="info-value">INV-${String(booking.id).padStart(6, '0')}</span>
                  </div>
                </div>
                <div>
                  <div class="info-row">
                    <span class="info-label">
                      <i class="fas fa-calendar-alt"></i> Payment Date
                    </span>
                    <span class="info-value">${new Date(data.date).toLocaleDateString("en-MY", {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">
                      <i class="fas fa-clock"></i> Payment Time
                    </span>
                    <span class="info-value">${new Date(data.date).toLocaleTimeString("en-MY", {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">
                      <i class="fas fa-check-circle"></i> Verified Date
                    </span>
                    <span class="info-value">${new Date(data.verifiedAt || data.date).toLocaleDateString("en-MY")}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Customer & Vehicle -->
            <div class="section">
              <h2 class="section-title">
                <i class="fas fa-user-tie"></i> Customer Details
              </h2>
              <div class="grid">
                <div>
                  <div class="info-row">
                    <span class="info-label">Customer Name</span>
                    <span class="customer-name">${data.customerName || 'Customer'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">
                      <i class="fas fa-phone"></i> Contact
                    </span>
                    <span class="info-value">${data.customerPhone || 'Not Provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">
                      <i class="fas fa-envelope"></i> Email
                    </span>
                    <span class="info-value">${data.customerEmail || 'Not Provided'}</span>
                  </div>
                </div>
                <div>
                  <h3 class="section-title" style="font-size: 16px; margin-bottom: 16px;">
                    <i class="fas fa-car"></i> Vehicle Information
                  </h3>
                  <div class="info-row">
                    <span class="info-label">Vehicle Model</span>
                    <span class="vehicle-info">${booking.vehicle.model}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Registration</span>
                    <span class="registration">${booking.vehicle.registrationNumber}</span>
                  </div>
                  ${booking.vehicle.year ? `
                    <div class="info-row">
                      <span class="info-label">Year</span>
                      <span class="info-value">${booking.vehicle.year}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
            
            <!-- Payment Details -->
            <div class="section">
              <h2 class="section-title">
                <i class="fas fa-credit-card"></i> Payment Details
              </h2>
              <div>
                <div class="info-row">
                  <span class="info-label">Payment Method</span>
                  <div class="payment-method">
                    <i class="fas ${
                      data.paymentMethod === 'DuitNow' ? 'fa-mobile-alt' :
                      data.paymentMethod === 'Credit Card' ? 'fa-credit-card' :
                      data.paymentMethod === 'FPX' ? 'fa-university' : 'fa-wallet'
                    }"></i>
                    <span>${data.paymentMethod || 'Online Payment'}</span>
                  </div>
                </div>
                
                <div class="separator"></div>
                
                <div class="info-row">
                  <span class="info-label">
                    <i class="fas fa-tools"></i> Service Cost
                  </span>
                  <div style="text-align: right;">
                    <div class="amount">RM ${booking.finalCost?.toFixed(2) || '0.00'}</div>
                    <div style="font-size: 14px; color: #94a3b8; margin-top: 4px;">
                      ${booking.reportedIssue ? `Service: ${booking.reportedIssue.substring(0, 40)}${booking.reportedIssue.length > 40 ? '...' : ''}` : 'General Service'}
                    </div>
                  </div>
                </div>
                
                ${booking.service?.spareParts ? `
                  <div class="info-row">
                    <span class="info-label">
                      <i class="fas fa-cogs"></i> Spare Parts
                    </span>
                    <span class="info-value">${booking.service.spareParts}</span>
                  </div>
                ` : ''}
                
                ${booking.service?.repairNotes ? `
                  <div class="info-row">
                    <span class="info-label">
                      <i class="fas fa-sticky-note"></i> Service Notes
                    </span>
                    <span class="info-value">${booking.service.repairNotes.substring(0, 60)}...</span>
                  </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Verification Details -->
            <div class="section verification-section">
              <h2 class="section-title">
                <i class="fas fa-shield-alt"></i> Verification Details
              </h2>
              <div>
                <div class="info-row">
                  <span class="info-label">Payment Status</span>
                  <span class="status-badge status-verified">
                    <i class="fas fa-check-circle"></i> VERIFIED
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">
                    <i class="fas fa-user-check"></i> Verified By
                  </span>
                  <span class="info-value">${data.verifiedBy || 'ChengService Admin'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">
                    <i class="fas fa-calendar-check"></i> Verification Date
                  </span>
                  <span class="info-value">${new Date(data.verifiedAt || data.date).toLocaleString('en-MY', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>
            
            <!-- Service Worker Details -->
            ${booking.service?.worker ? `
              <div class="section">
                <h2 class="section-title">
                  <i class="fas fa-user-hard-hat"></i> Service Technician
                </h2>
                <div class="info-row">
                  <span class="info-label">Technician</span>
                  <span class="info-value" style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-user" style="color: #f59e0b;"></i>
                    ${booking.service.worker.name}
                  </span>
                </div>
                ${booking.service.worker.phone ? `
                  <div class="info-row">
                    <span class="info-label">Contact</span>
                    <span class="info-value">${booking.service.worker.phone}</span>
                  </div>
                ` : ''}
                ${booking.service.worker.specialization ? `
                  <div class="info-row">
                    <span class="info-label">Specialization</span>
                    <span class="info-value">${booking.service.worker.specialization}</span>
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p style="color: #f59e0b; font-weight: 600; font-size: 16px; margin-bottom: 8px;">
              <i class="fas fa-heart" style="color: #ef4444;"></i> Thank you for choosing ChengService
            </p>
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">
              Your satisfaction is our priority. Keep this receipt for warranty claims.
            </p>
            
            <div class="contact-info">
              <div class="contact-item">
                <i class="fas fa-phone-alt"></i>
                03-1234 5678
              </div>
              <div class="contact-item">
                <i class="fas fa-envelope"></i>
                info@chengservice.com
              </div>
              <div class="contact-item">
                <i class="fas fa-map-marker-alt"></i>
                123 Workshop Street, KL
              </div>
            </div>
            
            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(148, 163, 184, 0.1);">
              <p style="font-size: 12px; color: #64748b; line-height: 1.6;">
                <strong>Terms & Conditions:</strong> This receipt is proof of payment. 
                Warranty valid for 6 months from service date. 
                Please present this receipt for any warranty claims.
              </p>
              <p style="font-size: 11px; color: #475569; margin-top: 12px;">
                Receipt ID: ${String(booking.id).padStart(10, '0')} • 
                Generated: ${new Date().toLocaleString('en-MY')}
              </p>
            </div>
          </div>
        </div>
        
        <div class="button-container">
          <button class="print-button" onclick="window.print()">
            <i class="fas fa-print"></i> Print Receipt
          </button>
        </div>
        
        <div class="watermark">
          ChengService Receipt System v1.0
        </div>
        
        <script>
          // Add some interactive effects
          document.addEventListener('DOMContentLoaded', function() {
            // Add hover effects to sections
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
              section.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
              });
              section.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
              });
            });
            
            // Auto-close after print
            window.onafterprint = function() {
              setTimeout(() => {
                if (confirm('Would you like to close the receipt window?')) {
                  window.close();
                }
              }, 1000);
            };
            
            // Add keyboard shortcut for printing (Ctrl/Cmd + P)
            document.addEventListener('keydown', function(e) {
              if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                window.print();
              }
            });
          });
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();

    // Focus the new window
    printWindow.focus();
    
  } catch (error) {
    console.error("Error generating receipt:", error);
    showBeautifulAlert("Failed to generate receipt. Please try again.", "error");
  }
};

// Helper function for beautiful alerts
const showBeautifulAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
  const alertContainer = document.createElement('div');
  const colors = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-600',
    error: 'bg-gradient-to-r from-red-500 to-rose-600',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-600'
  };
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  alertContainer.innerHTML = `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-gray-900 rounded-2xl border border-gray-700 max-w-md w-full overflow-hidden">
        <div class="${colors[type]} p-6 text-white text-center">
          <div class="text-4xl mb-3">${icons[type]}</div>
          <h3 class="text-xl font-bold">${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
        </div>
        <div class="p-6">
          <p class="text-gray-300 text-center whitespace-pre-line">${message}</p>
          <div class="mt-6 flex justify-center">
            <button onclick="this.closest('.fixed').remove()" 
              class="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(alertContainer);
};