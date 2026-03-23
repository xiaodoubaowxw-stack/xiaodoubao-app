// relay API 封装

const RELAY_BASE = 'http://124.156.194.65:6688';
const RELAY_ID = '41DEFE0E0D9F56B1A5355E6EC9B5CDCA';

export interface RelayMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  time: number;
  session: string;
}

export interface PollResponse {
  messages: RelayMessage[];
}

export async function pollMessages(afterId?: string): Promise<RelayMessage[]> {
  try {
    const url = afterId
      ? `${RELAY_BASE}/poll?id=${RELAY_ID}&after=${afterId}`
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

export async function sendMessage(text: string): Promise<boolean> {
  try {
    const res = await fetch(`${RELAY_BASE}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        to: 'bot',
        text,
        session: 'app',
      }),
    });
    if (!res.ok) {
      console.error('send error', res.status);
      return false;
    }
    return true;
  } catch (e) {
    console.error('send fetch error', e);
    return false;
  }
}

export async function fetchStatus(): Promise<any> {
  try {
    const res = await fetch(`${RELAY_BASE}/status`, {
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
