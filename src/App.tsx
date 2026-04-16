import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Upload, 
  FileText, 
  MessageSquare, 
  PieChart, 
  ChevronRight, 
  AlertCircle,
  Download,
  Info
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Analysis from './components/Analysis';
import Chat from './components/Chat';
import Report from './components/Report';
import { ScanResult } from './types';

type View = 'dashboard' | 'analysis' | 'chat' | 'report';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);

  useEffect(() => {
    fetch('/api/scans')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error("Error loading scans:", err));
  }, []);

  const handleScanComplete = (result: ScanResult) => {
    setCurrentScan(result);
    setHistory(prev => [result, ...prev]);
    setCurrentView('analysis');
    
    // Save to server
    fetch('/api/save-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });
  };

  const navigateToReport = (scan: ScanResult) => {
    setCurrentScan(scan);
    setCurrentView('report');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                OncoAI
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <NavButton active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<PieChart className="w-4 h-4" />} label="Dashboard" />
              <NavButton active={currentView === 'analysis'} onClick={() => setCurrentView('analysis')} icon={<Activity className="w-4 h-4" />} label="Analysis" disabled={!currentScan} />
              <NavButton active={currentView === 'report'} onClick={() => setCurrentView('report')} icon={<FileText className="w-4 h-4" />} label="Reports" disabled={!currentScan} />
              <NavButton active={currentView === 'chat'} onClick={() => setCurrentView('chat')} icon={<MessageSquare className="w-4 h-4" />} label="AI Doctor" />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:inline">Physician Access</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs ring-2 ring-white">
                DR
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Dashboard onScanStart={handleScanComplete} history={history} onViewReport={navigateToReport} />
            </motion.div>
          )}
          
          {currentView === 'analysis' && currentScan && (
            <motion.div key="analysis" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
              <Analysis result={currentScan} onNewScan={() => setCurrentView('dashboard')} onOpenChat={() => setCurrentView('chat')} />
            </motion.div>
          )}

          {currentView === 'report' && currentScan && (
            <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Report result={currentScan} />
            </motion.div>
          )}

          {currentView === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Chat currentScan={currentScan} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Disclaimer Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Disclaimer: This is an AI-assisted screening tool and NOT a medical diagnosis. Always consult a healthcare professional.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, disabled = false }: { active: boolean, onClick: () => void, icon: any, label: string, disabled?: boolean }) {
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2 py-2 px-1 border-b-2 transition-all duration-200 font-medium text-sm ${
        disabled ? 'opacity-30 cursor-not-allowed border-transparent text-slate-400' :
        active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-blue-500 hover:border-slate-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
