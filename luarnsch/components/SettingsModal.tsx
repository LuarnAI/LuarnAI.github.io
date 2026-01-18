
import React, { useState, useRef } from 'react';
import { TimeSlot, TimetableData, DAYS_ZH } from '../types';

interface SettingsModalProps {
  slots: TimeSlot[];
  setSlots: (s: TimeSlot[]) => void;
  timetable: TimetableData;
  setTimetable: (t: TimetableData) => void;
  onSync: () => Promise<void>;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ slots, setSlots, timetable, setTimetable, onSync, onClose }) => {
  const [activeSection, setActiveSection] = useState<string | null>('timetable');
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTimetableChange = (day: number, slotId: string, value: string) => {
    setTimetable({
      ...timetable,
      [day]: { ...(timetable[day] || {}), [slotId]: value }
    });
  };

  const handleGoogleSync = async () => {
    setIsSyncingLocal(true);
    await onSync();
    setIsSyncingLocal(false);
    setActiveSection('timetable');
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      
      // @ts-ignore
      const workbook = XLSX.read(data, { type: 'array' });
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
        setActiveSection('timetable');
        alert(`匯入成功！已讀取 ${newSlots.length} 節課表內容。`);
      } else {
        alert('檔案內容解析失敗，請確認格式。');
      }
    } catch (error: any) {
      alert('檔案讀取失敗：' + error.message);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const sections = [
    { id: 'schedule', title: '作息時間表設定', icon: 'fa-clock' },
    { id: 'timetable', title: '課表設定', icon: 'fa-book' },
    { id: 'system', title: '雲端同步與匯入', icon: 'fa-cloud-arrow-down' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#f8fafc] rounded-[2rem] w-full max-w-[95vw] lg:max-w-6xl max-h-[92vh] text-slate-800 overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-6 bg-white border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <i className="fas fa-gear text-slate-700"></i>
            設定控制台
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {sections.map(sec => (
            <div key={sec.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setActiveSection(activeSection === sec.id ? null : sec.id)}
                className="w-full px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-4">
                    <i className={`fas ${sec.icon} ${activeSection === sec.id ? 'text-blue-500' : 'text-slate-400'} text-xl`}></i>
                    <span className="font-bold text-lg">{sec.title}</span>
                </div>
                <i className={`fas fa-chevron-${activeSection === sec.id ? 'up' : 'down'} text-slate-300`}></i>
              </button>

              {activeSection === sec.id && (
                <div className="p-4 md:p-8 border-t bg-slate-50/50 animate-in slide-in-from-top-2">
                  {sec.id === 'timetable' && (
                    <div className="overflow-x-auto pb-4">
                      <table className="w-full border-separate border-spacing-x-3 border-spacing-y-2">
                        <thead>
                          <tr className="text-slate-400 text-sm font-bold">
                            <th className="w-20 py-2">節次</th>
                            {DAYS_ZH.map(d => <th key={d} className="min-w-[120px] py-2">{d}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {slots.map(slot => (
                            <tr key={slot.id}>
                              <td className="text-center">
                                <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 font-bold text-sm shadow-sm">
                                    {slot.name}
                                </div>
                              </td>
                              {[0, 1, 2, 3, 4, 5, 6].map(day => (
                                <td key={day}>
                                  <input 
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 text-base font-medium transition-all text-center shadow-sm placeholder:text-slate-200"
                                    value={timetable[day]?.[slot.id] || ''}
                                    placeholder=""
                                    onChange={e => handleTimetableChange(day, slot.id, e.target.value)}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {sec.id === 'schedule' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {slots.map(slot => (
                            <div key={slot.id} className="bg-white p-5 border border-slate-200 rounded-3xl flex flex-col gap-3 shadow-sm">
                                <span className="font-black text-slate-400 text-xs uppercase tracking-widest">{slot.name}</span>
                                <div className="flex items-center gap-2">
                                    <input type="time" className="flex-1 p-2 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold" value={slot.start} onChange={e => setSlots(slots.map(s => s.id === slot.id ? {...s, start: e.target.value} : s))} />
                                    <span className="text-slate-300">~</span>
                                    <input type="time" className="flex-1 p-2 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold" value={slot.end} onChange={e => setSlots(slots.map(s => s.id === slot.id ? {...s, end: e.target.value} : s))} />
                                </div>
                            </div>
                        ))}
                    </div>
                  )}
                  {sec.id === 'system' && (
                    <div className="space-y-6">
                        {/* Google Sheet Sync Button */}
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-200">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-white">
                                    <i className="fas fa-sync-alt text-2xl"></i>
                                </div>
                                <div>
                                    <h4 className="font-black text-xl">同步 Google 試算表</h4>
                                    <p className="text-blue-100 mt-1">直接從您的線上 Google 試算表讀取最新課表內容。</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleGoogleSync}
                                disabled={isSyncingLocal}
                                className={`px-10 py-4 bg-white text-blue-600 font-black rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95 ${isSyncingLocal ? 'opacity-50' : ''}`}
                            >
                                {isSyncingLocal ? '同步中...' : '立即同步'}
                            </button>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-600 shadow-inner">
                                    <i className="fas fa-file-excel text-2xl"></i>
                                </div>
                                <div>
                                    <h4 className="font-black text-xl text-slate-700">離線匯入 Excel</h4>
                                    <p className="text-slate-400 mt-1">手動上傳 .xlsx 檔案來更新課表。</p>
                                </div>
                            </div>
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              onChange={handleFileChange} 
                              accept=".xlsx" 
                              className="hidden" 
                            />
                            <button 
                                onClick={triggerFileInput}
                                disabled={isImporting}
                                className={`px-10 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl transition-all flex items-center gap-3 active:scale-95 ${isImporting ? 'opacity-50' : ''}`}
                            >
                                <i className={`fas ${isImporting ? 'fa-spinner fa-spin' : 'fa-folder-open'} text-xl`}></i>
                                {isImporting ? '處理中...' : '選取檔案'}
                            </button>
                        </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 bg-white border-t flex items-center justify-end">
          <button 
            onClick={onClose}
            className="px-16 py-4 bg-[#0f172a] hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3"
          >
            <i className="fas fa-check-circle text-xl"></i>
            儲存並關閉
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
