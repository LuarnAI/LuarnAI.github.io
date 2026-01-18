
import React, { useState } from 'react';

interface TravelModalProps {
  onPublish: (dest: string) => void;
  onClose: () => void;
}

const TravelModal: React.FC<TravelModalProps> = ({ onPublish, onClose }) => {
  const travelOptions = [
    { name: "德國", icon: "fa-castle" },
    { name: "日本", icon: "fa-torii-gate" },
    { name: "澳洲", icon: "fa-kangaroo" },
    { name: "美國", icon: "fa-flag-usa" }
  ];
  const [custom, setCustom] = useState("");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900/95 border border-white/10 rounded-[3rem] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black flex items-center gap-4 text-indigo-400">
                <i className="fas fa-globe-americas"></i>
                選擇目的地
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-3xl">
                <i className="fas fa-times"></i>
            </button>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-10">
            {travelOptions.map(opt => (
                <button
                    key={opt.name}
                    onClick={() => onPublish(opt.name)}
                    className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-indigo-600/40 hover:border-indigo-400 transition-all font-bold text-2xl btn-3d flex flex-col items-center gap-3"
                >
                    <i className={`fas ${opt.icon} text-3xl text-indigo-300`}></i>
                    {opt.name}
                </button>
            ))}
        </div>

        <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 block">或自行輸入目的地</label>
            <div className="relative flex items-center">
                <input 
                    value={custom}
                    onChange={e => setCustom(e.target.value)}
                    placeholder="輸入國家或城市..."
                    className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xl pr-32"
                />
                <button 
                    disabled={!custom.trim()}
                    onClick={() => onPublish(custom)}
                    className="absolute right-2 top-2 bottom-2 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold disabled:opacity-30 transition-all active:scale-95"
                >
                    確定
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TravelModal;
