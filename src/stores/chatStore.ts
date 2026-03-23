import { create } from 'zustand';
import { RelayMessage } from '../api/relay';

export interface ChatMessage {
  id: string;
  from: 'user' | 'bot';
  text: string;
  time: number;
}

interface ChatStore {
  messages: ChatMessage[];
  lastId: string | null;
  sending: boolean;
  addMessages: (msgs: RelayMessage[]) => void;
  addMessage: (text: string, from: 'user' | 'bot') => void;
  setSending: (v: boolean) => void;
  setLastId: (id: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  lastId: null,
  sending: false,

  addMessages: (msgs) => {
    if (!msgs.length) return;
    // Only show messages from/to the 'app' session (our app's session)
    const appMsgs = msgs.filter((m) => m.session === 'app');
    if (!appMsgs.length) return;
    const newMsgs: ChatMessage[] = appMsgs.map((m) => ({
      id: m.id,
      from: m.from === 'bot' ? 'bot' : 'user',
      text: m.text,
      time: m.time,
    }));
    set((state) => {
      const existingIds = new Set(state.messages.map((m) => m.id));
      const unique = newMsgs.filter((m) => !existingIds.has(m.id));
      return { messages: [...state.messages, ...unique] };
    });
    // update lastId to newest
    const maxId = appMsgs.reduce((a, b) => (a.time > b.time ? a : b)).id;
    get().setLastId(maxId);
  },

  addMessage: (text, from) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((state) => ({
      messages: [
        ...state.messages,
        { id, from, text, time: Date.now() },
      ],
    }));
  },

  setSending: (v) => set({ sending: v }),

  setLastId: (id) => set({ lastId: id }),
}));
