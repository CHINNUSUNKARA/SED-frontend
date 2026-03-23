
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/api';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize messages from localStorage or use default
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('sed_chatbot_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Hydrate date strings back to Date objects
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }
    return [
      {
        id: 1,
        text: "Hi there! 👋 I'm the SED Assistant powered by AI. How can I help you launch your tech career today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom on update
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Save to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('sed_chatbot_history', JSON.stringify(messages));
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Fallback keyword-based responses (used when API fails)
  const generateFallbackResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('fee')) {
      return "Our courses start from ₹19,999 for beginner modules and go up to ₹64,999 for advanced certifications. We also offer EMI options! 💳";
    }
    if (lowerQuery.includes('course') || lowerQuery.includes('program') || lowerQuery.includes('learn')) {
      return "We offer a wide range of courses including Full Stack Development, Data Science, Cloud Computing, and UI/UX Design. You can browse the full catalog on our Courses page. 📚";
    }
    if (lowerQuery.includes('contact') || lowerQuery.includes('support') || lowerQuery.includes('email') || lowerQuery.includes('phone')) {
      return "You can reach our support team at support@sed-edu.com or call us at +1 (555) 123-4567 during business hours. 📞";
    }
    if (lowerQuery.includes('certificate') || lowerQuery.includes('certification')) {
      return "Yes! You receive an industry-recognized certificate upon successful completion of any of our courses. 🏆";
    }
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      return "Hello! Great to see you. What are you interested in learning today? 🚀";
    }

    return "I'm not sure I have the details for that specific query yet. Would you like to speak with a human counselor instead? You can book a call via our Contact page.";
  };

  // Generate response using backend AI API
  const generateResponse = async (query: string): Promise<string> => {
    try {
      const response = await api.post('/ai/chat', { message: query });
      
      // If API returns 503 or fallback flag, use local fallback
      if (response.data.fallback || response.status === 503) {
        console.warn('AI service unavailable, using fallback responses');
        return generateFallbackResponse(query);
      }
      
      return response.data.response || generateFallbackResponse(query);
    } catch (error: any) {
      // Check if the error is a 503 Service Unavailable
      if (error.response?.status === 503) {
        console.warn('AI service unavailable (503), using fallback responses');
        return generateFallbackResponse(query);
      }
      
      console.error('AI API Error:', error);
      // Fallback to keyword-based responses if API fails
      return generateFallbackResponse(query);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    // Get AI response
    try {
      const responseText = await generateResponse(newUserMessage.text);

      // Simulate typing delay for better UX
      setTimeout(() => {
        const newBotMessage: Message = {
          id: Date.now() + 1,
          text: responseText,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newBotMessage]);
        setIsTyping(false);
      }, 800);
    } catch (error) {
      console.error('Error generating response:', error);
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear chat history? This cannot be undone.')) {
      const initialMsg: Message = {
        id: Date.now(),
        text: "Hi there! 👋 I'm the SED Assistant. How can I help you launch your tech career today?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([initialMsg]);
      localStorage.removeItem('sed_chatbot_history');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">

      {/* Chat Window */}
      <div
        className={`bg-white w-[350px] sm:w-[380px] rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300 origin-bottom-right mb-4 flex flex-col ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none h-0'
          }`}
        style={{ maxHeight: '600px', height: isOpen ? '500px' : '0' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm">SED Assistant</h3>
              <p className="text-xs text-brand-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              title="Clear History"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              title="Minimize"
            >
              <Minimize2 size={18} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
          <div className="text-center text-xs text-slate-400 my-4">
            <span>Today</span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === 'user' ? 'bg-brand-100 text-brand-600' : 'bg-slate-200 text-slate-600'
                  }`}>
                  {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-br-none'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                  }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex-shrink-0 flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex items-center gap-1 h-10">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything..."
              className="flex-grow bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">Powered by SED AI • Response times may vary</p>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg shadow-brand-500/30 flex items-center justify-center transition-all duration-300 z-50 ${isOpen ? 'bg-slate-900 rotate-90' : 'bg-brand-600 hover:bg-brand-700 hover:scale-110'
          }`}
      >
        {isOpen ? (
          <X size={28} className="text-white" />
        ) : (
          <MessageSquare size={28} className="text-white fill-current" />
        )}

        {/* Tooltip / Label */}
        {!isOpen && (
          <span
            className={`absolute right-full mr-4 bg-white text-slate-800 px-3 py-1.5 rounded-lg shadow-md text-sm font-bold whitespace-nowrap transition-all duration-300 origin-right border border-slate-100 ${isHovered ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 translate-x-2 pointer-events-none'
              }`}
          >
            Chat with us! 👋
          </span>
        )}

        {/* Notification Badge */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>
    </div>
  );
};
