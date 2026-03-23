// relay API 封装

const RELAY_BASE = 'http://124.156.194.65:6688';
const RELAY_ID = '41DEFE0E0D9F56B1A5355E6EC9B5CDCA'; // Boss 的 clientId

export interface RelayMessage {
  id: string;
  originId?: string;
  from: string;
  to: string;
  text: string;
  time: number;
  session: string;
  type?: string;
}

export interface PollResponse {
  messages: RelayMessage[];
}

export async function pollMessages(afterId?: string): Promise<RelayMessage[]> {
  try {
    // afterId: use originId (string) for proper string comparison ordering
    const url = afterId
      ? `${RELAY_BASE}/poll?id=${RELAY_ID}&after=${encodeURIComponent(afterId)}`
      : `${RELAY_BASE}/poll?id=${RELAY_ID}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      console.error('poll error', res.status);
      return [];
    }
    const data: PollResponse = await res.json();
    return data.messages || [];
  } catch (e) {
    console.error('poll fetch error', e);
    return [];
  }
}

export async function sendMessage(text: string): Promise<{ ok: boolean; msgId?: number; originId?: string }> {
  try {
    const res = await fetch(`${RELAY_BASE}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: RELAY_ID,       // Boss 的 clientId - 用于正确路由
        to: 'bot',          // 消息发给 bot
        text,
        session: 'app',     // 专属 app session
      }),
    });
    if (!res.ok) {
      console.error('send error', res.status);
      return { ok: false };
    }
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('send fetch error', e);
    return { ok: false };
  }
}

export async function fetchStatus(): Promise<any> {
  try {
    // Try OpenClaw gateway status via relay proxy
    const res = await fetch(`${RELAY_BASE}/oc-status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('status fetch error', e);
    return null;
  }
}
