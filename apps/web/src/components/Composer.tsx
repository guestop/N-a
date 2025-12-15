import { useEffect, useMemo, useRef } from 'react'
import clsx from 'clsx'

type ComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function Composer({ value, onChange, onSubmit, disabled }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const canSubmit = useMemo(() => value.trim().length > 0 && !disabled, [value, disabled])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return

    el.style.height = '0px'
    const next = Math.min(el.scrollHeight, 160)
    el.style.height = `${next}px`
  }, [value])

  return (
    <div className="border-t border-zinc-200 bg-white px-3 py-3">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (canSubmit) onSubmit()
            }
          }}
          placeholder="Message…"
          className="max-h-40 min-h-[44px] flex-1 resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-zinc-300 focus:ring-2 focus:ring-zinc-200"
          disabled={disabled}
          rows={1}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={clsx(
            'inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium',
            canSubmit
              ? 'border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800'
              : 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400'
          )}
          aria-label="Send"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
          >
            <path
              d="M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 5L19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="mx-auto mt-2 max-w-3xl text-xs text-zinc-500">
        Enter to send • Shift+Enter for newline
      </div>
    </div>
  )
}
