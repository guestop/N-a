import type { ChatMessage, ChatSource, SourceType } from '@/lib/chatTypes'
import { createId } from '@/lib/ids'

type StreamChatArgs = {
  messages: Array<Pick<ChatMessage, 'role' | 'content'>>
  signal?: AbortSignal
  onToken: (delta: string) => void
  onSources: (sources: ChatSource[]) => void
}

type StructuredChunk = Record<string, unknown>

function coerceSourceType(value: unknown): SourceType {
  if (typeof value !== 'string') return 'unknown'

  const v = value.toLowerCase()
  if (v.includes('news') || v.includes('article')) return 'news'
  if (v.includes('youtube') || v.includes('yt') || v.includes('video')) return 'youtube'
  if (v.includes('contact') || v.includes('person')) return 'contact'
  if (v.includes('web') || v.includes('url') || v.includes('link')) return 'web'

  return 'unknown'
}

function pickSourceType(...values: unknown[]): SourceType {
  for (const v of values) {
    const t = coerceSourceType(v)
    if (t !== 'unknown') return t
  }
  return 'unknown'
}

function normalizeSources(input: unknown): ChatSource[] {
  if (!Array.isArray(input)) return []

  return input
    .map((item): ChatSource | null => {
      if (typeof item === 'string') {
        return { id: createId('src'), type: 'web', title: item, url: item }
      }

      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>
        const url =
          (typeof obj.url === 'string' && obj.url) ||
          (typeof obj.href === 'string' && obj.href) ||
          (typeof obj.link === 'string' && obj.link)

        if (!url) return null

        const title =
          (typeof obj.title === 'string' && obj.title) ||
          (typeof obj.name === 'string' && obj.name) ||
          (typeof obj.label === 'string' && obj.label) ||
          url

        const type = pickSourceType(obj.type, obj.sourceType, obj.kind)

        return { id: createId('src'), type, title, url }
      }

      return null
    })
    .filter((v): v is ChatSource => Boolean(v))
}

function extractDelta(obj: StructuredChunk): string {
  const directCandidates: unknown[] = [obj.delta, obj.token, obj.text, obj.content]
  for (const c of directCandidates) {
    if (typeof c === 'string') return c
  }

  if (obj.delta && typeof obj.delta === 'object') {
    const deltaObj = obj.delta as Record<string, unknown>
    if (typeof deltaObj.content === 'string') return deltaObj.content
  }

  if (obj.message && typeof obj.message === 'object') {
    const msgObj = obj.message as Record<string, unknown>
    if (typeof msgObj.content === 'string') return msgObj.content
  }

  const choices = obj.choices
  if (Array.isArray(choices) && choices.length > 0) {
    const first = choices[0]
    if (first && typeof first === 'object') {
      const firstObj = first as Record<string, unknown>
      const delta = firstObj.delta
      if (delta && typeof delta === 'object') {
        const deltaObj = delta as Record<string, unknown>
        if (typeof deltaObj.content === 'string') return deltaObj.content
      }
    }
  }

  return ''
}

function extractSources(obj: StructuredChunk): ChatSource[] {
  const candidates: unknown[] = [obj.sources, obj.references, obj.citations]
  for (const c of candidates) {
    const normalized = normalizeSources(c)
    if (normalized.length > 0) return normalized
  }
  return []
}

function processStructuredData(data: string, onToken: (d: string) => void, onSources: (s: ChatSource[]) => void) {
  if (!data) return
  if (data === '[DONE]') return

  try {
    const parsed = JSON.parse(data) as StructuredChunk

    const sources = extractSources(parsed)
    if (sources.length > 0) onSources(sources)

    const delta = extractDelta(parsed)
    if (delta) onToken(delta)
  } catch {
    onToken(data)
  }
}

export async function streamChat({ messages, signal, onToken, onSources }: StreamChatArgs) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream, application/json, text/plain',
    },
    body: JSON.stringify({ messages }),
    signal,
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(message || `Request failed (${response.status})`)
  }

  if (!response.body) {
    const text = await response.text()
    onToken(text)
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let mode: 'unknown' | 'raw' | 'structured' = 'unknown'

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    const chunkText = decoder.decode(value, { stream: true })

    if (mode === 'unknown') {
      buffer += chunkText
      const t = buffer.trimStart()
      if (t.startsWith('data:') || t.startsWith('{') || t.startsWith('[')) {
        mode = 'structured'
      } else {
        mode = 'raw'
        onToken(buffer)
        buffer = ''
      }
      continue
    }

    if (mode === 'raw') {
      onToken(chunkText)
      continue
    }

    buffer += chunkText

    while (true) {
      const sseIdx = buffer.indexOf('\n\n')
      if (sseIdx !== -1) {
        const rawEvent = buffer.slice(0, sseIdx)
        buffer = buffer.slice(sseIdx + 2)

        const lines = rawEvent.split(/\r?\n/)
        const dataLines = lines
          .filter((l) => l.startsWith('data:'))
          .map((l) => l.replace(/^data:\s?/, ''))

        if (dataLines.length > 0) {
          processStructuredData(dataLines.join('\n'), onToken, onSources)
        } else {
          processStructuredData(rawEvent.trim(), onToken, onSources)
        }

        continue
      }

      const nlIdx = buffer.indexOf('\n')
      if (nlIdx !== -1) {
        const line = buffer.slice(0, nlIdx)
        buffer = buffer.slice(nlIdx + 1)
        processStructuredData(line.trim(), onToken, onSources)
        continue
      }

      break
    }
  }

  const rest = decoder.decode()
  if (mode === 'structured') {
    buffer += rest
    const trimmed = buffer.trim()
    if (trimmed) processStructuredData(trimmed, onToken, onSources)
  } else if (mode === 'raw') {
    if (rest) onToken(rest)
  }
}
