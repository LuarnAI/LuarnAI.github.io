// 在 ChatBot 類別中添加記憶管理方法

class ChatBot {
    constructor() {
        // ... 現有程式碼 ...
        
        // 記憶管理設定
        this.memorySettings = {
            autoClean: false,           // 是否自動清除記憶
            cleanOnNewSession: false,   // 每次新訪問是否清除
            sessionTimeout: 24 * 60,    // Session 超時時間（分鐘）
            maxHistory: 100            // 最大歷史記錄數
        };
        
        // 檢查是否需要清理過期記憶
        this.checkExpiredSessions();
    }
    
    // 檢查並清理過期的 Session
    checkExpiredSessions() {
        const chatHistory = JSON.parse(localStorage.getItem('chatbot_history') || '[]');
        const now = new Date().getTime();
        const timeoutMs = this.memorySettings.sessionTimeout * 60 * 1000;
        
        // 過濾掉過期的記錄
        const validHistory = chatHistory.filter(chat => {
            const chatTime = new Date(chat.timestamp).getTime();
            return (now - chatTime) < timeoutMs;
        });
        
        if (validHistory.length !== chatHistory.length) {
            localStorage.setItem('chatbot_history', JSON.stringify(validHistory));
            console.log(`清理了 ${chatHistory.length - validHistory.length} 條過期記錄`);
        }
    }
    
    // 完全清除所有記憶
    clearAllMemory() {
        localStorage.removeItem('chatbot_history');
        localStorage.removeItem('chatbot_session_id');
        console.log('所有 ChatBot 記憶已清除');
        return true;
    }
    
    // 只清除當前 Session 的記憶
    clearCurrentSession() {
        const chatHistory = JSON.parse(localStorage.getItem('chatbot_history') || '[]');
        const otherSessions = chatHistory.filter(chat => chat.sessionId !== this.sessionId);
        localStorage.setItem('chatbot_history', JSON.stringify(otherSessions));
        
        // 清空當前對話視窗
        this.messagesContainer.innerHTML = `
            <div class="message system">
                記憶已清除！歡迎重新開始對話。
            </div>
        `;
        
        console.log('當前 Session 記憶已清除');
        return true;
    }
    
    // 清除 N 天前的記憶
    clearOldMemory(days = 7) {
        const chatHistory = JSON.parse(localStorage.getItem('chatbot_history') || '[]');
        const cutoffTime = new Date().getTime() - (days * 24 * 60 * 60 * 1000);
        
        const recentHistory = chatHistory.filter(chat => {
            const chatTime = new Date(chat.timestamp).getTime();
            return chatTime > cutoffTime;
        });
        
        localStorage.setItem('chatbot_history', JSON.stringify(recentHistory));
        console.log(`清理了 ${days} 天前的記憶，剩餘 ${recentHistory.length} 條記錄`);
        return chatHistory.length - recentHistory.length;
    }
    
