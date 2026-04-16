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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-border-base px-6 h-16 flex items-center justify-between shrink-0 shadow-sm z-50">
        <div 
          className="flex items-center gap-2.5 cursor-pointer" 
          onClick={() => setCurrentView('dashboard')}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 12L2.1 12.5"/><path d="M12 12l6.3 7.7"/>
          </svg>
          <span className="text-[22px] font-extrabold text-primary tracking-tighter">OncoAI</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 h-full">
          <NavButton active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} label="Dashboard" />
          <NavButton active={currentView === 'analysis'} onClick={() => setCurrentView('analysis')} label="Clinical Records" disabled={!currentScan} />
          <NavButton active={currentView === 'chat'} onClick={() => setCurrentView('chat')} label="AI Analytics" />
          <NavButton active={currentView === 'report'} onClick={() => setCurrentView('report')} label="Reports" disabled={!currentScan} />
        </nav>

        <button 
          onClick={() => setCurrentView('dashboard')}
          className="bg-primary text-white text-[13px] font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          New Scan Upload
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Workspace */}
        <main className={`flex-1 overflow-y-auto p-4 custom-scrollbar transition-all duration-300 ${currentView === 'analysis' ? 'max-w-[calc(100%-320px)]' : 'w-full'}`}>
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Dashboard onScanStart={handleScanComplete} history={history} onViewReport={navigateToReport} />
              </motion.div>
            )}
            
            {currentView === 'analysis' && currentScan && (
              <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Analysis result={currentScan} onNewScan={() => setCurrentView('dashboard')} onOpenChat={() => setCurrentView('chat')} />
              </motion.div>
            )}

            {currentView === 'report' && currentScan && (
              <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Report result={currentScan} />
              </motion.div>
            )}

            {currentView === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="h-full">
                  <Chat currentScan={currentScan} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Persistent Side Panel for Analysis */}
        {currentView === 'analysis' && (
          <aside className="w-[320px] bg-white border-l border-border-base shrink-0 hidden lg:flex flex-col">
            <Chat currentScan={currentScan} />
          </aside>
        )}
      </div>

      {/* Footer */}
      <footer className="h-8 bg-slate-900 text-slate-400 flex items-center justify-center text-[11px] font-medium shrink-0 tracking-wide uppercase">
        &copy; 2024 ONCOAI MEDICAL SYSTEMS • NOTICE: THIS IS AN AI-ASSISTED SCREENING TOOL AND NOT A MEDICAL DIAGNOSIS • CONSULT A PHYSICIAN
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, label, disabled = false }: { active: boolean, onClick: () => void, label: string, disabled?: boolean }) {
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`relative flex items-center h-full px-1 text-sm font-medium transition-colors ${
        disabled ? 'opacity-30 cursor-not-allowed text-text-muted' :
        active ? 'text-primary' : 'text-text-muted hover:text-primary'
      }`}
    >
      {label}
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
        />
      )}
    </button>
  );
}

