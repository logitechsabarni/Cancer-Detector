import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Activity, Clock, ChevronRight, FileSearch, Loader2, Download, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { ScanResult } from '../types';
import { analyzeMammogram } from '../lib/gemini';
import { downloadCSV } from '../lib/utils';
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
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';

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

  const lastScan = history[0];

  const lineData = {
    labels: history.slice(0, 10).reverse().map(s => new Date(s.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Risk Score History',
        data: history.slice(0, 10).reverse().map(s => s.risk),
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

  const predictions = history.reduce((acc, scan) => {
    acc[scan.prediction]++;
    return acc;
  }, { benign: 0, malignant: 0 });

  const pieData = {
    labels: ['Benign', 'Malignant'],
    datasets: [{
      data: [predictions.benign, predictions.malignant],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 1,
    }]
  };

  const confidenceRanges = history.reduce((acc, scan) => {
    if (scan.confidence >= 90) acc['90-100%']++;
    else if (scan.confidence >= 80) acc['80-89%']++;
    else if (scan.confidence >= 70) acc['70-79%']++;
    else acc['<70%']++;
    return acc;
  }, { '90-100%': 0, '80-89%': 0, '70-79%': 0, '<70%': 0 });

  const barData = {
    labels: Object.keys(confidenceRanges),
    datasets: [{
      label: 'Confidence Classes',
      data: Object.values(confidenceRanges),
      backgroundColor: '#3b82f6',
      borderRadius: 4,
    }]
  };

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
    <div className="space-y-4">
      {/* Header with Export */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-muted">Clinical Overview</h2>
        <button 
          onClick={() => downloadCSV(history, 'oncoai_export.csv')}
          disabled={history.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border-base rounded-lg text-[11px] font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          EXPORT CSV DATA
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Detection Status" 
          value={lastScan ? (lastScan.prediction === 'malignant' ? 'Malignant' : 'Benign') : 'N/A'} 
          color={lastScan ? (lastScan.prediction === 'malignant' ? 'text-danger' : 'text-success') : ''}
        />
        <StatCard 
          label="AI Confidence" 
          value={lastScan ? `${lastScan.confidence}%` : 'N/A'} 
        />
        <StatCard 
          label="Risk Score" 
          value={lastScan ? `${lastScan.risk}/100` : 'N/A'} 
          color={lastScan && lastScan.risk > 50 ? 'text-danger' : ''}
        />
        <StatCard 
          label="BI-RADS Category" 
          value={lastScan ? lastScan.biRads.toString() : 'N/A'} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Work Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-border-base p-6 text-center">
            <div className="max-w-md mx-auto space-y-3">
              <div 
                className={`w-14 h-14 mx-auto bg-primary rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                {isUploading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <Upload className="w-7 h-7 text-white" />}
              </div>
              <div>
                <h2 className="text-lg font-bold">New Scan Upload</h2>
                <p className="text-xs text-text-muted font-medium">Analyze mammogram images using OncoAI Vision Engine</p>
              </div>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 py-8 transition-all cursor-pointer ${
                  isUploading ? 'border-primary bg-primary/5' : 'border-border-base hover:border-primary hover:bg-slate-50'
                }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-700">Browse or Drag Mammogram Files</p>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">DICOM, JPG, PNG • MAX 10MB</p>
                </div>
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

          {/* Bar Graph for Confidence Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-border-base p-4">
             <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="text-[11px] font-black text-text-muted uppercase tracking-widest">AI Confidence Distribution</h3>
             </div>
             <div className="h-48">
                <Bar data={barData} options={{ 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } } }, x: { ticks: { font: { size: 10 } } } }
                }} />
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border-base overflow-hidden font-mono">
            <div className="p-3 px-4 border-b border-border-base flex items-center justify-between bg-slate-50/50">
              <h3 className="text-[10px] font-black opacity-80 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Recent Clinical History LOG
              </h3>
            </div>
            <div className="divide-y divide-border-base max-h-[300px] overflow-y-auto custom-scrollbar">
              {history.length === 0 ? (
                <div className="py-12 text-center text-text-muted text-[11px] italic font-bold">NULL_HISTORY_FOUND</div>
              ) : (
                history.map((scan) => (
                  <div 
                    key={scan.id} 
                    onClick={() => onViewReport(scan)}
                    className="flex items-center gap-4 p-2.5 px-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border-base shrink-0">
                      <img src={scan.image} alt="Scan" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-[11px] font-black uppercase tracking-tight ${scan.prediction === 'malignant' ? 'text-danger' : 'text-success'}`}>
                          {scan.prediction}
                        </span>
                        <span className="text-[10px] text-text-muted font-black">{new Date(scan.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[10px] text-text-muted font-bold truncate">BI-RADS_{scan.biRads} // CONF_{scan.confidence}%</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-border-base group-hover:text-primary" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Analytics Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-border-base p-4">
            <div className="flex items-center gap-2 mb-4">
               <PieIcon className="w-4 h-4 text-primary" />
               <h3 className="text-[11px] font-black text-text-muted uppercase tracking-widest">Diagnostic Pie</h3>
            </div>
            <div className="h-44 relative flex items-center justify-center">
              <Pie data={pieData} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} />
            </div>
            <div className="mt-4 flex justify-around text-[10px] font-black uppercase tracking-tighter">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-success"></div>
                   Benign: {predictions.benign}
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-danger"></div>
                   Malignant: {predictions.malignant}
                </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border-base p-4">
            <h3 className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-4">Patient Distribution (BI-RADS)</h3>
            <div className="h-40 relative flex items-center justify-center">
              <Doughnut data={{
                ...doughnutData,
                datasets: [{ ...doughnutData.datasets[0], backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'] }]
              }} options={{ cutout: '75%', plugins: { legend: { display: false } }, maintainAspectRatio: false }} />
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black">{history.length}</span>
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">TOTAL</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border-base p-4">
            <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">Risk Variance</h3>
            <div className="h-28">
              <Line data={lineData} options={{ 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { 
                  y: { display: false },
                  x: { display: false }
                }
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "" }: { label: string, value: string, color?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border-base p-3 px-4">
      <div className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-black ${color}`}>{value}</div>
    </div>
  );
}

