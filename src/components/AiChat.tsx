'use client'
// components/AIChat.tsx
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Carvo AI assistant. I can help you check reservation availability, service pricing, and answer any questions about our BMW services. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate floating bubbles
  const bubbles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 30,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 10,
    duration: Math.random() * 15 + 20,
    gradient: Math.random() > 0.5 ? 'from-teal-400/15 to-blue-500/15' : 'from-blue-400/15 to-teal-500/15'
  }));

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('availability') || lowerMessage.includes('schedule') || lowerMessage.includes('book')) {
      return "I can help you check availability! We have openings for BMW services:\n\n• **Tomorrow**: 9:00 AM, 1:30 PM, 3:00 PM\n• **This week**: Wednesday 10:00 AM, Friday 2:00 PM\n• **Emergency slots**: Same-day available for urgent repairs\n\nWould you like me to hold a specific time slot for you?";
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return "Here are our standard BMW service prices:\n\n• **Oil Change**: $89.99\n• **Brake Service**: $249.99\n• **Engine Diagnostics**: $129.99\n• **Full Service Package**: $399.99\n• **AC Service**: $179.99\n\nAll prices include genuine BMW parts and 12-month warranty. Would you like detailed pricing for a specific service?";
    }
    
    if (lowerMessage.includes('service') || lowerMessage.includes('repair')) {
      return "We specialize in comprehensive BMW services:\n\n🔧 **Maintenance**: Oil changes, filter replacements, fluid checks\n⚡ **Diagnostics**: Advanced computer system analysis\n🛑 **Brakes**: Pad replacement, rotor resurfacing\n❄️ **AC Services**: Cooling system maintenance\n🔍 **Inspections**: Pre-purchase and safety inspections\n\nWhat specific service are you interested in?";
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('hour') || lowerMessage.includes('open')) {
      return "Our service hours:\n\n🕒 **Monday - Friday**: 7:30 AM - 6:00 PM\n🕒 **Saturday**: 8:00 AM - 4:00 PM\n🚗 **Emergency Service**: Available 24/7 for members\n\nWe're located at 123 Auto Street, Downtown. Free pickup and delivery available within 10 miles!";
    }
    
    if (lowerMessage.includes('warranty') || lowerMessage.includes('guarantee')) {
      return "All our services come with comprehensive coverage:\n\n✅ **12-month warranty** on all parts and labor\n✅ **Genuine BMW parts** only\n✅ **Free re-inspection** within warranty period\n✅ **Roadside assistance** for warranty work\n\nYour satisfaction is 100% guaranteed!";
    }
    
    return "I understand you're interested in our BMW services. I can help you with:\n\n• 📅 Reservation availability and booking\n• 💰 Service pricing and estimates\n• 🔧 Service details and timing\n• 🏢 Location and hours\n• 📞 Contact information\n\nWhat would you like to know more about?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Floating Gradient Bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className={`absolute rounded-full bg-gradient-to-r ${bubble.gradient} animate-float`}
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              top: `${bubble.top}%`,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${bubble.duration}s`,
              filter: 'blur(30px)',
            }}
          />
        ))}
      </div>

      {/* Subtle Grid */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(#00ffaa 1px, transparent 1px),
                           linear-gradient(90deg, #00ffaa 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Chat Container */}
      <div className="relative z-10 max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.isUser
                    ? 'bg-gradient-to-r from-teal-600 to-blue-700 text-white'
                    : 'bg-gray-800/80 backdrop-blur-sm text-gray-200 border border-teal-500/20'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-2 ${message.isUser ? 'text-blue-200' : 'text-teal-400'}`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/80 backdrop-blur-sm text-gray-200 rounded-2xl p-4 border border-teal-500/20">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-black/80 backdrop-blur-lg border-t border-teal-500/30 p-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about availability, pricing, or services..."
                className="w-full bg-gray-900/80 border border-teal-500/30 rounded-2xl px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-teal-400 backdrop-blur-sm"
                rows={1}
                style={{
                  minHeight: '50px',
                  maxHeight: '120px'
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? '⋯' : 'Send'}
            </button>
          </div>
          
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              "Check availability for tomorrow",
              "Oil change pricing",
              "Service hours",
              "BMW brake service"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputMessage(suggestion)}
                className="px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-300 text-sm hover:bg-teal-500/20 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          33% { 
            transform: translateY(-20px) rotate(120deg) scale(1.1);
          }
          66% { 
            transform: translateY(10px) rotate(240deg) scale(0.9);
          }
        }
        .animate-float { 
          animation: float 25s ease-in-out infinite; 
        }
      `}</style>
    </div>
  );
};

export default AIChat;