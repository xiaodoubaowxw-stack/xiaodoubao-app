import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { pollMessages, sendMessage } from '../api/relay';

const POLL_INTERVAL = 3000;

export default function ChatPage() {
  const { messages, lastId, addMessages, addMessage, setSending, sending, setLastId } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Polling
  useEffect(() => {
    async function poll() {
      const msgs = await pollMessages(lastId ?? undefined);
      if (msgs.length > 0) {
        addMessages(msgs);
      }
    }
    poll();
    pollTimerRef.current = setInterval(poll, POLL_INTERVAL);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastId]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    addMessage(text, 'user');
    setSending(true);
    try {
      await sendMessage(text);
    } catch (_) {
      // message already shown in UI
    } finally {
      setSending(false);
    }
  }

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="chat-page">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', padding: '40px 0', fontSize: '14px' }}>
            暂无消息，发送一条消息开始聊天吧！
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`msg ${msg.from}`}>
            <div className="msg-bubble">{msg.text}</div>
            <div className="msg-time">{formatTime(msg.time)}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <input
          className="chat-input"
          placeholder="输入消息..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={sending}
        />
        <button className="send-btn" onClick={handleSend} disabled={sending || !input.trim()}>
          {sending ? '发送中' : '发送'}
        </button>
      </div>
    </div>
  );
}
