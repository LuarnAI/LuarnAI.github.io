
import React, { useState, useEffect, useCallback } from 'react';
import MainDisplay from './components/MainDisplay';
import Toolbar from './components/Toolbar';
import BroadcastModal from './components/BroadcastModal';
import SettingsModal from './components/SettingsModal';
import TravelModal from './components/TravelModal';
import BubbleBackground from './components/BubbleBackground';
import { TimeSlot, TimetableData, BroadcastTemplate } from './types';

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1GPi-84ocA56qJrzGoN6ocmt27Fmc1iHJ-qxScqsHVvE/export?format=csv";

const DEFAULT_SLOTS: TimeSlot[] = [
  { id: '1', name: '第一節', start: '08:10', end: '09:00' },
  { id: '2', name: '第二節', start: '09:10', end: '10:00' },
  { id: '3', name: '第三節', start: '10:20', end: '11:10' },
  { id: '4', name: '第四節', start: '11:20', end: '12:10' },
  { id: '5', name: '第五節', start: '12:20', end: '13:10' },
  { id: '6', name: '第六節', start: '13:20', end: '14:10' },
  { id: '7', name: '第七節', start: '14:20', end: '15:10' },
  { id: '8', name: '第八節', start: '15:30', end: '16:20' },
  { id: '9', name: '第九節', start: '16:30', end: '17:20' },
  { id: '10', name: '第十節', start: '17:30', end: '18:20' },
  { id: '11', name: '第A節', start: '18:25', end: '19:15' },
  { id: '12', name: '第B節', start: '19:20', end: '20:10' },
  { id: '13', name: '第C節', start: '20:15', end: '21:05' },
];

const DEFAULT_TEMPLATES: BroadcastTemplate[] = [
  { id: '1', btnName: '下課休息', title: '下課時間', subtitle: '離開教室請注意安全' },
  { id: '2', btnName: '安靜午休', title: '午休時間', subtitle: '請保持安靜，安靜午睡' },
  { id: '3', btnName: '打掃時間', title: '環境清掃', subtitle: '維護校園整潔，大家動起來' },
];

