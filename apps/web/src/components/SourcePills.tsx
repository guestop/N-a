import type { ChatSource } from '@/lib/chatTypes'

function labelForType(type: ChatSource['type']) {
  switch (type) {
    case 'news':
      return 'News'
    case 'youtube':
      return 'YouTube'
    case 'contact':
      return 'Contact'
    case 'web':
      return 'Web'
    default:
      return 'Source'
  }
}

export function SourcePills({ sources }: { sources: ChatSource[] }) {
  if (sources.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {sources.map((s) => (
        <a
          key={s.id}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 shadow-sm hover:bg-zinc-50"
          title={s.title}
        >
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
            {labelForType(s.type)}
          </span>
          <span className="truncate">{s.title}</span>
        </a>
      ))}
    </div>
  )
}
