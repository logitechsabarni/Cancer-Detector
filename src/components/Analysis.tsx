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
  Stethoscope
} from 'lucide-react';
import { ScanResult } from '../types';

interface AnalysisProps {
  result: ScanResult;
  onNewScan: () => void;
  onOpenChat: () => void;
}

export default function Analysis({ result, onNewScan, onOpenChat }: AnalysisProps) {
  const isMalignant = result.prediction === 'malignant';

  return (
    <div className="space-y-8 pb-12">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onNewScan}
          className="flex items-center gap-2 text-slate-500 font-medium hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <div className="flex gap-4">
          <button 
            onClick={onOpenChat}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <MessageSquare className="w-4 h-4" />
            Ask OncoAI Assistant
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`col-span-1 md:col-span-2 rounded-3xl p-8 flex items-center justify-between shadow-sm border ${isMalignant ? 'bg-rose-50 border-rose-100 text-rose-900' : 'bg-emerald-50 border-emerald-100 text-emerald-900'}`}>
          <div>
            <div className="text-sm font-bold uppercase tracking-widest opacity-60 mb-1">Prediction</div>
            <div className="text-4xl font-black flex items-center gap-3">
              {isMalignant ? (
                <>
                  <AlertTriangle className="w-10 h-10" />
                  Malignant
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-10 h-10" />
                  Benign
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">BI-RADS</div>
            <div className="text-5xl font-black">{result.biRads}</div>
          </div>
        </div>

        <StatCard 
          label="Confidence" 
          value={`${result.confidence}%`} 
          icon={<TrendingUp className="w-5 h-5" />} 
          color="blue"
        />
        <StatCard 
          label="Risk Assessment" 
          value={`${result.risk}%`} 
          icon={<ShieldAlert className="w-5 h-5" />} 
          color={result.risk > 50 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Image Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <RefreshCcw className="w-5 h-5 text-blue-500" />
              Original Mammogram
            </h3>
            <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-500 font-bold">RAW DICOM</span>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 group">
             <img src={result.image} alt="Original" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg text-rose-600">
              <TrendingUp className="w-5 h-5" />
              AI Intensity Map (Grad-CAM)
            </h3>
            <span className="text-xs px-2 py-1 bg-rose-50 rounded text-rose-500 font-bold">EXPLAINABLE AI</span>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900">
             {/* Simple heatmap overlay simulation */}
             <img src={result.image} alt="Overlay Base" className="w-full h-full object-contain opacity-50" referrerPolicy="no-referrer" />
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 via-amber-500/40 to-rose-500/50 mix-blend-overlay"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-rose-600/40 rounded-full blur-3xl animate-pulse"></div>
          </div>
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900">Focus Region:</span> {result.heatmapDescription}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">Clinical Analysis & Summary</h3>
          </div>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-700 font-medium leading-relaxed italic mb-8">
              "{result.guidance}"
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnalysisSet title="Potential Factors" items={result.causes} icon={<AlertTriangle className="text-amber-500" />} />
              <AnalysisSet title="Precautions" items={result.precautions} icon={<CheckCircle2 className="text-emerald-500" />} />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 shadow-sm text-white space-y-6">
          <h3 className="text-lg font-bold">Recommended Actions</h3>
          <div className="space-y-4">
            {result.recommendedActions.map((action, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/30">
                  {i + 1}
                </div>
                <div className="text-sm font-medium text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                  {action}
                </div>
              </div>
            ))}
          </div>
          <button 
            className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors mt-8"
            onClick={() => window.print()}
          >
            <RefreshCcw className="w-4 h-4" />
            Generate PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: any, color: 'blue' | 'rose' | 'emerald' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-900 border-blue-100',
    rose: 'bg-rose-50 text-rose-900 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-100'
  };

  return (
    <div className={`rounded-3xl p-6 shadow-sm border ${colors[color]}`}>
      <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">{label}</div>
      <div className="flex items-center justify-between">
        <div className="text-3xl font-black">{value}</div>
        <div className={`p-2 rounded-xl bg-opacity-20 ${color === 'blue' ? 'bg-blue-600' : color === 'rose' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function AnalysisSet({ title, items, icon }: { title: string, items: string[], icon: any }) {
  return (
    <div className="space-y-4">
      <h4 className="font-bold text-slate-800 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
            <span className="text-blue-500 mt-1">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
