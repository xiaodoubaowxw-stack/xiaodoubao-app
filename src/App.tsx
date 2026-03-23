import { useState, useEffect, useRef } from 'react';
import ChatPage from './pages/ChatPage';
import MonitorPage from './pages/MonitorPage';

type Tab = 'chat' | 'monitor';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">⚡ 小逗包</div>
        <nav className="app-nav">
          <button
            className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 聊天
          </button>
          <button
            className={`nav-btn ${activeTab === 'monitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitor')}
          >
            📊 监控
          </button>
        </nav>
      </header>
      <main className="app-main">
        {activeTab === 'chat' ? <ChatPage /> : <MonitorPage />}
      </main>
    </div>
  );
}

export default App;
