import { useState } from 'react'
import { FolderKanban, CheckCircle2, CheckSquare, Plus, Trash2, Trophy, AlertTriangle, X, CornerUpLeft, Award, ExternalLink, Sparkles } from 'lucide-react'

export default function Projects({
  projects = [],
  zones = [],
  onCreateProject,
  onDeleteProject,
  onCompleteProject,
  onReopenProject,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) {
  const [activeTab, setActiveTab] = useState('actuales') // 'actuales' | 'realizados'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [confirmModalProject, setConfirmModalProject] = useState(null)
  
  // Selected project for overlay/modal view
  const [selectedProjectId, setSelectedProjectId] = useState(null)

  // Form states for new project
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newZoneId, setNewZoneId] = useState(zones[0]?.id || 4)
  const [initialSubtasksInput, setInitialSubtasksInput] = useState('')

  // Quick subtask input inside overlay modal
  const [overlaySubtaskInput, setOverlaySubtaskInput] = useState('')

  // Separate active vs completed
  const activeProjects = projects.filter(p => p.status !== 'completado')
  const completedProjects = projects.filter(p => p.status === 'completado')

  // Golden Ranking Rule: Sort active projects descending by number of completed subtasks!
  const sortedActiveProjects = [...activeProjects].sort((a, b) => {
    const completedA = (a.subtasks || []).filter(s => s.completed).length
    const completedB = (b.subtasks || []).filter(s => s.completed).length
    if (completedB !== completedA) {
      return completedB - completedA // Project with most checked subtasks goes to top!
    }
    return (b.subtasks || []).length - (a.subtasks || []).length
  })

  // Get current active selected project for overlay modal
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null
  const selectedRankIndex = sortedActiveProjects.findIndex(p => p.id === selectedProjectId)

  function handleCreateProjectSubmit(e) {
    e.preventDefault()
    if (!newTitle.trim()) return

    const parsedSubtasks = initialSubtasksInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    onCreateProject({
      title: newTitle.trim(),
      description: newDescription.trim(),
      zona_id: Number(newZoneId),
      initialSubtasks: parsedSubtasks,
    })

    setNewTitle('')
    setNewDescription('')
    setInitialSubtasksInput('')
    setIsCreateModalOpen(false)
  }

  function handleAddSubtaskInOverlay() {
    if (!selectedProjectId || !overlaySubtaskInput.trim()) return
    onAddSubtask(selectedProjectId, overlaySubtaskInput.trim())
    setOverlaySubtaskInput('')
  }

  function handleConfirmComplete() {
    if (!confirmModalProject) return
    onCompleteProject(confirmModalProject.id)
    if (selectedProjectId === confirmModalProject.id) {
      setSelectedProjectId(null)
    }
    setConfirmModalProject(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#6366F1]/20 to-[#10B981]/20 border border-[#6366F1]/30 text-[#6366F1]">
            <FolderKanban size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F1F3F9] font-display">Proyectos</h1>
            <p className="text-xs text-[#8892A4]">
              Gestiona tus metas por ventanitas. ¡Haz clic en un proyecto para abrir sus subtareas!
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white font-medium text-sm shadow-lg shadow-[#6366F1]/20 hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#12141D] rounded-2xl border border-[#1E2235] w-fit">
        <button
          onClick={() => setActiveTab('actuales')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'actuales'
              ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/20'
              : 'text-[#8892A4] hover:text-[#F1F3F9] hover:bg-[#1A1D29]'
          }`}
        >
          <FolderKanban size={16} />
          <span>Proyectos Actuales</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/20">
            {activeProjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('realizados')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'realizados'
              ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/20'
              : 'text-[#8892A4] hover:text-[#F1F3F9] hover:bg-[#1A1D29]'
          }`}
        >
          <CheckCircle2 size={16} />
          <span>Proyectos Realizados</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/20">
            {completedProjects.length}
          </span>
        </button>
      </div>

      {/* ACTIVE PROJECTS VIEW (GRID OF VENTANITAS) */}
      {activeTab === 'actuales' && (
        <div>
          {sortedActiveProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#12141D] border border-[#1E2235] space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#1A1D29] flex items-center justify-center text-[#8892A4]">
                <FolderKanban size={24} />
              </div>
              <p className="text-base font-semibold text-[#F1F3F9]">No tienes proyectos actuales en curso</p>
              <p className="text-xs text-[#8892A4] max-w-sm mx-auto">
                Crea un proyecto para dividir tus grandes objetivos en subtareas concretas y escalar en la tabla.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#6366F1]/20 hover:bg-[#6366F1]/30 text-[#6366F1] border border-[#6366F1]/30 text-xs font-semibold transition-all inline-flex items-center gap-1.5 mt-2"
              >
                <Plus size={14} />
                Crear Proyecto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedActiveProjects.map((project, index) => {
                const zone = zones.find(z => z.id === project.zona_id)
                const subtasks = project.subtasks || []
                const completedSubtasksCount = subtasks.filter(s => s.completed).length
                const totalSubtasksCount = subtasks.length
                const percent = totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0
                const isTop1 = index === 0 && completedSubtasksCount > 0

                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between cursor-pointer group hover:-translate-y-1 hover:shadow-2xl ${
                      isTop1
                        ? 'bg-gradient-to-br from-[#12141D] via-[#161926] to-[#1E1B4B] border-[#F59E0B]/50 shadow-lg shadow-[#F59E0B]/10 ring-1 ring-[#F59E0B]/30'
                        : 'bg-[#12141D] border-[#1E2235] hover:border-[#6366F1]/50 hover:shadow-[#6366F1]/5'
                    }`}
                  >
                    {/* Top rank badge banner if #1 */}
                    {isTop1 && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-[#F59E0B] to-[#D97706] text-black font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-2xl flex items-center gap-1 shadow-md z-10">
                        <Trophy size={12} className="text-black fill-black" />
                        <span>TOP #1 LÍDER</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Rank & Zone */}
                      <div className="flex items-center justify-between gap-2 pr-12">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#1A1D29] text-[#8892A4] border border-[#252A3E]">
                            #{index + 1}
                          </span>
                          {zone && (
                            <span
                              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
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

                        {/* Delete Quick Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteProject(project.id)
                          }}
                          className="p-1 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors opacity-0 group-hover:opacity-100"
                          title="Eliminar proyecto"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Project Title */}
                      <div>
                        <h3 className="text-base font-bold text-[#F1F3F9] font-display line-clamp-2 group-hover:text-[#6366F1] transition-colors leading-snug">
                          {project.title}
                        </h3>
                        {project.description && (
                          <p className="text-xs text-[#8892A4] mt-1 line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Subtasks Count */}
                    <div className="mt-4 pt-3 border-t border-[#1E2235]/60 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#8892A4] font-medium text-[11px]">
                          Progreso: <strong className="text-[#F1F3F9]">{completedSubtasksCount}/{totalSubtasksCount}</strong>
                        </span>
                        <span className={`font-bold text-xs ${isTop1 ? 'text-[#F59E0B]' : 'text-[#6366F1]'}`}>
                          {percent}%
                        </span>
                      </div>

                      <div className="h-2 bg-[#1A1D29] rounded-full overflow-hidden border border-[#252A3E]">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isTop1
                              ? 'bg-gradient-to-r from-[#F59E0B] via-[#EF4444] to-[#10B981]'
                              : 'bg-gradient-to-r from-[#6366F1] to-[#10B981]'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#8892A4] pt-1">
                        <span className="flex items-center gap-1 group-hover:text-[#F1F3F9] transition-colors">
                          <CheckSquare size={13} className="text-[#6366F1]" />
                          {totalSubtasksCount} subtareas
                        </span>
                        <span className="flex items-center gap-1 text-[#6366F1] font-semibold text-[11px] group-hover:underline">
                          <span>Abrir ventanita</span>
                          <ExternalLink size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* COMPLETED PROJECTS VIEW */}
      {activeTab === 'realizados' && (
        <div>
          {completedProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#12141D] border border-[#1E2235] space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#1A1D29] flex items-center justify-center text-[#8892A4]">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-base font-semibold text-[#F1F3F9]">Aún no has completado proyectos</p>
              <p className="text-xs text-[#8892A4] max-w-sm mx-auto">
                Cuando termines un proyecto activo y presiones &quot;Proyecto Completado&quot;, aparecerá en este salón de la fama.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedProjects.map(project => {
                const zone = zones.find(z => z.id === project.zona_id)
                const subtasks = project.subtasks || []
                const completedSubtasksCount = subtasks.filter(s => s.completed).length

                return (
                  <div
                    key={project.id}
                    className="p-5 rounded-2xl bg-[#12141D] border border-[#10B981]/30 relative overflow-hidden flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="p-1 rounded-lg bg-[#10B981]/20 text-[#10B981]">
                            <CheckCircle2 size={16} />
                          </span>
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

                        <button
                          onClick={() => onDeleteProject(project.id)}
                          className="p-1 text-[#6B7280] hover:text-[#EF4444] transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-[#F1F3F9] font-display">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-xs text-[#8892A4] leading-relaxed line-clamp-2">{project.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#8892A4] pt-2 border-t border-[#1E2235]">
                      <span>{completedSubtasksCount} subtareas logradas</span>
                      <button
                        onClick={() => onReopenProject(project.id)}
                        className="text-xs text-[#6366F1] hover:underline flex items-center gap-1 font-medium"
                      >
                        <CornerUpLeft size={13} />
                        Reabrir
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* SUPERPOSICIÓN / DETAIL OVERLAY MODAL (VENTANITA EXPANDIDA) */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#12141D] border border-[#1E2235] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6 animate-scale-up">
            
            {/* Header Banner if Rank 1 */}
            {selectedRankIndex === 0 && (selectedProject.subtasks || []).some(s => s.completed) && (
              <div className="bg-gradient-to-r from-[#F59E0B]/20 via-[#EF4444]/10 to-[#10B981]/20 border border-[#F59E0B]/40 rounded-2xl p-3 flex items-center justify-between text-[#F59E0B]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Trophy size={16} />
                  <span>¡Este proyecto es el LÍDER TOP #1 de tu tabla!</span>
                </div>
                <Sparkles size={16} />
              </div>
            )}

            {/* Top Info & Close */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedRankIndex >= 0 && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#1A1D29] text-[#8892A4] border border-[#252A3E]">
                      #{selectedRankIndex + 1}
                    </span>
                  )}
                  {(() => {
                    const zone = zones.find(z => z.id === selectedProject.zona_id)
                    return zone ? (
                      <span
                        className="text-xs font-bold px-3 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${zone.color}15`,
                          borderColor: `${zone.color}40`,
                          color: zone.color,
                        }}
                      >
                        {zone.icon} {zone.name}
                      </span>
                    ) : null
                  })()}
                </div>

                <h2 className="text-2xl font-bold text-[#F1F3F9] font-display pt-1">
                  {selectedProject.title}
                </h2>
                {selectedProject.description && (
                  <p className="text-xs text-[#8892A4] leading-relaxed pt-1">
                    {selectedProject.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedProjectId(null)}
                className="p-2 rounded-xl text-[#8892A4] hover:text-[#F1F3F9] hover:bg-[#1A1D29] transition-colors"
                title="Cerrar ventanita"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Section */}
            {(() => {
              const subtasks = selectedProject.subtasks || []
              const completedCount = subtasks.filter(s => s.completed).length
              const totalCount = subtasks.length
              const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

              return (
                <div className="p-4 rounded-2xl bg-[#1A1D29]/60 border border-[#252A3E] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8892A4] font-semibold">
                      Progreso del Proyecto: <strong className="text-[#F1F3F9]">{completedCount}</strong> de <strong className="text-[#F1F3F9]">{totalCount}</strong> subtareas
                    </span>
                    <span className="font-bold text-sm text-[#6366F1]">
                      {percent}%
                    </span>
                  </div>

                  <div className="h-3 bg-[#12141D] rounded-full overflow-hidden border border-[#252A3E]">
                    <div
                      className="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-[#6366F1] to-[#10B981]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })()}

            {/* Subtasks Section */}
            <div className="space-y-3 pt-2 border-t border-[#1E2235]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F1F3F9] flex items-center gap-2">
                  <CheckSquare size={16} className="text-[#6366F1]" />
                  <span>Subtareas ({ (selectedProject.subtasks || []).filter(s => s.completed).length }/{(selectedProject.subtasks || []).length})</span>
                </h3>
              </div>

              {/* Subtasks List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(selectedProject.subtasks || []).length === 0 ? (
                  <p className="text-xs text-[#8892A4] py-3 text-center italic">
                    Aún no hay subtareas creadas para este proyecto. ¡Añade la primera abajo!
                  </p>
                ) : (
                  (selectedProject.subtasks || []).map(st => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#1A1D29]/70 border border-[#252A3E] hover:border-[#6366F1]/40 transition-colors group"
                    >
                      <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(st.completed)}
                          onChange={e => onToggleSubtask(st.id, e.target.checked, selectedProject.id)}
                          className="w-4 h-4 rounded border-[#2E354F] text-[#10B981] focus:ring-[#10B981] bg-[#12141D] cursor-pointer"
                        />
                        <span className={`text-xs transition-all truncate ${
                          st.completed ? 'line-through text-[#6B7280]' : 'text-[#F1F3F9] font-medium'
                        }`}>
                          {st.title}
                        </span>
                      </label>

                      <button
                        onClick={() => onDeleteSubtask(st.id, selectedProject.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#6B7280] hover:text-[#EF4444] transition-all rounded-lg hover:bg-[#EF4444]/10"
                        title="Eliminar subtarea"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Subtask Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Escribe una nueva subtarea..."
                  value={overlaySubtaskInput}
                  onChange={e => setOverlaySubtaskInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddSubtaskInOverlay() }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#1A1D29] border border-[#252A3E] text-xs text-[#F1F3F9] focus:outline-none focus:border-[#6366F1]"
                />
                <button
                  type="button"
                  onClick={handleAddSubtaskInOverlay}
                  className="px-4 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-md shadow-[#6366F1]/20 transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Añadir</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#1E2235]">
              <button
                type="button"
                onClick={() => {
                  onDeleteProject(selectedProject.id)
                  setSelectedProjectId(null)
                }}
                className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={15} />
                <span>Eliminar</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmModalProject(selectedProject)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-bold shadow-md shadow-[#10B981]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Award size={16} />
                  <span>Proyecto Completado</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProjectId(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8892A4] bg-[#1A1D29] hover:bg-[#252A3E] border border-[#252A3E] transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION: Proyecto Completado */}
      {confirmModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12141D] border border-[#10B981]/50 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] mx-auto">
              <AlertTriangle size={26} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-[#F1F3F9]">¿Estás seguro?</h3>
              <p className="text-xs text-[#8892A4] leading-relaxed">
                Vas a marcar el proyecto <strong className="text-[#F1F3F9]">&quot;{confirmModalProject.title}&quot;</strong> como completado. Este proyecto se archivará en la sección de <strong className="text-[#10B981]">Proyectos Realizados</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2235]">
              <button
                type="button"
                onClick={() => setConfirmModalProject(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[#8892A4] hover:bg-[#1A1D29] border border-[#252A3E] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#10B981] hover:bg-[#059669] text-white shadow-lg shadow-[#10B981]/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Award size={15} />
                ¡Sí, Completar!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Project */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12141D] border border-[#1E2235] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1E2235]">
              <div className="flex items-center gap-2">
                <FolderKanban className="text-[#6366F1]" size={20} />
                <h2 className="text-lg font-bold text-[#F1F3F9]">Crear Nuevo Proyecto</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#8892A4] hover:text-[#F1F3F9] p-1 rounded-lg hover:bg-[#1A1D29]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8892A4] mb-1.5">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Profesorado Lengua y Literatura..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1D29] border border-[#252A3E] text-[#F1F3F9] text-sm focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8892A4] mb-1.5">
                  Descripción (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Objetivos o alcance general del proyecto..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1D29] border border-[#252A3E] text-[#F1F3F9] text-sm focus:outline-none focus:border-[#6366F1] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8892A4] mb-1.5">
                  Zona de Expansión
                </label>
                <select
                  value={newZoneId}
                  onChange={e => setNewZoneId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1D29] border border-[#252A3E] text-[#F1F3F9] text-sm focus:outline-none focus:border-[#6366F1]"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.icon} {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8892A4] mb-1.5">
                  Subtareas Iniciales (una por línea)
                </label>
                <textarea
                  rows={3}
                  placeholder="Fase 1: Boceto&#10;Fase 2: Desarrollo&#10;Fase 3: Pruebas"
                  value={initialSubtasksInput}
                  onChange={e => setInitialSubtasksInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1D29] border border-[#252A3E] text-[#F1F3F9] text-xs focus:outline-none focus:border-[#6366F1] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2235]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[#8892A4] hover:bg-[#1A1D29] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateProjectSubmit}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-lg shadow-[#6366F1]/20 transition-all"
                >
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
