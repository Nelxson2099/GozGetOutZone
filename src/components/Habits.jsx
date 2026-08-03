import { useState } from 'react'
import { Flame, CalendarRange, CalendarDays, Plus, Check, Trash2, Repeat, Sparkles, X } from 'lucide-react'

// Helper for Monday-Sunday week key
export function getWeeklyPeriodKey(d = new Date()) {
  const dateObj = new Date(d)
  const day = dateObj.getDay() // 0 = Sun, 1 = Mon...
  const diffToMon = day === 0 ? -6 : 1 - day
  const monday = new Date(dateObj)
  monday.setDate(dateObj.getDate() + diffToMon)
  const year = monday.getFullYear()
  const month = String(monday.getMonth() + 1).padStart(2, '0')
  const date = String(monday.getDate()).padStart(2, '0')
  return `W_${year}-${month}-${date}`
}

export function getWeeklyRangeLabel(d = new Date()) {
  const dateObj = new Date(d)
  const day = dateObj.getDay()
  const diffToMon = day === 0 ? -6 : 1 - day
  const monday = new Date(dateObj)
  monday.setDate(dateObj.getDate() + diffToMon)
  
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `Lun ${monday.getDate()} ${months[monday.getMonth()]} — Dom ${sunday.getDate()} ${months[sunday.getMonth()]}`
}

export function getDailyPeriodKey(d = new Date()) {
  const dateObj = new Date(d)
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const date = String(dateObj.getDate()).padStart(2, '0')
  return `D_${year}-${month}-${date}`
}

export function getMonthlyPeriodKey(d = new Date()) {
  const dateObj = new Date(d)
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  return `M_${year}-${month}`
}

export function getMonthlyLabel(d = new Date()) {
  const monthsLong = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const dateObj = new Date(d)
  return `${monthsLong[dateObj.getMonth()]} ${dateObj.getFullYear()}`
}

