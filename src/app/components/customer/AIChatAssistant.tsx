'use client';
import { useState, useEffect, useRef } from 'react';

interface AIChat {
  id: number;
  question: string;
  answer: string;
  timestamp: string;
  type?: 'chat' | 'booking' | 'action';
  action?: string;
  data?: any;
}

interface Vehicle {
  id: number;
  model: string;
  registrationNumber: string;
  year?: number;
  type?: string;
}

interface Booking {
  id: number;
  vehicleId: number;
  bookingDate: string;
  status: string;
  reportedIssue?: string;
  estimatedCost?: number;
  vehicle: {
    model: string;
    registrationNumber: string;
  };
  service?: {
    serviceStatus: string;
    serviceCost: number;
  };
}

interface ServiceType {
  id: string;
  name: string;
  price: number;
  duration: string;
  includes: string[];
}

interface AIChatAssistantProps {
  onBookingCreated?: () => void;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ onBookingCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<AIChat[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [newBooking, setNewBooking] = useState({
    vehicleId: '',
    serviceType: 'basic_service',
    bookingDate: '',
    bookingTime: '09:00',
    reportedIssue: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Service types with pricing
  const serviceTypes: ServiceType[] = [
    {
      id: 'basic_service',
      name: 'Basic Service',
      price: 120,
      duration: '1-2 hours',
      includes: ['Oil change', 'Filter replacement', 'Basic inspection'],
    },
    {
      id: 'premium_service',
      name: 'Premium Service',
      price: 250,
      duration: '2-3 hours',
      includes: ['Full oil change', 'All filters', 'Comprehensive inspection', 'Brake check'],
    },
    {
      id: 'engine_repair',
      name: 'Engine Repair',
      price: 500,
      duration: '3-4 hours',
      includes: ['Engine diagnostics', 'Repairs as needed'],
    },
    {
      id: 'brake_service',
      name: 'Brake Service',
      price: 180,
      duration: '1-2 hours',
      includes: ['Brake inspection', 'Pad replacement', 'Rotor check'],
    },
    {
      id: 'ac_repair',
      name: 'AC Repair',
      price: 200,
      duration: '2-3 hours',
      includes: ['AC diagnostics', 'Coolant recharge', 'System check'],
    },
    {
      id: 'electrical',
      name: 'Electrical System',
      price: 150,
      duration: '1-3 hours',
      includes: ['Battery check', 'Wiring inspection', 'Component testing'],
    },
    {
      id: 'general',
      name: 'General Checkup',
      price: 100,
      duration: '1 hour',
      includes: ['Basic diagnostics', 'Safety inspection'],
    },
  ];

  // Enhanced Quick Actions with Booking Features
  const quickActions = [
    {
      label: 'Book a Service',
      message: 'I want to book a service appointment',
      icon: '📅',
    },
    {
      label: 'View My Bookings',
      message: 'Show me my upcoming bookings',
      icon: '📋',
    },
    {
      label: 'Cancel Booking',
      message: 'I need to cancel a booking',
      icon: '❌',
    },
    {
      label: 'Service Pricing',
      message: 'What are your service prices?',
      icon: '💰',
    },
    {
      label: 'Emergency Help',
      message: 'I need emergency vehicle assistance',
      icon: '🚨',
    },
    {
      label: 'Vehicle Issues',
      message: 'My car is making strange noises',
      icon: '🔧',
    },
  ];

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatHistory]);

  const fetchInitialData = async () => {
    try {
      const [chatResponse, vehiclesResponse, bookingsResponse] = await Promise.all([
        fetch('/api/customer/support/ai-chat'),
        fetch('/api/customer/vehicles'),
        fetch('/api/customer/bookings?status=Pending,Confirmed'),
      ]);

      // Handle chat history
      if (chatResponse.ok) {
        const chatResult = await chatResponse.json();
        setAiChatHistory(chatResult.chats || []);
      }

      // Handle vehicles
      if (vehiclesResponse.ok) {
        const vehiclesResult = await vehiclesResponse.json();
        setVehicles(vehiclesResult.vehicles || []);
      }

      // Handle bookings
      if (bookingsResponse.ok) {
        const bookingsResult = await bookingsResponse.json();
        setBookings(bookingsResult.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    setIsLoading(true);

    // Add user message to chat
    const userChat: AIChat = {
      id: Date.now(),
      question: userMessage,
      answer: '',
      timestamp: new Date().toISOString(),
      type: 'chat',
    };

    setAiChatHistory((prev) => [...prev, userChat]);
    const currentMessage = userMessage;
    setUserMessage('');

    try {
      // Use the main AI chat endpoint
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          context: 'You are a helpful AI assistant for CARVO Auto Service in Malaysia. You can help with bookings, services, pricing, and vehicle advice. You have access to booking management features.',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Update chat with AI response and any actions
      const updatedChat = {
        ...userChat,
        answer: data.response,
        type: data.type || 'chat',
        action: data.action,
        data: data.data,
      };

      setAiChatHistory((prev) =>
        prev.map((chat) => (chat.id === userChat.id ? updatedChat : chat))
      );

      // Save to database
      await fetch('/api/customer/support/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentMessage,
          answer: data.response,
          type: 'ai',
          metadata: {
            action: data.action,
            data: data.data,
          },
        }),
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAiChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === userChat.id
            ? {
                ...chat,
                answer: 'Sorry, I\'m having trouble responding right now. Please try again later or contact our support team directly at 03-1234 5678.',
              }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingAction = async (action: string, bookingId?: number, data?: any) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/customer/bookings/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          bookingId,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process booking action');
      }

      const result = await response.json();

      // Add success message to chat
      const successChat: AIChat = {
        id: Date.now(),
        question: '',
        answer: `${result.message}\n\n${
          action === 'cancel'
            ? 'Your booking has been cancelled successfully.'
            : 'Your booking has been created successfully.'
        }`,
        timestamp: new Date().toISOString(),
        type: 'action',
      };

      setAiChatHistory((prev) => [...prev, successChat]);

      // Refresh bookings data and notify parent
      fetchInitialData();
      onBookingCreated?.();
    } catch (error) {
      console.error('Booking action error:', error);

      const errorChat: AIChat = {
        id: Date.now(),
        question: '',
        answer: 'Sorry, there was an error processing your booking request. Please try again or contact support.',
        timestamp: new Date().toISOString(),
        type: 'action',
      };

      setAiChatHistory((prev) => [...prev, errorChat]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!newBooking.vehicleId || !newBooking.bookingDate) {
      alert('Please select a vehicle and date');
      return;
    }

    const bookingDateTime = `${newBooking.bookingDate}T${newBooking.bookingTime}`;

    await handleBookingAction('create', undefined, {
      vehicleId: parseInt(newBooking.vehicleId),
      serviceType: newBooking.serviceType,
      bookingDate: bookingDateTime,
      reportedIssue: newBooking.reportedIssue,
      urgency: newBooking.urgency,
    });

    setIsCreatingBooking(false);
    setNewBooking({
      vehicleId: '',
      serviceType: 'basic_service',
      bookingDate: '',
      bookingTime: '09:00',
      reportedIssue: '',
      urgency: 'medium',
    });
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await handleBookingAction('cancel', bookingId);
    }
  };

  const renderChatMessage = (chat: AIChat) => {
    if (chat.type === 'booking' && chat.action === 'create_booking') {
      return (
        <div className="flex justify-start">
          <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl rounded-bl-none p-4 max-w-[80%]">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-purple-400">🤖</span>
              <span className="text-purple-400 text-sm font-medium">CARVO AI</span>
            </div>
            <p className="text-white whitespace-pre-wrap mb-4">{chat.answer}</p>
            <button
              onClick={() => setIsCreatingBooking(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold transition-all"
            >
              📅 Book Service Now
            </button>
          </div>
        </div>
      );
    }

    if (chat.type === 'booking' && chat.action === 'view_bookings' && chat.data?.bookings) {
      return (
        <div className="flex justify-start">
          <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl rounded-bl-none p-4 max-w-[80%]">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-purple-400">🤖</span>
              <span className="text-purple-400 text-sm font-medium">CARVO AI</span>
            </div>
            <p className="text-white whitespace-pre-wrap mb-4">{chat.answer}</p>
            <div className="space-y-2">
              {chat.data.bookings.map((booking: Booking) => (
                <div key={booking.id} className="bg-gray-600/30 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{booking.vehicle.model}</p>
                      <p className="text-gray-300 text-sm">
                        {new Date(booking.bookingDate).toLocaleDateString()} - {booking.status}
                      </p>
                      {booking.reportedIssue && (
                        <p className="text-gray-400 text-xs mt-1">{booking.reportedIssue}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Regular chat messages
    return (
      <div className="space-y-4">
        {/* User Question */}
        {chat.question && (
          <div className="flex justify-end">
            <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl rounded-br-none p-4 max-w-[80%]">
              <p className="text-white">{chat.question}</p>
              <p className="text-amber-400 text-xs mt-2 text-right">
                {formatDate(chat.timestamp)}
              </p>
            </div>
          </div>
        )}

        {/* AI Response */}
        {chat.answer && (
          <div className="flex justify-start">
            <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl rounded-bl-none p-4 max-w-[80%]">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-purple-400">🤖</span>
                <span className="text-purple-400 text-sm font-medium">CARVO AI</span>
              </div>
              <p className="text-white whitespace-pre-wrap">{chat.answer}</p>
              <p className="text-gray-400 text-xs mt-2">
                {formatDate(chat.timestamp)}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get selected service details
  const selectedService = serviceTypes.find((service) => service.id === newBooking.serviceType);

  // Generate time slots
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  // Calculate min date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Calculate max date (2 weeks from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">CARVO AI Assistant</h3>
                  <p className="text-gray-400 text-sm">Powered by Ollama • Can manage bookings • Online</p>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    ● Live
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {aiChatHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-bold text-white mb-2">Hello! I'm your CARVO AI Assistant</h3>
                  <p className="text-gray-400 mb-4">
                    I can help you with services, bookings, pricing, and any vehicle-related questions.
                    I can even create, view, and cancel bookings for you!
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                    {quickActions.slice(0, 4).map((action, index) => (
                      <button
                        key={index}
                        onClick={() => setUserMessage(action.message)}
                        className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl p-3 text-amber-400 text-sm transition-all"
                      >
                        <span className="mr-2">{action.icon}</span>
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                aiChatHistory.map((chat) => (
                  <div key={chat.id}>{renderChatMessage(chat)}</div>
                ))
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl rounded-bl-none p-4 max-w-[80%]">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-purple-400">🤖</span>
                      <span className="text-purple-400 text-sm font-medium">CARVO AI</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-300"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-gray-700/50">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about services, book appointments, cancel bookings..."
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !userMessage.trim()}
                  className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2"
                >
                  <span>📤</span>
                  <span>Send</span>
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Press Enter to send • I can manage your bookings and answer questions
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h4 className="text-white font-semibold mb-4">⚡ Quick Actions</h4>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setUserMessage(action.message)}
                  disabled={isLoading}
                  className="w-full text-left p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl text-gray-300 hover:text-white transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Bookings Preview */}
          {bookings.length > 0 && (
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h4 className="text-white font-semibold mb-4">📅 Upcoming Bookings</h4>
              <div className="space-y-3">
                {bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="bg-gray-700/30 rounded-lg p-3">
                    <p className="text-white text-sm font-medium">{booking.vehicle.model}</p>
                    <p className="text-gray-300 text-xs">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                    <p className={`text-xs mt-1 ${
                      booking.status === 'Confirmed' ? 'text-green-400' : 
                      booking.status === 'Pending' ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {booking.status}
                    </p>
                  </div>
                ))}
                {bookings.length > 3 && (
                  <button
                    onClick={() => setUserMessage('Show me all my bookings')}
                    className="w-full text-amber-400 text-sm hover:text-amber-300 transition-colors"
                  >
                    View all {bookings.length} bookings →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Contact Support */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h4 className="text-white font-semibold mb-4">📞 Contact Support</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <span className="text-amber-400">📞</span>
                <span className="text-white">03-1234 5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-amber-400">📧</span>
                <span className="text-white">support@carvo.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-amber-400">🕒</span>
                <span className="text-white">Mon-Sat: 8AM-6PM</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-amber-400">🚨</span>
                <span className="text-white">Emergency: 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Booking Creation Modal */}
      {isCreatingBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white">Book Service Appointment</h3>
                <button
                  onClick={() => setIsCreatingBooking(false)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Form */}
                <div className="space-y-6">
                  <h4 className="text-white font-semibold text-lg">Service Details</h4>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Select Vehicle *</label>
                    <select
                      value={newBooking.vehicleId}
                      onChange={(e) => setNewBooking({ ...newBooking, vehicleId: e.target.value })}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Choose your vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.model} ({vehicle.registrationNumber}) {vehicle.year && `- ${vehicle.year}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Service Type *</label>
                    <select
                      value={newBooking.serviceType}
                      onChange={(e) => setNewBooking({ ...newBooking, serviceType: e.target.value })}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    >
                      {serviceTypes.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - RM{service.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Date *</label>
                      <input
                        type="date"
                        value={newBooking.bookingDate}
                        onChange={(e) => setNewBooking({ ...newBooking, bookingDate: e.target.value })}
                        min={minDate}
                        max={maxDateStr}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Time *</label>
                      <select
                        value={newBooking.bookingTime}
                        onChange={(e) => setNewBooking({ ...newBooking, bookingTime: e.target.value })}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                      >
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Urgency Level</label>
                    <select
                      value={newBooking.urgency}
                      onChange={(e) => setNewBooking({ ...newBooking, urgency: e.target.value as any })}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="low">Low - Routine maintenance</option>
                      <option value="medium">Medium - Needs attention soon</option>
                      <option value="high">High - Vehicle issues affecting performance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Issue Description</label>
                    <textarea
                      value={newBooking.reportedIssue}
                      onChange={(e) => setNewBooking({ ...newBooking, reportedIssue: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 resize-none"
                      placeholder="Describe any specific issues, sounds, or symptoms you're experiencing..."
                    />
                  </div>
                </div>

                {/* Service Summary */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                  <h4 className="text-white font-semibold text-lg mb-4">Service Summary</h4>

                  {selectedService && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{selectedService.name}</p>
                          <p className="text-gray-400 text-sm">{selectedService.duration}</p>
                        </div>
                        <p className="text-amber-400 font-bold text-lg">RM{selectedService.price}</p>
                      </div>

                      <div className="border-t border-gray-700/50 pt-4">
                        <p className="text-gray-400 text-sm mb-2">Includes:</p>
                        <ul className="text-gray-300 text-sm space-y-1">
                          {selectedService.includes.map((item, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <span className="text-green-400">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {newBooking.vehicleId && (
                        <div className="border-t border-gray-700/50 pt-4">
                          <p className="text-gray-400 text-sm mb-2">Vehicle:</p>
                          <p className="text-white text-sm">
                            {vehicles.find((v) => v.id === parseInt(newBooking.vehicleId))?.model}
                          </p>
                        </div>
                      )}

                      {newBooking.bookingDate && (
                        <div className="border-t border-gray-700/50 pt-4">
                          <p className="text-gray-400 text-sm mb-2">Appointment:</p>
                          <p className="text-white text-sm">
                            {new Date(newBooking.bookingDate).toLocaleDateString()} at {newBooking.bookingTime}
                          </p>
                        </div>
                      )}

                      <div className="border-t border-gray-700/50 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400">Estimated Cost:</span>
                          <span className="text-amber-400 font-bold">RM{selectedService.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">GST (6%):</span>
                          <span className="text-gray-300">RM{(selectedService.price * 0.06).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700/50">
                          <span className="text-white font-semibold">Total:</span>
                          <span className="text-amber-400 font-bold text-lg">
                            RM{(selectedService.price * 1.06).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleCreateBooking}
                    disabled={!newBooking.vehicleId || !newBooking.bookingDate}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold transition-all mt-6 flex items-center justify-center space-x-2"
                  >
                    <span>📅</span>
                    <span>Confirm Booking</span>
                  </button>

                  <p className="text-gray-400 text-xs text-center mt-3">
                    You can cancel or reschedule up to 24 hours before your appointment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;