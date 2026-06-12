import { LayoutDashboard, GitBranch, Lightbulb, Target } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'timeline',  label: 'Línea de Tiempo', icon: GitBranch },
  { id: 'insights',  label: 'Insights',   icon: Lightbulb },
]

const ZONE_COLORS = {
  1: '#6366F1',
  2: '#EF4444',
  3: '#F59E0B',
  4: '#10B981',
}

export default function Sidebar({ view, setView, stats }) {
  const totalActivities = stats.reduce((s, z) => s + (z.total || 0), 0)

  return (
    <aside className="w-56 flex flex-col bg-[#0E0F14] border-r border-[#1E2235] shrink-0">
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${view === id
                ? 'bg-gradient-to-r from-[#10B981]/20 to-[#6366F1]/10 text-[#F1F3F9] border border-[#10B981]/30'
                : 'text-[#8892A4] hover:text-[#F1F3F9] hover:bg-[#1A1D29]'
              }
            `}
          >
            <Icon size={16} className={view === id ? 'text-[#10B981]' : ''} />
            {label}
          </button>
        ))}
      </nav>

      {/* Zone Stats */}
      <div className="p-3 border-t border-[#1E2235]">
        <p className="text-[10px] font-semibold text-[#4A5166] uppercase tracking-wider mb-2 px-1">Zonas Activas</p>
        <div className="space-y-1.5">
          {stats.map(zone => (
            <div key={zone.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#1A1D29] transition-colors">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ZONE_COLORS[zone.id], boxShadow: `0 0 6px ${ZONE_COLORS[zone.id]}` }}
                />
                <span className="text-xs text-[#8892A4]">{zone.icon} {zone.name}</span>
              </div>
              <span
                className="text-xs font-bold"
                style={{ color: ZONE_COLORS[zone.id] }}
              >
                {zone.total || 0}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-3 p-2 rounded-xl bg-gradient-to-br from-[#10B981]/10 to-[#6366F1]/5 border border-[#10B981]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Target size={12} className="text-[#10B981]" />
              <span className="text-[10px] text-[#8892A4] font-medium">Total Expansiones</span>
            </div>
            <span className="text-sm font-bold text-[#10B981]">{totalActivities}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
