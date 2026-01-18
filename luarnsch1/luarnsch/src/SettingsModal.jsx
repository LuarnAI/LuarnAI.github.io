import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, X, Save, RefreshCw, Calendar, Wrench, MapPin, BookOpen, Coffee, 
  Download, Upload, Plus, Trash2, Clock
} from 'lucide-react';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

// 共用的摺疊區塊組件
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
        {isOpen ? '▼' : '▶'}
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
  systemButtonsConfig, // 從父層傳入按鈕設定
  defaultValues // 用於重置的預設值
}) => {
  const [expandedSections, setExpandedSections] = useState({ 'timeslots': true }); // 預設展開作息設定
  const [newSubjectName, setNewSubjectName] = useState('');
  const [tempTime, setTempTime] = useState(''); 
  const [selectedDay, setSelectedDay] = useState(''); 
  const fileInputRef = useRef(null);

  // 初始化時間與星期
  useEffect(() => {
    if (isOpen && now) {
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        setTempTime(`${h}:${m}`);
        setSelectedDay(prev => prev === '' ? now.getDay().toString() : prev);
    }
  }, [isOpen, now]); 

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // --- 作息時間表管理邏輯 (新功能) ---
  const handleTimeSlotChange = (id, field, value) => {
    const newSlots = timeSlots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    );
    // 簡單排序：依開始時間排序，避免時間錯亂
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
        // 同步清除課表中該時段的資料，避免殘留
        const newSchedule = { ...schedule };
        Object.keys(newSchedule).forEach(day => {
            if (newSchedule[day][id]) delete newSchedule[day][id];
        });
        setSchedule(newSchedule);
    }
  };

  // --- 其他原有邏輯 ---
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

  // 匯入匯出
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
        
        {/* Header */}
        <div className="p-6 bg-slate-800 text-white flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-bold flex items-center gap-3"><Settings /> 設定控制台</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full"><X /></button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar">
          
          {/* 1. 作息時間表設定 (新功能) */}
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
                            <input 
                                type="time" 
                                value={slot.start} 
                                onChange={(e) => handleTimeSlotChange(slot.id, 'start', e.target.value)}
                                className="w-full bg-slate-50 rounded px-2 py-1 text-sm font-mono font-bold text-slate-600 outline-none focus:ring-1 focus:ring-blue-400"
                            />
                        </div>
                        <div className="col-span-2">
                            <input 
                                type="time" 
                                value={slot.end} 
                                onChange={(e) => handleTimeSlotChange(slot.id, 'end', e.target.value)}
                                className="w-full bg-slate-50 rounded px-2 py-1 text-sm font-mono font-bold text-slate-600 outline-none focus:ring-1 focus:ring-blue-400"
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

          {/* 2. 一般設定 */}
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

          {/* 3. 全天/半天設定 */}
          <SettingsSection 
            title="全天/半天設定" 
            icon={Calendar} 
            isOpen={expandedSections['dayTypes']} 
            onToggle={() => toggleSection('dayTypes')}
            colorClass="text-orange-600"
          >
             <div className="bg-orange-50 p-4 rounded-xl grid grid-cols-5 gap-3 border border-orange-100">
                {[1,2,3,4,5].map(day => (
                  <div key={day} className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-500 mb-2">週{WEEKDAYS[day]}</span>
                    <button
                      onClick={() => setDayTypes(prev => ({...prev, [day]: prev[day] === 'full' ? 'half' : 'full'}))}
                      className={`w-full py-3 rounded-lg text-sm font-bold transition-all border shadow-sm ${
                        dayTypes[day] === 'full' ? 'bg-blue-50 border-blue-600 text-white hover:bg-blue-600' : 'bg-yellow-400 border-yellow-500 text-yellow-900 hover:bg-yellow-500'
                      }`}
                    >
                      {dayTypes[day] === 'full' ? '全天課' : '半天課'}
                    </button>
                  </div>
                ))}
             </div>
             <p className="text-sm text-slate-500 mt-3">💡 提示：半天課時，第五節（含）以後的時間會被判定為「放學」。</p>
          </SettingsSection>

          {/* 4. 快捷按鈕管理 */}
          <SettingsSection 
            title="快捷按鈕管理" 
            icon={MapPin} 
            isOpen={expandedSections['buttons']} 
            onToggle={() => toggleSection('buttons')}
            colorClass="text-purple-600"
          >
             <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex flex-wrap gap-3">
                {systemButtonsConfig.singles.map(btn => (
                    <button key={btn.id} onClick={() => toggleButtonVisibility(btn.id)} className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${visibleButtons.includes(btn.id) ? 'bg-purple-600 text-white' : 'bg-white text-slate-400'}`}>{btn.label}</button>
                ))}
                {systemButtonsConfig.groups.flatMap(g => g.items).map(btn => (
                    <button key={btn.id} onClick={() => toggleButtonVisibility(btn.id)} className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${visibleButtons.includes(btn.id) ? 'bg-purple-600 text-white' : 'bg-white text-slate-400'}`}>{btn.label}</button>
                ))}
             </div>
          </SettingsSection>

          {/* 5. 課表設定 */}
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

          {/* 6. 科目管理 */}
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

          {/* 7. 系統維護 */}
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
                     <input value={tempTime} onChange={(e) => setTempTime(e.target.value)} className="p-2 rounded border w-32 text-center" placeholder="HH:mm" />
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

        {/* Footer */}
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
                 // 重置按鈕
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

export default SettingsModal;
