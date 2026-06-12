import { Plus } from 'lucide-react'

/**
 * FAB — Floating Action Button
 * Floats bottom-right, rotates on hover, triggers the Activity modal.
 */
export default function FAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fab"
      title="Añadir nuevo desafío"
      aria-label="Añadir nuevo evento de expansión"
      id="fab-add-activity"
    >
      <Plus size={24} color="white" strokeWidth={2.5} />
    </button>
  )
}
