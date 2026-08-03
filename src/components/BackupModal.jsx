import { useState } from 'react'
import { Download, Upload, X, ShieldCheck, Database, FileJson, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const api = window.equilibrium ?? null

export default function BackupModal({ isOpen, onClose, onReloadData, fullStateData }) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  if (!isOpen) return null

  // ── Export JSON Handler ───────────────────────────────────────────────────
  async function handleExport() {
    setIsExporting(true)
    try {
      let dataToSave = null

      if (api && api.data && api.data.export) {
        dataToSave = await api.data.export()
      } else {
        // Fallback for web mode
        dataToSave = {
          version: '1.3',
          exportedAt: new Date().toISOString(),
          activities: fullStateData.activities || [],
          achievements: fullStateData.achievements || [],
          habits: fullStateData.habits || [],
          habit_logs: fullStateData.habitLogs || [],
          projects: fullStateData.projects || [],
          project_subtasks: (fullStateData.projects || []).flatMap(p => p.subtasks || [])
        }
      }

      const jsonStr = JSON.stringify(dataToSave, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const dateStr = new Date().toISOString().split('T')[0]
      const a = document.createElement('a')
      a.href = url
      a.download = `equilibrium_backup_${dateStr}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('¡Copia de seguridad JSON descargada con éxito!', { icon: '💾', duration: 4000 })
    } catch (err) {
      console.error('Export error:', err)
      toast.error('Error al exportar los datos JSON: ' + (err.message || err))
    } finally {
      setIsExporting(false)
    }
  }

  // ── Import JSON Handler ───────────────────────────────────────────────────
  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      const payload = JSON.parse(text)

      if (!payload || typeof payload !== 'object') {
        throw new Error('El archivo no contiene un formato JSON válido.')
      }

      if (api && api.data && api.data.import) {
        await api.data.import(payload)
      } else {
        // Web fallback
        if (payload.projects) localStorage.setItem('goz_projects', JSON.stringify(payload.projects))
        if (payload.activities) localStorage.setItem('goz_activities', JSON.stringify(payload.activities))
      }

      toast.success('¡Datos importados correctamente! Actualizando...', { icon: '🎉', duration: 4000 })
      
      if (onReloadData) {
        await onReloadData()
      }
      onClose()
    } catch (err) {
      console.error('Import error:', err)
      toast.error('Error al importar el archivo: ' + (err.message || 'Formato JSON no reconocido'))
    } finally {
      setIsImporting(false)
      e.target.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#12141D] border border-[#1E2235] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2235] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#6366F1]/20 to-[#10B981]/20 border border-[#6366F1]/30 text-[#6366F1]">
              <Database size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F1F3F9] font-display">Respaldo y Transferencia JSON</h2>
              <p className="text-xs text-[#8892A4]">Exporta tu información para moverla a otra PC o restaurarla en cualquier momento.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8892A4] hover:text-[#F1F3F9] hover:bg-[#1A1D29] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info card */}
        <div className="p-4 rounded-2xl bg-[#1A1D29]/60 border border-[#252A3E] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#10B981]">
            <ShieldCheck size={16} />
            <span>Tus datos se guardan de forma local y 100% segura</span>
          </div>
          <p className="text-xs text-[#8892A4] leading-relaxed">
            El archivo JSON incluye todos tus proyectos, subtareas, misiones, hábitos, registros e historial de XP.
          </p>
        </div>

        {/* Action Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#1A1D29] hover:bg-[#252A3E] border border-[#252A3E] hover:border-[#6366F1]/50 text-left transition-all group space-y-3 active:scale-95 disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] group-hover:scale-110 transition-transform">
              <Download size={22} />
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold text-[#F1F3F9] group-hover:text-[#6366F1] transition-colors">
                Exportar JSON
              </span>
              <span className="block text-[11px] text-[#8892A4] mt-0.5">
                Descargar respaldo completo
              </span>
            </div>
          </button>

          {/* Import Button */}
          <label className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#1A1D29] hover:bg-[#252A3E] border border-[#252A3E] hover:border-[#10B981]/50 text-left transition-all group space-y-3 cursor-pointer active:scale-95">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              disabled={isImporting}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] group-hover:scale-110 transition-transform">
              <Upload size={22} />
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold text-[#F1F3F9] group-hover:text-[#10B981] transition-colors">
                Importar JSON
              </span>
              <span className="block text-[11px] text-[#8892A4] mt-0.5">
                Cargar respaldo de otra PC
              </span>
            </div>
          </label>

        </div>

        {/* Notice */}
        <div className="flex items-start gap-2 text-[11px] text-[#8892A4] pt-2 border-t border-[#1E2235]">
          <AlertCircle size={14} className="text-[#F59E0B] shrink-0 mt-0.5" />
          <span>Al importar una copia de seguridad JSON, los datos importados reemplazarán la información actual de la base de datos local.</span>
        </div>

      </div>
    </div>
  )
}
