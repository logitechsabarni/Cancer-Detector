import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  MessageSquare, 
  RefreshCcw, 
  TrendingUp, 
  ShieldAlert,
  Info,
  Stethoscope,
  Activity,
  Layers,
  Download,
  Eye,
  Scan,
  Maximize2
} from 'lucide-react';
import { ScanResult } from '../types';
import { downloadCSV } from '../lib/utils';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

interface AnalysisProps {
  result: ScanResult;
  onNewScan: () => void;
  onOpenChat: () => void;
}

export default function Analysis({ result, onNewScan, onOpenChat }: AnalysisProps) {
  const isMalignant = result.prediction === 'malignant';

  const featureImportanceData = {
    labels: result.featureImportance.map(f => f.feature),
    datasets: [{
      label: 'Impact Score',
      data: result.featureImportance.map(f => f.impact),
      backgroundColor: isMalignant ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)',
      borderRadius: 4,
    }]
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex justify-between items-center bg-white p-3 px-4 rounded-xl border border-border-base shadow-sm">
        <button 
          onClick={onNewScan}
          className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          BACK TO DASHBOARD
        </button>
        <div className="flex gap-2">
           <button 
              onClick={() => downloadCSV(result, `oncoai_report_${result.id}.csv`)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-border-base rounded-lg text-[10px] font-black hover:bg-slate-100 transition-colors"
           >
              <Download className="w-3.5 h-3.5" />
              CSV REPORT
           </button>
           <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black hover:opacity-95 transition-colors"
           >
              <Maximize2 className="w-3.5 h-3.5" />
              DOWNLOAD PDF
           </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalysisStatCard 
          label="Finding" 
          value={isMalignant ? 'Malignant' : 'Benign'} 
          color={isMalignant ? 'text-danger' : 'text-success'}
        />
        <AnalysisStatCard 
          label="AI System Confidence" 
          value={`${result.confidence}%`} 
        />
        <AnalysisStatCard 
          label="Malignancy Risk" 
          value={`${result.risk}/100`} 
          color={result.risk > 50 ? 'text-danger' : ''}
        />
        <AnalysisStatCard 
          label="BI-RADS Level" 
          value={result.biRads.toString()} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Diagnostic Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-border-base overflow-hidden flex flex-col h-[600px]">
            <div className="p-3 px-4 border-b border-border-base flex justify-between items-center bg-white/50 backdrop-blur-sm z-10 shrink-0">
              <span className="text-sm font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Multi-Spectral Diagnostic Views
              </span>
              <div className="flex gap-4">
                 {['Original', 'Heatmap', 'ROI', 'Inverted'].map(tag => (
                   <span key={tag} className="text-[9px] font-black text-text-muted hover:text-primary cursor-pointer uppercase tracking-widest">{tag}</span>
                 ))}
              </div>
            </div>
            
            <div className="flex-1 min-h-0 grid grid-cols-2 bg-slate-100 p-2 gap-2">
               <div className="bg-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[8px] font-black rounded z-10">ORIGINAL</div>
                  <img src={result.image} alt="Raw" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
               </div>
               <div className="bg-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[8px] font-black rounded z-10 uppercase">AI Intensity Map</div>
                  <img src={result.image} alt="Heatmap" className="h-full w-full object-contain opacity-70" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 heatmap-overlay mix-blend-color-burn"></div>
               </div>
               <div className="bg-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[8px] font-black rounded z-10">ROI SEGMENTATION</div>
                  <img src={result.image} alt="ROI" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 border-4 border-dashed border-danger/40 m-12 rounded-full animate-pulse"></div>
               </div>
               <div className="bg-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[8px] font-black rounded z-10 uppercase">Inverted Contrast</div>
                  <img src={result.image} alt="Inverted" className="h-full w-full object-contain invert" referrerPolicy="no-referrer" />
               </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-border-base">
               <p className="text-[11px] text-text-muted font-bold text-center italic">
                  Localization Focus: {result.heatmapDescription}
               </p>
            </div>
          </div>

          {/* Feature Importance Graph */}
          <div className="bg-white rounded-xl shadow-sm border border-border-base p-6">
             <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">Feature Importance Analysis</h3>
             </div>
             <div className="h-64">
                <Bar 
                  data={featureImportanceData} 
                  options={{ 
                    indexAxis: 'y' as const,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { 
                      x: { grid: { display: false }, ticks: { font: { size: 10 } }, title: { display: true, text: 'Clinical Weight', font: { size: 10, weight: 'bold' } } },
                      y: { ticks: { font: { size: 10, weight: 'bold' } } }
                    }
                  }} 
                />
             </div>
          </div>
        </div>

        {/* Diagnostic Metrics Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-border-base flex flex-col h-full max-h-[850px]">
            <div className="p-3 px-4 border-b border-border-base flex justify-between items-center shrink-0">
              <span className="text-[11px] font-black text-text-muted uppercase tracking-widest">Diagnostic Verdict</span>
              <Activity className="w-3.5 h-3.5 text-primary" />
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-6">
              {/* Risk Score Gauge */}
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em]">Severity Index</span>
                  <span className={`text-sm font-black ${result.risk > 70 ? 'text-danger' : result.risk > 40 ? 'text-warning' : 'text-success'}`}>
                     {result.risk > 70 ? 'LEVEL 5 - HIGH' : result.risk > 40 ? 'LEVEL 3 - MOD' : 'LEVEL 1 - LOW'}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full relative overflow-hidden">
                  <div 
                    className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 bg-gradient-to-r ${isMalignant ? 'from-rose-400 to-rose-600' : 'from-emerald-400 to-emerald-600'}`}
                    style={{ width: `${result.risk}%` }}
                  ></div>
                </div>
              </div>

              {/* Guidance Box */}
              <div className="bg-slate-50 border border-border-base rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                   <Info className="w-3.5 h-3.5" />
                   OncoAI Consultation
                </div>
                <p className="text-xs leading-relaxed font-bold text-text-main italic">
                  "{result.guidance}"
                </p>
              </div>

              {/* Findings Lists */}
              <div className="space-y-4">
                <div className="space-y-2.5">
                   <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border-base pb-1 flex items-center gap-1">
                     <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                     Observed Anomalies
                   </h4>
                   <ul className="space-y-1.5">
                     {result.causes.map((c, i) => (
                       <li key={i} className="text-xs text-text-main font-bold leading-tight pl-3 border-l-2 border-slate-200">
                         {c}
                       </li>
                     ))}
                   </ul>
                </div>

                <div className="space-y-2.5">
                   <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border-base pb-1 flex items-center gap-1">
                     <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                     Clinical Directives
                   </h4>
                   <ul className="space-y-1.5">
                     {result.recommendedActions.map((a, i) => (
                       <li key={i} className="text-xs text-text-main font-black leading-tight flex items-start gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1"></div>
                         {a}
                       </li>
                     ))}
                   </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 shrink-0">
               <button 
                onClick={onOpenChat}
                className="w-full py-3 bg-primary text-white text-xs font-black rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
               >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Assisted Consultation
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisStatCard({ label, value, color = "" }: { label: string, value: string, color?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border-base p-4">
      <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-xl font-black ${color}`}>{value}</div>
    </div>
  );
}

