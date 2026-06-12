import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { TrendingUp, Zap, Clock, Star } from 'lucide-react'
import InsightBanner from './InsightBanner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const ZONE_COLORS = ['#6366F1', '#EF4444', '#F59E0B', '#10B981']
const ZONE_CLASS  = ['zone-comfort', 'zone-fear', 'zone-learning', 'zone-growth']

export default function Dashboard({ stats, activities, insights, zones }) {
  // ── Radar Chart Data ─────────────────────────────────────────────────────────
  const maxCount  = Math.max(...stats.map(z => z.total || 0), 1)
  const normalized = stats.map(z => Math.round(((z.total || 0) / maxCount) * 10))

  const radarData = {
    labels: stats.map(z => `${z.icon} ${z.name}`),
    datasets: [{
      label: 'Nivel de Expansión',
      data: normalized,
      backgroundColor: 'rgba(16,185,129,0.1)',
      borderColor: '#10B981',
      borderWidth: 2,
      pointBackgroundColor: stats.map(z => z.color),
      pointBorderColor: '#fff',
      pointRadius: 5,
      pointHoverRadius: 8,
    }],
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          display: false,
          stepSize: 2,
        },
        grid: {
          color: 'rgba(255,255,255,0.06)',
          circular: true,
        },
        angleLines: { color: 'rgba(255,255,255,0.06)' },
        pointLabels: {
          color: '#8892A4',
          font: { size: 12, family: 'Inter', weight: '500' },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#161924',
        borderColor: '#1E2235',
        borderWidth: 1,
        titleColor: '#F1F3F9',
        bodyColor: '#8892A4',
        callbacks: {
          label: (ctx) => ` Nivel: ${ctx.raw}/10`,
        },
      },
    },
    animation: { duration: 800, easing: 'easeInOutQuart' },
  }

  // ── Urgent Insight ───────────────────────────────────────────────────────────
  const urgentInsight = insights?.find(i => i.days_since >= 3 && i.id !== 4) || null

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-[#F1F3F9]">
          Panel de Equilibrio
        </h1>
        <p className="text-sm text-[#8892A4] mt-1">
          Tu mapa de crecimiento personal en tiempo real
        </p>
      </div>

      {/* Insight Banner */}
      {urgentInsight && <InsightBanner insight={urgentInsight} />}

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Radar Chart */}
        <div className="col-span-2 glass rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#F1F3F9] flex items-center gap-2">
              <Star size={14} className="text-[#10B981]" />
              Radar de Expansión
            </h2>
            <span className="text-[10px] text-[#4A5166] font-medium uppercase tracking-wider">Normalizado /10</span>
          </div>
          <div className="radar-container" style={{ height: '280px' }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* Zone Cards Column */}
        <div className="space-y-3">
          {stats.map((zone, i) => (
            <ZoneCard key={zone.id} zone={zone} zoneClass={ZONE_CLASS[i]} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass rounded-2xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#F1F3F9] flex items-center gap-2">
            <Clock size={14} className="text-[#6366F1]" />
            Actividad Reciente
          </h2>
          <span className="text-[10px] text-[#4A5166]">Últimos 5 eventos</span>
        </div>
        <div className="space-y-2">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-[#4A5166] text-sm">
              <Zap size={24} className="mx-auto mb-2 opacity-50" />
              <p>Aún no hay eventos. ¡Pulsa + para añadir tu primer desafío!</p>
            </div>
          ) : (
            activities.map(act => (
              <RecentActivityRow key={act.id} activity={act} />
            ))
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((zone, i) => (
          <StatCard key={zone.id} zone={zone} color={ZONE_COLORS[i]} />
        ))}
      </div>
    </div>
  )
}

// ── Zone Card (sidebar) ─────────────────────────────────────────────────────────
function ZoneCard({ zone, zoneClass }) {
  return (
    <div
      className={`zone-card ${zoneClass} glass rounded-xl p-3 cursor-default`}
      style={{ '--zone-color': zone.color }}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-lg">{zone.icon}</span>
          <p className="text-xs font-semibold text-[#F1F3F9] mt-1">{zone.name}</p>
          <p className="text-[10px] text-[#8892A4]">{zone.total || 0} eventos</p>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: `${zone.color}20`, color: zone.color }}
        >
          {zone.total || 0}
        </div>
      </div>
      {zone.avg_resistencia && (
        <div className="mt-2">
          <div className="h-1 bg-[#1E2235] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(zone.avg_resistencia / 10) * 100}%`, backgroundColor: zone.color }}
            />
          </div>
          <p className="text-[9px] text-[#4A5166] mt-1">Resistencia avg: {zone.avg_resistencia?.toFixed(1)}/10</p>
        </div>
      )}
    </div>
  )
}

// ── Recent Activity Row ─────────────────────────────────────────────────────────
function RecentActivityRow({ activity }) {
  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: es })
    } catch { return 'Hace poco' }
  })()

  return (
    <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#1A1D29] transition-colors group">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
        style={{ background: `${activity.zona_color}15`, border: `1px solid ${activity.zona_color}30` }}
      >
        {activity.zona_icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#F1F3F9] truncate">{activity.descripcion}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-semibold" style={{ color: activity.zona_color }}>
            {activity.zona_name}
          </span>
          {activity.sentimiento_emoji && (
            <span className="text-[10px]">{activity.sentimiento_emoji} {activity.sentimiento_label}</span>
          )}
          <span className="text-[10px] text-[#4A5166] ml-auto">{timeAgo}</span>
        </div>
      </div>
    </div>
  )
}

// ── Stat Card ───────────────────────────────────────────────────────────────────
function StatCard({ zone, color }) {
  return (
    <div className="glass rounded-xl p-3 border border-[#1E2235] hover:border-opacity-50 transition-all"
         style={{ '--zone-color': color }}>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp size={12} style={{ color }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
          {zone.name}
        </span>
      </div>
      <p className="text-2xl font-bold text-[#F1F3F9] font-display">{zone.total || 0}</p>
      <p className="text-[10px] text-[#4A5166] mt-0.5">expansiones totales</p>
    </div>
  )
}
