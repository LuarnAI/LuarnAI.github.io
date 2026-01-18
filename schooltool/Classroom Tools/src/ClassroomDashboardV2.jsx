import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Settings, Clock, MapPin, Coffee, BookOpen, Edit3, X, 
  Bell, Calendar, Sun, Moon, Star, Maximize, Minimize, 
  Box, Play, Pause, RotateCcw, Shuffle, Megaphone, Home,
  LogOut, LogIn, UserX, Library, Tent, Trees, MonitorPlay,
  Utensils, Droplet, Waves, ArrowRight,
  // 補齊 SettingsModal 需要的所有圖示
  Save, RefreshCw, Wrench, Download, Upload, Plus, Trash2, AlertCircle,
  ToggleLeft, ToggleRight, Check, ChevronDown, ChevronUp
} from 'lucide-react';

// --- 預設資料 (Constants) ---
const DEFAULT_TIME_SLOTS = [
  { id: 'arrival', name: '上學時間', start: '07:20', end: '07:50', type: 'break' },
  { id: 'morning', name: '晨光時間', start: '07:50', end: '08:25', type: 'class' },
  { id: 'break1', name: '下課', start: '08:25', end: '08:30', type: 'break' },
  { id: 'p1', name: '第一節', start: '08:30', end: '09:10', type: 'class' },
  { id: 'break2', name: '下課', start: '09:10', end: '09:20', type: 'break' },
  { id: 'p2', name: '第二節', start: '09:20', end: '10:00', type: 'class' },
  { id: 'break3', name: '大下課', start: '10:00', end: '10:20', type: 'break' }, 
  { id: 'p3', name: '第三節', start: '10:20', end: '11:00', type: 'class' },
  { id: 'break4', name: '下課', start: '11:00', end: '11:10', type: 'break' },
  { id: 'p4', name: '第四節', start: '11:10', end: '11:50', type: 'class' },
  { id: 'lunch_prep', name: '準備午餐', start: '11:50', end: '12:00', type: 'break' }, 
  { id: 'lunch', name: '午餐時間', start: '12:00', end: '12:40', type: 'break' },
  { id: 'nap', name: '午休時間', start: '12:40', end: '13:15', type: 'break' }, 
  { id: 'break_noon', name: '準備上課', start: '13:15', end: '13:20', type: 'break' }, 
  { id: 'p5', name: '第五節', start: '13:20', end: '14:00', type: 'class' },
  { id: 'break6', name: '下課', start: '14:00', end: '14:10', type: 'break' },
  { id: 'p6', name: '第六節', start: '14:10', end: '14:50', type: 'class' },
  { id: 'cleaning', name: '打掃時間', start: '14:50', end: '15:10', type: 'break' },
  { id: 'p7', name: '第七節', start: '15:10', end: '15:50', type: 'class' },
  { id: 'after', name: '放學', start: '15:50', end: '16:10', type: 'break' },
];

const DEFAULT_SCHEDULE = {
  1: { p1: '國語', p2: '數學', p3: '生活(視覺)', p4: '生活(視覺)', p5: '綜合', p6: '綜合', p7: '' },
  2: { p1: '數學', p2: '國語', p3: '體育', p4: '英語', p5: '國語', p6: '有品麗山幸福悅讀', p7: '' },
  3: { p1: '國語', p2: '數學', p3: '本土語', p4: '生活(音樂)', p5: '', p6: '', p7: '' },
  4: { p1: 'Reading Fun', p2: '國語', p3: '數學', p4: '生活', p5: '視覺藝術', p6: '視覺藝術', p7: '' },
  5: { p1: '數學', p2: '國語', p3: '理財悠遊趣', p4: '健康', p5: 'STEAM手創館', p6: 'STEAM手創館', p7: '' },
};

const DEFAULT_DAY_TYPES = {
  1: 'full', 2: 'full', 3: 'half', 4: 'full', 5: 'full', 6: 'full', 0: 'full'
};

const DEFAULT_SUBJECT_HINTS = {
  '晨光時間': '抄寫聯絡簿以及準備交作業',
  '全天打掃': '請拿起掃具，認真打掃環境，保持整潔', 
  '打掃時間': '請拿起掃具，認真打掃環境，保持整潔', 
  '準備午餐': '請洗手，拿出餐具，準備用餐',
  '午餐時間': '請細嚼慢嚥，保持桌面整潔，安靜用餐',
  '午休時間': '請趴下休息，保持安靜，不隨意走動',
  '準備上課': '午休結束，請起床洗臉，準備上課',
  '晨間閱讀': '請安靜閱讀，享受書本的樂趣',
  '國語': '準備國語課本、習作、鉛筆盒',
  '數學': '準備數學課本、附件、圓規、直尺',
  '自然': '準備自然課本、習作、觀察紀錄本',
  '社會': '準備社會課本、習作',
  '英語': '準備英語課本、習作、點讀筆',
  '本土語': '準備本土語課本、相關教材',
  '生活': '準備生活課本、習作',
  '生活(視覺)': '攜帶彩色筆、水彩、圍裙，保持整潔', 
  '生活(音樂)': '攜帶直笛/樂器、課本，至音樂教室', 
  '視覺藝術': '攜帶水彩、畫筆、調色盤，至美勞教室', 
  '音樂': '攜帶直笛/樂器、課本，至音樂教室', 
  '視覺/音樂': '攜帶相關藝文用具(畫具或樂器)',
  '體育': '穿著運動服，攜帶水壺、毛巾，至操場集合',
  '健康': '準備健康課本、習作',
  '游泳': '攜帶泳衣、泳帽、蛙鏡、浴巾，至游泳池集合',
  '綜合': '準備綜合活動課本或小組討論資料',
  'STEAM手創館': '請至電腦教室集合，攜帶筆記本',
  'Reading Fun': '準備英語讀本，保持愉快心情',
  '有品麗山幸福悅讀': '準備喜歡的書，靜心閱讀',
  '理財悠遊趣': '準備理財學習單或相關教具',
  '閱讀': '攜帶借閱證，安靜排隊至圖書館',
  'default': '準備下節課本，喝水上廁所',
  '放學': '請收拾好書包，拿好餐袋及個人物品到走廊排隊'
};

const SYSTEM_BUTTONS_CONFIG = {
  groups: [
    {
      id: 'move',
      label: '移動/集合',
      icon: MapPin,
      color: 'bg-emerald-600',
      items: [
        { id: 'playground', label: '操場', message: '全班在操場', sub: '請攜帶水壺/毛巾，體育課/戶外活動', icon: Trees, color: 'from-green-500 to-emerald-400' },
        { id: 'library', label: '圖書館', message: '全班在圖書館', sub: '請攜帶借書證，保持安靜', icon: Library, color: 'from-blue-500 to-cyan-400' },
        { id: 'activity_center', label: '活動中心', message: '全班在活動中心', sub: '週會/宣導活動，請依序入座', icon: Tent, color: 'from-purple-500 to-violet-400' },
        { id: 'computer_lab', label: '電腦教室', message: '全班在電腦教室', sub: '資訊課程，請帶筆記本', icon: MonitorPlay, color: 'from-indigo-500 to-blue-500' },
        { id: 'swimming_pool', label: '游泳池', message: '全班在游泳池', sub: '請攜帶泳具、毛巾', icon: Waves, color: 'from-cyan-500 to-blue-600' },
        { id: 'av_room', label: '視聽教室', message: '全班在視聽教室', sub: '觀賞影片/講座，請保持安靜', icon: MonitorPlay, color: 'from-rose-400 to-red-500' }, 
      ]
    },
    {
      id: 'status',
      label: '作息/狀態',
      icon: Coffee,
      color: 'bg-indigo-600',
      items: [
        { id: 'morning_read', label: '晨間閱讀', message: '晨間閱讀', sub: '請安靜閱讀，享受書本樂趣', type: 'dark', icon: BookOpen, color: 'from-amber-900 to-orange-950' },
        { id: 'nap', label: '午休', message: '午休時間', sub: '請趴下休息，保持安靜', type: 'dark', icon: Moon, color: 'from-indigo-950 to-slate-900' },
        { id: 'lunch', label: '午餐', message: '午餐時間', sub: '請細嚼慢嚥，保持桌面整潔', icon: Utensils, color: 'from-orange-400 to-amber-500' },
        { id: 'cleaning', label: '打掃', message: '打掃時間', sub: '請拿起掃具，認真打掃環境', icon: Droplet, color: 'from-cyan-400 to-blue-500' },
        { id: 'after_school', label: '放學', message: '放學時間', sub: '請收拾書包，座位淨空', icon: Home, color: 'from-green-500 to-emerald-600' },
        { id: 'teacher_meeting', label: '老師開會', message: '老師處理公務中', sub: '請安靜進行班級活動', type: 'dark', icon: UserX, color: 'from-slate-700 to-slate-900' },
      ]
    }
  ],
  singles: [
    { id: 'back_classroom', label: '回教室', message: '請盡速回教室', sub: '下課後，準備下一節課程', icon: LogIn, color: 'bg-blue-600' },
    { id: 'corridor', label: '走廊排隊', message: '走廊排隊中', sub: '靠上椅子，在走廊安靜排隊', icon: LogOut, color: 'bg-orange-500' },
  ]
};

