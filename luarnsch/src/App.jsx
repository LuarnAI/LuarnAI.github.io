import React, { useState } from 'react';
import { 
  Monitor, Layout, Grid, ClipboardCheck, Mail, Link
} from 'lucide-react';

// 引入原本的電子看板檔案
import ClassroomDashboardV2 from './ClassroomDashboardV2';
// 引入新的監考系統檔案
import ExamTool from './ExamTool';

// ==========================================
// 系統架構設定
// ==========================================

const APPS = [
  { id: 'dashboard', name: '電子看板', icon: Monitor, color: 'bg-blue-500', component: ClassroomDashboardV2 },
  { id: 'exam', name: '監考系統', icon: ClipboardCheck, color: 'bg-rose-500', component: ExamTool },
];

const AppLauncher = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white/80 backdrop-blur-md p-12 rounded-[3rem] shadow-2xl max-w-4xl w-full mx-4 border border-white/50 relative flex flex-col min-h-[600px]" onClick={e => e.stopPropagation()}>
         
         <div className="flex-1">
             <h2 className="text-3xl font-bold text-slate-700 mb-8 flex items-center gap-3">
               <Layout className="text-indigo-600" /> 應用程式
             </h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {APPS.map(app => (
                 <button 
                   key={app.id} 
                   onClick={() => { onSelect(app.id); onClose(); }}
                   className="group flex flex-col items-center gap-4 transition-all hover:scale-105 active:scale-95"
                 >
                   <div className={`w-32 h-32 rounded-[2rem] shadow-lg flex items-center justify-center text-white text-5xl transition-shadow group-hover:shadow-2xl ${app.color}`}>
                     <app.icon size={64} />
                   </div>
                   <span className="text-lg font-bold text-slate-600 group-hover:text-slate-800">{app.name}</span>
                 </button>
               ))}
             </div>
         </div>

         {/* 作者資訊 Footer */}
         <div className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-500">
             <div className="font-bold text-lg text-slate-700 mb-2">Developed by 阿保老師</div>
             <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
                <a href="mailto:apaul@g.lnps.tp.edu.tw" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <Mail size={16} /> apaul@g.lnps.tp.edu.tw
                </a>
                <span className="hidden md:inline text-slate-300">|</span>
                <a href="https://sites.google.com/g.lnps.tp.edu.tw/apaul-classroom/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <Link size={16} /> 阿保老師的教室
                </a>
             </div>
         </div>
         
      </div>
    </div>
  );
};

const App = () => {
  const [currentAppId, setCurrentAppId] = useState('dashboard');
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  // 根據 ID 決定要渲染哪一個元件
  const CurrentComponent = APPS.find(a => a.id === currentAppId)?.component || ClassroomDashboardV2;

  return (
    <div className="relative w-full h-screen bg-slate-200 overflow-hidden">
      {/* 隱藏式系統選單按鈕 (改為左下角 bottom-4) */}
      <button 
        onClick={() => setIsLauncherOpen(true)}
        className="fixed bottom-4 left-4 z-[90] p-3 bg-black/5 hover:bg-black/80 hover:text-white text-transparent rounded-full transition-all duration-300 group backdrop-blur-sm"
        title="切換應用程式"
      >
        <Grid size={24} className="text-slate-400 group-hover:text-white" />
      </button>

      {/* 應用程式容器 */}
      <div className="w-full h-full">
         <CurrentComponent />
      </div>

      {/* 啟動器 Modal */}
      <AppLauncher 
        isOpen={isLauncherOpen} 
        onClose={() => setIsLauncherOpen(false)} 
        onSelect={setCurrentAppId} 
      />
    </div>
  );
};

export default App;
