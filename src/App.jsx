import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Timeline from './components/Timeline'
import ActivityModal from './components/ActivityModal'
import InsightsPanel from './components/InsightsPanel'
import FAB from './components/FAB'

// Determine if we're in Electron or browser preview
const api = window.equilibrium ?? null

export default function App() {
  const [view, setView]           = useState('dashboard')
  const [activities, setActivities] = useState([])
  const [stats, setStats]         = useState([])
  const [insights, setInsights]   = useState([])
  const [zones, setZones]         = useState([])
  const [sentiments, setSentiments] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading]     = useState(true)

  // ── Load initial data ──────────────────────────────────────────────────────
  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      if (api) {
        const [acts, st, ins, zns, sents] = await Promise.all([
          api.activities.getAll(),
          api.activities.getStats(),
          api.activities.getInsights(),
          api.zones.getAll(),
          api.sentiments.getAll(),
        ])
        setActivities(acts)
        setStats(st)
        setInsights(ins)
        setZones(zns)
        setSentiments(sents)
      } else {
        // Demo data for browser preview
        setZones(DEMO_ZONES)
        setSentiments(DEMO_SENTIMENTS)
        setActivities(DEMO_ACTIVITIES)
        setStats(DEMO_STATS)
        setInsights(DEMO_INSIGHTS)
      }
    } catch (err) {
      console.error('[App] Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateActivity(data) {
    try {
      if (api) {
        const newAct = await api.activities.create(data)
        setActivities(prev => [newAct, ...prev])
        const [st, ins] = await Promise.all([
          api.activities.getStats(),
          api.activities.getInsights(),
        ])
        setStats(st)
        setInsights(ins)
      } else {
        // Demo mode: fake create
        const zone = DEMO_ZONES.find(z => z.id === data.zona_id)
        const sent = DEMO_SENTIMENTS.find(s => s.id === data.sentimiento_id)
        const newAct = {
          id: Date.now(),
          ...data,
          zona_name: zone?.name,
          zona_color: zone?.color,
          zona_icon: zone?.icon,
          sentimiento_label: sent?.label,
          sentimiento_emoji: sent?.emoji,
          created_at: new Date().toISOString(),
          timestamp: Math.floor(Date.now() / 1000),
        }
        setActivities(prev => [newAct, ...prev])
      }
    } catch (err) {
      console.error('[App] Failed to create activity:', err)
    }
  }

  async function handleDeleteActivity(id) {
    try {
      if (api) await api.activities.delete(id)
      setActivities(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      console.error('[App] Failed to delete activity:', err)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0B0F]">
      {/* Custom Titlebar */}
      <TitleBar />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar view={view} setView={setView} stats={stats} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-grid bg-[#0A0B0F]">
          {loading ? (
            <LoadingScreen />
          ) : view === 'dashboard' ? (
            <Dashboard
              stats={stats}
              activities={activities.slice(0, 5)}
              insights={insights}
              zones={zones}
            />
          ) : view === 'timeline' ? (
            <Timeline
              activities={activities}
              onDelete={handleDeleteActivity}
              zones={zones}
            />
          ) : view === 'insights' ? (
            <InsightsPanel insights={insights} stats={stats} zones={zones} />
          ) : null}
        </main>
      </div>

      {/* Floating Action Button */}
      <FAB onClick={() => setModalOpen(true)} />

      {/* Activity Modal */}
      {modalOpen && (
        <ActivityModal
          zones={zones}
          sentiments={sentiments}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateActivity}
        />
      )}

      {/* Toast notifications */}
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: '#161924',
            color: '#F1F3F9',
            border: '1px solid #1E2235',
            borderRadius: '0.75rem',
          },
        }}
      />
    </div>
  )
}

// ── Loading Screen ─────────────────────────────────────────────────────────────
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

// ── Demo Data (for browser preview without Electron) ───────────────────────────
const DEMO_ZONES = [
  { id: 1, name: 'Confort',     color: '#6366F1', icon: '🏠', description: 'Lo familiar y seguro.' },
  { id: 2, name: 'Miedo',       color: '#EF4444', icon: '⚡', description: 'El umbral del riesgo.' },
  { id: 3, name: 'Aprendizaje', color: '#F59E0B', icon: '📚', description: 'Adquisición de habilidades.' },
  { id: 4, name: 'Crecimiento', color: '#10B981', icon: '🚀', description: 'Metas cumplidas.' },
]
const DEMO_SENTIMENTS = [
  { id: 1, label: 'Energizado', emoji: '⚡' },
  { id: 2, label: 'Ansioso',    emoji: '😰' },
  { id: 3, label: 'Orgulloso',  emoji: '😤' },
  { id: 4, label: 'Satisfecho', emoji: '😊' },
]
const DEMO_ACTIVITIES = [
  { id:1, zona_id:4, zona_name:'Crecimiento', zona_color:'#10B981', zona_icon:'🚀', descripcion:'Lancé mi primer proyecto de escritorio', sentimiento_label:'Imparable', sentimiento_emoji:'🔥', meta_cumplida:'App funcional en producción', created_at: new Date(Date.now()-3600000).toISOString(), timestamp: Math.floor(Date.now()/1000)-3600 },
  { id:2, zona_id:2, zona_name:'Miedo',       zona_color:'#EF4444', zona_icon:'⚡', descripcion:'Hablé en público ante 50 personas', sentimiento_label:'Ansioso', sentimiento_emoji:'😰', resistencia:8, created_at: new Date(Date.now()-86400000).toISOString(), timestamp: Math.floor(Date.now()/1000)-86400 },
  { id:3, zona_id:3, zona_name:'Aprendizaje', zona_color:'#F59E0B', zona_icon:'📚', descripcion:'Completé curso de Electron.js', sentimiento_label:'Curioso', sentimiento_emoji:'🔍', habilidad:'Electron + IPC', created_at: new Date(Date.now()-172800000).toISOString(), timestamp: Math.floor(Date.now()/1000)-172800 },
]
const DEMO_STATS = [
  { id:1, name:'Confort',     color:'#6366F1', icon:'🏠', total:5,  avg_resistencia:null, last_activity: Math.floor(Date.now()/1000)-259200 },
  { id:2, name:'Miedo',       color:'#EF4444', icon:'⚡', total:3,  avg_resistencia:7.5,  last_activity: Math.floor(Date.now()/1000)-86400 },
  { id:3, name:'Aprendizaje', color:'#F59E0B', icon:'📚', total:8,  avg_resistencia:null, last_activity: Math.floor(Date.now()/1000)-172800 },
  { id:4, name:'Crecimiento', color:'#10B981', icon:'🚀', total:4,  avg_resistencia:null, last_activity: Math.floor(Date.now()/1000)-3600 },
]
const DEMO_INSIGHTS = [
  { id:1, name:'Confort',     color:'#6366F1', icon:'🏠', total_activities:5, days_since:3  },
  { id:2, name:'Miedo',       color:'#EF4444', icon:'⚡', total_activities:3, days_since:1  },
  { id:3, name:'Aprendizaje', color:'#F59E0B', icon:'📚', total_activities:8, days_since:2  },
  { id:4, name:'Crecimiento', color:'#10B981', icon:'🚀', total_activities:4, days_since:0  },
]
