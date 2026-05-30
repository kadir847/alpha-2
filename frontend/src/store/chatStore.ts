import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '../types';

type ChatState = {
  activeConversationId: number | null;
  messages: Message[];
  streaming: boolean;
  setActiveConversationId: (id: number | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string | number, content: string) => void;
  setStreaming: (streaming: boolean) => void;
  resetChat: () => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      activeConversationId: null,
      messages: [],
      streaming: false,
      setActiveConversationId: (id) => set({ activeConversationId: id }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (id, content) =>
        set((state) => ({
          messages: state.messages.map((message) => (message.id === id ? { ...message, content } : message)),
        })),
      setStreaming: (streaming) => set({ streaming }),
      resetChat: () => set({ activeConversationId: null, messages: [] }),
    }),
    { name: 'alpha2-chat' },
  ),
);

