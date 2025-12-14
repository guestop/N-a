import { create } from 'zustand'
import type { ChatMessage, ChatSource, SourcesStatus } from '@/lib/chatTypes'

type ChatState = {
  messages: ChatMessage[]
  error: string | null

  addMessage: (message: ChatMessage) => void
  appendToMessage: (messageId: string, delta: string) => void
  setMessageStreaming: (messageId: string, isStreaming: boolean) => void
  setSourcesStatus: (messageId: string, status: SourcesStatus) => void
  setSources: (messageId: string, sources: ChatSource[]) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  error: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  appendToMessage: (messageId, delta) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, content: m.content + delta } : m
      ),
    })),

  setMessageStreaming: (messageId, isStreaming) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === messageId ? { ...m, isStreaming } : m)),
    })),

  setSourcesStatus: (messageId, status) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === messageId ? { ...m, sourcesStatus: status } : m)),
    })),

  setSources: (messageId, sources) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === messageId ? { ...m, sources } : m)),
    })),

  setError: (error) => set({ error }),

  reset: () => set({ messages: [], error: null }),
}))