const DEFAULT_CUSTOM_BROADCASTS = [
  { id: 1, name: '常用1', title: '全班集合', sub: '請到走廊排隊' },
  { id: 2, name: '常用2', title: '安靜自習', sub: '請拿出課本閱讀' },
  { id: 3, name: '常用3', title: '放學準備', sub: '抄寫聯絡簿，整理書包' },
];

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const getSecondsFromTime = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 3600 + m * 60;
};

// --- Settings Components (Integrated) ---

// 解決時間選擇器卡死問題的自訂元件
const CustomTimeInput = ({ value, onChange }) => {
  const [hours, minutes] = value.split(':');
  
  const handleHourChange = (e) => onChange(`${e.target.value}:${minutes}`);
  const handleMinuteChange = (e) => onChange(`${hours}:${e.target.value}`);

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200">
      <select value={hours} onChange={handleHourChange} className="bg-transparent font-mono font-bold text-slate-700 outline-none p-1 appearance-none cursor-pointer text-center w-12">
        {Array.from({ length: 24 }).map((_, i) => (
          <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
        ))}
      </select>
      <span className="text-slate-400 font-bold">:</span>
      <select value={minutes} onChange={handleMinuteChange} className="bg-transparent font-mono font-bold text-slate-700 outline-none p-1 appearance-none cursor-pointer text-center w-12">
        {Array.from({ length: 60 }).map((_, i) => (
          <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
        ))}
      </select>
    </div>
  );
};

