import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Timeline from './components/Timeline'
import ActivityModal from './components/ActivityModal'
import InsightsPanel from './components/InsightsPanel'
import MissionsPanel from './components/Missions'
import Habits, { getDailyPeriodKey, getWeeklyPeriodKey } from './components/Habits'
import Projects from './components/Projects'
import BackupModal from './components/BackupModal'
import FAB from './components/FAB'
import { ACHIEVEMENTS_DEF, getLevelInfo } from './constants'

const api = window.equilibrium ?? null

// ── Streak System ─────────────────────────────────────────────────────────────
export function calculateStreak(missions) {
  const completed = missions.filter(m => m.completada && m.completada_at)
  if (!completed.length) return 0

  const dayKey = (dateStr) => {
    const d = new Date(dateStr)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  }

  const uniqueDays = [...new Set(completed.map(m => dayKey(m.completada_at)))]
    .sort((a, b) => b - a)

  const todayStart    = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime() })()
  const yesterdayStart = todayStart - 86400000

  if (uniqueDays[0] !== todayStart && uniqueDays[0] !== yesterdayStart) return 0

  let streak = 1
  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i - 1] - uniqueDays[i] === 86400000) streak++
    else break
  }
  return streak
}

export function getStreakMultiplier(streak) {
  if (streak >= 14) return 3
  if (streak >= 7)  return 2
  if (streak >= 3)  return 1.5
  return 1
}

// ── Achievements Logic ────────────────────────────────────────────────────────
function checkAchievements({ missions, streak, levelNum, unlockedIds, lastCompleted }) {
  const completed         = missions.filter(m => m.completada)
  const totalCompleted    = completed.length
  const principalDone     = completed.filter(m => m.mision_tipo === 'principal').length
  const today             = new Date().toDateString()
  const completedToday    = completed.filter(m => m.completada_at && new Date(m.completada_at).toDateString() === today).length
  const zonesDone         = new Set(completed.map(m => m.zona_id))
  const allZones          = [1,2,3,4].every(z => zonesDone.has(z))
  const hadValidDeadline  = lastCompleted?.deadline &&
    new Date(lastCompleted.deadline + 'T23:59:59') >= new Date()

  const conditions = {
    first_mission:   totalCompleted >= 1,
    ten_missions:    totalCompleted >= 10,
    twenty_five:     totalCompleted >= 25,
    first_principal: principalDone  >= 1,
    streak_3:        streak >= 3,
    streak_7:        streak >= 7,
    streak_14:       streak >= 14,
    all_zones:       allZones,
    level_5:         levelNum >= 5,
    level_8:         levelNum >= 8,
    before_deadline: Boolean(hadValidDeadline),
    triple_day:      completedToday >= 3,
  }

  const unlocked = new Set(unlockedIds)
  return Object.entries(conditions)
    .filter(([id, met]) => met && !unlocked.has(id))
    .map(([id]) => id)
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]                   = useState('dashboard')
  const [activities, setActivities]       = useState([])
  const [missions, setMissions]           = useState([])
  const [stats, setStats]                 = useState([])
  const [insights, setInsights]           = useState([])
  const [zones, setZones]                 = useState([])
  const [sentiments, setSentiments]       = useState([])
  const [xpData, setXpData]               = useState({ xp_principal:0, xp_secundaria:0, pendientes_principal:0, pendientes_secundaria:0, total_completadas:0 })
  const [unlockedAchievements, setUnlocked] = useState([]) // array of ids
  
  // Habits & Projects state
  const [habits, setHabits]               = useState([])
  const [habitLogs, setHabitLogs]         = useState([])
  const [projects, setProjects]           = useState([])

  const [modalOpen, setModalOpen]         = useState(false)
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false)
  const [loading, setLoading]             = useState(true)

  const totalXP        = (xpData.xp_principal || 0) + (xpData.xp_secundaria || 0)
  const levelInfo      = getLevelInfo(totalXP)
  const streak         = calculateStreak(missions)
  const streakMultiplier = getStreakMultiplier(streak)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      if (api) {
        const [acts, st, ins, zns, sents, miss, xp, achs, habitsRes, projectsRes] = await Promise.all([
          api.activities.getAll().catch(e => { console.error(e); return [] }),
          api.activities.getStats().catch(e => { console.error(e); return [] }),
          api.activities.getInsights().catch(e => { console.error(e); return [] }),
          api.zones.getAll().catch(e => { console.error(e); return DEMO_ZONES }),
          api.sentiments.getAll().catch(e => { console.error(e); return DEMO_SENTIMENTS }),
          api.activities.getMissions().catch(e => { console.error(e); return [] }),
          api.activities.getXP().catch(e => { console.error(e); return DEMO_XP }),
          api.achievements.getAll().catch(e => { console.error(e); return [] }),
          api.habits ? api.habits.getAll().catch(e => ({ habits: [], logs: [] })) : Promise.resolve({ habits: DEMO_HABITS, logs: DEMO_HABIT_LOGS }),
          api.projects ? api.projects.getAll().catch(e => []) : Promise.resolve(DEMO_PROJECTS),
        ])
        setActivities(acts || []); setStats(st || []); setInsights(ins || [])
        setZones(zns || DEMO_ZONES); setSentiments(sents || DEMO_SENTIMENTS)
        setMissions(miss || []); setXpData(xp || DEMO_XP)
        setUnlocked((achs || []).map(a => a.id))
        setHabits(habitsRes?.habits || []); setHabitLogs(habitsRes?.logs || [])
        setProjects(projectsRes || [])
      } else {
        setZones(DEMO_ZONES);         setSentiments(DEMO_SENTIMENTS)
        setActivities(DEMO_ACTIVITIES); setStats(DEMO_STATS)
        setInsights(DEMO_INSIGHTS);   setMissions(DEMO_MISSIONS)
        setXpData(DEMO_XP);           setUnlocked(DEMO_ACHIEVEMENTS)
        setHabits(DEMO_HABITS);       setHabitLogs(DEMO_HABIT_LOGS)
        setProjects(DEMO_PROJECTS)
      }
    } catch (err) {
      console.error('[App] loadAll error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Activity Handlers ─────────────────────────────────────────────────────
  async function handleCreateActivity(data) {
    try {
      if (api) {
        const newAct = await api.activities.create(data)
        setActivities(prev => [newAct, ...prev])
        if (data.mision_tipo) setMissions(prev => [newAct, ...prev])
        const [st, ins, xp] = await Promise.all([
          api.activities.getStats(), api.activities.getInsights(), api.activities.getXP()
        ])
        setStats(st); setInsights(ins); setXpData(xp)
      } else {
        const zone = DEMO_ZONES.find(z => z.id === data.zona_id)
        const sent = DEMO_SENTIMENTS.find(s => s.id === data.sentimiento_id)
        const newAct = {
          id: Date.now(), ...data,
          zona_name: zone?.name, zona_color: zone?.color, zona_icon: zone?.icon,
          sentimiento_label: sent?.label, sentimiento_emoji: sent?.emoji,
          completada: 0, completada_at: null,
          created_at: new Date().toISOString(), timestamp: Math.floor(Date.now()/1000),
        }
        setActivities(prev => [newAct, ...prev])
        if (data.mision_tipo) setMissions(prev => [newAct, ...prev])
      }
    } catch (err) { console.error('[App] create error:', err) }
  }

  async function handleDeleteActivity(id) {
    try {
      if (api) await api.activities.delete(id)
      setActivities(prev => prev.filter(a => a.id !== id))
      setMissions(prev => prev.filter(a => a.id !== id))
    } catch (err) { console.error('[App] delete error:', err) }
  }

  async function handleCompleteActivity(id) {
    try {
      const completedMission = missions.find(m => m.id === id)
      const multiplier = streakMultiplier
      const baseXP     = completedMission?.mision_tipo === 'principal' ? 1000 : 100
      const earnedXP   = Math.round(baseXP * multiplier)

      if (api) {
        await api.activities.complete(id, multiplier)
        const xp = await api.activities.getXP()
        setXpData(xp)
      } else {
        setXpData(prev => ({
          ...prev,
          xp_principal:  completedMission?.mision_tipo === 'principal' ? prev.xp_principal + earnedXP : prev.xp_principal,
          xp_secundaria: completedMission?.mision_tipo === 'secundaria' ? prev.xp_secundaria + earnedXP : prev.xp_secundaria,
          total_completadas: prev.total_completadas + 1,
          pendientes_principal:  completedMission?.mision_tipo === 'principal'  ? prev.pendientes_principal  - 1 : prev.pendientes_principal,
          pendientes_secundaria: completedMission?.mision_tipo === 'secundaria' ? prev.pendientes_secundaria - 1 : prev.pendientes_secundaria,
        }))
      }

      const updatedMissions = missions.map(m =>
        m.id === id ? { ...m, completada: 1, completada_at: new Date().toISOString(), streak_multiplier: multiplier } : m
      )
      setMissions(updatedMissions)
      setActivities(prev => prev.map(a => a.id === id ? { ...a, completada: 1, completada_at: new Date().toISOString() } : a))

      const newTotalXP   = totalXP + earnedXP
      const newLevelInfo = getLevelInfo(newTotalXP)
      const leveledUp    = newLevelInfo.current.level > levelInfo.current.level

      const multiplierLabel = multiplier > 1 ? ` (x${multiplier} 🔥 racha)` : ''
      toast.success(`+${earnedXP} XP ganados${multiplierLabel}`, {
        icon: completedMission?.mision_tipo === 'principal' ? '🏆' : '⚡',
        duration: 4000,
      })

      if (leveledUp) {
        setTimeout(() => {
          toast(`⬆️ ¡Subiste a ${newLevelInfo.current.icon} ${newLevelInfo.current.name}!`, {
            duration: 6000,
            style: { background: `${newLevelInfo.current.color}20`, color: '#F1F3F9', border: `1px solid ${newLevelInfo.current.color}50` }
          })
        }, 800)
      }

      const newStreak = calculateStreak(updatedMissions)
      const newlyUnlocked = checkAchievements({
        missions: updatedMissions,
        streak:   newStreak,
        levelNum: newLevelInfo.current.level,
        unlockedIds: unlockedAchievements,
        lastCompleted: completedMission,
      })

      if (newlyUnlocked.length > 0) {
        for (const achId of newlyUnlocked) {
          if (api) await api.achievements.unlock(achId)
        }
        setUnlocked(prev => [...prev, ...newlyUnlocked])
        for (const achId of newlyUnlocked) {
          const def = ACHIEVEMENTS_DEF.find(a => a.id === achId)
          setTimeout(() => {
            toast(`🏅 ¡Logro desbloqueado! ${def.icon} ${def.name}`, {
              duration: 6000,
              style: { background: `${def.color}20`, color: '#F1F3F9', border: `1px solid ${def.color}50` }
            })
          }, 1200)
        }
      }
    } catch (err) { console.error('[App] complete error:', err) }
  }

  // ── Habits Handlers ───────────────────────────────────────────────────────
  async function handleCreateHabit(data) {
    try {
      if (api && api.habits) {
        const newHabit = await api.habits.create(data)
        setHabits(prev => [newHabit, ...prev])
      } else {
        const zone = zones.find(z => z.id === data.zona_id)
        const newHabit = {
          id: Date.now(),
          ...data,
          zona_name: zone?.name,
          zona_color: zone?.color,
          zona_icon: zone?.icon,
          created_at: new Date().toISOString(),
        }
        setHabits(prev => [newHabit, ...prev])
      }
      toast.success('¡Hábito creado con éxito!', { icon: '🔥' })
    } catch (err) { console.error('[App] create habit error:', err) }
  }

  async function handleDeleteHabit(id) {
    try {
      if (api && api.habits) {
        await api.habits.delete(id)
      }
      setHabits(prev => prev.filter(h => h.id !== id))
      setHabitLogs(prev => prev.filter(l => l.habit_id !== id))
      toast.success('Hábito eliminado', { icon: '🗑️' })
    } catch (err) { console.error('[App] delete habit error:', err) }
  }

  async function handleToggleHabitLog(habitId, periodKey) {
    try {
      if (api && api.habits) {
        const updatedLogs = await api.habits.toggleLog(habitId, periodKey)
        setHabitLogs(updatedLogs)
      } else {
        const existingIndex = habitLogs.findIndex(l => l.habit_id === habitId && l.period_key === periodKey)
        if (existingIndex >= 0) {
          setHabitLogs(prev => prev.filter((_, i) => i !== existingIndex))
        } else {
          setHabitLogs(prev => [...prev, { id: Date.now(), habit_id: habitId, period_key: periodKey, completed_at: new Date().toISOString() }])
        }
      }
    } catch (err) { console.error('[App] toggle habit log error:', err) }
  }

  // ── Projects Handlers ─────────────────────────────────────────────────────
  async function handleCreateProject(data) {
    try {
      if (api && api.projects) {
        const newProj = await api.projects.create(data)
        setProjects(prev => [newProj, ...prev])
      } else {
        const zone = zones.find(z => z.id === data.zona_id)
        const newId = Date.now()
        const initialSubtasks = (data.initialSubtasks || []).map((t, idx) => ({
          id: newId + idx + 1,
          project_id: newId,
          title: t,
          completed: 0,
        }))
        const newProj = {
          id: newId,
          title: data.title,
          description: data.description,
          zona_id: data.zona_id,
          zona_name: zone?.name,
          zona_color: zone?.color,
          zona_icon: zone?.icon,
          status: 'activo',
          created_at: new Date().toISOString(),
          subtasks: initialSubtasks,
        }
        setProjects(prev => [newProj, ...prev])
      }
      toast.success('¡Proyecto creado con éxito!', { icon: '🚀' })
    } catch (err) { console.error('[App] create project error:', err) }
  }

  async function handleDeleteProject(id) {
    try {
      if (api && api.projects) await api.projects.delete(id)
      setProjects(prev => prev.filter(p => p.id !== id))
      toast.success('Proyecto eliminado')
    } catch (err) { console.error('[App] delete project error:', err) }
  }

  async function handleCompleteProject(id) {
    try {
      if (api && api.projects) await api.projects.complete(id)
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'completado', completed_at: new Date().toISOString() } : p))
      toast.success('🎉 ¡Felicidades! Proyecto completado con éxito', { duration: 5000, icon: '🏆' })
    } catch (err) { console.error('[App] complete project error:', err) }
  }

  async function handleReopenProject(id) {
    try {
      if (api && api.projects) await api.projects.reopen(id)
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'activo', completed_at: null } : p))
      toast.success('Proyecto reabierto', { icon: '🔄' })
    } catch (err) { console.error('[App] reopen project error:', err) }
  }

  async function handleAddSubtask(projectId, title) {
    try {
      if (api && api.projects) {
        const updatedSubtasks = await api.projects.addSubtask(projectId, title)
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, subtasks: updatedSubtasks } : p))
      } else {
        const newSubtask = { id: Date.now(), project_id: projectId, title, completed: 0 }
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, subtasks: [...(p.subtasks || []), newSubtask] } : p))
      }
    } catch (err) { console.error('[App] add subtask error:', err) }
  }

  async function handleToggleSubtask(subtaskId, completed, projectId) {
    try {
      if (api && api.projects) {
        const updatedSubtasks = await api.projects.toggleSubtask(subtaskId, completed, projectId)
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, subtasks: updatedSubtasks } : p))
      } else {
        setProjects(prev => prev.map(p => {
          if (p.id !== projectId) return p
          const updated = (p.subtasks || []).map(s => s.id === subtaskId ? { ...s, completed: completed ? 1 : 0 } : s)
          return { ...p, subtasks: updated }
        }))
      }
    } catch (err) { console.error('[App] toggle subtask error:', err) }
  }

  async function handleDeleteSubtask(subtaskId, projectId) {
    try {
      if (api && api.projects) {
        const updatedSubtasks = await api.projects.deleteSubtask(subtaskId, projectId)
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, subtasks: updatedSubtasks } : p))
      } else {
        setProjects(prev => prev.map(p => {
          if (p.id !== projectId) return p
          return { ...p, subtasks: (p.subtasks || []).filter(s => s.id !== subtaskId) }
        }))
      }
    } catch (err) { console.error('[App] delete subtask error:', err) }
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0B0F]">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          view={view} setView={setView} stats={stats}
          levelInfo={levelInfo} totalXP={totalXP} xpData={xpData}
          streak={streak} streakMultiplier={streakMultiplier}
          onOpenBackup={() => setIsBackupModalOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-grid bg-[#0A0B0F]">
          {loading ? <LoadingScreen /> :
           view === 'dashboard' ? <Dashboard stats={stats} activities={activities.slice(0,5)} insights={insights} zones={zones} /> :
           view === 'timeline'  ? <Timeline activities={activities} onDelete={handleDeleteActivity} zones={zones} /> :
           view === 'insights'  ? <InsightsPanel insights={insights} stats={stats} zones={zones} /> :
           view === 'misiones'  ? (
             <MissionsPanel
               missions={missions} zones={zones}
               levelInfo={levelInfo} totalXP={totalXP} xpData={xpData}
               streak={streak} streakMultiplier={streakMultiplier}
               unlockedAchievements={unlockedAchievements}
               onComplete={handleCompleteActivity} onDelete={handleDeleteActivity}
             />
           ) :
           view === 'habitos' ? (
             <Habits
               habits={habits}
               habitLogs={habitLogs}
               zones={zones}
               onCreateHabit={handleCreateHabit}
               onDeleteHabit={handleDeleteHabit}
               onToggleLog={handleToggleHabitLog}
             />
           ) :
           view === 'proyectos' ? (
             <Projects
               projects={projects}
               zones={zones}
               onCreateProject={handleCreateProject}
               onDeleteProject={handleDeleteProject}
               onCompleteProject={handleCompleteProject}
               onReopenProject={handleReopenProject}
               onAddSubtask={handleAddSubtask}
               onToggleSubtask={handleToggleSubtask}
               onDeleteSubtask={handleDeleteSubtask}
             />
           ) : null}
        </main>
      </div>
      <FAB onClick={() => setModalOpen(true)} />
      {modalOpen && (
        <ActivityModal
          zones={zones} sentiments={sentiments}
          onClose={() => setModalOpen(false)} onCreate={handleCreateActivity}
        />
      )}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onReloadData={loadAll}
        fullStateData={{ activities, achievements: unlockedAchievements, habits, habitLogs, projects }}
      />
      <Toaster position="bottom-left" toastOptions={{ style: { background: '#161924', color: '#F1F3F9', border: '1px solid #1E2235', borderRadius: '0.75rem' } }} />
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[#10B981] border-t-transparent animate-spin" />
        <p className="text-[#8892A4] text-sm font-medium">Inicializando Equilibrium...</p>
      </div>
    </div>
  )
}

// ── Demo Data ──────────────────────────────────────────────────────────────────
const DEMO_ZONES = [
  { id:1, name:'Confort',     color:'#6366F1', icon:'🏠', description:'Lo familiar y seguro.' },
  { id:2, name:'Miedo',       color:'#EF4444', icon:'⚡', description:'El umbral del riesgo.' },
  { id:3, name:'Aprendizaje', color:'#F59E0B', icon:'📚', description:'Adquisición de habilidades.' },
  { id:4, name:'Crecimiento', color:'#10B981', icon:'🚀', description:'Metas cumplidas.' },
]
const DEMO_SENTIMENTS = [
  { id:1, label:'Energizado', emoji:'⚡' }, { id:2, label:'Ansioso', emoji:'😰' },
  { id:3, label:'Orgulloso',  emoji:'😤' }, { id:4, label:'Satisfecho', emoji:'😊' },
]
const now = Math.floor(Date.now()/1000)
const DEMO_ACTIVITIES = [
  { id:1, zona_id:4, zona_name:'Crecimiento', zona_color:'#10B981', zona_icon:'🚀', descripcion:'Crear video de animación de Luhmann', mision_tipo:'principal', completada:0, deadline: new Date(Date.now()+86400000*2).toISOString().split('T')[0], sentimiento_label:'Imparable', sentimiento_emoji:'🔥', created_at:new Date(Date.now()-3600000).toISOString(), timestamp:now-3600 },
  { id:2, zona_id:2, zona_name:'Miedo', zona_color:'#EF4444', zona_icon:'⚡', descripcion:'Hablar en público ante 50 personas', mision_tipo:'principal', completada:1, completada_at:new Date(Date.now()-86400000).toISOString(), streak_multiplier:1.5, sentimiento_label:'Ansioso', sentimiento_emoji:'😰', created_at:new Date(Date.now()-86400000*2).toISOString(), timestamp:now-86400*2 },
  { id:3, zona_id:3, zona_name:'Aprendizaje', zona_color:'#F59E0B', zona_icon:'📚', descripcion:'Completar curso de Electron.js', mision_tipo:'secundaria', completada:1, completada_at:new Date(Date.now()-86400000).toISOString(), streak_multiplier:1.5, sentimiento_label:'Curioso', sentimiento_emoji:'🔍', created_at:new Date(Date.now()-86400000*3).toISOString(), timestamp:now-86400*3 },
  { id:4, zona_id:1, zona_name:'Confort', zona_color:'#6366F1', zona_icon:'🏠', descripcion:'Revisar fotos y reflexionar', mision_tipo:null, completada:0, created_at:new Date(Date.now()-259200000).toISOString(), timestamp:now-259200 },
  { id:5, zona_id:3, zona_name:'Aprendizaje', zona_color:'#F59E0B', zona_icon:'📚', descripcion:'Aprender técnicas de motion graphics', mision_tipo:'secundaria', completada:0, deadline: new Date(Date.now()).toISOString().split('T')[0], sentimiento_label:'Energizado', sentimiento_emoji:'⚡', created_at:new Date(Date.now()-345600000).toISOString(), timestamp:now-345600 },
]
const DEMO_MISSIONS    = DEMO_ACTIVITIES.filter(a => a.mision_tipo !== null)
const DEMO_STATS = [
  { id:1, name:'Confort',     color:'#6366F1', icon:'🏠', total:1, avg_resistencia:null, last_activity:now-259200 },
  { id:2, name:'Miedo',       color:'#EF4444', icon:'⚡', total:1, avg_resistencia:7.5,  last_activity:now-86400*2 },
  { id:3, name:'Aprendizaje', color:'#F59E0B', icon:'📚', total:2, avg_resistencia:null, last_activity:now-86400*3 },
  { id:4, name:'Crecimiento', color:'#10B981', icon:'🚀', total:1, avg_resistencia:null, last_activity:now-3600 },
]
const DEMO_INSIGHTS = [
  { id:1, name:'Confort',     color:'#6366F1', icon:'🏠', total_activities:1, days_since:3 },
  { id:2, name:'Miedo',       color:'#EF4444', icon:'⚡', total_activities:1, days_since:2 },
  { id:3, name:'Aprendizaje', color:'#F59E0B', icon:'📚', total_activities:2, days_since:3 },
  { id:4, name:'Crecimiento', color:'#10B981', icon:'🚀', total_activities:1, days_since:0 },
]
const DEMO_XP = { xp_principal:1500, xp_secundaria:150, pendientes_principal:1, pendientes_secundaria:1, total_completadas:2 }
const DEMO_ACHIEVEMENTS = ['first_mission', 'first_principal', 'streak_3']

const DEMO_HABITS = [
  { id: 1, title: 'Meditación Matutina (15m)', description: 'Calmar la mente antes de comenzar el día', frequency: 'diario', zona_id: 1, zona_name: 'Confort', zona_color: '#6366F1', zona_icon: '🏠' },
  { id: 2, title: 'Lectura de Desarrollo (30m)', description: 'Leer páginas de libro técnico o crecimiento', frequency: 'diario', zona_id: 3, zona_name: 'Aprendizaje', zona_color: '#F59E0B', zona_icon: '📚' },
  { id: 3, title: 'Revisión Semanal de Metas', description: 'Evaluar avances de la semana', frequency: 'semanal', zona_id: 4, zona_name: 'Crecimiento', zona_color: '#10B981', zona_icon: '🚀' },
  { id: 4, title: 'Planificación Mensual', description: 'Definir prioridades para el próximo mes', frequency: 'mensual', zona_id: 4, zona_name: 'Crecimiento', zona_color: '#10B981', zona_icon: '🚀' },
]

const DEMO_HABIT_LOGS = [
  { id: 101, habit_id: 1, period_key: getDailyPeriodKey(), completed_at: new Date().toISOString() },
  { id: 102, habit_id: 3, period_key: getWeeklyPeriodKey(), completed_at: new Date().toISOString() },
]

const DEMO_PROJECTS = [
  {
    id: 1,
    title: 'Rediseño de Sistema GOZ',
    description: 'Actualización visual con estética neón dark e interacciones fluidas',
    zona_id: 4,
    zona_name: 'Crecimiento',
    zona_color: '#10B981',
    zona_icon: '🚀',
    status: 'activo',
    created_at: new Date().toISOString(),
    subtasks: [
      { id: 10, project_id: 1, title: 'Diseñar arquitectura de vistas', completed: 1 },
      { id: 11, project_id: 1, title: 'Implementar sección de Hábitos', completed: 1 },
      { id: 12, project_id: 1, title: 'Implementar sección de Proyectos con Ranking', completed: 1 },
      { id: 13, project_id: 1, title: 'Pruebas e integración final', completed: 0 },
    ]
  },
  {
    id: 2,
    title: 'Creación de Contenido YouTube',
    description: 'Serie de videos sobre optimización de hábitos y disciplina',
    zona_id: 2,
    zona_name: 'Miedo',
    zona_color: '#EF4444',
    zona_icon: '⚡',
    status: 'activo',
    created_at: new Date().toISOString(),
    subtasks: [
      { id: 20, project_id: 2, title: 'Escribir guion del episodio 1', completed: 1 },
      { id: 21, project_id: 2, title: 'Grabar tomas de apoyo B-roll', completed: 0 },
    ]
  },
  {
    id: 3,
    title: 'Configuración Inicial del Servidor',
    description: 'Despliegue y seguridad básica de infraestructura',
    zona_id: 3,
    zona_name: 'Aprendizaje',
    zona_color: '#F59E0B',
    zona_icon: '📚',
    status: 'completado',
    completed_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    subtasks: [
      { id: 30, project_id: 3, title: 'Instalar Docker y dependencias', completed: 1 },
      { id: 31, project_id: 3, title: 'Configurar certificados SSL', completed: 1 },
    ]
  }
]
