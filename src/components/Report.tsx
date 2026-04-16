import { motion } from 'motion/react';
import { 
  FileText, 
  Download, 
  Printer, 
  Activity, 
  Calendar, 
  Stethoscope, 
  ShieldCheck,
  Award,
  TrendingUp,
  ChevronLeft
} from 'lucide-react';
import { ScanResult } from '../types';
import { downloadCSV } from '../lib/utils';

interface ReportProps {
  result: ScanResult;
}

export default function Report({ result }: ReportProps) {
  const isMalignant = result.prediction === 'malignant';

  return (
    <div className="max-w-4xl mx-auto space-y-6 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
      {/* Report Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">OncoAI Clinical Summary</h1>
            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Verified Diagnostic Engine // MD-VERIFIED
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xl font-black text-slate-900 leading-none">REF_{result.id.toString().slice(-8)}</div>
          <div className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Diagnostic Reference</div>
          <div className="mt-2 flex items-center gap-2 text-slate-600 font-black text-[10px] justify-end uppercase tracking-tighter">
            <Calendar className="w-3.5 h-3.5" />
            GEN_DATE: {new Date(result.date).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${isMalignant ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1 leading-none">Primary Classification</div>
          <div className={`text-xl font-black ${isMalignant ? 'text-rose-600' : 'text-emerald-600'}`}>
            {result.prediction.toUpperCase()} FINDING
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1 leading-none">Diagnostic Confidence</div>
          <div className="text-xl font-black text-slate-900">{result.confidence.toFixed(1)}%</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1 leading-none">BI-RADS CATEGORY</div>
          <div className="flex items-center justify-between">
            <div className="text-xl font-black italic">Score_{result.biRads}</div>
            <Award className="w-5 h-5 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Visual Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            Imaging Visualization
          </h3>
          <div className="flex gap-3">
            <div className="flex-1 aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
               <img src={result.image} alt="Original" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 aspect-square rounded-xl overflow-hidden bg-slate-900 relative">
               <img src={result.image} alt="Heatmap" className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 heatmap-overlay mix-blend-color-burn"></div>
            </div>
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
             <span>[RAW_IMAGING]</span>
             <span>[AI_INTENSITY_MAP]</span>
          </div>
        </div>

        <div className="space-y-5">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] flex items-center gap-2 border-b border-slate-100 pb-3">
            <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
            Clinical Analysis
          </h3>
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-700 leading-relaxed font-bold italic">
              "{result.guidance}"
            </p>
          </div>
          <div className="space-y-3">
             <div className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Localization Data:</div>
             <div className="text-xs font-black text-slate-800 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
               {result.heatmapDescription}
             </div>
          </div>
        </div>
      </div>

      {/* Feature Importance Simplified */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
         <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Feature-Level Influence Metrics
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {result.featureImportance.map((f, i) => (
              <div key={i} className="space-y-1.5">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                    <span>{f.feature}</span>
                    <span>{f.impact}%</span>
                 </div>
                 <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000" 
                      style={{ width: `${f.impact}%` }}
                    ></div>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Advanced Clinical Guidance */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest border-b border-slate-200 pb-1">Recommended Precautions</h4>
            <ul className="space-y-2">
              {result.precautions.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-slate-600 leading-relaxed font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5"></div>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest border-b border-slate-200 pb-1">Clinical Directives</h4>
            <ul className="space-y-2">
              {result.recommendedActions.map((a, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-slate-900 leading-relaxed font-black uppercase tracking-tighter">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5"></div>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Report Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-100">
        <div className="flex gap-4 print:hidden">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-slate-800 transition-all shadow-lg uppercase tracking-widest"
          >
            <Printer className="w-4 h-4" />
            Print to PDF
          </button>
          <button 
            onClick={() => downloadCSV(result, `oncoai_export_${result.id}.csv`)}
            className="flex items-center gap-2 bg-white text-slate-900 border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
        
        <div className="text-center md:text-right">
          <div className="text-[9px] font-black text-slate-300 uppercase leading-[2] tracking-widest whitespace-pre">ONCOAI_DIAGNOSTIC_PAYLOAD_VERIFIED // SECURE_HANDOFF</div>
          <div className="text-[9px] font-black text-slate-300 uppercase leading-[2] tracking-widest whitespace-pre">TIMESTAMP: {new Date().toISOString()}</div>
        </div>
      </div>

      <div className="p-3 bg-rose-100 rounded-lg text-center border border-rose-200">
        <p className="text-[9px] text-rose-900 font-black uppercase tracking-[0.2em]">
          DISCLAIMER: AI-ASSISTED SCREENING ONLY. NOT A FINAL DIAGNOSIS. CONSULT ONCOLOGIST.
        </p>
      </div>
    </div>
  );
}