const SettingsSection = ({ title, icon: Icon, isOpen, onToggle, children, colorClass = "text-slate-600" }) => (
  <div className="border rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300">
    <button 
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
    >
      <div className="flex items-center gap-3 text-lg font-bold text-slate-800">
        <Icon className={colorClass} size={24} />
        {title}
      </div>
      <div className="text-slate-400">
        {isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
      </div>
    </button>
    {isOpen && (
      <div className="p-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
        {children}
      </div>
    )}
  </div>
);

const SettingsModal = ({ 
  isOpen, onClose, 
  timeSlots, setTimeSlots, 
  schedule, setSchedule, 
  subjectHints, setSubjectHints,
  dayTypes, setDayTypes, 
  timeOffset, setTimeOffset,
  setIsManualEco,
  setIsAutoEcoOverride, 
  setNow, 
  is24Hour, setIs24Hour,
  now,
  visibleButtons, setVisibleButtons,
  systemButtonsConfig, 
  defaultValues
}) => {
  const [expandedSections, setExpandedSections] = useState({ 'general': true });
  const [newSubjectName, setNewSubjectName] = useState('');
  const [tempTime, setTempTime] = useState(''); 
  const [selectedDay, setSelectedDay] = useState(''); 
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && now) {
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        setTempTime(`${h}:${m}`);
        setSelectedDay(prev => prev === '' ? now.getDay().toString() : prev);
    }
  }, [isOpen]); 

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // --- 作息時間表管理邏輯 ---
  const handleTimeSlotChange = (id, field, value) => {
    const newSlots = timeSlots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    );
    newSlots.sort((a, b) => a.start.localeCompare(b.start));
    setTimeSlots(newSlots);
  };

  const handleAddSlot = () => {
    const newId = `custom_${Date.now()}`;
    const newSlot = { 
        id: newId, 
        name: '新時段', 
        start: '00:00', 
        end: '00:00', 
        type: 'break' 
    };
    setTimeSlots([...timeSlots, newSlot]);
  };

  const handleDeleteSlot = (id) => {
    if (confirm('確定要刪除此時段嗎？這將會一併清除該時段的課表資料。')) {
        setTimeSlots(timeSlots.filter(s => s.id !== id));
        const newSchedule = { ...schedule };
        Object.keys(newSchedule).forEach(day => {
            if (newSchedule[day][id]) delete newSchedule[day][id];
        });
        setSchedule(newSchedule);
    }
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    if (subjectHints[newSubjectName.trim()]) {
      alert('該科目已存在！');
      return;
    }
    setSubjectHints(prev => ({
      ...prev,
      [newSubjectName.trim()]: '請設定準備事項...'
    }));
    setNewSubjectName('');
  };

  const handleDeleteSubject = (subject) => {
    if (subject === 'default') {
      alert('預設科目無法刪除');
      return;
    }
    if (confirm(`確定要刪除「${subject}」嗎？`)) {
       const newHints = { ...subjectHints };
       delete newHints[subject];
       setSubjectHints(newHints);
       
       const newSchedule = { ...schedule };
       Object.keys(newSchedule).forEach(day => {
         Object.keys(newSchedule[day]).forEach(period => {
           if (newSchedule[day][period] === subject) {
             newSchedule[day][period] = '';
           }
         });
       });
       setSchedule(newSchedule);
    }
  };

  const handleRenameSubject = (oldName, newName) => {
    const trimmedNew = newName.trim();
    if (oldName === trimmedNew || !trimmedNew) return;
    if (subjectHints[trimmedNew]) {
      alert(`科目「${trimmedNew}」已存在。`);
      return;
    }
    const newHints = { ...subjectHints };
    newHints[trimmedNew] = newHints[oldName];
    delete newHints[oldName];
    setSubjectHints(newHints);

    const newSchedule = { ...schedule };
    Object.keys(newSchedule).forEach(day => {
      Object.keys(newSchedule[day]).forEach(period => {
        if (newSchedule[day][period] === oldName) {
          newSchedule[day][period] = trimmedNew;
        }
      });
    });
    setSchedule(newSchedule);
  };

  const toggleButtonVisibility = (btnId) => {
    const newSet = new Set(visibleButtons);
    if (newSet.has(btnId)) newSet.delete(btnId);
    else newSet.add(btnId);
    setVisibleButtons(Array.from(newSet));
  };

  const handleExport = () => {
    const data = {
      version: '2.2',
      timestamp: new Date().toISOString(),
      config: { timeSlots, schedule, subjectHints, dayTypes, is24Hour, visibleButtons }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Classroom_Config_${new Date().toLocaleDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.config) {
          if (confirm('確定要還原設定嗎？目前的設定將被覆蓋。')) {
            if(data.config.timeSlots) setTimeSlots(data.config.timeSlots);
            if(data.config.schedule) setSchedule(data.config.schedule);
            if(data.config.subjectHints) setSubjectHints(data.config.subjectHints);
            if(data.config.dayTypes) setDayTypes(data.config.dayTypes);
            if(data.config.is24Hour !== undefined) setIs24Hour(data.config.is24Hour);
            if(data.config.visibleButtons) setVisibleButtons(data.config.visibleButtons);
            alert('設定還原成功！');
          }
        } else { alert('無效的設定檔格式。'); }
      } catch (err) { alert('讀取檔案失敗。'); }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const applyTimeChange = () => {
    const nowReal = new Date();
    let targetDate = new Date(nowReal);

    if (tempTime) {
      const [h, m] = tempTime.split(':').map(Number);
      targetDate.setHours(h, m, 0);
    }
    if (selectedDay !== '') {
      const currentDay = nowReal.getDay();
      const targetDay = parseInt(selectedDay, 10);
      targetDate.setDate(nowReal.getDate() + (targetDay - currentDay));
    }
    const offset = targetDate.getTime() - nowReal.getTime();
    setTimeOffset(offset);
    setNow(new Date(Date.now() + offset)); 
    setIsManualEco(false);
    setIsAutoEcoOverride(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6 bg-slate-800 text-white flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-bold flex items-center gap-3"><Settings /> 設定控制台</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full"><X /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar">
          
          <SettingsSection 
            title="一般設定" 
            icon={Wrench} 
            isOpen={expandedSections['general']} 
            onToggle={() => toggleSection('general')}
          >
             <div className="flex flex-col gap-6">
               <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-700 w-24">時間格式：</span>
                  <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                     <button onClick={() => setIs24Hour(false)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${!is24Hour ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}>12H</button>
                     <button onClick={() => setIs24Hour(true)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${is24Hour ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}>24H</button>
                  </div>
               </div>
             </div>
          </SettingsSection>

          <SettingsSection 
            title="🔔 作息時間表設定 (可自訂每節課時間)" 
            icon={Clock} 
            isOpen={expandedSections['timeslots']} 
            onToggle={() => toggleSection('timeslots')}
            colorClass="text-rose-500"
          >
            <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-400 px-2 mb-2 uppercase tracking-wider">
                    <div className="col-span-3">時段名稱</div>
                    <div className="col-span-2">開始時間</div>
                    <div className="col-span-2">結束時間</div>
                    <div className="col-span-3">類型</div>
                    <div className="col-span-2 text-center">操作</div>
                </div>
                
                {timeSlots.map((slot) => (
                    <div key={slot.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                        <div className="col-span-3">
                            <input 
                                value={slot.name} 
                                onChange={(e) => handleTimeSlotChange(slot.id, 'name', e.target.value)}
                                className="w-full font-bold text-slate-700 bg-transparent outline-none border-b border-transparent focus:border-blue-500"
                            />
                        </div>
                        <div className="col-span-2">
                            <CustomTimeInput 
                                value={slot.start} 
                                onChange={(val) => handleTimeSlotChange(slot.id, 'start', val)}
                            />
                        </div>
                        <div className="col-span-2">
                            <CustomTimeInput 
                                value={slot.end} 
                                onChange={(val) => handleTimeSlotChange(slot.id, 'end', val)}
                            />
                        </div>
                        <div className="col-span-3">
                            <select 
                                value={slot.type} 
                                onChange={(e) => handleTimeSlotChange(slot.id, 'type', e.target.value)}
                                className={`w-full text-sm font-bold rounded px-2 py-1 outline-none ${slot.type === 'class' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}
                            >
                                <option value="class">上課 (Class)</option>
                                <option value="break">下課/作息 (Break)</option>
                            </select>
                        </div>
                        <div className="col-span-2 text-center">
                            <button 
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                <button 
                    onClick={handleAddSlot}
                    className="w-full py-3 mt-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 hover:border-slate-400 transition flex items-center justify-center gap-2"
                >
                    <Plus size={20} /> 新增時間段
                </button>
            </div>
            <p className="text-sm text-slate-400 mt-2">💡 提示：修改時間後，系統會自動按「開始時間」重新排序。</p>
          </SettingsSection>

          <SettingsSection 
            title="全天/半天設定" 
            icon={Calendar} 
            isOpen={expandedSections['dayTypes']} 
            onToggle={() => toggleSection('dayTypes')}
            colorClass="text-orange-600"
          >
             <div className="bg-orange-50 p-4 rounded-xl grid grid-cols-5 gap-3 border border-orange-100">
                {[1,2,3,4,5].map(day => (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">週{WEEKDAYS[day]}</span>
                    <div className="flex flex-col gap-1 w-full">
                        <button
                            onClick={() => setDayTypes(prev => ({...prev, [day]: 'full'}))}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border shadow-sm flex items-center justify-center gap-1 ${
                                dayTypes[day] === 'full' 
                                ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300' 
                                : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {dayTypes[day] === 'full' && <Check size={12}/>} 全天
                        </button>
                        <button
                            onClick={() => setDayTypes(prev => ({...prev, [day]: 'half'}))}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border shadow-sm flex items-center justify-center gap-1 ${
                                dayTypes[day] === 'half' 
                                ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-200' 
                                : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {dayTypes[day] === 'half' && <Check size={12}/>} 半天
                        </button>
                    </div>
                  </div>
                ))}
             </div>
             <p className="text-sm text-slate-500 mt-3">💡 提示：半天課時，第五節（含）以後的時間會被判定為「放學」。</p>
          </SettingsSection>

          <SettingsSection 
            title="快捷按鈕管理" 
            icon={MapPin} 
            isOpen={expandedSections['buttons']} 
            onToggle={() => toggleSection('buttons')}
            colorClass="text-purple-600"
          >
             <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-4">
                {/* 單獨按鈕 */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">常用動作</h4>
                    <div className="flex flex-wrap gap-2">
                        {systemButtonsConfig.singles.map(btn => (
                            <button key={btn.id} onClick={() => toggleButtonVisibility(btn.id)} className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ${visibleButtons.includes(btn.id) ? 'bg-purple-600 text-white shadow-md border-purple-700' : 'bg-white text-slate-400 border-slate-200 opacity-60 grayscale'}`}>
                                {visibleButtons.includes(btn.id) && <Check size={14}/>}
                                <btn.icon size={14}/> {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* 群組按鈕 */}
                {systemButtonsConfig.groups.map(group => (
                    <div key={group.id}>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><group.icon size={12}/> {group.label}</h4>
                        <div className="flex flex-wrap gap-2">
                            {group.items.map(btn => (
                                <button key={btn.id} onClick={() => toggleButtonVisibility(btn.id)} className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ${visibleButtons.includes(btn.id) ? 'bg-purple-600 text-white shadow-md border-purple-700' : 'bg-white text-slate-400 border-slate-200 opacity-60 grayscale'}`}>
                                    {visibleButtons.includes(btn.id) && <Check size={14}/>}
                                    <btn.icon size={14}/> {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
             </div>
          </SettingsSection>

          <SettingsSection 
            title="課表設定" 
            icon={BookOpen} 
            isOpen={expandedSections['schedule']} 
            onToggle={() => toggleSection('schedule')}
            colorClass="text-blue-600"
          >
            <div className="grid grid-cols-6 gap-2 text-sm text-center mb-2 font-bold bg-slate-100 p-3 rounded-xl text-slate-600">
              <div>節次</div>
              {Object.keys(schedule).map(day => <div key={day}>週{WEEKDAYS[day]}</div>)}
            </div>
            {timeSlots.filter(s => s.type === 'class').map(slot => (
              <div key={slot.id} className="grid grid-cols-6 gap-2 mb-2">
                <div className="flex items-center justify-center font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg text-sm">{slot.name}</div>
                {Object.keys(schedule).map(day => (
                  <select
                    key={`${day}-${slot.id}`}
                    value={schedule[day][slot.id] || ''}
                    onChange={(e) => setSchedule({...schedule, [day]: {...schedule[day], [slot.id]: e.target.value}})}
                    className="border rounded-lg p-2 text-center text-sm outline-none hover:bg-slate-50"
                  >
                    <option value="">(空堂)</option>
                    {Object.keys(subjectHints).filter(k => k !== 'default').map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                ))}
              </div>
            ))}
            <p className="text-sm text-slate-400 mt-2">💡 提示：若要修改「節次名稱」或「時間」，請至上方的「作息時間表設定」。</p>
          </SettingsSection>

          <SettingsSection 
            title="科目與提醒詞管理" 
            icon={Coffee} 
            isOpen={expandedSections['hints']} 
            onToggle={() => toggleSection('hints')}
            colorClass="text-emerald-600"
          >
             <div className="flex gap-2 mb-4">
                <input value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="新科目名稱..." className="flex-1 p-2 border rounded-lg outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()} />
                <button onClick={handleAddSubject} className="bg-emerald-600 text-white px-4 rounded-lg font-bold"><Plus size={18}/></button>
             </div>
             <div className="space-y-2">
               {Object.keys(subjectHints).map(subject => (
                 <div key={subject} className="flex gap-2 items-center bg-white p-2 rounded-lg border">
                    {subject === 'default' ? <span className="px-3 py-1 bg-slate-100 rounded text-sm font-bold text-slate-500 w-32 text-center">預設</span> : 
                    <input defaultValue={subject} onBlur={(e) => handleRenameSubject(subject, e.target.value)} className="w-32 px-2 py-1 font-bold text-slate-700 bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-sm"/>}
                    <input value={subjectHints[subject]} onChange={(e) => setSubjectHints({...subjectHints, [subject]: e.target.value})} className="flex-1 bg-transparent outline-none text-sm" />
                    {subject !== 'default' && <button onClick={() => handleDeleteSubject(subject)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>}
                 </div>
               ))}
             </div>
          </SettingsSection>

          <SettingsSection 
            title="系統維護 (備份/還原/測試)" 
            icon={Save} 
            isOpen={expandedSections['maintenance']} 
            onToggle={() => toggleSection('maintenance')}
            colorClass="text-slate-500"
          >
             <div className="space-y-4">
                <div className="bg-slate-100 p-4 rounded-xl flex gap-4 items-center flex-wrap">
                     <span className="font-bold text-slate-700">模擬：</span>
                     <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="p-2 rounded border"><option value="">(原星期)</option>{WEEKDAYS.map((d,i)=><option key={i} value={i}>週{d}</option>)}</select>
                     <CustomTimeInput value={tempTime} onChange={setTempTime} />
                     <button onClick={applyTimeChange} className="px-4 py-2 bg-blue-600 text-white rounded font-bold">套用</button>
                     <button onClick={() => {setTimeOffset(0); setIsManualEco(false); setIsAutoEcoOverride(true);}} className="px-4 py-2 bg-slate-600 text-white rounded font-bold">重置</button>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleExport} className="flex-1 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold flex justify-center gap-2"><Download size={20}/> 備份設定</button>
                  <button onClick={() => fileInputRef.current.click()} className="flex-1 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold flex justify-center gap-2"><Upload size={20}/> 還原設定</button>
                  <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json"/>
                </div>
             </div>
          </SettingsSection>

        </div>

        <div className="p-4 border-t bg-white flex justify-end gap-3 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => {
              if(confirm('重置將恢復到最初的預設狀態，確定嗎？')) {
                 setTimeSlots(defaultValues.TIME_SLOTS);
                 setSchedule(defaultValues.SCHEDULE);
                 setSubjectHints(defaultValues.SUBJECT_HINTS);
                 setDayTypes(defaultValues.DAY_TYPES);
                 setTimeOffset(0);
                 setIsManualEco(false);
                 setIsAutoEcoOverride(false);
                 setIs24Hour(true);
                 const allIds = [
                    ...systemButtonsConfig.singles.map(b => b.id),
                    ...systemButtonsConfig.groups.flatMap(g => g.items.map(b => b.id))
                 ];
                 setVisibleButtons(allIds);
              }
            }}
            className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-2 font-bold transition-colors"
          >
            <RefreshCw size={18}/> 重置預設
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all font-bold"
          >
            <Save size={18} /> 完成設定
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 共用元件 ---

const QuietModeView = ({ title, subtext, icon: IconComponent, centerContent, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse pointer-events-none"></div>
      <Star className="absolute top-10 right-20 text-yellow-100 opacity-40 w-4 h-4 animate-ping pointer-events-none" />
      <Star className="absolute bottom-10 left-20 text-yellow-100 opacity-30 w-6 h-6 animate-pulse pointer-events-none" />
      <Star className="absolute top-1/3 left-10 text-blue-200 opacity-20 w-3 h-3 animate-pulse delay-700 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center p-8 w-full h-full">
         <div className="mb-12 flex flex-col items-center">
            {IconComponent && <IconComponent size={80} className="text-indigo-200 mb-6 drop-shadow-[0_0_15px_rgba(199,210,254,0.5)]" />}
            <h2 className="text-6xl font-bold text-indigo-100 tracking-wider mb-4">{title}</h2>
            {/* 修正廣播副標題顯示邏輯：如果沒傳入 subtext，則不渲染，避免空行佔位或顯示 undefined */}
            {subtext && <p className="text-2xl text-indigo-300 font-light">{subtext}</p>}
         </div>
         {centerContent}
         {onClose && (
           <button onClick={onClose} className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50 group" title="回到主畫面 (Esc)">
             <X size={32} className="group-hover:scale-110 transition-transform"/>
           </button>
         )}
      </div>
    </div>
  );
};

const ToolsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('timer');
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  const audioRef = useRef(null);
  const tickRef = useRef(null); 
  
  const [studentCount, setStudentCount] = useState(30);
  const [pickedNumber, setPickedNumber] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
           if (prev <= 6 && prev > 1 && tickRef.current) {
             tickRef.current.currentTime = 0;
             tickRef.current.play().catch(e => {});
           }
           return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    } else if (timeLeft === 0) {
        setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const startTimer = (mins) => {
    setTimeLeft(Math.floor(mins * 60));
    setIsTimerRunning(true);
  };

  const handlePick = () => {
    if (isRolling) return;
    setIsRolling(true);
    setPickedNumber(null);
    let count = 0;
    const maxCount = 20;
    const interval = setInterval(() => {
      setPickedNumber(Math.floor(Math.random() * studentCount) + 1);
      count++;
      if (count >= maxCount) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 50);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><Box size={24}/> 教室百寶箱</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full"><X size={20}/></button>
        </div>
        
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('timer')}
            className={`flex-1 py-4 font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'timer' ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Clock size={20}/> 倒數計時
          </button>
          <button 
            onClick={() => setActiveTab('random')}
            className={`flex-1 py-4 font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'random' ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Shuffle size={20}/> 幸運抽籤
          </button>
        </div>

        <div className="p-8 min-h-[300px] flex flex-col items-center justify-center">
          {activeTab === 'timer' && (
            <div className="w-full flex flex-col items-center">
               <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg" preload="auto" />
               <audio ref={tickRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" preload="auto" />

               <div className={`text-8xl font-mono font-bold mb-8 ${timeLeft < 10 && timeLeft > 0 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                 {formatTime(timeLeft)}
               </div>
               
               <div className="flex gap-4 mb-4 w-full justify-center">
                 {[1,3,5,10].map(m => (
                    <button key={m} onClick={() => startTimer(m)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold">{m}分鐘</button>
                 ))}
               </div>

               <div className="flex gap-2 mb-8 items-center bg-slate-50 p-2 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-slate-500 font-bold text-sm pl-2">自訂：</span>
                  <input 
                    type="number" 
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    placeholder="分鐘"
                    className="w-24 p-2 border rounded-lg text-center font-bold text-slate-700 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && customMinutes) {
                            startTimer(Number(customMinutes));
                            setCustomMinutes('');
                        }
                    }}
                  />
                  <button 
                    onClick={() => {
                        if(customMinutes) {
                            startTimer(Number(customMinutes));
                            setCustomMinutes('');
                        }
                    }}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-bold transition-colors text-sm"
                  >
                    設定
                  </button>
               </div>

               <div className="flex gap-4">
                 <button 
                   onClick={() => setIsTimerRunning(!isTimerRunning)}
                   className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${isTimerRunning ? 'bg-amber-500' : 'bg-green-500'}`}
                 >
                   {isTimerRunning ? <Pause size={32}/> : <Play size={32}/>}
                 </button>
                 <button 
                   onClick={() => { setIsTimerRunning(false); setTimeLeft(0); }}
                   className="w-16 h-16 rounded-full flex items-center justify-center text-slate-500 bg-slate-200 shadow-lg transition-transform hover:scale-105 active:scale-95 hover:bg-slate-300"
                 >
                   <RotateCcw size={32}/>
                 </button>
               </div>
            </div>
          )}

          {activeTab === 'random' && (
            <div className="w-full flex flex-col items-center">
               <div className="mb-4 flex items-center gap-2">
                 <span className="text-slate-500 font-bold">班級人數：</span>
                 <input 
                   type="number" 
                   value={studentCount} 
                   onChange={(e) => setStudentCount(Number(e.target.value))}
                   className="w-20 p-2 border rounded-lg text-center font-bold text-slate-700 focus:ring-2 focus:ring-purple-400 outline-none"
                 />
               </div>

               <div className="w-48 h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center border-4 border-white shadow-inner mb-8">
                  <span className={`text-8xl font-bold text-purple-600 ${isRolling ? 'blur-sm' : ''}`}>
                    {pickedNumber !== null ? pickedNumber : '?'}
                  </span>
               </div>

               <button 
                 onClick={handlePick}
                 disabled={isRolling}
                 className="px-8 py-4 bg-purple-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
               >
                 <Shuffle/> {isRolling ? '抽選中...' : '開始抽籤'}
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BroadcastInputModal = ({ isOpen, onClose, onConfirm, customPresets, setCustomPresets }) => {
  const [activeTabId, setActiveTabId] = useState(1);
  const [title, setTitle] = useState('');
  const [sub, setSub] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    if (isOpen) {
      const preset = customPresets.find(p => p.id === activeTabId);
      if (preset) {
        setTitle(preset.title);
        setSub(preset.sub);
        setTempName(preset.name);
      }
    }
  }, [isOpen, activeTabId, customPresets]);

  const handleSavePreset = () => {
    const newPresets = customPresets.map(p => 
      p.id === activeTabId 
        ? { ...p, title, sub, name: isEditingName ? tempName : p.name } 
        : p
    );
    setCustomPresets(newPresets);
    setIsEditingName(false);
  };

  const handlePublish = () => {
    handleSavePreset();
    onConfirm(title, sub);
    onClose(); 
  };

  if (!isOpen) return null;

  const currentPreset = customPresets.find(p => p.id === activeTabId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="text-pink-500" />
            發布自訂廣播
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
        </div>
        
        <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
            {customPresets.map(preset => (
                <button
                    key={preset.id}
                    onClick={() => setActiveTabId(preset.id)}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                        activeTabId === preset.id 
                        ? 'bg-white text-pink-600 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-200/50'
                    }`}
                >
                    {preset.name}
                </button>
            ))}
        </div>

        <div className="space-y-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">按鈕名稱</span>
                {isEditingName ? (
                    <div className="flex items-center gap-2 flex-1">
                        <input 
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="px-2 py-1 text-sm border rounded w-32"
                            autoFocus
                        />
                        <button onClick={() => { handleSavePreset(); setIsEditingName(false); }} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">V</button>
                    </div>
                ) : (
                    <button onClick={() => { setTempName(currentPreset?.name); setIsEditingName(true); }} className="text-xs flex items-center gap-1 text-slate-400 hover:text-blue-500">
                        {currentPreset?.name} <Edit3 size={10}/>
                    </button>
                )}
            </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 mb-1">主標題</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none text-lg font-bold"
              placeholder="例如：全班集合"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-1">副標題</label>
            <input 
              value={sub}
              onChange={(e) => setSub(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
              placeholder="例如：請帶水壺至走廊"
            />
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 text-center">
            <div className="text-xs text-slate-400 font-bold mb-2">畫面預覽</div>
            <div className="text-2xl font-bold text-slate-800">{title || '主標題'}</div>
            <div className="text-sm text-slate-500 mt-1">{sub || '副標題'}</div>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
          >
            取消
          </button>
          <button 
            onClick={handlePublish}
            disabled={!title}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            發布廣播
          </button>
        </div>
      </div>
    </div>
  );
};

const CircularProgress = ({ progress, size = 300, strokeWidth = 15, children, colorClass }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle className="text-slate-200/30" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <circle className={`transition-all duration-1000 ease-linear ${colorClass}`} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">{children}</div>
    </div>
  );
};

const MessageInput = ({ isOpen, onClose, message, setMessage }) => {
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message, isOpen]);
  const fontSizeClass = message.length > 50 ? 'text-xl' : (message.length > 20 ? 'text-2xl' : 'text-3xl');

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
       <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all scale-100 flex flex-col gap-4">
          <h3 className="text-2xl font-bold text-slate-700">新增便利貼留言 (可換行)</h3>
          <textarea ref={textareaRef} autoFocus value={message} onChange={e => setMessage(e.target.value)} className={`w-full font-bold p-4 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none resize-none overflow-hidden ${fontSizeClass}`} placeholder="例如：請將聯絡簿交到講桌&#10;記得帶水壺" rows={3} style={{ minHeight: '120px', maxHeight: '400px' }} />
          <div className="flex justify-end gap-3">
             <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">完成</button>
             <button onClick={() => { setMessage(''); onClose(); }} className="px-6 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50">清除</button>
          </div>
       </div>
    </div>
  );
};

const ControlDock = ({ 
  statusMode, setSpecialStatus, setIsManualEco, isFullscreen, toggleFullScreen, setShowSettings, isAutoNapActive, onBroadcastClick, visibleButtons, 
  forceDark, setForceDark, setShowTools 
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    if (activeDropdown) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  if (statusMode === 'eco' || statusMode === 'special' || isAutoNapActive) return null;
  const isDark = statusMode === 'off-hours' || forceDark;
  const toggleDropdown = (id) => setActiveDropdown(prev => prev === id ? null : id);
  const getVisibleItems = (items) => items.filter(item => visibleButtons.includes(item.id));

  return (
    <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-2 rounded-2xl shadow-2xl border flex items-center gap-2 whitespace-nowrap z-50 transition-all backdrop-blur-md max-w-[95vw] overflow-visible no-scrollbar hover:scale-105 ${isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-white/50'}`}>
      <button onClick={onBroadcastClick} className={`px-3 py-2 rounded-xl font-bold text-white text-sm shadow-sm transition-all hover:-translate-y-1 bg-gradient-to-r from-pink-500 to-rose-500 flex items-center gap-1`}>
        <Megaphone size={16} /> 自訂廣播
      </button>
      <div className={`w-px h-6 mx-1 shrink-0 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
      {SYSTEM_BUTTONS_CONFIG.singles.filter(btn => visibleButtons.includes(btn.id)).map(btn => (
        <button key={btn.id} onClick={() => setSpecialStatus(btn)} className={`px-3 py-2 rounded-xl font-bold text-white text-sm shadow-sm transition-all hover:-translate-y-1 bg-gradient-to-br flex items-center gap-1 ${btn.color}`}>
          <btn.icon size={16} /> {btn.label}
        </button>
      ))}
      {SYSTEM_BUTTONS_CONFIG.groups.map(group => {
          const visibleItems = getVisibleItems(group.items);
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.id} className="relative group">
                <button onClick={(e) => { e.stopPropagation(); toggleDropdown(group.id); }} className={`px-3 py-2 rounded-xl font-bold text-white text-sm shadow-sm transition-all hover:-translate-y-1 flex items-center gap-1 ${group.color} ${activeDropdown === group.id ? 'ring-2 ring-white ring-opacity-50' : ''}`}>
                    <group.icon size={16} /> {group.label}
                </button>
                {activeDropdown === group.id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-2 flex flex-col gap-1 animate-in slide-in-from-bottom-2 duration-200 origin-bottom z-50">
                        {visibleItems.map(item => (
                            <button key={item.id} onClick={() => setSpecialStatus(item)} className={`w-full text-left px-3 py-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-3 text-slate-700 font-bold`}>
                                <div className={`p-2 rounded-full text-white bg-gradient-to-br ${item.color}`}><item.icon size={14} /></div>
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
          );
      })}
      <div className={`w-px h-6 mx-1 shrink-0 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
      <button onClick={(e) => { e.stopPropagation(); setIsManualEco(true); }} className={`p-2 rounded-xl transition-all hover:-translate-y-1 shrink-0 ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`} title="時鐘模式 (省電)"><Clock size={20} /></button>
      <button onClick={() => setForceDark(!forceDark)} className={`p-2 rounded-xl transition-all hover:-translate-y-1 shrink-0 ${isDark ? 'text-yellow-400 hover:bg-slate-700' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`} title="切換深色模式">
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <button onClick={() => setShowTools(true)} className={`p-2 rounded-xl transition-all hover:-translate-y-1 shrink-0 ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`} title="教室小工具"><Box size={20} /></button>
      <button onClick={toggleFullScreen} className={`p-2 rounded-xl transition-all hover:-translate-y-1 shrink-0 ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`} title={isFullscreen ? "退出全螢幕" : "全螢幕模式"}>
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
      <button onClick={() => setShowSettings(true)} className={`p-2 rounded-xl shadow-lg transition-all hover:-translate-y-1 shrink-0 ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-800 text-white hover:bg-slate-700'}`}><Settings size={20} /></button>
    </div>
  );
};

const SidebarHeader = ({ now, is24Hour, dayTypes }) => {
  const rocYear = now.getFullYear() - 1911;
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const dateNum = now.getDate().toString().padStart(2, '0');
  const week = WEEKDAYS[now.getDay()];
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;
  const dayTypeLabel = isWeekend ? '假日' : (dayTypes[day] === 'full' ? '全天課' : '半天課');

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg shrink-0">
      <div className="text-4xl font-mono font-bold tracking-tight">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: !is24Hour })}</div>
      <div className="text-blue-100 mt-2 text-sm font-medium flex flex-col gap-1">
        <span>民國{rocYear}年{month}月{dateNum}日</span>
        <div className="flex justify-between items-center"><span>星期{week}</span><span className={`px-2 py-0.5 bg-white/20 rounded-md text-xs border border-white/10 shadow-sm ${isWeekend ? 'bg-red-500/30 border-red-400/50' : ''}`}>{dayTypeLabel}</span></div>
      </div>
    </div>
  );
};

const SidebarList = React.memo(({ displaySlots, daySchedule, currentSlotId, nextSlotId }) => {
  const activeRef = useRef(null);
  useEffect(() => {
    if (activeRef.current) activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentSlotId]); 

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth no-scrollbar">
      {displaySlots.map((slot) => {
        const subject = daySchedule[slot.id] || slot.name;
        const isCurrent = currentSlotId === slot.id;
        const isNext = nextSlotId === slot.id;
        return (
          <div key={slot.id} ref={isCurrent ? activeRef : null} className={`relative p-4 rounded-xl transition-all duration-500 ${isCurrent ? 'bg-indigo-600 border-l-4 border-indigo-400 shadow-md transform scale-105 z-10' : (isNext ? 'bg-blue-50 border-l-4 border-blue-400 shadow-sm border-dashed' : 'bg-slate-50/50 border-l-4 border-transparent opacity-60 grayscale')}`}>
             {isNext && <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm font-bold animate-pulse">NEXT</div>}
            <div className={`flex justify-between items-center text-xs font-mono mb-1 ${isCurrent ? 'text-indigo-200' : 'text-slate-400'}`}><span>{slot.start}</span><span>{slot.end}</span></div>
            <div className={`text-lg font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-600'}`}>{subject || slot.name}</div>
          </div>
        );
      })}
    </div>
  );
}, (prevProps, nextProps) => {
  return (prevProps.currentSlotId === nextProps.currentSlotId && prevProps.nextSlotId === nextProps.nextSlotId && prevProps.daySchedule === nextProps.daySchedule && prevProps.displaySlots === nextProps.displaySlots);
});

const TimelineSidebar = ({ now, schedule, activeTimeSlots, currentSlot, nextSlot, is24Hour, dayTypes }) => {
  const daySchedule = schedule[now.getDay()] || {};
  const currentSlotId = currentSlot?.id;
  const nextSlotId = nextSlot?.id;
  const displaySlots = useMemo(() => activeTimeSlots.filter(s => (s.type === 'class' || [ 'lunch', 'cleaning'].includes(s.id)) && s.id !== 'lunch_prep'), [activeTimeSlots]);

  return (
    <div className="w-64 h-full bg-white/80 backdrop-blur-md border-r border-white/20 flex flex-col shadow-xl z-20">
      <SidebarHeader now={now} is24Hour={is24Hour} dayTypes={dayTypes} />
      <SidebarList displaySlots={displaySlots} daySchedule={daySchedule} currentSlotId={currentSlotId} nextSlotId={nextSlotId} />
    </div>
  );
};

// ... App (ClassroomDashboardV2) ...
const ClassroomDashboardV2 = () => {
  const [timeSlots, setTimeSlots] = useState(() => JSON.parse(localStorage.getItem('timeSlots')) || DEFAULT_TIME_SLOTS);
  const [schedule, setSchedule] = useState(() => JSON.parse(localStorage.getItem('schedule')) || DEFAULT_SCHEDULE);
  const [subjectHints, setSubjectHints] = useState(() => JSON.parse(localStorage.getItem('subjectHints')) || DEFAULT_SUBJECT_HINTS);
  const [is24Hour, setIs24Hour] = useState(() => { const saved = localStorage.getItem('is24Hour'); return saved !== null ? JSON.parse(saved) : true; });
  const [dayTypes, setDayTypes] = useState(() => JSON.parse(localStorage.getItem('dayTypes')) || DEFAULT_DAY_TYPES);
  const [customPresets, setCustomPresets] = useState(() => JSON.parse(localStorage.getItem('customPresets')) || DEFAULT_CUSTOM_BROADCASTS);
  const [visibleButtons, setVisibleButtons] = useState(() => {
      const saved = localStorage.getItem('visibleButtons');
      if (saved) return JSON.parse(saved);
      return [...SYSTEM_BUTTONS_CONFIG.singles.map(b => b.id), ...SYSTEM_BUTTONS_CONFIG.groups.flatMap(g => g.items.map(b => b.id))];
  });

  const [teacherMessage, setTeacherMessage] = useState('');
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTools, setShowTools] = useState(false); 
  const [showBroadcastInput, setShowBroadcastInput] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false); 
  const [now, setNow] = useState(new Date());
  const [timeOffset, setTimeOffset] = useState(0); 
  const [statusMode, setStatusMode] = useState('loading'); 
  const [specialStatus, setSpecialStatus] = useState(null);
  const [isManualEco, setIsManualEco] = useState(false); 
  const [isAutoEcoOverride, setIsAutoEcoOverride] = useState(false);
  const [dismissedNap, setDismissedNap] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [nextSlot, setNextSlot] = useState(null);
  const [progress, setProgress] = useState(100);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [saverPos, setSaverPos] = useState({ x: 0, y: 0 });
  
  // 新增手動深色模式狀態
  const [forceDark, setForceDark] = useState(false);

  // 鍵盤與時間邏輯 (省略重複代碼，保留核心邏輯)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (showSettings || showBroadcastInput || isEditingMessage) return;
      if (e.key === 'f' || e.key === 'F') toggleFullScreen();
      if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false);
        if (showTools) setShowTools(false);
        if (showBroadcastInput) setShowBroadcastInput(false);
        if (specialStatus) setSpecialStatus(null);
        if (isEditingMessage) setIsEditingMessage(false);
        if (statusMode === 'break' && !dismissedNap) setDismissedNap(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings, showTools, showBroadcastInput, specialStatus, isEditingMessage, dismissedNap, statusMode]);

  // 全螢幕切換函式
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((e) => {
            console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };

  // Active Time Slots Logic
  const activeTimeSlots = useMemo(() => {
    const day = now.getDay();
    if (day === 0 || day === 6) return []; 
    const isHalfDay = dayTypes[day] === 'half';
    if (!isHalfDay) return timeSlots;
    const halfDaySlots = [];
    let isDismissed = false;
    const p5Start = timeSlots.find(s => s.id === 'p5')?.start || '13:20';
    for (let slot of timeSlots) {
       if (isDismissed) continue;
       if (slot.id === 'break3') { halfDaySlots.push({ ...slot, name: '打掃時間' }); continue; }
       if (getSecondsFromTime(slot.start) >= getSecondsFromTime(p5Start)) {
          halfDaySlots.push({ id: 'after', name: '放學', start: slot.start, end: '17:00', type: 'break' });
          isDismissed = true;
          continue;
       }
       halfDaySlots.push(slot);
    }
    return halfDaySlots;
  }, [timeSlots, dayTypes, now.getDay()]);

  const isNapTime = currentSlot?.name.includes('午休') || currentSlot?.id === 'nap';
  const isDismissal = currentSlot?.name.includes('放學') || currentSlot?.id === 'after';
  const isAutoNapActive = (isNapTime || isDismissal) && !dismissedNap && statusMode === 'break';

  // Effects
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date(Date.now() + timeOffset)), 1000);
    return () => clearInterval(timer);
  }, [timeOffset]);
  useEffect(() => {
    if (statusMode === 'eco') {
      const interval = setInterval(() => setSaverPos({ x: Math.floor(Math.random() * 100 - 50), y: Math.floor(Math.random() * 100 - 50) }), 60000);
      return () => clearInterval(interval);
    }
  }, [statusMode]);
  useEffect(() => {
    localStorage.setItem('timeSlots', JSON.stringify(timeSlots));
    localStorage.setItem('schedule', JSON.stringify(schedule));
    localStorage.setItem('subjectHints', JSON.stringify(subjectHints));
    localStorage.setItem('is24Hour', JSON.stringify(is24Hour));
    localStorage.setItem('dayTypes', JSON.stringify(dayTypes));
    localStorage.setItem('customPresets', JSON.stringify(customPresets));
    localStorage.setItem('visibleButtons', JSON.stringify(visibleButtons));
  }, [timeSlots, schedule, subjectHints, customPresets, visibleButtons, is24Hour, dayTypes]);
  useEffect(() => {
    if (!showSettings) { setIsAutoEcoOverride(false); setDismissedNap(false); }
  }, [currentSlot?.id, showSettings]);

  // Main Status Logic
  useEffect(() => {
    if (specialStatus) { setStatusMode('special'); return; }
    if (isManualEco) { setStatusMode('eco'); return; }
    const currentTimeSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let foundSlot = null;
    let nextClass = null;
    const sortedSlots = [...activeTimeSlots].sort((a, b) => getSecondsFromTime(a.start) - getSecondsFromTime(b.start));
    if (activeTimeSlots.length === 0) { setStatusMode('off-hours'); setCurrentSlot(null); setNextSlot(null); return; }
    for (let i = 0; i < sortedSlots.length; i++) {
      const slot = sortedSlots[i];
      const startSec = getSecondsFromTime(slot.start);
      const endSec = getSecondsFromTime(slot.end);
      if (currentTimeSec >= startSec && currentTimeSec < endSec) {
        foundSlot = slot;
        for (let j = i + 1; j < sortedSlots.length; j++) { if (sortedSlots[j].type === 'class') { nextClass = sortedSlots[j]; break; } }
        break;
      }
    }
    setCurrentSlot(foundSlot);
    setNextSlot(nextClass);
    if (!foundSlot) { setStatusMode('off-hours'); return; }
    if (foundSlot.type === 'class') {
      const startSec = getSecondsFromTime(foundSlot.start);
      const elapsed = currentTimeSec - startSec;
      if (elapsed > 180 && !isAutoEcoOverride) setStatusMode('eco'); else setStatusMode('class');
    } else {
      const startSec = getSecondsFromTime(foundSlot.start);
      const endSec = getSecondsFromTime(foundSlot.end);
      const total = endSec - startSec;
      const remain = endSec - currentTimeSec;
      setSecondsRemaining(remain);
      setProgress(Math.max(0, Math.min(100, (remain / total) * 100)));
      if (remain <= 60 && remain > 0) setStatusMode('pre-bell'); else setStatusMode('break');
    }
  }, [now, activeTimeSlots, specialStatus, isManualEco]);

  // View Components (簡化保留，實作邏輯不變)
  const getNextSubjectName = () => {
    if (!nextSlot) return '放學';
    const daySchedule = schedule[now.getDay()];
    if (!daySchedule) return '無課表';
    return daySchedule[nextSlot.id] || nextSlot.name;
  };
  const getSystemHint = () => {
    if (currentSlot && (currentSlot.name.includes('打掃') || currentSlot.id === 'cleaning')) return subjectHints['全天打掃'] || subjectHints['打掃時間'] || '請拿起掃具，認真打掃環境，保持整潔';
    if (currentSlot && (currentSlot.name.includes('午餐') || currentSlot.name.includes('午休') || currentSlot.name.includes('放學'))) return subjectHints[currentSlot.name] || '請保持安靜';
    const subject = getNextSubjectName();
    return subjectHints[subject] || subjectHints['default'];
  };
  const formatCountdown = (secs) => `${Math.floor(secs / 60)}:${secs % 60 < 10 ? '0' : ''}${secs % 60}`;
  const formatROCDate = (date) => {
    const rocYear = date.getFullYear() - 1911;
    const week = WEEKDAYS[date.getDay()];
    return `民國${rocYear}年${(date.getMonth() + 1).toString().padStart(2,'0')}月${date.getDate().toString().padStart(2,'0')}日 星期${week}`;
  };

  const BreakView = () => {
    const isPreBell = statusMode === 'pre-bell';
    const isNap = currentSlot?.name.includes('午休'); 
    const isDismissal = currentSlot?.name.includes('放學');
    const isCleaning = currentSlot && (currentSlot.name.includes('打掃') || currentSlot.id === 'cleaning');
    const isLunch = currentSlot && currentSlot.name.includes('午餐');
    const progressColor = (isNap || isDismissal) ? 'text-indigo-400' : (isPreBell ? 'text-red-500' : (progress > 50 ? 'text-emerald-500' : 'text-amber-400'));
    
    if ((isNap || isDismissal) && !dismissedNap) {
      const title = isNap ? "午休時間" : "放學時間";
      const subtext = isNap ? "Shhh... 請保持安靜，好好休息" : "請收拾書包，準備回家";
      const icon = isNap ? Moon : Home;
      return <QuietModeView title={title} subtext={subtext} icon={icon} onClose={() => setDismissedNap(true)} centerContent={<div className="flex flex-col items-center"><div className="text-8xl font-mono font-bold text-slate-200 drop-shadow-2xl">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: !is24Hour })}</div><div className="mt-8 bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/10 text-indigo-200"><span className="mr-4">{isNap ? '💤' : '🏠'}</span>{getSystemHint()}</div></div>} />;
    }

    return (
      <div className={`flex-1 relative overflow-hidden transition-colors duration-1000 ${isPreBell ? 'bg-red-50' : 'bg-slate-100'}`}>
        {/* Force Dark Mode Overlay */}
        {forceDark && <div className="absolute inset-0 bg-slate-900/90 z-0 pointer-events-none transition-colors duration-500"></div>}
        
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        <div className="h-full flex flex-col relative z-10">
          <div className="flex justify-between items-start p-8">
            <div className={`bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-white/50 ${forceDark ? 'bg-slate-800/60 border-slate-700' : ''}`}><span className={`font-bold mr-2 ${forceDark ? 'text-slate-400' : 'text-slate-500'}`}>目前時段</span><span className={`text-2xl font-bold ${forceDark ? 'text-white' : 'text-slate-800'}`}>{currentSlot?.name}</span></div>
            {timeOffset !== 0 && <div className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-bold animate-pulse border border-red-200">⚠️ 時間模擬模式中</div>}
          </div>
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 px-8 pb-8">
            <div className={`relative transition-all duration-500 ${isPreBell ? 'scale-110' : ''}`}><CircularProgress progress={progress} size={400} strokeWidth={24} colorClass={progressColor}>
                <div className="text-center flex flex-col items-center">
                    <div className={`absolute -top-24 backdrop-blur-md px-8 py-3 rounded-full shadow-lg border-2 flex items-center gap-4 transform hover:scale-105 transition-transform z-20 ${forceDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-indigo-100'}`}><span className="text-lg font-bold text-slate-400 uppercase tracking-wider">NEXT</span><div className={`flex items-center gap-2 text-4xl font-bold ${forceDark ? 'text-indigo-400' : 'text-indigo-600'}`}><ArrowRight size={32} strokeWidth={3} /> {getNextSubjectName()}</div></div>
                    <div className={`text-[7rem] font-bold font-mono tracking-tighter leading-none ${isPreBell ? 'text-red-600 animate-pulse' : (forceDark ? 'text-slate-200' : 'text-slate-700')}`}>{formatCountdown(secondsRemaining)}</div><div className="text-slate-400 font-medium mt-2 tracking-widest uppercase">{isPreBell ? '預備鐘響' : 'REMAINING'}</div>
                </div>
            </CircularProgress></div>
            <div className="max-w-xl w-full flex flex-col gap-6">
              {teacherMessage ? (
                    <div onClick={() => setIsEditingMessage(true)} className="bg-yellow-200 p-6 shadow-lg transform rotate-1 hover:rotate-0 transition-transform cursor-pointer relative group" style={{ fontFamily: 'cursive, sans-serif' }}>
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-300/50 backdrop-blur-sm rotate-1"></div>
                        <div className="flex justify-between items-start mb-2 opacity-50"><span className="text-xs font-bold uppercase tracking-widest text-yellow-800">MEMO</span><Edit3 size={16} className="text-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity"/></div>
                        <p className={`font-bold text-slate-800 leading-snug break-words whitespace-pre-wrap ${teacherMessage.length > 50 ? 'text-2xl' : 'text-3xl'}`}>{teacherMessage}</p>
                    </div>
                  ) : (!isPreBell && (<button onClick={() => setIsEditingMessage(true)} className={`group flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed transition-all ${forceDark ? 'border-slate-600 hover:border-yellow-600 hover:bg-yellow-900/20' : 'border-slate-300 hover:border-yellow-400 hover:bg-yellow-50'}`}><Edit3 className={`group-hover:text-yellow-600 ${forceDark ? 'text-slate-500' : 'text-slate-400'}`} /><span className={`font-bold group-hover:text-yellow-700 ${forceDark ? 'text-slate-500' : 'text-slate-400'}`}>新增便利貼留言</span></button>))}
              <div className={`backdrop-blur-xl p-8 rounded-3xl shadow-xl border transform transition-all duration-500 ${isPreBell ? 'opacity-50 blur-[2px] scale-95' : 'opacity-100 scale-100'} ${forceDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/50'}`}><div className="flex items-center gap-4 mb-4"><div className="p-3 bg-blue-100 rounded-2xl text-blue-600"><BookOpen size={32} /></div><div className="text-lg text-slate-500 font-bold">{isCleaning ? '打掃提醒' : (isLunch ? '用餐提醒' : '請準備')}</div></div><div className={`text-3xl font-bold leading-normal ${forceDark ? 'text-slate-200' : 'text-slate-800'}`}>{getSystemHint()}</div></div>
              {isPreBell && (<div className="bg-red-600 text-white p-8 rounded-3xl shadow-2xl border-4 border-red-400 animate-bounce-subtle flex items-center justify-center text-center"><div><h3 className="text-4xl font-bold mb-2">請回座位</h3><p className="text-xl opacity-90">靜候老師上課</p></div></div>)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ClassView = () => (
    <div className={`flex-1 flex items-center justify-center p-8 transition-colors duration-500 ${forceDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className={`max-w-5xl w-full rounded-[3rem] shadow-2xl p-16 text-center border-4 relative overflow-hidden ${forceDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <div className={`mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${forceDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}><Bell size={48} /></div>
            <h1 className={`text-7xl font-bold mb-8 tracking-tight ${forceDark ? 'text-slate-100' : 'text-slate-800'}`}>上課了</h1>
            <div className="text-3xl text-slate-500 mb-12 font-medium">現在是 <span className="text-indigo-600 font-bold mx-2">{schedule[now.getDay()]?.[currentSlot?.id] || currentSlot?.name}</span> 時間</div>
            <div className={`rounded-2xl p-8 max-w-2xl mx-auto ${forceDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}><p className={`text-2xl leading-relaxed ${forceDark ? 'text-slate-300' : 'text-slate-700'}`}>請拿出課本與學用品<br/>保持安靜，專心聽講</p></div>
        </div>
    </div>
  );
  const OffHoursView = () => (<div className="flex-1 bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-8 transition-colors duration-1000"><div className="text-center z-10"><div className="mb-8"><div className="text-xl text-blue-300 font-medium mb-2 tracking-widest uppercase">Off-Hours</div><h2 className="text-6xl font-bold text-white tracking-tight drop-shadow-lg">非上課時段</h2></div><div className="font-mono text-[8rem] leading-none text-slate-200 font-bold drop-shadow-2xl">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: !is24Hour })}</div><div className="text-2xl text-slate-400 mt-4 font-light">{formatROCDate(now)}</div></div></div>);
  const EcoView = () => (<div className="flex-1 bg-black relative overflow-hidden cursor-pointer w-full h-full" onClick={() => {setIsManualEco(false);setIsAutoEcoOverride(true);}}><div className="absolute transition-all duration-[2000ms] flex flex-col items-center" style={{ transform: `translate(${saverPos.x}px, ${saverPos.y}px)`, top: '50%', left: '50%', marginTop: '-150px', marginLeft: '-300px', width: '600px' }}><div className="text-[12rem] font-mono font-bold text-slate-800 leading-none select-none">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: !is24Hour })}</div><div className="mt-4 text-2xl text-slate-900 font-medium border px-4 py-1 rounded-full border-slate-900">{schedule[now.getDay()]?.[currentSlot?.id] || '休息中'}</div></div></div>);
  const SpecialView = () => {
    if (!specialStatus) return null;
    if (specialStatus.type === 'dark' || specialStatus.type === 'alert') return <QuietModeView title={specialStatus.message} subtext={specialStatus.sub} icon={specialStatus.icon} onClose={() => setSpecialStatus(null)} centerContent={<div className="flex flex-col items-center"><div className="text-8xl font-mono font-bold text-slate-200 drop-shadow-2xl">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: !is24Hour })}</div><div className="mt-8 bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/10 text-indigo-200"><span className="mr-4">📢</span>{subjectHints[specialStatus.message] || specialStatus.sub}</div></div>} />;
    const Icon = specialStatus.icon;
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 p-8"><div className={`max-w-6xl w-full aspect-video rounded-[3rem] shadow-2xl flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br text-white relative overflow-hidden ${specialStatus.color || 'from-blue-600 to-indigo-800'}`}><div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div><Icon size={100} className="mb-8 opacity-90 animate-bounce" /><h1 className="text-[7rem] font-bold mb-4 leading-tight drop-shadow-md">{specialStatus.message}</h1><h2 className="text-[3rem] font-bold mb-4 leading-tight drop-shadow-md">{specialStatus.sub}</h2><button onClick={() => setSpecialStatus(null)} className="absolute top-12 right-12 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={32} /></button></div></div>;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans text-slate-800 bg-slate-200 selection:bg-indigo-200">
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      {statusMode !== 'eco' && statusMode !== 'off-hours' && <TimelineSidebar now={now} schedule={schedule} activeTimeSlots={activeTimeSlots} currentSlot={currentSlot} nextSlot={nextSlot} is24Hour={is24Hour} dayTypes={dayTypes} />}
      <div className="flex-1 flex flex-col relative">
        {statusMode === 'loading' && <div className="flex-1 flex items-center justify-center">Loading...</div>}
        {(statusMode === 'break' || statusMode === 'pre-bell') && <BreakView />}
        {statusMode === 'class' && <ClassView />}
        {statusMode === 'eco' && <EcoView />}
        {statusMode === 'off-hours' && <OffHoursView />}
        {statusMode === 'special' && specialStatus && <SpecialView />}
        
        {/* 控制列傳遞 forceDark 狀態 */}
        <ControlDock 
            statusMode={statusMode} 
            setSpecialStatus={setSpecialStatus} 
            setIsManualEco={setIsManualEco} 
            isFullscreen={isFullscreen} 
            toggleFullScreen={toggleFullScreen} 
            setShowSettings={setShowSettings} 
            isAutoNapActive={isAutoNapActive} 
            onBroadcastClick={() => setShowBroadcastInput(true)} 
            visibleButtons={visibleButtons} 
            forceDark={forceDark}
            setForceDark={setForceDark}
            setShowTools={setShowTools}
        />
        
        {/* 小工具按鈕優化：在窄螢幕裝置(如平板直向 md:以下)將按鈕上移，避免擋住設定控制台
          md:bottom-6 md:right-6 (桌面版位置不變)
          bottom-24 right-4 (手機平板版上移並靠右)
        */}
        
      </div>
      
      {/* 呼叫內嵌的 SettingsModal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        timeSlots={timeSlots} setTimeSlots={setTimeSlots} 
        schedule={schedule} setSchedule={setSchedule} 
        subjectHints={subjectHints} setSubjectHints={setSubjectHints} 
        dayTypes={dayTypes} setDayTypes={setDayTypes} 
        timeOffset={timeOffset} setTimeOffset={setTimeOffset} 
        setIsManualEco={setIsManualEco} setIsAutoEcoOverride={setIsAutoEcoOverride} 
        setNow={setNow} is24Hour={is24Hour} setIs24Hour={setIs24Hour} now={now} 
        visibleButtons={visibleButtons} setVisibleButtons={setVisibleButtons}
        systemButtonsConfig={SYSTEM_BUTTONS_CONFIG}
        defaultValues={{
           TIME_SLOTS: DEFAULT_TIME_SLOTS,
           SCHEDULE: DEFAULT_SCHEDULE,
           SUBJECT_HINTS: DEFAULT_SUBJECT_HINTS,
           DAY_TYPES: DEFAULT_DAY_TYPES
        }}
      />

      <ToolsModal isOpen={showTools} onClose={() => setShowTools(false)} />
      <BroadcastInputModal isOpen={showBroadcastInput} onClose={() => setShowBroadcastInput(false)} onConfirm={(title, sub) => setSpecialStatus({ message: title, sub: sub, color: 'from-pink-500 to-rose-500', type: 'input', id: 99, icon: Megaphone })} customPresets={customPresets} setCustomPresets={setCustomPresets} />
      <MessageInput isOpen={isEditingMessage} onClose={() => setIsEditingMessage(false)} message={teacherMessage} setMessage={setTeacherMessage} />
    </div>
  );
};

export default ClassroomDashboardV2;
