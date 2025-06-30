import React from 'react'
import { Goal, Match } from '../types'

interface GoalDetailProps {
  goal: Goal
  match: Match
  onClose: () => void
}

const GoalDetail: React.FC<GoalDetailProps> = ({ goal, match, onClose }) => {
  const goalTime = new Date(match.date)
  goalTime.setMinutes(goalTime.getMinutes() + goal.minute)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white text-black p-6 rounded-xl max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-black font-bold text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-bold mb-4">Detalle del Gol</h2>
        <p><strong>Jugador:</strong> {goal.player.firstName} {goal.player.lastName}</p>
        <p><strong>Minuto:</strong> {goal.minute}'</p>
        <p><strong>Fecha del partido:</strong> {new Date(match.date).toLocaleDateString('es-AR')}</p>
        <p><strong>Hora estimada del gol:</strong> {goalTime.toLocaleTimeString('es-AR')}</p>
        <p><strong>Asistencia:</strong> {goal.assist ? `${goal.assist.firstName} ${goal.assist.lastName}` : 'Sin asistencia'}</p>
        <p><strong>Partido:</strong> {match.teamA.name} vs {match.teamB.name}</p>
      </div>
    </div>
  )
}

export default GoalDetail
