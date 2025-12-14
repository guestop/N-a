import clsx from 'clsx'
import type { ChatMessage } from '@/lib/chatTypes'
import { SourcePills } from '@/components/SourcePills'
import { TypingIndicator } from '@/components/TypingIndicator'

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <div className={clsx('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
          isUser ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900',
          isAssistant ? 'border border-zinc-200' : 'border border-transparent'
        )}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
          {message.isStreaming ? <TypingIndicator className="ml-2 align-middle" /> : null}
        </div>

        {isAssistant && message.sourcesStatus === 'loading' ? (
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent" />
            <span>Fetching sources…</span>
          </div>
        ) : null}

        {isAssistant && message.sources ? <SourcePills sources={message.sources} /> : null}
      </div>
    </div>
  )
}
