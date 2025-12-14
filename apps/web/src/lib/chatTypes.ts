export type ChatRole = 'user' | 'assistant' | 'system'

export type SourceType = 'news' | 'youtube' | 'web' | 'contact' | 'unknown'

export type ChatSource = {
  id: string
  type: SourceType
  title: string
  url: string
}

export type SourcesStatus = 'idle' | 'loading' | 'success' | 'error'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: number

  isStreaming?: boolean
  sourcesStatus?: SourcesStatus
  sources?: ChatSource[]
}
