import { useState } from 'react'
import { X, ChevronRight, Save, Swords, Shield, Minus } from 'lucide-react'
import toast from 'react-hot-toast'

const ZONE_DESCRIPTIONS = {
  1: 'Registra algo que hiciste desde tu zona segura.',
  2: 'Algo que te generó resistencia, miedo o incomodidad.',
  3: 'Una habilidad, conocimiento o técnica que adquiriste.',
  4: 'Una meta, logro o expansión que alcanzaste.',
}

const MISSION_TYPES = [
  {
    id: 'principal',
    label: 'Misión Principal',
    xp: 1000,
    icon: '🏆',
    description: 'Grande, épica y transformadora. Cambia quién eres.',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.3)',
    gradient: 'linear-gradient(135deg, #F59E0B22, #F97316111)',
    border: '#F59E0B',
  },
  {
    id: 'secundaria',
    label: 'Misión Secundaria',
    xp: 100,
    icon: '⚡',
    description: 'Táctica, diaria, constante. Los pequeños pasos importan.',
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.3)',
    gradient: 'linear-gradient(135deg, #A78BFA22, #6366F111)',
    border: '#A78BFA',
  },
  {
    id: null,
    label: 'Solo un registro',
    xp: 0,
    icon: '📝',
    description: 'Registra sin gamificar. Solo para el historial.',
    color: '#4A5166',
    glow: 'rgba(74,81,102,0.2)',
    gradient: 'linear-gradient(135deg, #4A516622, transparent)',
    border: '#2E3450',
  },
]

