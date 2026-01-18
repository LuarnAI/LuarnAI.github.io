
import React, { useState } from 'react';
import { BroadcastTemplate } from '../types';

interface BroadcastModalProps {
  templates: BroadcastTemplate[];
  onUpdateTemplates: (t: BroadcastTemplate[]) => void;
  onPublish: (t: BroadcastTemplate) => void;
  onClose: () => void;
}

const BroadcastModal: React.FC<BroadcastModalProps> = ({ templates, onUpdateTemplates, onPublish, onClose }) => {
  const [activeTab, setActiveTab] = useState(templates[0].id);
  const current = templates.find(t => t.id === activeTab)!;

  const handleChange = (field: keyof BroadcastTemplate, val: string) => {
    onUpdateTemplates(templates.map(t => t.id === activeTab ? { ...t, [field]: val } : t));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-xl text-slate-800 overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-300">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <i className="fas fa-bullhorn text-pink-500"></i>
            發布自訂廣播
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-3 font-bold rounded-xl transition-all ${
                  activeTab === t.id ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-400'
                }`}
              >
                {t.btnName}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">按鈕名稱 <i className="fas fa-pen text-[10px] ml-1"></i></label>
              <input 
                value={current.btnName} 
                onChange={e => handleChange('btnName', e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">主標題</label>
              <input 
                value={current.title} 
                onChange={e => handleChange('title', e.target.value)}
                placeholder="例如：全班集合"
                className="w-full px-5 py-4 bg-slate-50 border rounded-2xl text-2xl font-bold outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">副標題</label>
              <input 
                value={current.subtitle} 
                onChange={e => handleChange('subtitle', e.target.value)}
                placeholder="例如：請到走廊排隊"
                className="w-full px-5 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">畫面預覽</p>
            <div className="text-3xl font-bold text-slate-800 mb-1">{current.title || '（未輸入）'}</div>
            <div className="text-sm text-slate-400">{current.subtitle || '（未輸入）'}</div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t flex items-center justify-end gap-4">
          <button onClick={onClose} className="px-8 py-3 font-bold text-slate-500 hover:text-slate-700">取消</button>
          <button 
            onClick={() => onPublish(current)}
            className="px-10 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-pink-200 transition-all active:scale-95"
          >
            發布廣播
          </button>
        </div>
      </div>
    </div>
  );
};

export default BroadcastModal;
