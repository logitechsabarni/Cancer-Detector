import { motion } from 'motion/react';
import { 
  FileText, 
  Download, 
  Printer, 
  Activity, 
  Calendar, 
  Stethoscope, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { ScanResult } from '../types';

interface ReportProps {
  result: ScanResult;
}

export default function Report({ result }: ReportProps) {
  const isMalignant = result.prediction === 'malignant';

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
      {/* Report Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">OncoAI Scan Report</h1>
            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Verified AI Analysis Engine v4.2
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-black text-slate-900 leading-none">#{result.id.toString().slice(-6)}</div>
          <div className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Report Reference ID</div>
          <div className="mt-2 flex items-center gap-2 text-slate-600 font-medium text-sm justify-end">
            <Calendar className="w-4 h-4" />
            {new Date(result.date).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl border ${isMalignant ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">AI Classification</div>
          <div className={`text-2xl font-black ${isMalignant ? 'text-rose-600' : 'text-emerald-600'}`}>
            {result.prediction.toUpperCase()}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Risk Probability</div>
          <div className="text-2xl font-black text-slate-900">{result.risk.toFixed(1)}%</div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">BI-RADS CATEGORY</div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-black">Score {result.biRads}</div>
            <Award className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Visual Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2 border-b border-slate-100 pb-4">
            <FileText className="w-4 h-4 text-blue-500" />
            Diagnostic Images
          </h3>
          <div className="flex gap-4">
            <div className="flex-1 aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
               <img src={result.image} alt="Scan" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 relative">
               <img src={result.image} alt="Heatmap" className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-amber-500/30 to-rose-500/40 mix-blend-overlay"></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-wider">Left: Raw Imaging / Right: AI Thermal Mapping</p>
        </div>

        <div className="space-y-6">
          <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2 border-b border-slate-100 pb-4">
            <Stethoscope className="w-4 h-4 text-blue-500" />
            Clinical Observations
          </h3>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
              "{result.guidance}"
            </p>
          </div>
          <div className="space-y-4">
             <div className="text-xs font-black uppercase text-slate-400 tracking-[0.1em]">Targeted Findings:</div>
             <div className="text-sm font-bold text-slate-800 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
               {result.heatmapDescription}
             </div>
          </div>
        </div>
      </div>

      {/* Advanced Clinical Guidance */}
      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Recommended Precautions</h4>
            <ul className="space-y-3">
              {result.precautions.map((p, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-900 tracking-widest">Post-Screening Actions</h4>
            <ul className="space-y-3">
              {result.recommendedActions.map((a, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5"></span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Report Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-slate-100">
        <div className="flex gap-4 print:hidden">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button className="flex items-center gap-2 bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
        
        <div className="text-center md:text-right">
          <div className="text-[10px] font-black text-slate-300 uppercase leading-[2]">Generated by OncoAI Engine v4.2</div>
          <div className="text-[10px] font-black text-slate-300 uppercase leading-[2]">Electronic Signature: [SYSTEM_VERIFIED]</div>
        </div>
      </div>

      <div className="p-4 bg-rose-50 rounded-xl text-center border border-rose-100">
        <p className="text-[10px] text-rose-800 font-bold uppercase tracking-wider">
          Legal Notice: This document is an automated clinical summary. It is not a prescription or a diagnostic validation.
        </p>
      </div>
    </div>
  );
}
