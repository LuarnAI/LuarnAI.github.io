import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Play, Pause, Upload, Trash2, Plus, Maximize, Minimize, Settings, 
    ArrowUp, ArrowDown, RotateCcw, X, Sidebar, Globe, Languages 
} from 'lucide-react';

const TRANSLATIONS = {
    zh: {
        title_exam: "⚠️ 考試注意事項",
        title_break: "☕ 下課注意事項",
        settings_title: "設定提醒文字",
        done: "完成",
        add_reminder: "新增提醒事項",
        schedule_add: "新增考試時段",
        expected: "應到",
        actual: "實到",
        note: "備註",
        absent_ph: "缺席座號...",
        subject_ph: "科目",
        upload_audio: "上傳鐘聲",
        play: "播放",
        pause: "暫停",
        replay: "重播",
        delete: "刪除",
        idle: "目前無考試行程",
        exam_now: "考試中",
        break_now: "下課中",
        remaining: "剩餘",
        min: "分鐘",
        to: "至",
        toggle_left: "顯示/隱藏 排程",
        toggle_right: "顯示/隱藏 提醒",
        fullscreen: "全螢幕",
        lang_switch: "En"
    },
    en: {
        title_exam: "⚠️ Exam Rules",
        title_break: "☕ Break Time",
        settings_title: "Settings",
        done: "Done",
        add_reminder: "Add Item",
        schedule_add: "Add Exam Slot",
        expected: "Expected",
        actual: "Actual",
        note: "Note",
        absent_ph: "Absent IDs...",
        subject_ph: "Subject",
        upload_audio: "Upload Audio",
        play: "Play",
        pause: "Pause",
        replay: "Replay",
        delete: "Delete",
        idle: "No Exam Schedule",
        exam_now: "Exam",
        break_now: "Break",
        remaining: "Left",
        min: "min",
        to: "to",
        toggle_left: "Toggle Schedule",
        toggle_right: "Toggle Reminders",
        fullscreen: "Fullscreen",
        lang_switch: "中"
    }
};

