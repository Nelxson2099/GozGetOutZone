import { Minus, Square, X } from 'lucide-react'

const api = window.equilibrium ?? null

export default function TitleBar() {
  return (
    <header className="titlebar flex items-center justify-between h-10 px-4 bg-[#0E0F14] border-b border-[#1E2235] select-none shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#10B981] to-[#6366F1] animate-pulse-slow" />
        <span className="text-xs font-semibold text-[#F1F3F9] font-display tracking-wider">EQUILIBRIUM</span>
        <span className="text-[10px] text-[#4A5166] ml-1">v1.0.0</span>
      </div>

      {/* Window controls */}
      <div className="titlebar-controls flex items-center gap-1">
        <button
          onClick={() => api?.window.minimize()}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#8892A4] hover:text-[#F1F3F9] hover:bg-[#1A1D29] transition-all"
          title="Minimizar"
        >
          <Minus size={12} />
        </button>
        <button
          onClick={() => api?.window.maximize()}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#8892A4] hover:text-[#F1F3F9] hover:bg-[#1A1D29] transition-all"
          title="Maximizar"
        >
          <Square size={11} />
        </button>
        <button
          onClick={() => api?.window.close()}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#8892A4] hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Cerrar"
        >
          <X size={13} />
        </button>
      </div>
    </header>
  )
}
