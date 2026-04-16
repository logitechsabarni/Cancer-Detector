import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Activity, Clock, ChevronRight, FileSearch, Loader2 } from 'lucide-react';
import { ScanResult } from '../types';
import { analyzeMammogram } from '../lib/gemini';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement, 
  LineElement,
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement,
  LineElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

interface DashboardProps {
  onScanStart: (result: ScanResult) => void;
  history: ScanResult[];
  onViewReport: (scan: ScanResult) => void;
}

export default function Dashboard({ onScanStart, history, onViewReport }: DashboardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      setIsUploading(true);
      
      try {
        const analysis = await analyzeMammogram(base64);
        onScanStart({
          ...analysis,
          id: Date.now(),
          date: new Date().toISOString(),
          image: base64
        });
      } catch (err) {
        alert("Failed to analyze image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const lineData = {
    labels: history.slice(0, 7).reverse().map(s => new Date(s.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Risk Score History',
        data: history.slice(0, 7).reverse().map(s => s.risk),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const biRadsCounts = history.reduce((acc, scan) => {
    acc[scan.biRads - 1]++;
    return acc;
  }, [0, 0, 0, 0, 0]);

  const doughnutData = {
    labels: ['BI-RADS 1', 'BI-RADS 2', 'BI-RADS 3', 'BI-RADS 4', 'BI-RADS 5'],
    datasets: [
      {
        data: biRadsCounts,
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medical Dashboard</h1>
          <p className="text-slate-500">Welcome back, Dr. Guha. Here is your overview.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Scans</div>
              <div className="text-xl font-bold">{history.length}</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Last 24h</div>
              <div className="text-xl font-bold">{history.filter(s => new Date(s.date).getTime() > Date.now() - 86400000).length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden bg-[url('https://picsum.photos/seed/medical/1920/1080?blur=10')] bg-cover bg-center">
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
            <div className="relative flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 transition-transform hover:rotate-0 duration-300">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Screen New Patient</h2>
                <p className="text-slate-500 max-w-sm mx-auto">Upload a high-resolution DICOM or Mammogram image for AI analysis.</p>
              </div>
              
              <div 
                className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer ${
                  isUploading ? 'border-blue-400 bg-blue-50/50' : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'
                }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <span className="font-medium text-blue-600">OncoAI Engine Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-semibold text-slate-700">Drop image here or click to browse</span>
                    <span className="text-xs text-slate-400 font-medium">Supports PNG, JPG (Max 10MB)</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-[350px]">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Risk Variance Over Time</h3>
            <div className="h-[260px] w-full">
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Patient Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={doughnutData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {['BI-RADS 1', 'BI-RADS 2', 'BI-RADS 3', 'BI-RADS 4', 'BI-RADS 5'].map((label, i) => (
                <div key={label} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[i] }}></div>
                  {label}: {biRadsCounts[i]}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 shadow-sm text-white">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Recent History</h3>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic text-sm">No analysis history found.</div>
              ) : (
                history.map((scan) => (
                  <div 
                    key={scan.id} 
                    onClick={() => onViewReport(scan)}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                      <img src={scan.image} alt="Scan" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">
                        {scan.prediction === 'malignant' ? '⚠️ Malignant' : '✅ Benign'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">{new Date(scan.date).toLocaleString()}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
