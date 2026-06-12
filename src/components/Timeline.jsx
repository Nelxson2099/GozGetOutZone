import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'

const ZONE_CLASS = {
  1: 'zone-comfort',
  2: 'zone-fear',
  3: 'zone-learning',
  4: 'zone-growth',
}

export default function Timeline({ activities, onDelete, zones }) {
  const [expandedId, setExpandedId] = useState(null)
  const [filterZone, setFilterZone] = useState(null)

  const filtered = filterZone
    ? activities.filter(a => a.zona_id === filterZone)
    : activities

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#F1F3F9]">Línea de Tiempo</h1>
          <p className="text-sm text-[#8892A4] mt-1">Historial completo de tus expansiones</p>
        </div>
        {/* Zone Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterZone(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterZone === null ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40' : 'text-[#8892A4] hover:text-[#F1F3F9] border border-[#1E2235]'
            }`}
          >
            Todas
          </button>
          {zones.map(z => (
            <button
              key={z.id}
              onClick={() => setFilterZone(filterZone === z.id ? null : z.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filterZone === z.id
                  ? 'border-opacity-50 text-white'
                  : 'text-[#8892A4] hover:text-[#F1F3F9] border-[#1E2235]'
              }`}
              style={filterZone === z.id ? {
                background: `${z.color}20`,
                borderColor: `${z.color}50`,
                color: z.color,
              } : {}}
            >
              {z.icon} {z.name}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {filtered.length > 0 && <div className="timeline-line" />}
        <div className="space-y-3 pl-10">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[#4A5166]">
              <p className="text-4xl mb-3">🌱</p>
              <p className="text-sm">Sin eventos en esta zona aún.</p>
              <p className="text-xs mt-1">¡Pulsa el botón + para comenzar!</p>
            </div>
          ) : (
            filtered.map((act, i) => (
              <TimelineItem
                key={act.id}
                activity={act}
                isExpanded={expandedId === act.id}
                onToggle={() => setExpandedId(expandedId === act.id ? null : act.id)}
                onDelete={() => onDelete(act.id)}
                isLast={i === filtered.length - 1}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ── Timeline Item ───────────────────────────────────────────────────────────────
function TimelineItem({ activity: act, isExpanded, onToggle, onDelete }) {
  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(act.created_at), { addSuffix: true, locale: es })
    } catch { return '' }
  })()
  const dateStr = (() => {
    try { return format(new Date(act.created_at), 'dd MMM yyyy, HH:mm', { locale: es }) }
    catch { return '' }
  })()

  return (
    <div className={`zone-card ${ZONE_CLASS[act.zona_id]} glass rounded-2xl p-4 animate-slide-up`}
         style={{ '--zone-color': act.zona_color }}>
      {/* Dot on timeline */}
      <div
        className="absolute -left-[2.05rem] top-5 w-4 h-4 rounded-full border-2 border-[#0A0B0F]"
        style={{ backgroundColor: act.zona_color, boxShadow: `0 0 10px ${act.zona_color}` }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Zone Icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
            style={{ background: `${act.zona_color}15`, border: `1px solid ${act.zona_color}30` }}
          >
            {act.zona_icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#F1F3F9] leading-snug">{act.descripcion}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              <span className="zone-pill text-[10px]"
                    style={{ background: `${act.zona_color}15`, color: act.zona_color }}>
                {act.zona_name}
              </span>
              {act.sentimiento_emoji && (
                <span className="text-[10px] text-[#8892A4]">
                  {act.sentimiento_emoji} {act.sentimiento_label}
                </span>
              )}
              <span className="text-[10px] text-[#4A5166]">{timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#4A5166] hover:text-[#F1F3F9] hover:bg-[#1A1D29] transition-all"
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#4A5166] hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#1E2235] space-y-2 animate-fade-in">
          <p className="text-[10px] text-[#4A5166] font-medium">{dateStr}</p>
          {act.resistencia && (
            <div>
              <p className="text-[10px] text-[#8892A4] mb-1">Nivel de Resistencia</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[#1E2235] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#EF4444]" style={{ width: `${act.resistencia * 10}%` }} />
                </div>
                <span className="text-xs font-bold text-[#EF4444]">{act.resistencia}/10</span>
              </div>
            </div>
          )}
          {act.habilidad && (
            <p className="text-xs text-[#F59E0B]">📚 Habilidad: <span className="text-[#F1F3F9]">{act.habilidad}</span></p>
          )}
          {act.meta_cumplida && (
            <p className="text-xs text-[#10B981]">🎯 Meta: <span className="text-[#F1F3F9]">{act.meta_cumplida}</span></p>
          )}
          {act.notas && (
            <p className="text-xs text-[#8892A4] italic">"{act.notas}"</p>
          )}
        </div>
      )}
    </div>
  )
}
