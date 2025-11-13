'use client';
import { useState, useEffect, useRef } from 'react';

interface SupportTicket {
  id: number;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  description: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

interface SupportMessage {
  id: number;
  ticketId: number;
  sender: 'customer' | 'support' | 'ai';
  message: string;
  timestamp: string;
  isAI?: boolean;
}

interface AIChat {
  id: number;
  question: string;
  answer: string;
  timestamp: string;
}

const CustomerSupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai-chat' | 'tickets' | 'faq'>('ai-chat');
  const [isLoading, setIsLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<AIChat[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    description: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // FAQ Data
  const faqCategories = [
    {
      id: 'booking',
      name: 'Booking & Appointments',
      icon: '📅',
      questions: [
        {
          question: 'How do I book a service appointment?',
          answer: 'You can book a service appointment through our website or mobile app. Go to the "Book Service" section, select your vehicle, choose the service type, and pick your preferred date and time.'
        },
        {
          question: 'Can I reschedule or cancel my booking?',
          answer: 'Yes, you can reschedule or cancel your booking up to 24 hours before the appointment time. Go to "My Bookings" and select the booking you want to modify.'
        },
        {
          question: 'What are your service hours?',
          answer: 'We are open Monday to Saturday from 8:00 AM to 6:00 PM. Sunday services are available for emergency cases only.'
        }
      ]
    },
    {
      id: 'pricing',
      name: 'Pricing & Payments',
      icon: '💰',
      questions: [
        {
          question: 'How are service costs calculated?',
          answer: 'Service costs include labor charges, spare parts (if needed), and GST. You\'ll receive an estimated cost during booking and the final cost after service completion.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept cash, credit/debit cards, online banking, and popular e-wallets like Touch \'n Go and GrabPay.'
        },
        {
          question: 'Do you offer any discounts or promotions?',
          answer: 'Yes, we regularly run promotions for loyal customers. Check our website or subscribe to our newsletter for the latest offers.'
        }
      ]
    },
    {
      id: 'vehicles',
      name: 'Vehicle Services',
      icon: '🚗',
      questions: [
        {
          question: 'What types of vehicles do you service?',
          answer: 'We service all types of passenger vehicles including cars, SUVs, and MPVs from all major brands.'
        },
        {
          question: 'How often should I service my vehicle?',
          answer: 'We recommend servicing every 5,000-10,000 km or every 6 months, whichever comes first. Check your vehicle manual for specific recommendations.'
        },
        {
          question: 'Do you provide loaner vehicles?',
          answer: 'Yes, we provide loaner vehicles for services that take more than 4 hours. Please request in advance during booking.'
        }
      ]
    },
    {
      id: 'technical',
      name: 'Technical Support',
      icon: '🔧',
      questions: [
        {
          question: 'What should I do if my check engine light is on?',
          answer: 'If your check engine light is on, please schedule a diagnostic service immediately. Avoid driving long distances until the issue is diagnosed.'
        },
        {
          question: 'How long does a typical service take?',
          answer: 'Basic services take 1-2 hours, while comprehensive services can take 3-4 hours. Major repairs may require 1-2 days.'
        },
        {
          question: 'Do you use genuine spare parts?',
          answer: 'We use both genuine OEM parts and high-quality aftermarket parts. We\'ll always discuss options with you before proceeding.'
        }
      ]
    }
  ];

  // Simulated data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockTickets: SupportTicket[] = [
          {
            id: 1,
            subject: 'Service Completion Delay',
            category: 'service',
            priority: 'high',
            status: 'in-progress',
            description: 'My vehicle service was supposed to be completed yesterday but it\'s still ongoing. Need update on completion time.',
            createdAt: '2024-01-15T10:30:00',
            updatedAt: '2024-01-16T14:20:00',
            messages: [
              {
                id: 1,
                ticketId: 1,
                sender: 'customer',
                message: 'When will my car be ready? It\'s been 2 days.',
                timestamp: '2024-01-15T10:30:00'
              },
              {
                id: 2,
                ticketId: 1,
                sender: 'support',
                message: 'We apologize for the delay. We\'re waiting for a specific part to arrive. Expected completion is tomorrow.',
                timestamp: '2024-01-15T11:15:00'
              }
            ]
          },
          {
            id: 2,
            subject: 'Invoice Query',
            category: 'billing',
            priority: 'medium',
            status: 'open',
            description: 'I noticed some charges on my invoice that I don\'t understand. Can you explain the breakdown?',
            createdAt: '2024-01-14T09:15:00',
            updatedAt: '2024-01-14T09:15:00',
            messages: [
              {
                id: 1,
                ticketId: 2,
                sender: 'customer',
                message: 'The labor charges seem higher than estimated.',
                timestamp: '2024-01-14T09:15:00'
              }
            ]
          },
          {
            id: 3,
            subject: 'Service Completed Successfully',
            category: 'feedback',
            priority: 'low',
            status: 'resolved',
            description: 'Great service! The technician was very professional.',
            createdAt: '2024-01-10T16:45:00',
            updatedAt: '2024-01-11T10:20:00',
            messages: [
              {
                id: 1,
                ticketId: 3,
                sender: 'customer',
                message: 'Thank you for the excellent service!',
                timestamp: '2024-01-10T16:45:00'
              },
              {
                id: 2,
                ticketId: 3,
                sender: 'support',
                message: 'Thank you for your feedback! We\'re glad to hear you had a good experience.',
                timestamp: '2024-01-11T10:20:00'
              }
            ]
          }
        ];

        const mockAIChat: AIChat[] = [
          {
            id: 1,
            question: 'How do I book a service?',
            answer: 'You can book a service through our website or mobile app. Go to the "Book Service" section, select your vehicle, choose the service type, and pick your preferred date and time. You can also call us directly at 03-1234 5678.',
            timestamp: '2024-01-16T09:30:00'
          }
        ];

        setSupportTickets(mockTickets);
        setAiChatHistory(mockAIChat);
        setIsLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatHistory]);

  // Simulate AI response using Ollama API
  const sendToOllama = async (message: string): Promise<string> => {
    // This is where you would integrate with your local Ollama API
    // For demo purposes, we'll simulate AI responses
    
    const responses = {
      'hello': 'Hello! I\'m your ChengService AI assistant. How can I help you with your vehicle service today?',
      'hi': 'Hi there! I\'m here to help with any questions about your vehicle services, bookings, or general inquiries.',
      'service': 'We offer various services including regular maintenance, brake service, AC service, tire rotation, full service, engine diagnostics, and more. Which service are you interested in?',
      'booking': 'You can book a service through our website, mobile app, or by calling us. Would you like me to guide you through the booking process?',
      'price': 'Service costs vary based on the type of service and your vehicle model. Basic services start from RM 50, while comprehensive services can range from RM 150-500. Would you like a specific quote?',
      'time': 'Most services take 1-4 hours depending on complexity. Basic maintenance usually takes 1-2 hours, while major services may take 3-4 hours or more.',
      'emergency': 'For emergency services, please call our hotline at 03-1234 5678. We provide 24/7 emergency support for breakdowns and urgent repairs.',
      'warranty': 'We offer a 6-month warranty on all our services and a 12-month warranty on replaced parts. All warranties are covered by our service guarantee.',
      'default': 'I understand you\'re asking about vehicle services. At ChengService, we provide comprehensive auto care including maintenance, repairs, and diagnostics. Could you please provide more specific details about what you need help with?'
    };

    const lowerMessage = message.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key) && key !== 'default') {
        return response;
      }
    }
    
    return responses.default;
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    setIsLoading(true);
    
    // Add user message to chat
    const userChat: AIChat = {
      id: aiChatHistory.length + 1,
      question: userMessage,
      answer: '',
      timestamp: new Date().toISOString()
    };

    setAiChatHistory(prev => [...prev, userChat]);
    const currentMessage = userMessage;
    setUserMessage('');

    try {
      // Simulate API call to Ollama
      const aiResponse = await sendToOllama(currentMessage);
      
      // Update the last message with AI response
      setAiChatHistory(prev => 
        prev.map(chat => 
          chat.id === userChat.id 
            ? { ...chat, answer: aiResponse }
            : chat
        )
      );
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAiChatHistory(prev => 
        prev.map(chat => 
          chat.id === userChat.id 
            ? { ...chat, answer: 'Sorry, I\'m having trouble responding right now. Please try again later or contact our support team directly.' }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.description) {
      alert('Please fill in all required fields');
      return;
    }

    const ticket: SupportTicket = {
      id: supportTickets.length + 1,
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'open',
      description: newTicket.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 1,
          ticketId: supportTickets.length + 1,
          sender: 'customer',
          message: newTicket.description,
          timestamp: new Date().toISOString()
        }
      ]
    };

    setSupportTickets(prev => [ticket, ...prev]);
    setNewTicket({
      subject: '',
      category: 'general',
      priority: 'medium',
      description: ''
    });
    setIsCreatingTicket(false);
    setActiveTab('tickets');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && aiChatHistory.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Customer Support</h2>
            <p className="text-gray-400">Get help and support for your vehicle services</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="text-gray-400 mt-4">Loading support...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Customer Support</h2>
          <p className="text-gray-400">Get help and support for your vehicle services</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex bg-gray-800/50 rounded-xl border border-gray-700 p-1">
            <button
              onClick={() => setActiveTab('ai-chat')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                activeTab === 'ai-chat' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🤖 AI Assistant
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                activeTab === 'tickets' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📧 Support Tickets
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                activeTab === 'faq' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ❓ FAQ
            </button>
          </div>
        </div>
      </div>

      {/* AI Chat Assistant */}
      {activeTab === 'ai-chat' && (
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
                    <h3 className="text-white font-semibold text-lg">ChengService AI Assistant</h3>
                    <p className="text-gray-400 text-sm">Powered by Ollama • Online</p>
                  </div>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      ● Live
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {aiChatHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-bold text-white mb-2">Hello! I'm your AI Assistant</h3>
                    <p className="text-gray-400">
                      Ask me about services, bookings, pricing, or any vehicle-related questions.
                    </p>
                  </div>
                ) : (
                  aiChatHistory.map((chat) => (
                    <div key={chat.id} className="space-y-4">
                      {/* User Question */}
                      <div className="flex justify-end">
                        <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl rounded-br-none p-4 max-w-[80%]">
                          <p className="text-white">{chat.question}</p>
                          <p className="text-amber-400 text-xs mt-2 text-right">
                            {formatDate(chat.timestamp)}
                          </p>
                        </div>
                      </div>

                      {/* AI Response */}
                      {chat.answer && (
                        <div className="flex justify-start">
                          <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl rounded-bl-none p-4 max-w-[80%]">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-purple-400">🤖</span>
                              <span className="text-purple-400 text-sm font-medium">AI Assistant</span>
                            </div>
                            <p className="text-white">{chat.answer}</p>
                            <p className="text-gray-400 text-xs mt-2">
                              {formatDate(chat.timestamp)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl rounded-bl-none p-4">
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
                    placeholder="Ask about services, bookings, pricing..."
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
                  Press Enter to send • AI responses may take a few seconds
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h4 className="text-white font-semibold mb-4">💡 Quick Questions</h4>
              <div className="space-y-2">
                {[
                  'How do I book a service?',
                  'What are your service hours?',
                  'How much does a basic service cost?',
                  'Do you provide emergency services?'
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setUserMessage(question)}
                    className="w-full text-left p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl text-gray-300 hover:text-white transition-all text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h4 className="text-white font-semibold mb-4">📞 Contact Support</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-amber-400">📞</span>
                  <span className="text-white">03-1234 5678</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-amber-400">📧</span>
                  <span className="text-white">support@chengservice.com</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-amber-400">🕒</span>
                  <span className="text-white">Mon-Sat: 8AM-6PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Tickets */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">My Support Tickets</h3>
              <p className="text-gray-400">Track your support requests and communications</p>
            </div>
            <button
              onClick={() => setIsCreatingTicket(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2"
            >
              <span>➕</span>
              <span>New Ticket</span>
            </button>
          </div>

          {/* Create Ticket Modal */}
          {isCreatingTicket && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-gray-900 rounded-2xl border border-amber-500/30 max-w-2xl w-full">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-white">Create Support Ticket</h3>
                    <button
                      onClick={() => setIsCreatingTicket(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Subject *</label>
                      <input
                        type="text"
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                        placeholder="Brief description of your issue"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Category</label>
                        <select
                          value={newTicket.category}
                          onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="service">Service Issue</option>
                          <option value="billing">Billing/Payment</option>
                          <option value="technical">Technical Support</option>
                          <option value="feedback">Feedback</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Priority</label>
                        <select
                          value={newTicket.priority}
                          onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as any})}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Description *</label>
                      <textarea
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                        rows={4}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 resize-none"
                        placeholder="Please provide detailed information about your issue..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-800">
                    <button
                      onClick={handleCreateTicket}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-xl font-semibold transition-all"
                    >
                      Create Ticket
                    </button>
                    <button
                      onClick={() => setIsCreatingTicket(false)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all border border-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tickets List */}
          <div className="space-y-4">
            {supportTickets.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-12 border border-gray-700/50 text-center">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-2xl font-bold text-white mb-2">No support tickets</h3>
                <p className="text-gray-400 mb-6">You haven't created any support tickets yet.</p>
                <button
                  onClick={() => setIsCreatingTicket(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center space-x-2"
                >
                  <span>📧</span>
                  <span>Create Your First Ticket</span>
                </button>
              </div>
            ) : (
              supportTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-semibold text-lg mb-1">
                            {ticket.subject}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            Ticket #{ticket.id} • {formatDate(ticket.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm mb-4">
                        {ticket.description}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          Category: <span className="text-amber-400 capitalize">{ticket.category}</span>
                        </span>
                        <span className="text-gray-400">
                          Last updated: {formatDate(ticket.updatedAt)}
                        </span>
                      </div>

                      {ticket.messages.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                          <p className="text-amber-400 text-sm font-medium">
                            💬 {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex lg:flex-col gap-2">
                      <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold transition-all text-sm whitespace-nowrap">
                        View Details
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-all border border-gray-600 text-sm whitespace-nowrap">
                        Add Message
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h3>
            <p className="text-gray-400">Quick answers to common questions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqCategories.map((category) => (
              <div
                key={category.id}
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">{category.icon}</span>
                  <h4 className="text-white font-semibold text-lg">{category.name}</h4>
                </div>

                <div className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <div key={index} className="border-b border-gray-700/50 pb-4 last:border-b-0 last:pb-0">
                      <h5 className="text-white font-medium mb-2">{faq.question}</h5>
                      <p className="text-gray-300 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Still Need Help */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-8 border border-amber-500/30 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-2xl font-bold text-white mb-2">Still need help?</h3>
            <p className="text-gray-400 mb-6">Our support team is here to assist you</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActiveTab('ai-chat')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 justify-center"
              >
                <span>🤖</span>
                <span>Chat with AI Assistant</span>
              </button>
              <button
                onClick={() => setIsCreatingTicket(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all border border-gray-600 flex items-center space-x-2 justify-center"
              >
                <span>📧</span>
                <span>Create Support Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSupport;