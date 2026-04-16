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
        content: `Hello, I am OncoAI Assistant. ${currentScan ? "I've reviewed the patient's scan results showing a " + (currentScan.prediction === 'malignant' ? "potential concern (Malignant prediction)." : "benign finding.") : "How can I help you with breast cancer clinical guidance today?"} How can I assist you in explaining these results or answering medical questions?`
      }]);
    }
  }, []);

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
      setMessages(prev => [...prev, { role: 'model', content: "I apologize, but I encountered an error connecting to my medical knowledge base. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              OncoAI AI Doctor
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
            </h2>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              Live Clinical Knowledge
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs text-slate-400 font-medium">Model: Claude 3rd Gen (Haiku)</span>
          <span className="text-[10px] text-slate-500 uppercase font-bold">Secure Medical Cloud</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/50"
      >
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none whitespace-pre-wrap'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
               <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center animate-pulse">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-slate-400 text-xs italic font-medium tracking-wide">OncoAI is analyzing clinical data...</span>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Disclaimer bar */}
      <div className="px-6 py-2 bg-amber-50 border-y border-amber-100 flex items-center gap-2">
        <AlertCircle className="w-3 h-3 text-amber-600" />
        <span className="text-[10px] text-amber-700 font-bold uppercase">AI Sourced Guidance - Not a Final Diagnosis</span>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto flex gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Explain mammogram findings in simple terms..."
              className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 text-center">
           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
             <ShieldCheck className="w-3 h-3" />
             HIPAA-Compliant AI Environment
           </span>
        </div>
      </div>
    </div>
  );
}
