import { Lightbulb, Flame, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'

/**
 * InsightsPanel — Dedicated view for behavioral analytics and zone balance insights.
 */
export default function InsightsPanel({ insights, stats, zones }) {
  const totalActivities = stats.reduce((s, z) => s + (z.total || 0), 0)

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-[#F1F3F9]">Sistema de Insights</h1>
        <p className="text-sm text-[#8892A4] mt-1">Análisis de tu equilibrio y patrones de comportamiento</p>
      </div>

      {/* Balance Score */}
      <BalanceScore stats={stats} total={totalActivities} />

      {/* Zone Insights */}
      <div className="grid grid-cols-2 gap-4">
        {insights.map(insight => (
          <ZoneInsightCard key={insight.id} insight={insight} total={totalActivities} />
        ))}
      </div>

      {/* Behavioral Recommendations */}
      <RecommendationsSection insights={insights} stats={stats} />
    </div>
  )
}

// ── Balance Score ───────────────────────────────────────────────────────────────
function BalanceScore({ stats, total }) {
  if (total === 0) return null

  const max = Math.max(...stats.map(z => z.total || 0))
  const min = Math.min(...stats.map(z => z.total || 0))
  const variance = max - min
  const score = Math.max(0, Math.round(100 - (variance / (total / 4)) * 20))

  const getLabel = () => {
    if (score >= 80) return { text: 'Equilibrio Óptimo', color: '#10B981', icon: <CheckCircle size={18} /> }
    if (score >= 60) return { text: 'Buen Progreso', color: '#F59E0B', icon: <TrendingUp size={18} /> }
    return { text: 'Necesitas Rebalancear', color: '#EF4444', icon: <AlertTriangle size={18} /> }
  }
  const { text, color, icon } = getLabel()

  return (
    <div className="glass rounded-2xl p-5 shadow-card text-center">
      <p className="text-xs font-semibold text-[#8892A4] uppercase tracking-widest mb-3">Score de Equilibrio</p>
      <div className="relative w-28 h-28 mx-auto mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1E2235" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${score * 2.51} 251`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold font-display" style={{ color }}>{score}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2" style={{ color }}>
        {icon}
        <span className="text-sm font-semibold">{text}</span>
      </div>
    </div>
  )
}

// ── Zone Insight Card ───────────────────────────────────────────────────────────
function ZoneInsightCard({ insight, total }) {
  const { name, icon, color, total_activities, days_since } = insight
  const pct = total > 0 ? Math.round((total_activities / total) * 100) : 0

  const getStatus = () => {
    if (days_since === 0) return { text: 'Activa hoy', color: '#10B981', icon: '🟢' }
    if (days_since <= 2)  return { text: `Hace ${days_since}d`, color: '#F59E0B', icon: '🟡' }
    if (days_since <= 5)  return { text: `${days_since}d sin actividad`, color: '#F97316', icon: '🟠' }
    return { text: `${days_since}d inactiva ⚠️`, color: '#EF4444', icon: '🔴' }
  }
  const status = getStatus()

  return (
    <div className="zone-card glass rounded-2xl p-4 shadow-card" style={{ '--zone-color': color }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="text-sm font-semibold text-[#F1F3F9]">{name}</p>
            <p className="text-[10px]" style={{ color: status.color }}>{status.icon} {status.text}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold font-display" style={{ color }}>{total_activities}</p>
          <p className="text-[10px] text-[#4A5166]">eventos</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#1E2235] rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
      <p className="text-[10px] text-[#4A5166]">{pct}% de tus expansiones totales</p>
    </div>
  )
}

// ── Recommendations ─────────────────────────────────────────────────────────────
function RecommendationsSection({ insights, stats }) {
  const recs = []

  const comfort = insights.find(i => i.id === 1)
  const fear    = insights.find(i => i.id === 2)
  const learn   = insights.find(i => i.id === 3)
  const growth  = insights.find(i => i.id === 4)

  if (comfort?.days_since >= 5)
    recs.push({ icon: '🏠', color: '#6366F1', title: 'Sal de tu Zona de Confort',
      text: `Llevas ${comfort.days_since} días sin registrar actividad. El confort crónico es el enemigo del crecimiento.` })
  if (fear?.days_since >= 7)
    recs.push({ icon: '⚡', color: '#EF4444', title: 'Enfrenta un Miedo Esta Semana',
      text: `${fear.days_since} días sin confrontar el miedo. Incluso un pequeño reto diario construye coraje.` })
  if (learn?.total_activities === 0)
    recs.push({ icon: '📚', color: '#F59E0B', title: 'Activa el Modo Aprendizaje',
      text: 'Aún no has registrado ninguna habilidad adquirida. ¿Qué podrías aprender esta semana?' })
  if (growth?.total_activities > 0 && fear?.total_activities === 0)
    recs.push({ icon: '🚀', color: '#10B981', title: 'Metas sin Riesgo No Escalan',
      text: 'Tienes metas cumplidas, pero sin zona de miedo. Las metas más grandes requieren mayor incomodidad.' })
  if (recs.length === 0)
    recs.push({ icon: '✨', color: '#10B981', title: '¡Equilibrio Excelente!',
      text: 'Estás activo en todas las zonas. Tu sistema de expansión está funcionando perfectamente.' })

  return (
    <div className="glass rounded-2xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={16} className="text-[#F59E0B]" />
        <h2 className="text-sm font-semibold text-[#F1F3F9]">Recomendaciones Personalizadas</h2>
      </div>
      <div className="space-y-3">
        {recs.map((rec, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-[#1E2235] hover:bg-[#1A1D29] transition-colors">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
              style={{ background: `${rec.color}15` }}
            >
              {rec.icon}
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: rec.color }}>{rec.title}</p>
              <p className="text-xs text-[#8892A4] mt-0.5 leading-relaxed">{rec.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