    // 獲取記憶統計資訊
    getMemoryStats() {
        const chatHistory = JSON.parse(localStorage.getItem('chatbot_history') || '[]');
        const currentSessionHistory = chatHistory.filter(chat => chat.sessionId === this.sessionId);
        
        return {
            totalConversations: chatHistory.length,
            currentSessionConversations: currentSessionHistory.length,
            sessionId: this.sessionId,
            oldestRecord: chatHistory.length > 0 ? chatHistory[0].timestamp : null,
            newestRecord: chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].timestamp : null
        };
    }
    
    // 設定自動清理選項
    setMemorySettings(settings) {
        this.memorySettings = { ...this.memorySettings, ...settings };
        localStorage.setItem('chatbot_memory_settings', JSON.stringify(this.memorySettings));
        console.log('記憶設定已更新:', this.memorySettings);
    }
    
    // 載入記憶設定
    loadMemorySettings() {
        const saved = localStorage.getItem('chatbot_memory_settings');
        if (saved) {
            this.memorySettings = { ...this.memorySettings, ...JSON.parse(saved) };
        }
    }
    
    // 在 UI 中添加清除記憶按鈕
    addMemoryManagementUI() {
        const memoryButton = document.createElement('button');
        memoryButton.innerHTML = '<i class="fas fa-trash"></i>';
        memoryButton.className = 'memory-clear-btn';
        memoryButton.title = '清除對話記憶';
        memoryButton.style.cssText = `
            position: absolute;
            top: 15px;
            right: 60px;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.2s ease;
        `;
        
        memoryButton.addEventListener('mouseenter', () => {
            memoryButton.style.background = 'rgba(255,255,255,0.3)';
        });
        
        memoryButton.addEventListener('mouseleave', () => {
            memoryButton.style.background = 'rgba(255,255,255,0.2)';
        });
        
        memoryButton.addEventListener('click', () => {
            this.showMemoryManagementModal();
        });
        
        // 添加到 chatbot header
        const header = this.chatbotPanel.querySelector('.chatbot-header');
        header.appendChild(memoryButton);
    }
    
    // 顯示記憶管理模態視窗
    showMemoryManagementModal() {
        const stats = this.getMemoryStats();
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 15px; padding: 30px; max-width: 400px; width: 90%;">
                <h3 style="margin-bottom: 20px; color: #333;">記憶管理</h3>
                <div style="margin-bottom: 20px; font-size: 14px; color: #666;">
                    <p><strong>總對話數：</strong>${stats.totalConversations}</p>
                    <p><strong>本次對話數：</strong>${stats.currentSessionConversations}</p>
                    <p><strong>最早記錄：</strong>${stats.oldestRecord ? new Date(stats.oldestRecord).toLocaleString() : '無'}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button onclick="window.chatBot.clearCurrentSession(); this.closest('div').remove();" 
                            style="padding: 10px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        清除本次對話
                    </button>
                    <button onclick="window.chatBot.clearOldMemory(7); this.closest('div').remove();" 
                            style="padding: 10px; background: #ffc107; color: #333; border: none; border-radius: 8px; cursor: pointer;">
                        清除 7 天前記憶
                    </button>
                    <button onclick="if(confirm('確定要清除所有記憶嗎？')) { window.chatBot.clearAllMemory(); location.reload(); }" 
                            style="padding: 10px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        清除所有記憶
                    </button>
                    <button onclick="this.closest('div').remove();" 
                            style="padding: 10px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        取消
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 點擊外部關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // 修改原有的初始化方法，添加記憶管理 UI
    bindEvents() {
        // ... 現有的事件綁定 ...
        
        // 添加記憶管理 UI
        this.addMemoryManagementUI();
        
        // 載入記憶設定
        this.loadMemorySettings();
    }
}

// 全域函數：不同的清除選項
window.chatBotMemory = {
    // 清除所有記憶
    clearAll: () => {
        if (confirm('確定要清除所有 ChatBot 記憶嗎？')) {
            window.chatBot.clearAllMemory();
            location.reload();
        }
    },
    
    // 清除當前對話
    clearCurrent: () => {
        window.chatBot.clearCurrentSession();
    },
    
    // 清除舊記憶
    clearOld: (days = 7) => {
        const cleared = window.chatBot.clearOldMemory(days);
        alert(`已清除 ${cleared} 條 ${days} 天前的記錄`);
    },
    
    // 查看記憶統計
    stats: () => {
        const stats = window.chatBot.getMemoryStats();
        console.table(stats);
        return stats;
    },
    
    // 設定自動清理
    setAutoClean: (enabled = true, hours = 24) => {
        window.chatBot.setMemorySettings({
            autoClean: enabled,
            sessionTimeout: hours * 60
        });
    }
};

// 根據不同需求的設定範例
const memoryConfigs = {
    // 每次進入都是新對話（無記憶）
    noMemory: {
        autoClean: true,
        cleanOnNewSession: true,
        sessionTimeout: 0
    },
    
    // 短期記憶（1小時）
    shortTerm: {
        autoClean: true,
        sessionTimeout: 60,
        maxHistory: 20
    },
    
    // 長期記憶（7天）
    longTerm: {
        autoClean: true,
        sessionTimeout: 7 * 24 * 60,
        maxHistory: 500
    },
    
    // 永久記憶
    permanent: {
        autoClean: false,
        sessionTimeout: Infinity,
        maxHistory: 1000
    }
};

// 在控制台提供快速設定選項
window.setChatBotMemory = (type) => {
    if (memoryConfigs[type]) {
        window.chatBot.setMemorySettings(memoryConfigs[type]);
        console.log(`ChatBot 記憶設定為：${type}`);
    } else {
        console.log('可用選項：noMemory, shortTerm, longTerm, permanent');
    }
};