import { useState, useEffect } from 'react';
import { fetchStatus } from '../api/relay';

interface StatusData {
  gateway?: {
    status: string;
    uptime: number;
  };
  agents?: Array<{
    name: string;
    status: string;
    skills?: string[];
  }>;
  skills?: string[];
  version?: string;
}

export default function MonitorPage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function loadStatus() {
    setLoading(true);
    try {
      const data = await fetchStatus();
      setStatus(data);
      setLastUpdated(new Date());
    } catch (_) {}
    setLoading(false);
  }

  useEffect(() => {
    loadStatus();
    const timer = setInterval(loadStatus, 15000);
    return () => clearInterval(timer);
  }, []);

  function formatUptime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  return (
    <div className="monitor-page">
      {/* Gateway Status */}
      <div className="status-card">
        <h3>🚀 Gateway 状态</h3>
        <div className="status-indicator">
          <span
            className={`status-dot ${status?.gateway?.status === 'running' || status ? 'online' : 'offline'}`}
          />
          {status?.gateway?.status === 'running' ? '运行中' : status ? '运行中' : '加载中...'}
        </div>
        {status?.gateway?.uptime !== undefined && (
          <div className="agent-status" style={{ marginTop: 6 }}>
            运行时间: {formatUptime(status.gateway.uptime)}
          </div>
        )}
      </div>

      {/* Agents */}
      <div className="status-card">
        <h3>🤖 Agent 在线状态</h3>
        {status?.agents && status.agents.length > 0 ? (
          <div className="agent-list">
            {status.agents.map((agent, i) => (
              <div key={i} className="agent-item">
                <span className="agent-name">{agent.name}</span>
                <span className={`agent-status ${agent.status === 'online' ? 'online' : ''}`}>
                  {agent.status === 'online' ? '🟢 在线' : '⚪ 离线'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#999', fontSize: '13px', marginTop: 8 }}>
            {status ? '暂无 Agent 数据' : '加载中...'}
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="status-card">
        <h3>🛠️ 技能列表</h3>
        {status?.skills && status.skills.length > 0 ? (
          <div className="skill-tags">
            {status.skills.map((skill, i) => (
              <span key={i} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ color: '#999', fontSize: '13px', marginTop: 8 }}>
            {status ? '暂无技能数据' : '加载中...'}
          </div>
        )}
      </div>

      {/* Refresh */}
      <button className="refresh-btn" onClick={loadStatus} disabled={loading}>
        {loading ? '刷新中...' : '🔄 刷新状态'}
      </button>

      {lastUpdated && (
        <div className="last-updated">最后更新: {formatTime(lastUpdated)}</div>
      )}
    </div>
  );
}
