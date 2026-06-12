import { useState } from 'react'
import { X, ChevronRight, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const ZONE_FIELDS = {
  1: [], // Confort — solo descripción y sentimiento
  2: ['resistencia'],        // Miedo
  3: ['habilidad'],          // Aprendizaje
  4: ['meta_cumplida'],      // Crecimiento
}

const ZONE_DESCRIPTIONS = {
  1: 'Registra algo que hiciste desde tu zona segura.',
  2: 'Algo que te generó resistencia, miedo o incomodidad.',
  3: 'Una habilidad, conocimiento o técnica que adquiriste.',
  4: 'Una meta, logro o expansión que alcanzaste.',
}

export default function ActivityModal({ zones, sentiments, onClose, onCreate }) {
  const [step, setStep]         = useState(1) // 1=zona, 2=detalles
  const [selectedZone, setSelectedZone] = useState(null)
  const [form, setForm]         = useState({
    descripcion:    '',
    sentimiento_id: null,
    resistencia:    5,
    habilidad:      '',
    meta_cumplida:  '',
    notas:          '',
  })
  const [saving, setSaving]     = useState(false)

  function handleZoneSelect(zone) {
    setSelectedZone(zone)
    setStep(2)
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
        zona_id:       selectedZone.id,
        descripcion:   form.descripcion.trim(),
        sentimiento_id: form.sentimiento_id || null,
        resistencia:   selectedZone.id === 2 ? Number(form.resistencia) : null,
        habilidad:     selectedZone.id === 3 ? form.habilidad.trim() || null : null,
        meta_cumplida: selectedZone.id === 4 ? form.meta_cumplida.trim() || null : null,
        notas:         form.notas.trim() || null,
      })
      toast.success(`¡Evento en Zona ${selectedZone.name} registrado! ${selectedZone.icon}`)
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
              {step === 1 ? '¿En qué Zona estás?' : `Zona ${selectedZone?.icon} ${selectedZone?.name}`}
            </h2>
            <p className="text-xs text-[#8892A4] mt-0.5">
              {step === 1 ? 'Selecciona la zona que describe este momento' : ZONE_DESCRIPTIONS[selectedZone?.id]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4A5166] hover:text-[#F1F3F9] hover:bg-[#1A1D29] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step 1 — Zone Selection */}
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

        {/* Step 2 — Details Form */}
        {step === 2 && selectedZone && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  type="range"
                  min="1" max="10"
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
                  type="text"
                  className="eq-input"
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
                  type="text"
                  className="eq-input"
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
                type="text"
                className="eq-input"
                placeholder="Reflexión, contexto, próximo paso..."
                value={form.notas}
                onChange={e => handleChange('notas', e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving || !form.descripcion.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${selectedZone.color}, ${selectedZone.color}cc)`,
                boxShadow: `0 0 20px ${selectedZone.color}40`,
                color: 'white',
              }}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={14} />
                  Registrar Expansión
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