export default function ActivityModal({ zones, sentiments, onClose, onCreate }) {
  const [step, setStep]             = useState(1)
  const [selectedZone, setSelectedZone]   = useState(null)
  const [selectedMission, setSelectedMission] = useState(undefined)
  const [deadline, setDeadline]     = useState('')
  const [form, setForm] = useState({
    descripcion:    '',
    sentimiento_id: null,
    resistencia:    5,
    habilidad:      '',
    meta_cumplida:  '',
    notas:          '',
  })
  const [saving, setSaving] = useState(false)

  function handleZoneSelect(zone) {
    setSelectedZone(zone)
    setStep(2)
  }

  function handleMissionSelect(type) {
    setSelectedMission(type)
    setStep(3)
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.descripcion.trim()) {
      toast.error('La descripción es obligatoria')
      return
    }
    setSaving(true)
    try {
      await onCreate({
        zona_id:        selectedZone.id,
        descripcion:    form.descripcion.trim(),
        sentimiento_id: form.sentimiento_id || null,
        resistencia:    selectedZone.id === 2 ? Number(form.resistencia) : null,
        habilidad:      selectedZone.id === 3 ? form.habilidad.trim() || null : null,
        meta_cumplida:  selectedZone.id === 4 ? form.meta_cumplida.trim() || null : null,
        notas:          form.notas.trim() || null,
        mision_tipo:    selectedMission?.id ?? null,
        deadline:       (selectedMission?.id && deadline) ? deadline : null,
      })
      if (selectedMission?.id) {
        toast.success(`¡${selectedMission.label} creada! ${selectedMission.icon} +${selectedMission.xp} XP al completar`)
      } else {
        toast.success(`¡Evento en Zona ${selectedZone.name} registrado! ${selectedZone.icon}`)
      }
      onClose()
    } catch (err) {
      toast.error('Error al guardar. Intenta de nuevo.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass rounded-3xl w-full max-w-lg mx-4 shadow-glass animate-slide-up overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#1E2235]">
          <div>
            <h2 className="text-base font-bold font-display text-[#F1F3F9]">
              {step === 1 && '¿En qué Zona estás?'}
              {step === 2 && `Zona ${selectedZone?.icon} ${selectedZone?.name}`}
              {step === 3 && '¿Es una Misión?'}
            </h2>
            <p className="text-xs text-[#8892A4] mt-0.5">
              {step === 1 && 'Selecciona la zona que describe este momento'}
              {step === 2 && ZONE_DESCRIPTIONS[selectedZone?.id]}
              {step === 3 && 'Clasifica el tipo de impacto de esta actividad'}
            </p>
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: step === s ? '20px' : '6px',
                    backgroundColor: step >= s ? '#10B981' : '#1E2235',
                  }}
                />
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4A5166] hover:text-[#F1F3F9] hover:bg-[#1A1D29] transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── STEP 1: Zone Selection ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="p-6 grid grid-cols-2 gap-3">
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => handleZoneSelect(zone)}
                className="group p-4 rounded-2xl border border-[#1E2235] hover:border-opacity-50 transition-all text-left relative overflow-hidden"
                style={{ background: `${zone.color}08` }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${zone.color}15, transparent 60%)` }}
                />
                <div className="relative">
                  <span className="text-3xl">{zone.icon}</span>
                  <p className="font-semibold text-sm text-[#F1F3F9] mt-2">{zone.name}</p>
                  <p className="text-[10px] text-[#8892A4] mt-0.5 leading-relaxed">{zone.description}</p>
                  <ChevronRight size={14}
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: zone.color }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── STEP 2: Details Form ───────────────────────────────────────────── */}
        {step === 2 && selectedZone && (
          <form onSubmit={e => { e.preventDefault(); setStep(3) }} className="p-6 space-y-4">
            {/* Back */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[10px] text-[#8892A4] hover:text-[#F1F3F9] flex items-center gap-1 transition-colors mb-1"
            >
              ← Cambiar zona
            </button>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-semibold text-[#8892A4] mb-1.5">Descripción *</label>
              <textarea
                className="eq-input resize-none"
                rows={3}
                placeholder="¿Qué hiciste? Sé específico y honesto..."
                value={form.descripcion}
                onChange={e => handleChange('descripcion', e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Zona de Miedo: Resistencia */}
            {selectedZone.id === 2 && (
              <div>
                <label className="block text-xs font-semibold text-[#EF4444] mb-1.5">
                  Nivel de Resistencia: <span className="text-[#F1F3F9] font-bold">{form.resistencia}/10</span>
                </label>
                <input
                  type="range" min="1" max="10"
                  value={form.resistencia}
                  onChange={e => handleChange('resistencia', e.target.value)}
                />
                <div className="flex justify-between text-[9px] text-[#4A5166] mt-1">
                  <span>Pequeño reto</span><span>Terror total</span>
                </div>
              </div>
            )}

            {/* Zona de Aprendizaje: Habilidad */}
            {selectedZone.id === 3 && (
              <div>
                <label className="block text-xs font-semibold text-[#F59E0B] mb-1.5">Habilidad Adquirida</label>
                <input
                  type="text" className="eq-input"
                  placeholder="ej. React Hooks, comunicación asertiva..."
                  value={form.habilidad}
                  onChange={e => handleChange('habilidad', e.target.value)}
                />
              </div>
            )}

            {/* Zona de Crecimiento: Meta */}
            {selectedZone.id === 4 && (
              <div>
                <label className="block text-xs font-semibold text-[#10B981] mb-1.5">Meta Cumplida</label>
                <input
                  type="text" className="eq-input"
                  placeholder="ej. Lancé mi primera app, completé el reto de 30 días..."
                  value={form.meta_cumplida}
                  onChange={e => handleChange('meta_cumplida', e.target.value)}
                />
              </div>
            )}

            {/* Sentimiento */}
            <div>
              <label className="block text-xs font-semibold text-[#8892A4] mb-1.5">¿Cómo te sentiste?</label>
              <div className="grid grid-cols-4 gap-2">
                {sentiments.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleChange('sentimiento_id', form.sentimiento_id === s.id ? null : s.id)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      form.sentimiento_id === s.id
                        ? 'border-[#10B981]/50 bg-[#10B981]/10 text-[#F1F3F9]'
                        : 'border-[#1E2235] text-[#8892A4] hover:border-[#2E3450]'
                    }`}
                  >
                    <div className="text-lg">{s.emoji}</div>
                    <div className="text-[9px] mt-0.5">{s.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notas adicionales */}
            <div>
              <label className="block text-xs font-semibold text-[#8892A4] mb-1.5">Notas adicionales (opcional)</label>
              <input
                type="text" className="eq-input"
                placeholder="Reflexión, contexto, próximo paso..."
                value={form.notas}
                onChange={e => handleChange('notas', e.target.value)}
              />
            </div>

            {/* Next */}
            <button
              type="submit"
              disabled={!form.descripcion.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${selectedZone.color}, ${selectedZone.color}cc)`,
                boxShadow: `0 0 20px ${selectedZone.color}40`,
                color: 'white',
              }}
            >
              Siguiente → Clasificar Misión
            </button>
          </form>
        )}

        {/* ── STEP 3: Mission Type ───────────────────────────────────────────── */}
        {step === 3 && (
          <div className="p-6 space-y-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-[10px] text-[#8892A4] hover:text-[#F1F3F9] flex items-center gap-1 transition-colors mb-1"
            >
              ← Volver a detalles
            </button>

            {MISSION_TYPES.map(type => (
              <button
                key={String(type.id)}
                onClick={() => setSelectedMission(type)}
                className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden group ${
                  selectedMission?.id === type.id
                    ? 'scale-[1.01]'
                    : 'hover:scale-[1.005]'
                }`}
                style={{
                  background: selectedMission?.id === type.id ? type.gradient : `${type.color}08`,
                  borderColor: selectedMission?.id === type.id ? type.border : '#1E2235',
                  boxShadow: selectedMission?.id === type.id ? `0 0 20px ${type.glow}` : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{
                      background: `${type.color}15`,
                      border: `1px solid ${type.color}30`,
                    }}
                  >
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#F1F3F9]">{type.label}</p>
                      {type.xp > 0 && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${type.color}20`, color: type.color }}
                        >
                          +{type.xp} XP
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8892A4] mt-0.5">{type.description}</p>
                  </div>
                  {selectedMission?.id === type.id && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: type.color }}
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}

            {/* Deadline — only show when a mission type is selected */}
            {selectedMission?.id && (
              <div className="pt-1">
                <label className="block text-xs font-semibold text-[#8892A4] mb-1.5">
                  📅 Fecha límite <span className="font-normal text-[#4A5166]">(opcional)</span>
                </label>
                <input
                  type="date"
                  className="eq-input text-sm"
                  min={new Date().toISOString().split('T')[0]}
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                />
                {deadline && (
                  <p className="text-[10px] text-[#F59E0B] mt-1">
                    ⚠️ Si no completas antes de esa fecha, la misión se marcará como vencida.
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              disabled={saving || selectedMission === undefined}
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={selectedMission ? {
                background: selectedMission.id
                  ? `linear-gradient(135deg, ${selectedMission.color}, ${selectedMission.color}99)`
                  : 'linear-gradient(135deg, #1E2235, #161924)',
                boxShadow: selectedMission.id ? `0 0 24px ${selectedMission.glow}` : 'none',
                color: 'white',
              } : { background: '#1E2235', color: '#4A5166' }}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={14} />
                  {selectedMission?.id ? `Crear ${selectedMission.label}` : 'Registrar Actividad'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