export default function App() {
  const [now, setNow] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [slots, setSlots] = useState<TimeSlot[]>(() => {
    const saved = localStorage.getItem('slots');
    return saved ? JSON.parse(saved) : DEFAULT_SLOTS;
  });

  const [timetable, setTimetable] = useState<TimetableData>(() => {
    const saved = localStorage.getItem('timetable');
    return saved ? JSON.parse(saved) : {};
  });

  const [templates, setTemplates] = useState<BroadcastTemplate[]>(() => {
    const saved = localStorage.getItem('templates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  const [broadcast, setBroadcast] = useState<BroadcastTemplate | null>(null);
  
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);

  const syncWithGoogleSheet = useCallback(async (silent = false) => {
    setIsSyncing(true);
    try {
      const response = await fetch(SHEET_URL);
      if (!response.ok) throw new Error("無法抓取試算表內容");
      const csvText = await response.text();
      
      // @ts-ignore
      const workbook = XLSX.read(csvText, { type: 'string' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // @ts-ignore
      const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const newSlots: TimeSlot[] = [];
      const newTimetable: TimetableData = {};
      const dataRows = json.slice(1);
      
      dataRows.forEach((row, rowIndex) => {
        if (!row || row.length === 0) return;
        const slotRaw = String(row[0] || '').replace(/\s/g, '');
        if (!slotRaw) return;

        const timeMatch = slotRaw.match(/(\d{1,2}[:：]\d{2})\s*[~～-]\s*(\d{1,2}[:：]\d{2})/);
        const nameMatch = slotRaw.match(/^[^\d]+/);
        const slotName = nameMatch ? nameMatch[0] : `第${rowIndex + 1}節`;
        const startTime = timeMatch ? timeMatch[1].replace('：', ':').padStart(5, '0') : '00:00';
        const endTime = timeMatch ? timeMatch[2].replace('：', ':').padStart(5, '0') : '00:00';
        
        const slotId = (rowIndex + 1).toString();
        newSlots.push({ id: slotId, name: slotName, start: startTime, end: endTime });

        for (let day = 0; day < 7; day++) {
          const subject = row[day + 1];
          if (subject) {
            if (!newTimetable[day]) newTimetable[day] = {};
            newTimetable[day][slotId] = String(subject).trim();
          }
        }
      });

      if (newSlots.length > 0) {
        setSlots(newSlots);
        setTimetable(newTimetable);
        if (!silent) console.log("Google 試算表同步成功");
      }
    } catch (error) {
      console.error("同步失敗:", error);
      if (!silent) alert("同步 Google 試算表失敗，請檢查網路連線或權限設定。");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    // 初始化時同步一次
    syncWithGoogleSheet(true);
    return () => clearInterval(timer);
  }, [syncWithGoogleSheet]);

  useEffect(() => {
    localStorage.setItem('slots', JSON.stringify(slots));
    localStorage.setItem('timetable', JSON.stringify(timetable));
    localStorage.setItem('templates', JSON.stringify(templates));
  }, [slots, timetable, templates]);

  const getStatus = () => {
    const day = now.getDay();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;
    
    const currentSlot = slots.find(s => currentTimeStr >= s.start && currentTimeStr < s.end);
    
    if (currentSlot) {
      const subject = timetable[day]?.[currentSlot.id];
      return {
        name: currentSlot.name,
        label: subject || '（空堂）',
        isClass: !!subject
      };
    }
    
    return {
      name: '休息',
      label: '下課時間',
      isClass: false
    };
  };

  const handleQuickAction = (title: string, sub: string) => {
    setBroadcast({ id: Date.now().toString(), btnName: 'Quick', title, subtitle: sub });
  };

  const handleTravelPublish = (dest: string) => {
    setBroadcast({ id: Date.now().toString(), btnName: 'Travel', title: `我在${dest}`, subtitle: '很快就回來' });
    setIsTravelModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative font-sans">
      <BubbleBackground />
      
      {/* 同步狀態指示 */}
      {isSyncing && (
        <div className="fixed top-4 right-4 z-[100] bg-blue-600/80 backdrop-blur px-4 py-2 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
            <i className="fas fa-sync-alt fa-spin"></i>
            雲端同步中...
        </div>
      )}

      {/* 個人頭像 */}
      <div className="avatar-box absolute top-8 left-10 z-30">
        <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-yellow-600 via-amber-400 to-yellow-200 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition duration-500"></div>
            <img src="https://luarnai.github.io/pic/mypic.jpg" alt="Dr. Luarn" className="relative w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-[#FFD700]/40 shadow-2xl object-cover" />
        </div>
      </div>

      {/* 標題區域 */}
      <div className="title-area absolute top-14 left-0 right-0 z-20 flex flex-col items-center pointer-events-none">
        <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-4 md:gap-10 drop-shadow-2xl">
                <span className="text-6xl md:text-9xl font-black text-white tracking-tighter">欒老師</span>
                <span className="text-3xl md:text-7xl font-light tracking-widest uppercase text-slate-300">Dr. Luarn</span>
            </div>
            <div className="mt-4 md:mt-8 text-lg md:text-2xl tracking-[1.5em] text-indigo-400 font-black uppercase border-t border-indigo-500/20 pt-4 w-full text-center">
                資訊看板
            </div>
        </div>
      </div>

      <main className="relative z-10 h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center p-8">
          <MainDisplay 
            now={now} 
            status={getStatus()} 
            broadcast={broadcast} 
            onCloseBroadcast={() => setBroadcast(null)} 
          />
        </div>

        <Toolbar 
          onOpenBroadcast={() => setIsBroadcastModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenTravel={() => setIsTravelModalOpen(true)}
          onQuickAction={handleQuickAction}
        />
      </main>

      {isBroadcastModalOpen && (
        <BroadcastModal 
          templates={templates}
          onUpdateTemplates={setTemplates}
          onPublish={(t) => { setBroadcast(t); setIsBroadcastModalOpen(false); }}
          onClose={() => setIsBroadcastModalOpen(false)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal 
          slots={slots}
          setSlots={setSlots}
          timetable={timetable}
          setTimetable={setTimetable}
          onSync={syncWithGoogleSheet}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {isTravelModalOpen && (
        <TravelModal 
          onPublish={handleTravelPublish}
          onClose={() => setIsTravelModalOpen(false)}
        />
      )}
    </div>
  );
}