const SettingsModal = ({ show, onClose, reminders, setReminders, t }) => {
    if (!show) return null;

    const handleChange = (mode, idx, val) => {
        const newR = { ...reminders };
        newR[mode][idx] = val;
        setReminders(newR);
    };

    const add = (mode) => {
        const newR = { ...reminders };
        newR[mode].push(t.add_reminder);
        setReminders(newR);
    };

    const remove = (mode, idx) => {
        const newR = { ...reminders };
        newR[mode].splice(idx, 1);
        setReminders(newR);
    };

    const move = (mode, idx, dir) => {
        const newR = { ...reminders };
        const list = newR[mode];
        if (dir === -1 && idx > 0) [list[idx], list[idx-1]] = [list[idx-1], list[idx]];
        else if (dir === 1 && idx < list.length - 1) [list[idx], list[idx+1]] = [list[idx+1], list[idx]];
        setReminders(newR);
    };

    const ListSection = ({ title, mode, color }) => (
        <div className={`flex-1 flex flex-col gap-2 p-4 rounded-2xl border ${mode === 'exam' ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="flex justify-between items-center mb-2">
                <h3 className={`font-bold text-lg ${color}`}>{title}</h3>
                <button onClick={() => add(mode)} className="p-1 bg-white rounded-full shadow hover:bg-slate-50"><Plus size={18}/></button>
            </div>
            <div className="overflow-y-auto flex-1 pr-2 space-y-2 custom-scrollbar">
                {reminders[mode].map((txt, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                        <div className="flex flex-col gap-1">
                            <button onClick={() => move(mode, i, -1)} disabled={i===0} className="text-slate-300 hover:text-blue-500 disabled:opacity-0"><ArrowUp size={12}/></button>
                            <button onClick={() => move(mode, i, 1)} disabled={i===reminders[mode].length-1} className="text-slate-300 hover:text-blue-500 disabled:opacity-0"><ArrowDown size={12}/></button>
                        </div>
                        <input value={txt} onChange={(e) => handleChange(mode, i, e.target.value)} className="flex-1 bg-transparent outline-none text-slate-700" />
                        <button onClick={() => remove(mode, i)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white w-[90vw] max-w-4xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xl">
                        <Settings className="text-slate-400" /> {t.settings_title}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition"><X /></button>
                </div>
                <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 overflow-hidden">
                    <ListSection title={t.title_exam} mode="exam" color="text-red-500" />
                    <ListSection title={t.title_break} mode="break" color="text-emerald-600" />
                </div>
                <div className="p-4 border-t bg-slate-50 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 font-bold shadow-lg transition transform active:scale-95">{t.done}</button>
                </div>
            </div>
        </div>
    );
};

const ExamTool = () => {
    // --- State ---
    const [now, setNow] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showLeft, setShowLeft] = useState(true);
    const [showRight, setShowRight] = useState(true);
    const [lang, setLang] = useState('zh');
    
    const t = TRANSLATIONS[lang];

    // Schedule Data
    const [schedule, setSchedule] = useState([
        { id: 1, subject: '第一節', start: '08:20', end: '09:10', audioUrl: null, audioName: null },
        { id: 2, subject: '第二節', start: '09:20', end: '10:10', audioUrl: null, audioName: null },
    ]);

    // Attendance Data
    const [attendance, setAttendance] = useState({ expected: '', actual: '', absent: '' });

    // Reminders Data
    const [reminders, setReminders] = useState({
        exam: ["寫上班級姓名", "有問題舉手", "字跡工整", "檢查考卷", "保持安靜"],
        break: ["準備下節課本", "上廁所喝水", "桌面淨空", "坐在位置上"]
    });

    // Audio State
    const [playingId, setPlayingId] = useState(null);
    const audioRefs = useRef({});

    // --- Effects ---
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        try {
            const savedSchedule = localStorage.getItem('flex_schedule_text_v2');
            const savedAtt = localStorage.getItem('flex_attendance_v2');
            const savedReminders = localStorage.getItem('flex_reminders_v2');
            if (savedSchedule) {
                const parsed = JSON.parse(savedSchedule);
                setSchedule(parsed.map(s => ({...s, audioUrl: null, audioName: null})));
            }
            if (savedAtt) setAttendance(JSON.parse(savedAtt));
            if (savedReminders) setReminders(JSON.parse(savedReminders));
        } catch(e) {}
    }, []);

    useEffect(() => {
        const textOnlySchedule = schedule.map(({audioUrl, ...rest}) => rest);
        localStorage.setItem('flex_schedule_text_v2', JSON.stringify(textOnlySchedule));
    }, [schedule]);

    useEffect(() => {
        localStorage.setItem('flex_attendance_v2', JSON.stringify(attendance));
    }, [attendance]);

    useEffect(() => {
        localStorage.setItem('flex_reminders_v2', JSON.stringify(reminders));
    }, [reminders]);

    // --- Logic ---
    const adjustedTime = now;
    
    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                    setIsFullscreen(false);
                }
            }
        } catch (err) { console.log("無法切換全螢幕"); }
    };

    const toggleLang = () => {
        setLang(prev => prev === 'zh' ? 'en' : 'zh');
    };

    const handleAudioUpload = (e, id) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const currentItem = schedule.find(i => i.id === id);
        if (currentItem?.audioUrl) URL.revokeObjectURL(currentItem.audioUrl);

        const url = URL.createObjectURL(file);
        setSchedule(prev => prev.map(item => 
            item.id === id ? { ...item, audioUrl: url, audioName: file.name } : item
        ));
    };

    const toggleAudio = (id) => {
        const audio = audioRefs.current[id];
        if (!audio) return;
        if (playingId === id) {
            audio.pause();
            setPlayingId(null);
        } else {
            if (playingId && audioRefs.current[playingId]) {
                audioRefs.current[playingId].pause();
                audioRefs.current[playingId].currentTime = 0;
            }
            audio.play();
            setPlayingId(id);
        }
    };

    const resetAudio = (id) => {
        const audio = audioRefs.current[id];
        if (!audio) return;
        if (playingId && playingId !== id && audioRefs.current[playingId]) {
            audioRefs.current[playingId].pause();
            audioRefs.current[playingId].currentTime = 0;
        }
        audio.currentTime = 0;
        audio.play();
        setPlayingId(id);
    };

    const addSlot = () => {
        const newId = Date.now();
        setSchedule([...schedule, { 
            id: newId, 
            subject: lang === 'zh' ? '新考科' : 'New Exam', 
            start: '12:00', 
            end: '13:00', 
            audioUrl: null, 
            audioName: null 
        }]);
    };

    const removeSlot = (e, id) => {
        e.stopPropagation(); // Stop event bubbling
        if (schedule.length <= 1) {
            alert(lang === 'zh' ? "至少需保留一個時段" : "Keep at least one slot");
            return;
        }
        if (confirm(lang === 'zh' ? '確定刪除此時段？' : 'Delete this slot?')) {
            setSchedule(prev => prev.filter(s => s.id !== id));
        }
    };

    const updateSchedule = (id, field, val) => {
        setSchedule(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
    };

    const parseTime = (t) => {
        if (!t) return null;
        const [h, m] = t.split(':').map(Number);
        const d = new Date(adjustedTime);
        d.setHours(h, m, 0, 0);
        return d.getTime();
    };

    const currentStatus = useMemo(() => {
        const nowMs = adjustedTime.getTime();
        
        for (let i = 0; i < schedule.length; i++) {
            const s = schedule[i];
            const start = parseTime(s.start);
            const end = parseTime(s.end);
            
            if (i === 0 && start) {
                if (nowMs >= start - 600000 && nowMs < start) 
                    return { type: 'break', timeLeft: start - nowMs, total: 600000 };
            }

            if (start && end && nowMs >= start && nowMs <= end) {
                return { type: 'exam', idx: i, timeLeft: end - nowMs, total: end - start };
            }

            if (i < schedule.length - 1) {
                const nextStart = parseTime(schedule[i+1].start);
                if (end && nextStart && nowMs > end && nowMs < nextStart) {
                    return { type: 'break', timeLeft: nextStart - nowMs, total: nextStart - end };
                }
            }
        }
        return { type: 'idle' };
    }, [adjustedTime, schedule]);

    // --- Layout Calculations ---
    const isFocusMode = !showLeft && !showRight;
    
    // 在專注模式下，Top Bar 不再單純依賴 h-screen，而是使用 Flexbox 的 gap 和 justify-center 來排列
    // 當 isFocusMode 為 true 時，外層容器會變成一個全螢幕的 flex column，時間和進度條都會置中
    const topHeightClass = isFocusMode ? 'h-full flex-col justify-center gap-12' : 'h-[25vh]';
    const bottomHeightClass = isFocusMode ? 'h-0 overflow-hidden hidden' : 'h-[75vh]';
    
    // Width Logic
    let leftWidthClass = 'w-0 hidden';
    let rightWidthClass = 'w-0 hidden';
    
    if (!isFocusMode) {
        if (showLeft && showRight) {
            leftWidthClass = 'w-[45%]';
            rightWidthClass = 'w-[55%]';
        } else if (showLeft) {
            leftWidthClass = 'w-full';
        } else if (showRight) {
            rightWidthClass = 'w-full';
        }
    }

    // --- Sub-components ---
    const RotatingText = () => {
        const { type } = currentStatus;
        const list = type === 'exam' ? reminders.exam : reminders.break;
        const [idx, setIdx] = useState(0);
        const [fade, setFade] = useState(true);

        useEffect(() => {
            const interval = setInterval(() => {
                setFade(false);
                setTimeout(() => {
                    setIdx(p => (p + 1) % list.length);
                    setFade(true);
                }, 500);
            }, 8000);
            return () => clearInterval(interval);
        }, [list]);

        let displayText = "";
        if (list.length > 0) {
            displayText = list[idx];
        } else {
            displayText = type === 'exam' ? t.exam_now : t.break_now;
        }

        return (
            <div className={`transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'} w-full h-full flex items-center justify-center p-8`}>
                <div className="text-slate-800 font-black text-center leading-tight" style={{ fontSize: '11vw' }}>
                    {displayText}
                </div>
            </div>
        );
    };

    const ProgressBar = () => {
        const { type, timeLeft, total } = currentStatus;
        if (type === 'idle') return <div className="text-slate-400 text-2xl font-bold flex items-center justify-center h-full border-2 border-dashed border-slate-300 rounded-xl">{t.idle}</div>;
        
        const pct = Math.max(0, Math.min(100, (timeLeft / total) * 100));
        const mins = Math.ceil(timeLeft / 60000);
        let color = "bg-emerald-500";
        if (pct < 20) color = "bg-rose-500 animate-pulse-slow";
        else if (pct < 50) color = "bg-amber-400";
        
        // Styles for Focus Mode
        // 當專注模式時，使用更大的高度和文字
        const containerClass = isFocusMode ? "h-48 rounded-[3rem]" : "h-14";
        const textSizeClass = isFocusMode ? "text-[5rem]" : "text-2xl";

        return (
            <div className="h-full flex flex-col justify-center">
                <div className={`relative w-full bg-slate-200 rounded-full overflow-hidden shadow-inner transition-all duration-500 ${containerClass}`}>
                    <div className={`absolute left-0 h-full transition-all duration-1000 linear ${color}`} style={{ width: `${pct}%` }}></div>
                    <div className={`absolute inset-0 flex items-center justify-center text-slate-800 font-bold z-10 drop-shadow-sm transition-all duration-500 ${textSizeClass}`}>
                        {type === 'exam' ? t.exam_now : t.break_now} - {t.remaining} {mins} {t.min}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-100 text-slate-800 font-sans selection:bg-blue-200 overflow-hidden">
            <SettingsModal 
                show={showSettings} 
                onClose={() => setShowSettings(false)} 
                reminders={reminders} 
                setReminders={setReminders} 
                t={t}
            />

            {/* Floating Control Buttons (Bottom Right) */}
            <div className="fixed bottom-6 right-6 z-50 flex gap-3">
                 <button onClick={toggleLang} className="w-12 h-12 rounded-full bg-slate-800 text-white shadow-lg hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all flex items-center justify-center font-bold text-lg border-2 border-slate-700" title={lang === 'zh' ? "Switch to English" : "切換至中文"}>
                    {t.lang_switch}
                </button>
                 <button onClick={() => setShowLeft(!showLeft)} className={`w-12 h-12 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-slate-800 ${showLeft ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-800'}`} title={showLeft ? t.toggle_left : t.toggle_left}>
                    <Sidebar size={20} className="rotate-180" />
                </button>
                 <button onClick={() => setShowRight(!showRight)} className={`w-12 h-12 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-slate-800 ${showRight ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-800'}`} title={showRight ? t.toggle_right : t.toggle_right}>
                    <Sidebar size={20} />
                </button>
                <button onClick={toggleFullscreen} className="w-12 h-12 rounded-full bg-slate-800 text-white shadow-lg hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-slate-700" title={t.fullscreen}>
                    {isFullscreen ? <Minimize size={20}/> : <Maximize size={20}/>}
                </button>
            </div>

            {/* Top Bar */}
            <div className={`${topHeightClass} flex bg-slate-900 text-white shadow-xl z-20 relative transition-all duration-500 ease-in-out`}>
                
                {/* Clock Section */}
                <div className={`${isFocusMode ? 'w-full bg-transparent p-0' : 'w-[35%] border-r border-slate-700 px-4 bg-gradient-to-b from-slate-800 to-slate-900'} flex flex-col justify-center items-center relative transition-all duration-500`}>
                    <div className={`text-slate-400 font-medium tracking-widest opacity-80 transition-all duration-500 ${isFocusMode ? 'text-3xl mb-4 text-center' : 'absolute top-4 left-6 text-sm md:text-base'}`}>
                        {adjustedTime.toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                    </div>
                    <div className="font-mono font-bold leading-none tracking-tight text-white drop-shadow-lg tabular-nums transition-all duration-500" style={{ fontSize: isFocusMode ? '25vw' : '13vh' }}>
                        {adjustedTime.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                </div>

                {/* Progress Bar Section */}
                <div className={`${isFocusMode ? 'w-full bg-transparent px-16' : 'w-[65%] bg-slate-100 relative p-6'} transition-all duration-500`}>
                     {!isFocusMode && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>}
                     <ProgressBar />
                </div>
            </div>

            {/* Main Content: Split View */}
            <div className={`${bottomHeightClass} flex transition-all duration-500`}>
                
                {/* Left: Schedule List */}
                <div className={`${leftWidthClass} bg-white border-r border-slate-200 flex flex-col shadow-[10px_0_20px_rgba(0,0,0,0.05)] z-10 transition-all duration-500 overflow-hidden`}>
                    <div className="flex-1 overflow-y-auto p-4 scroll-smooth custom-scrollbar">
                        {schedule.map((item, idx) => {
                            const active = currentStatus.type === 'exam' && currentStatus.idx === idx;
                            // Scale font size based on layout
                            const subjectSize = !showRight ? 'text-6xl' : 'text-[clamp(1.5rem,4vh,3rem)]';
                            const timeSize = !showRight ? 'text-4xl' : 'text-[clamp(1.2rem,2.5vh,2rem)]';

                            return (
                                <div key={item.id} className={`group flex items-center gap-4 p-4 mb-3 rounded-xl border transition-all ${active ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-lg' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'}`}>
                                    <button 
                                        onClick={(e) => removeSlot(e, item.id)} 
                                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                        title={t.delete}
                                    >
                                        <Trash2 size={24} />
                                    </button>

                                    <div className="flex-1 flex flex-col gap-1">
                                        <input 
                                            value={item.subject} 
                                            onChange={(e) => updateSchedule(item.id, 'subject', e.target.value)}
                                            className={`w-full bg-transparent font-black text-center outline-none border-b border-transparent focus:border-blue-300 transition-all ${active ? 'text-amber-900' : 'text-slate-700'} ${subjectSize}`}
                                            placeholder={t.subject_ph}
                                        />
                                        <div className={`flex justify-center items-center gap-3 font-mono font-bold ${active ? 'text-amber-700' : 'text-slate-500'} ${timeSize}`}>
                                            <div className="time-input-container">
                                                <input type="time" value={item.start} onChange={(e) => updateSchedule(item.id, 'start', e.target.value)} className="bg-transparent text-center outline-none w-auto" />
                                            </div>
                                            <span className="opacity-30 text-sm">{t.to}</span>
                                            <div className="time-input-container">
                                                <input type="time" value={item.end} onChange={(e) => updateSchedule(item.id, 'end', e.target.value)} className="bg-transparent text-center outline-none w-auto" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-1 w-16 flex-shrink-0">
                                         <input type="file" id={`audio-${item.id}`} className="hidden" accept="audio/*" onChange={(e) => handleAudioUpload(e, item.id)} />
                                         {item.audioUrl ? (
                                             <>
                                                <div className="flex gap-1 justify-center">
                                                    <audio ref={el => audioRefs.current[item.id] = el} src={item.audioUrl} onEnded={() => setPlayingId(null)} />
                                                    <button onClick={() => toggleAudio(item.id)} className={`p-2 rounded-full text-white shadow transition-transform active:scale-95 ${playingId === item.id ? 'bg-rose-500' : 'bg-emerald-500'}`} title={playingId === item.id ? t.pause : t.play}>
                                                        {playingId === item.id ? <Pause size={18}/> : <Play size={18}/>}
                                                    </button>
                                                    <button onClick={() => resetAudio(item.id)} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition shadow-sm" title={t.replay}>
                                                        <RotateCcw size={18}/>
                                                    </button>
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate w-16 text-center mt-1">{item.audioName}</div>
                                             </>
                                         ) : (
                                             <label htmlFor={`audio-${item.id}`} className="cursor-pointer p-3 bg-slate-100 rounded-full text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition border border-slate-200" title={t.upload_audio}>
                                                <Upload size={22} />
                                             </label>
                                         )}
                                    </div>
                                </div>
                            )
                        })}
                        <button onClick={addSlot} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 hover:border-slate-400 transition flex items-center justify-center gap-2 text-lg">
                            <Plus size={24} /> {t.schedule_add}
                        </button>
                    </div>

                    <div className="h-[25%] bg-slate-50 border-t border-slate-200 p-4 flex gap-4">
                        <div className="glass rounded-xl flex-1 flex flex-col items-center justify-center relative">
                            <div className="text-sm text-slate-400 font-bold mb-1">{t.expected}</div>
                            <input value={attendance.expected} onChange={(e) => setAttendance({...attendance, expected: e.target.value})} className="w-full text-center bg-transparent text-5xl font-black text-slate-700 outline-none" placeholder="0" />
                        </div>
                        <div className="glass rounded-xl flex-1 flex flex-col items-center justify-center relative">
                            <div className="text-sm text-slate-400 font-bold mb-1">{t.actual}</div>
                            <input value={attendance.actual} onChange={(e) => setAttendance({...attendance, actual: e.target.value})} className={`w-full text-center bg-transparent text-5xl font-black outline-none ${parseInt(attendance.actual) < parseInt(attendance.expected) ? 'text-red-500' : 'text-slate-700'}`} placeholder="0" />
                        </div>
                        <div className="glass rounded-xl flex-[1.5] flex flex-col p-2 relative">
                            <div className="text-sm text-slate-400 font-bold mb-1">{t.note}</div>
                            <textarea value={attendance.absent} onChange={(e) => setAttendance({...attendance, absent: e.target.value})} className="flex-1 bg-transparent text-2xl font-bold text-red-500 resize-none outline-none leading-tight custom-scrollbar" placeholder={t.absent_ph} />
                        </div>
                    </div>
                </div>

                {/* Right: Reminder Display */}
                <div className={`${rightWidthClass} bg-white flex flex-col relative overflow-hidden group transition-all duration-500`}>
                    <div className={`relative text-center py-3 font-bold text-2xl tracking-wider transition-colors duration-500 ${currentStatus.type === 'exam' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>
                        {currentStatus.type === 'exam' ? t.title_exam : t.title_break}
                        <button onClick={() => setShowSettings(true)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/5 text-current opacity-60 hover:opacity-100 transition" title={t.settings_title}>
                            <Settings size={24} />
                        </button>
                    </div>
                    <div className="flex-1 relative">
                        <RotatingText />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamTool;