export default function Habits({ habits = [], habitLogs = [], zones = [], onCreateHabit, onDeleteHabit, onToggleLog }) {
  const [activeTab, setActiveTab] = useState('diario') // 'diario' | 'semanal' | 'mensual'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newFrequency, setNewFrequency] = useState('diario')
  const [newZoneId, setNewZoneId] = useState(zones[0]?.id || 4)

  // Current period keys
  const dailyKey = getDailyPeriodKey()
  const weeklyKey = getWeeklyPeriodKey()
  const monthlyKey = getMonthlyPeriodKey()

  const currentPeriodKey = activeTab === 'diario' ? dailyKey : activeTab === 'semanal' ? weeklyKey : monthlyKey

  // Filter habits by frequency
  const filteredHabits = habits.filter(h => h.frequency === activeTab)

  // Calculate completions for current tab & period
  const completedCount = filteredHabits.filter(h =>
    habitLogs.some(l => l.habit_id === h.id && l.period_key === currentPeriodKey)
  ).length

  const progressPercent = filteredHabits.length > 0 ? Math.round((completedCount / filteredHabits.length) * 100) : 0

  function handleFormSubmit(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    onCreateHabit({
      title: newTitle.trim(),
      description: newDescription.trim(),
      frequency: newFrequency,
      zona_id: Number(newZoneId),
    })
    setNewTitle('')
    setNewDescription('')
    setIsModalOpen(false)
  }

  function openCreateModal(freq = activeTab) {
    setNewFrequency(freq)
    setIsModalOpen(true)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#6366F1]/20 border border-[#10B981]/30">
              <Repeat className="text-[#10B981]" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F1F3F9] font-display">Hábitos</h1>
              <p className="text-xs text-[#8892A4]">
                Cultiva consistencia y conquista tus rutinas diarias, semanales y mensuales
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => openCreateModal(activeTab)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-medium text-sm shadow-lg shadow-[#10B981]/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span>Nuevo Hábito</span>
        </button>
      </div>

      {/* Tabs bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2 bg-[#12141D] rounded-2xl border border-[#1E2235]">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1">
          <button
            onClick={() => setActiveTab('diario')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'diario'
                ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/20'
                : 'text-[#8892A4] hover:text-[#F1F3F9] hover:bg-[#1A1D29]'
            }`}
          >
            <Flame size={16} />
            <span>Diarios</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/20">
              {habits.filter(h => h.frequency === 'diario').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('semanal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'semanal'
                ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/20'
                : 'text-[#8892A4] hover:text-[#F1F3F9] hover:bg-[#1A1D29]'
            }`}
          >
            <CalendarRange size={16} />
            <span>Semanales (Lun-Dom)</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/20">
              {habits.filter(h => h.frequency === 'semanal').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mensual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'mensual'
                ? 'bg-[#F59E0B] text-white shadow-md shadow-[#F59E0B]/20'
                : 'text-[#8892A4] hover:text-[#F1F3F9] hover:bg-[#1A1D29]'
            }`}
          >
            <CalendarDays size={16} />
            <span>Mensuales</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/20">
              {habits.filter(h => h.frequency === 'mensual').length}
            </span>
          </button>
        </div>

        {/* Current Period Badge */}
        <div className="px-3 py-1.5 rounded-xl bg-[#1A1D29] border border-[#252A3E] text-xs font-medium text-[#A0AEC0] flex items-center gap-2">
          <Sparkles size={14} className="text-[#F59E0B]" />
          <span>
            {activeTab === 'diario' && `Hoy: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}`}
            {activeTab === 'semanal' && getWeeklyRangeLabel()}
            {activeTab === 'mensual' && getMonthlyLabel()}
          </span>
        </div>
      </div>

      {/* Progress overview bar */}
      {filteredHabits.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#161924] to-[#12141D] border border-[#1E2235] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-[#F1F3F9]">
              Progreso del período ({completedCount} de {filteredHabits.length} completados)
            </span>
            <span className="font-bold text-[#10B981]">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-[#1E2235] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] to-[#6366F1] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#12141D] border border-[#1E2235] space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#1A1D29] flex items-center justify-center text-[#8892A4]">
            <Repeat size={24} />
          </div>
          <p className="text-base font-semibold text-[#F1F3F9]">
            No tienes hábitos {activeTab === 'diario' ? 'diarios' : activeTab === 'semanal' ? 'semanales' : 'mensuales'} aún
          </p>
          <p className="text-xs text-[#8892A4] max-w-sm mx-auto">
            Agrega tus rutinas clave para mantener la constancia y hacer seguimiento a tu desarrollo personal.
          </p>
          <button
            onClick={() => openCreateModal(activeTab)}
            className="px-4 py-2 rounded-xl bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/30 text-xs font-semibold transition-all inline-flex items-center gap-1.5 mt-2"
          >
            <Plus size={14} />
            Crear Hábito
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHabits.map(habit => {
            const isCompleted = habitLogs.some(
              l => l.habit_id === habit.id && l.period_key === currentPeriodKey
            )
            const zone = zones.find(z => z.id === habit.zona_id)
            const habitTotalCompletions = habitLogs.filter(l => l.habit_id === habit.id).length

            return (
              <div
                key={habit.id}
                className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex items-start justify-between gap-3 ${
                  isCompleted
                    ? 'bg-[#10B981]/10 border-[#10B981]/40 shadow-lg shadow-[#10B981]/5'
                    : 'bg-[#12141D] border-[#1E2235] hover:border-[#2E354F]'
                }`}
              >
                {/* Left checkmark button & info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleLog(habit.id, currentPeriodKey)}
                    className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                      isCompleted
                        ? 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-md shadow-[#10B981]/30 scale-105'
                        : 'border-2 border-[#2E354F] text-transparent hover:border-[#10B981]/60 hover:bg-[#10B981]/10'
                    }`}
                  >
                    <Check size={16} strokeWidth={3} className={isCompleted ? 'opacity-100' : 'opacity-0'} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className={`text-base font-bold transition-colors truncate ${
                        isCompleted ? 'text-[#10B981] line-through opacity-80' : 'text-[#F1F3F9]'
                      }`}>
                        {habit.title}
                      </h3>
                      {zone && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: `${zone.color}15`,
                            borderColor: `${zone.color}40`,
                            color: zone.color,
                          }}
                        >
                          {zone.icon} {zone.name}
                        </span>
                      )}
                    </div>

                    {habit.description && (
                      <p className="text-xs text-[#8892A4] leading-relaxed mb-2 line-clamp-2">
                        {habit.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <Flame size={12} className={habitTotalCompletions > 0 ? 'text-[#F59E0B]' : 'text-gray-500'} />
                        {habitTotalCompletions} completados en total
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right delete action */}
                <button
                  onClick={() => onDeleteHabit(habit.id)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors shrink-0"
                  title="Eliminar hábito"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: Create Habit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12141D] border border-[#1E2235] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1E2235]">
              <div className="flex items-center gap-2">
                <Repeat className="text-[#10B981]" size={20} />
                <h2 className="text-lg font-bold text-[#F1F3F9]">Crear Nuevo Hábito</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8892A4] hover:text-[#F1F3F9] p-1 rounded-lg hover:bg-[#1A1D29]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8892A4] mb-1.5">
                  Nombre del Hábito *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Leer 20 minutos, Gimnasio, Meditar..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1D29] border border-[#252A3E] text-[#F1F3F9] text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8892A4] mb-1.5">
                  Descripción (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles o motivación de esta rutina..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1D29] border border-[#252A3E] text-[#F1F3F9] text-sm focus:outline-none focus:border-[#10B981] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8892A4] mb-1.5">
                    Frecuencia
                  </label>
                  <select
                    value={newFrequency}
                    onChange={e => setNewFrequency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1D29] border border-[#252A3E] text-[#F1F3F9] text-sm focus:outline-none focus:border-[#10B981]"
                  >
                    <option value="diario">🔥 Diario</option>
                    <option value="semanal">📅 Semanal</option>
                    <option value="mensual">🏆 Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8892A4] mb-1.5">
                    Zona de Expansión
                  </label>
                  <select
                    value={newZoneId}
                    onChange={e => setNewZoneId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1D29] border border-[#252A3E] text-[#F1F3F9] text-sm focus:outline-none focus:border-[#10B981]"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>
                        {z.icon} {z.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2235]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[#8892A4] hover:bg-[#1A1D29] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#10B981] hover:bg-[#059669] text-white shadow-lg shadow-[#10B981]/20 transition-all"
                >
                  Guardar Hábito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
