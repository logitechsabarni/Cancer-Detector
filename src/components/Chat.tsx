import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { ScanResult, ChatMessage } from '../types';
import { askDoctor } from '../lib/gemini';

interface ChatProps {
  currentScan: ScanResult | null;
}

export default function Chat({ currentScan }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    // Initial greeting
    if (messages.length === 0) {
      setMessages([{
        role: 'model',
        content: `Analysis complete. I've flagged suspicious clusters with ${currentScan?.confidence || 0}% confidence. How can I assist you in interpreting these results?`
      }]);
    }
  }, [currentScan]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const historyForGemini = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await askDoctor(userMsg, currentScan || {}, historyForGemini);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-primary px-4 py-3 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-bold tracking-tight">OncoAI Doctor Assistant</span>
        </div>
        <span className="text-[10px] font-bold opacity-70 uppercase">Claude 3 Haiku Active</span>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[90%] p-2.5 px-3.5 rounded-xl text-[13px] leading-snug shadow-sm border ${
                msg.role === 'user' 
                  ? 'bg-primary text-white border-primary rounded-br-none' 
                  : 'bg-bg-base text-text-main border-border-base rounded-bl-none'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-border-base rounded-xl">
              <Loader2 className="w-3 h-3 text-primary animate-spin" />
              <span className="text-[10px] font-bold text-text-muted italic uppercase italic">OncoAI Analyzing...</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Warning Tip */}
      <div className="px-4 py-2 bg-rose-50 border-y border-rose-100 italic text-[10px] text-rose-700 leading-tight">
        Note: This is an AI-assisted tool and not a medical diagnosis. Consult a specialist for final confirmation.
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-border-base">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a medical question..."
            className="flex-1 px-3 py-2 bg-white border border-border-base rounded-lg text-xs focus:ring-1 focus:ring-primary outline-none transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-40 shadow-sm"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

