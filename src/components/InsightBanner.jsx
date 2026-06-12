import { AlertTriangle, TrendingUp, Flame } from 'lucide-react'

/**
 * InsightBanner — displayed at the top of Dashboard when a zone has been
 * neglected for too many days. Triggers behavioral nudge messages.
 */
export default function InsightBanner({ insight }) {
  const { name, icon, color, days_since } = insight

  const getMessage = () => {
    if (name === 'Confort' && days_since >= 5)
      return `Llevas ${days_since} días seguidos en Zona de Confort. Es hora de un pequeño riesgo. 🌱`
    if (name === 'Miedo' && days_since >= 7)
      return `Han pasado ${days_since} días sin confrontar el miedo. El coraje se entrena. ⚡`
    if (name === 'Aprendizaje' && days_since >= 5)
      return `${days_since} días sin aprender algo nuevo. Tu cerebro necesita ese reto. 📚`
    return `Han pasado ${days_since} días sin actividad en ${name}. ¡Es tu momento! ${icon}`
  }

  return (
    <div className="insight-card rounded-2xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
           style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        {days_since >= 7 ? <Flame size={16} style={{ color }} /> : <AlertTriangle size={16} style={{ color }} />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <TrendingUp size={12} className="text-[#6366F1]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6366F1]">Insight del Sistema</span>
        </div>
        <p className="text-sm text-[#F1F3F9] font-medium leading-relaxed">{getMessage()}</p>
      </div>
    </div>
  )
}
