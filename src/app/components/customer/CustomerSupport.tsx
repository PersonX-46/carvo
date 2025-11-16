'use client';
import { useState, useEffect } from 'react';
import AIChatAssistant from './AIChatAssistant';

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

const CustomerSupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai-chat' | 'tickets' | 'faq'>('ai-chat');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    description: ''
  });

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

  // Fetch support tickets
  useEffect(() => {
    fetchSupportTickets();
  }, []);

  const fetchSupportTickets = async () => {
    try {
      const response = await fetch('/api/customer/support/tickets');
      if (response.ok) {
        const result = await response.json();
        setSupportTickets(result.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/customer/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTicket),
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const result = await response.json();
      
      setSupportTickets(prev => [result.ticket, ...prev]);
      setNewTicket({
        subject: '',
        category: 'general',
        priority: 'medium',
        description: ''
      });
      setIsCreatingTicket(false);

    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create support ticket. Please try again.');
    }
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
        <AIChatAssistant {...({ onBookingCreated: fetchSupportTickets } as any)} />
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