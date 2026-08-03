import { LayoutDashboard, GitBranch, Lightbulb, Target, Swords, Repeat, FolderKanban } from 'lucide-react'
import { getLevelInfo } from '../constants'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'misiones',  label: 'Misiones',      icon: Swords          },
  { id: 'habitos',   label: 'Hábitos',       icon: Repeat          },
  { id: 'proyectos', label: 'Proyectos',     icon: FolderKanban    },
  { id: 'timeline',  label: 'Línea de Tiempo', icon: GitBranch      },
  { id: 'insights',  label: 'Insights',      icon: Lightbulb       },
]

const ZONE_COLORS = {
  1: '#6366F1',
  2: '#EF4444',
  3: '#F59E0B',
  4: '#10B981',
}

export default function Sidebar({ view, setView, stats, levelInfo, totalXP, xpData, streak, streakMultiplier, onOpenBackup }) {
  const totalActivities = stats.reduce((s, z) => s + (z.total || 0), 0)
  const pendingMissions = (xpData?.pendientes_principal || 0) + (xpData?.pendientes_secundaria || 0)

  return (
    <aside className="w-56 flex flex-col bg-[#0E0F14] border-r border-[#1E2235] shrink-0">

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative
              ${view === id
                ? 'bg-gradient-to-r from-[#10B981]/20 to-[#6366F1]/10 text-[#F1F3F9] border border-[#10B981]/30'
                : 'text-[#8892A4] hover:text-[#F1F3F9] hover:bg-[#1A1D29]'
              }
            `}
          >
            <Icon size={16} className={view === id ? 'text-[#10B981]' : ''} />
            <span className="flex-1 text-left">{label}</span>
            {/* Missions badge */}
            {id === 'misiones' && pendingMissions > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 min-w-[18px] text-center">
                {pendingMissions}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Streak + XP Level Card */}
      {levelInfo && (
        <div className="px-3 pb-3 space-y-2">

          {/* Streak badge */}
          {streak > 0 && (
            <div
              className="flex items-center justify-between px-3 py-2 rounded-xl border"
              style={{
                background: streak >= 7 ? 'rgba(249,115,22,0.08)' : 'rgba(239,68,68,0.06)',
                borderColor: streak >= 7 ? 'rgba(249,115,22,0.3)' : 'rgba(239,68,68,0.2)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className={`text-base ${streak >= 7 ? 'animate-pulse' : ''}`}>🔥</span>
                <div>
                  <p className="text-xs font-bold text-[#F1F3F9]">{streak} {streak === 1 ? 'día' : 'días'} de racha</p>
                  {streakMultiplier > 1 && (
                    <p className="text-[10px]" style={{ color: streak >= 14 ? '#EC4899' : streak >= 7 ? '#F97316' : '#EF4444' }}>
                      x{streakMultiplier} XP activo
                    </p>
                  )}
                </div>
              </div>
              {streakMultiplier > 1 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: streak >= 14 ? 'rgba(236,72,153,0.2)' : streak >= 7 ? 'rgba(249,115,22,0.2)' : 'rgba(239,68,68,0.2)',
                    color: streak >= 14 ? '#EC4899' : streak >= 7 ? '#F97316' : '#EF4444',
                  }}
                >
                  x{streakMultiplier}
                </span>
              )}
            </div>
          )}

          {/* XP Level card */}
          <div
            className="p-3 rounded-2xl border relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${levelInfo.current.color}10, transparent)`,
              borderColor: `${levelInfo.current.color}30`,
            }}
          >
            {/* Glow bg */}
            <div
              className="absolute inset-0 opacity-10 rounded-2xl"
              style={{ background: `radial-gradient(circle at 80% 20%, ${levelInfo.current.color}, transparent 60%)` }}
            />
            <div className="relative">
              {/* Level info */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">{levelInfo.current.icon}</span>
                <div>
                  <p className="text-[10px] font-bold" style={{ color: levelInfo.current.color }}>
                    Nivel {levelInfo.current.level}
                  </p>
                  <p className="text-[11px] font-semibold text-[#F1F3F9] leading-tight">
                    {levelInfo.current.name}
                  </p>
                </div>
              </div>

              {/* XP Progress bar */}
              {levelInfo.next ? (
                <>
                  <div className="h-1.5 bg-[#1E2235] rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${levelInfo.progress * 100}%`,
                        background: `linear-gradient(90deg, ${levelInfo.current.color}, ${levelInfo.next?.color || levelInfo.current.color})`,
                        boxShadow: `0 0 8px ${levelInfo.current.color}80`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-[#4A5166]">
                    <span>{levelInfo.xpIntoLevel.toLocaleString()} XP</span>
                    <span>{levelInfo.next.name} → {levelInfo.next.minXP.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <p className="text-[10px] text-center font-bold mt-1" style={{ color: levelInfo.current.color }}>
                  ✨ NIVEL MÁXIMO
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
              <span className="text-xs font-bold" style={{ color: ZONE_COLORS[zone.id] }}>
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

        {/* JSON Backup Button */}
        {onOpenBackup && (
          <button
            onClick={onOpenBackup}
            className="w-full mt-2.5 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#1A1D29] hover:bg-[#252A3E] border border-[#252A3E] text-xs font-semibold text-[#8892A4] hover:text-[#F1F3F9] transition-all active:scale-95 group"
            title="Exportar o Importar Copia de Seguridad JSON"
          >
            <FolderKanban size={14} className="text-[#6366F1] group-hover:scale-110 transition-transform" />
            <span>Respaldo JSON</span>
          </button>
        )}
      </div>
    </aside>
  )
}
