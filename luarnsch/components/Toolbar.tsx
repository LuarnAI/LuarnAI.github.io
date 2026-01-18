
import React from 'react';

interface ToolbarProps {
  onOpenBroadcast: () => void;
  onOpenSettings: () => void;
  onOpenTravel: () => void;
  onQuickAction: (title: string, sub: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onOpenBroadcast, onOpenSettings, onOpenTravel, onQuickAction }) => {
  return (
    <div className="p-8 glass-texture border-t border-white/10 flex items-center justify-center depth-3d relative z-20">
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <button 
            onClick={onOpenBroadcast}
            className="px-8 h-16 bg-gradient-to-b from-pink-400 to-pink-600 rounded-2xl flex items-center gap-3 transition-all btn-3d font-black shadow-pink-900/40"
        >
          <i className="fas fa-bullhorn text-xl"></i>
          <span className="text-lg">自訂廣播</span>
        </button>

        <button 
            onClick={() => onQuickAction("去上課了", "下課才回來")}
            className="px-6 h-16 bg-gradient-to-b from-blue-500 to-blue-700 rounded-2xl flex flex-col items-center justify-center transition-all btn-3d font-black shadow-blue-900/40"
        >
          <div className="flex items-center gap-2">
            <i className="fas fa-person-walking-arrow-right text-lg"></i>
            <span className="text-base">去上課了</span>
          </div>
          <span className="text-[10px] opacity-70 font-normal">下課才回來</span>
        </button>

        <button 
            onClick={() => onQuickAction("回家了", "明天才回來")}
            className="px-6 h-16 bg-gradient-to-b from-orange-500 to-orange-700 rounded-2xl flex flex-col items-center justify-center transition-all btn-3d font-black shadow-orange-900/40"
        >
          <div className="flex items-center gap-2">
            <i className="fas fa-house-chimney text-lg"></i>
            <span className="text-base">回家了</span>
          </div>
          <span className="text-[10px] opacity-70 font-normal">明天才回來</span>
        </button>

        <button 
            onClick={() => onQuickAction("打球去了", "下午才回來")}
            className="px-6 h-16 bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-2xl flex flex-col items-center justify-center transition-all btn-3d font-black shadow-emerald-900/40"
        >
          <div className="flex items-center gap-2">
            <i className="fas fa-basketball text-lg"></i>
            <span className="text-base">打球去了</span>
          </div>
          <span className="text-[10px] opacity-70 font-normal">下午才回來</span>
        </button>

        <button 
            onClick={() => onQuickAction("開會去了", "請稍後再來訪")}
            className="px-6 h-16 bg-gradient-to-b from-violet-500 to-violet-700 rounded-2xl flex flex-col items-center justify-center transition-all btn-3d font-black shadow-violet-900/40"
        >
          <div className="flex items-center gap-2">
            <i className="fas fa-users-rectangle text-lg"></i>
            <span className="text-base">開會去了</span>
          </div>
          <span className="text-[10px] opacity-70 font-normal">請稍後再來訪</span>
        </button>

        <button 
            onClick={onOpenTravel}
            className="px-8 h-16 bg-gradient-to-b from-indigo-500 to-indigo-700 rounded-2xl flex items-center gap-3 transition-all btn-3d font-black shadow-indigo-900/40 border border-indigo-400/20"
        >
          <i className="fas fa-plane-departure text-xl"></i>
          <span className="text-lg">出國了</span>
        </button>
      </div>

      <div className="absolute right-8 hidden md:flex items-center">
        <button 
            onClick={onOpenSettings}
            title="系統設定"
            className="w-14 h-14 flex items-center justify-center hover:bg-white/10 rounded-full transition-all border border-white/5 bg-white/2"
        >
            <i className="fas fa-gear text-2xl text-slate-400"></i>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
