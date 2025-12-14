import clsx from 'clsx'

type SidebarProps = {
  open: boolean
  onClose: () => void
  onNewChat: () => void
}

export function Sidebar({ open, onClose, onNewChat }: SidebarProps) {
  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-30 bg-black/30 transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          'fixed z-40 flex h-full w-72 flex-col border-r border-zinc-200 bg-white p-4 transition-transform md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-zinc-900">Chat</div>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 md:hidden"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <button
          type="button"
          className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-100"
          onClick={() => {
            onNewChat()
            onClose()
          }}
        >
          + New chat
        </button>

        <div className="mt-6 text-xs text-zinc-500">
          This UI expects a streaming <code className="rounded bg-zinc-100 px-1">/api/chat</code> endpoint.
        </div>

        <div className="mt-auto text-[11px] text-zinc-400">
          Tip: set <code className="rounded bg-zinc-100 px-1">VITE_API_PROXY_TARGET</code> to proxy API in dev.
        </div>
      </aside>
    </>
  )
}
