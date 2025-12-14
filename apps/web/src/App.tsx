import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Composer } from '@/components/Composer'
import { MessageBubble } from '@/components/MessageBubble'
import { Sidebar } from '@/components/Sidebar'
import { streamChat } from '@/lib/chatApi'
import type { ChatMessage } from '@/lib/chatTypes'
import { createId } from '@/lib/ids'
import { useChatStore } from '@/stores/chatStore'

type SendArgs = {
  prompt: string
  history: Array<Pick<ChatMessage, 'role' | 'content'>>
  assistantMessageId: string
}

export default function App() {
  const messages = useChatStore((s) => s.messages)
  const error = useChatStore((s) => s.error)
  const addMessage = useChatStore((s) => s.addMessage)
  const appendToMessage = useChatStore((s) => s.appendToMessage)
  const setMessageStreaming = useChatStore((s) => s.setMessageStreaming)
  const setSourcesStatus = useChatStore((s) => s.setSourcesStatus)
  const setSources = useChatStore((s) => s.setSources)
  const setError = useChatStore((s) => s.setError)
  const reset = useChatStore((s) => s.reset)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [draft, setDraft] = useState('')

  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const apiHistory = useMemo(
    () => messages.map((m) => ({ role: m.role, content: m.content })),
    [messages]
  )

  const sendMutation = useMutation({
    mutationFn: async ({ history, assistantMessageId }: SendArgs) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setError(null)
      setMessageStreaming(assistantMessageId, true)
      setSourcesStatus(assistantMessageId, 'loading')

      try {
        await streamChat({
          messages: history,
          signal: controller.signal,
          onToken: (delta) => {
            appendToMessage(assistantMessageId, delta)
          },
          onSources: (sources) => {
            setSources(assistantMessageId, sources)
            setSourcesStatus(assistantMessageId, 'success')
          },
        })
      } finally {
        setMessageStreaming(assistantMessageId, false)

        const msg = useChatStore
          .getState()
          .messages.find((m) => m.id === assistantMessageId)
        if (msg && msg.sourcesStatus === 'loading' && (!msg.sources || msg.sources.length === 0)) {
          setSourcesStatus(assistantMessageId, 'idle')
        }
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    },
  })

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ block: 'end' })
    })
    return () => window.cancelAnimationFrame(id)
  }, [messages])

  const onNewChat = () => {
    abortRef.current?.abort()
    abortRef.current = null
    sendMutation.reset()
    reset()
    setDraft('')
  }

  const onSubmit = () => {
    const prompt = draft.trim()
    if (!prompt || sendMutation.isPending) return

    const userMessage: ChatMessage = {
      id: createId('msg'),
      role: 'user',
      content: prompt,
      createdAt: Date.now(),
    }

    const assistantMessageId = createId('msg')

    addMessage(userMessage)
    addMessage({
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      isStreaming: true,
      sourcesStatus: 'loading',
    })

    setDraft('')

    const history = [...apiHistory, { role: 'user' as const, content: prompt }]

    sendMutation.mutate({ prompt, history, assistantMessageId })
  }

  return (
    <div className="h-full">
      <div className="flex h-full">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNewChat={onNewChat} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100"
              onClick={() => setSidebarOpen(true)}
            >
              Menu
            </button>
            <div className="text-sm font-semibold text-zinc-900">Chat</div>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100"
              onClick={onNewChat}
            >
              New
            </button>
          </header>

          <main className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-3 py-6">
              <div className="mx-auto flex max-w-3xl flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-600">
                    <div className="font-medium text-zinc-800">Ask something to get started</div>
                    <div className="mt-1">
                      Prompts are sent to <code className="rounded bg-zinc-100 px-1">/api/chat</code> and streamed
                      back into the UI.
                    </div>
                  </div>
                ) : null}

                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}

                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                    {error}
                  </div>
                ) : null}

                <div ref={bottomRef} />
              </div>
            </div>

            <Composer value={draft} onChange={setDraft} onSubmit={onSubmit} disabled={sendMutation.isPending} />
          </main>
        </div>
      </div>
    </div>
  )
}
