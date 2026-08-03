export const LEVELS = [
  { level: 1,  name: 'Novicio',       minXP: 0,     icon: '🌱', color: '#6B7280' },
  { level: 2,  name: 'Aprendiz',      minXP: 500,   icon: '🔰', color: '#10B981' },
  { level: 3,  name: 'Explorador',    minXP: 1500,  icon: '🧭', color: '#3B82F6' },
  { level: 4,  name: 'Guerrero',      minXP: 3000,  icon: '⚔️', color: '#8B5CF6' },
  { level: 5,  name: 'Veterano',      minXP: 6000,  icon: '🛡️', color: '#F59E0B' },
  { level: 6,  name: 'Cazador',       minXP: 10000, icon: '🏹', color: '#EF4444' },
  { level: 7,  name: 'Campeón',       minXP: 16000, icon: '🏆', color: '#F97316' },
  { level: 8,  name: 'Héroe',         minXP: 25000, icon: '🦅', color: '#EC4899' },
  { level: 9,  name: 'Legendario',    minXP: 40000, icon: '⭐', color: '#FBBF24' },
  { level: 10, name: 'Trascendente',  minXP: 60000, icon: '🌟', color: '#FFF'    },
]

export function getLevelInfo(totalXP) {
  let current = LEVELS[0], next = LEVELS[1]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].minXP) { current = LEVELS[i]; next = LEVELS[i + 1] || null; break }
  }
  const xpIntoLevel = totalXP - current.minXP
  const xpForNext   = next ? next.minXP - current.minXP : 1
  const progress    = next ? Math.min(xpIntoLevel / xpForNext, 1) : 1
  return { current, next, xpIntoLevel, xpForNext, progress, totalXP }
}

export const ACHIEVEMENTS_DEF = [
  { id: 'first_mission',   icon: '🌱', name: 'Primer Paso',         desc: 'Completa tu primera misión',              color: '#10B981' },
  { id: 'ten_missions',    icon: '⚔️', name: 'Cazador',             desc: '10 misiones completadas',                 color: '#8B5CF6' },
  { id: 'twenty_five',     icon: '🏹', name: 'Veterano',            desc: '25 misiones completadas',                 color: '#F59E0B' },
  { id: 'first_principal', icon: '🏆', name: 'El Elegido',          desc: 'Primera misión principal completada',     color: '#F59E0B' },
  { id: 'streak_3',        icon: '🔥', name: 'En Racha',            desc: 'Racha de 3 días consecutivos',            color: '#EF4444' },
  { id: 'streak_7',        icon: '⚡', name: 'Imparable',           desc: 'Racha de 7 días consecutivos',            color: '#F97316' },
  { id: 'streak_14',       icon: '☄️', name: 'Fuerza de Voluntad',  desc: 'Racha de 14 días consecutivos',           color: '#EC4899' },
  { id: 'all_zones',       icon: '🚀', name: 'Explorador Total',    desc: 'Misión completada en cada zona',          color: '#3B82F6' },
  { id: 'level_5',         icon: '🛡️', name: 'Ascendido',           desc: 'Alcanza el Nivel 5 (Veterano)',           color: '#F59E0B' },
  { id: 'level_8',         icon: '🦅', name: 'Casi Leyenda',        desc: 'Alcanza el Nivel 8 (Héroe)',              color: '#EC4899' },
  { id: 'before_deadline', icon: '🎯', name: 'Comprometido',        desc: 'Completa una misión antes de su fecha',   color: '#10B981' },
  { id: 'triple_day',      icon: '💥', name: 'Día Épico',           desc: '3 misiones completadas en un mismo día',  color: '#F97316' },
]
