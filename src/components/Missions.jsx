import { useState } from 'react'
import { CheckCircle2, Trash2, Clock, Filter } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { ACHIEVEMENTS_DEF, LEVELS } from '../constants'
import toast from 'react-hot-toast'

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es }) }
  catch { return '' }
}

// ── XP Header ─────────────────────────────────────────────────────────────────
function XPHeader({ levelInfo, totalXP, xpData, streak, streakMultiplier }) {
  const completadas = xpData?.total_completadas || 0
  const pendingP    = xpData?.pendientes_principal || 0
  const pendingS    = xpData?.pendientes_secundaria || 0

  return (
    <div className="rounded-2xl p-5 mb-6 relative overflow-hidden border border-[#1E2235]"
         style={{ background: 'linear-gradient(135deg, #0E0F14 0%, #12141f 100%)' }}>
      {/* bg glow */}
      <div className="absolute inset-0 opacity-20"
           style={{ background: `radial-gradient(ellipse at 80% 0%, ${levelInfo.current.color}60, transparent 60%)` }} />

      <div className="relative flex items-start gap-6">
        {/* Level badge */}
        <div className="shrink-0 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-1 border"
            style={{
              background: `${levelInfo.current.color}15`,
              borderColor: `${levelInfo.current.color}40`,
              boxShadow: `0 0 20px ${levelInfo.current.color}30`,
            }}
          >
            {levelInfo.current.icon}
          </div>
          <p className="text-[10px] font-bold" style={{ color: levelInfo.current.color }}>
            Nv. {levelInfo.current.level}
          </p>
        </div>

        {/* Stats */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <h2 className="text-xl font-bold font-display text-[#F1F3F9]">{levelInfo.current.name}</h2>
            {levelInfo.next && (
              <span className="text-xs text-[#4A5166]">→ {levelInfo.next.name}</span>
            )}
          </div>
          {/* XP bar */}
          <div className="h-2 bg-[#1A1D29] rounded-full overflow-hidden mb-2 w-full">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${levelInfo.progress * 100}%`,
                background: `linear-gradient(90deg, ${levelInfo.current.color}, ${levelInfo.next?.color || levelInfo.current.color})`,
                boxShadow: `0 0 10px ${levelInfo.current.color}`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#4A5166] mb-3">
            <span><span className="text-[#F1F3F9] font-bold">{totalXP.toLocaleString()}</span> XP total</span>
            {levelInfo.next
              ? <span>Faltan <span className="text-[#F1F3F9] font-bold">{(levelInfo.next.minXP - totalXP).toLocaleString()}</span> XP para {levelInfo.next.name}</span>
              : <span className="font-bold" style={{ color: levelInfo.current.color }}>✨ NIVEL MÁXIMO</span>
            }
          </div>

          {/* Mini stats */}
          <div className="flex flex-wrap gap-3 mt-3">
            <StatPill label="Completadas" value={completadas} color="#10B981" />
            <StatPill label="Ppales. Pend." value={pendingP} color="#F59E0B" />
            <StatPill label="Secd. Pend." value={pendingS} color="#A78BFA" />
            {streak > 0 && (
              <StatPill
                label={`Racha (x${streakMultiplier})`}
                value={`${streak}d 🔥`}
                color={streak >= 7 ? '#F97316' : '#EF4444'}
              />
            )}
          </div>
        </div>

        {/* All levels preview */}
        <div className="shrink-0 hidden lg:flex flex-col gap-1">
          {LEVELS.map(l => (
            <div
              key={l.level}
              className="flex items-center gap-1.5 transition-opacity"
              style={{ opacity: levelInfo.current.level >= l.level ? 1 : 0.3 }}
            >
              <span className="text-[11px]">{l.icon}</span>
              <span className="text-[9px] font-medium" style={{ color: levelInfo.current.level === l.level ? l.color : '#4A5166' }}>
                {l.name}
              </span>
              {levelInfo.current.level === l.level && (
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: l.color }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#1E2235]"
         style={{ background: `${color}08` }}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-[#8892A4]">{label}</span>
      <span className="text-[10px] font-bold" style={{ color }}>{value}</span>
    </div>
  )
}

// ── Mission Card ──────────────────────────────────────────────────────────────
function MissionCard({ mission: m, onComplete, onDelete }) {
  const isPrincipal = m.mision_tipo === 'principal'
  const isCompleted = Boolean(m.completada)
  const isExpired   = !isCompleted && m.deadline && new Date(m.deadline + 'T23:59:59') < new Date()
  
  const accentColor = isCompleted ? (isPrincipal ? '#F59E0B' : '#A78BFA') : isExpired ? '#EF4444' : (isPrincipal ? '#F59E0B' : '#A78BFA')
  const xpReward    = isPrincipal ? 1000 : 100
  const [completing, setCompleting] = useState(false)

  async function handleComplete() {
    setCompleting(true)
    await onComplete(m.id)
    toast.success(`+${xpReward} XP ganados! ${isPrincipal ? '🏆' : '⚡'}`, {
      icon: isPrincipal ? '🏆' : '⚡',
      style: {
        background: `${accentColor}15`,
        color: '#F1F3F9',
        border: `1px solid ${accentColor}40`,
      },
    })
  }

  return (
    <div
      className={`relative rounded-2xl p-4 border transition-all duration-300 ${isCompleted ? 'opacity-60' : ''}`}
      style={{
        background: isCompleted
          ? '#0E0F14'
          : `linear-gradient(135deg, ${accentColor}08, transparent)`,
        borderColor: isCompleted ? '#1E2235' : isExpired ? `${accentColor}50` : `${accentColor}30`,
        boxShadow: isCompleted ? 'none' : `0 0 15px ${accentColor}10`,
      }}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        {/* Zone icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0"
          style={{ background: `${m.zona_color}15`, border: `1px solid ${m.zona_color}30` }}
        >
          {m.zona_icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${isCompleted ? 'line-through text-[#4A5166]' : 'text-[#F1F3F9]'}`}>
            {m.descripcion}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
            {/* Zone pill */}
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${m.zona_color}15`, color: m.zona_color }}
            >
              {m.zona_icon} {m.zona_name}
            </span>
            {/* Mission type */}
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: `${accentColor}15`, color: accentColor }}
            >
              {isPrincipal ? '🏆 Principal' : '⚡ Secundaria'}
            </span>
            {/* XP reward */}
            <span className="text-[10px] text-[#4A5166]">
              +{xpReward} XP
            </span>
            {/* Time */}
            <span className="text-[10px] text-[#4A5166] flex items-center gap-1">
              <Clock size={9} /> {timeAgo(m.created_at)}
            </span>
            {/* Deadline */}
            {m.deadline && !isCompleted && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isExpired ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-[#1E2235] text-[#8892A4]'}`}>
                {isExpired ? '⚠️ Vencida' : `📅 Vence: ${m.deadline}`}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!isCompleted && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}40`,
                color: accentColor,
              }}
              title="Completar misión"
            >
              {completing
                ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <CheckCircle2 size={15} />
              }
            </button>
          )}
          {isCompleted && (
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#10B98115', border: '1px solid #10B98140', color: '#10B981' }}
            >
              <CheckCircle2 size={15} />
            </div>
          )}
          <button
            onClick={() => onDelete(m.id)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4A5166] hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Completed overlay accent */}
      {isCompleted && (
        <div className="absolute top-2 right-12 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
          ✅ Completada
        </div>
      )}
    </div>
  )
}

function SectionHeader({ icon, label, color, count, xpEach, customDesc }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-[#F1F3F9]">{label}</h3>
        <p className="text-[10px] text-[#4A5166]">
          {customDesc ? customDesc : `+${xpEach} XP por completar · ${count} ${count === 1 ? 'misión' : 'misiones'}`}
        </p>
      </div>
    </div>
  )
}

// ── Achievements Gallery ──────────────────────────────────────────────────────
function AchievementsGallery({ unlockedAchievements }) {
  const unlocked = new Set(unlockedAchievements)
  
  return (
    <div className="mt-8 mb-8">
      <SectionHeader icon="🏅" label="Galería de Logros" color="#3B82F6" count={unlocked.size} xpEach="Bonus" customDesc={`Has desbloqueado ${unlocked.size} de ${ACHIEVEMENTS_DEF.length} logros`} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
        {ACHIEVEMENTS_DEF.map(ach => {
          const isUnlocked = unlocked.has(ach.id)
          return (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                isUnlocked ? 'bg-[#1A1D29]' : 'bg-[#0E0F14] opacity-50 grayscale'
              }`}
              style={{
                borderColor: isUnlocked ? `${ach.color}40` : '#1E2235',
                boxShadow: isUnlocked ? `0 4px 20px ${ach.color}15` : 'none',
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2"
                style={{ background: isUnlocked ? `${ach.color}20` : '#1E2235' }}
              >
                {ach.icon}
              </div>
              <h4 className="text-xs font-bold text-[#F1F3F9] mb-1">{ach.name}</h4>
              <p className="text-[9px] text-[#8892A4] leading-tight">{ach.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function MissionsPanel({ missions, zones, levelInfo, totalXP, xpData, streak, streakMultiplier, unlockedAchievements, onComplete, onDelete }) {
  const [filter, setFilter] = useState('pending') // 'pending' | 'all' | 'achievements'

  const displayed  = filter === 'pending' ? missions.filter(m => !m.completada) : [...missions]
  
  // Sort displayed: expired first (if pending), then principal, then secundarias
  displayed.sort((a, b) => {
    const aExpired = !a.completada && a.deadline && new Date(a.deadline + 'T23:59:59') < new Date() ? 1 : 0
    const bExpired = !b.completada && b.deadline && new Date(b.deadline + 'T23:59:59') < new Date() ? 1 : 0
    if (aExpired !== bExpired) return bExpired - aExpired
    if (a.mision_tipo !== b.mision_tipo) return a.mision_tipo === 'principal' ? -1 : 1
    return b.timestamp - a.timestamp
  })

  const principales = displayed.filter(m => m.mision_tipo === 'principal')
  const secundarias = displayed.filter(m => m.mision_tipo === 'secundaria')
  const empty       = principales.length === 0 && secundarias.length === 0

  return (
    <div className="p-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#F1F3F9] flex items-center gap-2">
            ⚔️ Misiones
          </h1>
          <p className="text-sm text-[#8892A4] mt-1">Tu sistema de progresión y conquistas</p>
        </div>
        {/* Filter toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-[#0E0F14] border border-[#1E2235]">
          {[
            { id: 'pending',      label: 'Pendientes' },
            { id: 'all',          label: 'Todas' },
            { id: 'achievements', label: 'Logros 🏅' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.id
                  ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                  : 'text-[#8892A4] hover:text-[#F1F3F9]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* XP Header */}
      <XPHeader levelInfo={levelInfo} totalXP={totalXP} xpData={xpData} streak={streak} streakMultiplier={streakMultiplier} />

      {filter === 'achievements' ? (
        <AchievementsGallery unlockedAchievements={unlockedAchievements} />
      ) : (
        <>
          {/* Empty state */}
      {empty && (
        <div className="text-center py-16 text-[#4A5166]">
          <p className="text-5xl mb-4">⚔️</p>
          <p className="text-sm font-medium text-[#8892A4]">
            {filter === 'pending' ? 'No tienes misiones pendientes.' : 'Aún no has creado misiones.'}
          </p>
          <p className="text-xs mt-2">Pulsa el botón <span className="text-[#10B981] font-bold">+</span> y elige Misión Principal o Secundaria.</p>
        </div>
      )}

      {/* Principales */}
      {principales.length > 0 && (
        <div className="mb-8">
          <SectionHeader
            icon="🏆"
            label="Misiones Principales"
            color="#F59E0B"
            count={principales.length}
            xpEach={1000}
          />
          <div className="space-y-3">
            {principales.map(m => (
              <MissionCard key={m.id} mission={m} onComplete={onComplete} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Secundarias */}
      {secundarias.length > 0 && filter !== 'achievements' && (
        <div>
          <SectionHeader
            icon="⚡"
            label="Misiones Secundarias"
            color="#A78BFA"
            count={secundarias.length}
            xpEach={100}
          />
          <div className="space-y-3">
            {secundarias.map(m => (
              <MissionCard key={m.id} mission={m} onComplete={onComplete} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}
      
      {/* End of content wrapper */}
      {filter !== 'achievements' && <div className="h-8" />}
        </>
      )}
    </div>
  )
}
