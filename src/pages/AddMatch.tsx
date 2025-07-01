"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Calendar, Users, Trophy, Target, Plus, Minus, Clock, User, CheckCircle, AlertCircle } from "lucide-react"
import type { Match } from "../types"

// Componentes UI inline
const Badge = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode
  variant?: "default" | "secondary" | "success" | "warning"
  className?: string
}) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
  }
  return <span className={`${baseClasses} ${variants[variant]} ${className}`}>{children}</span>
}

const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  disabled = false,
  type = "button",
}: {
  children: React.ReactNode
  variant?: "default" | "ghost" | "outline" | "destructive" | "success"
  size?: "default" | "sm" | "lg"
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit"
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "hover:bg-gray-100 hover:text-gray-900",
    outline: "border border-gray-300 hover:bg-gray-50 hover:text-gray-900",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
  }
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-12 px-6 text-base",
  }
  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-white text-gray-900 shadow-sm ${className}`}>{children}</div>
)

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
)

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
)

const Input = ({
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  min,
  required = false,
}: {
  type?: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
  min?: number
  required?: boolean
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    min={min}
    required={required}
    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
  />
)

const Select = ({
  value,
  onChange,
  children,
  className = "",
  required = false,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
  className?: string
  required?: boolean
}) => (
  <select
    value={value}
    onChange={onChange}
    required={required}
    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
  >
    {children}
  </select>
)

interface AddMatchProps {
  onAddMatch: (match: Match) => void
}

const AddMatch: React.FC<AddMatchProps> = ({ onAddMatch }) => {
  const [date, setDate] = useState("")
  const [homeTeam, setHomeTeam] = useState("")
  const [awayTeam, setAwayTeam] = useState("")
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [goalsData, setGoalsData] = useState<
    { player: string; assist: string | null; minute: number; team: string; time: string }[]
  >([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateGoal = (
    index: number,
    updated: Partial<{ player: string; assist: string | null; minute: number; team: string }>,
  ) => {
    setGoalsData((prev) => {
      const updatedGoals = [...prev]
      const newData = { ...updatedGoals[index], ...updated }
      newData.time = `${newData.minute}'`
      updatedGoals[index] = newData
      return updatedGoals
    })
  }

  useEffect(() => {
    const totalGoals = homeScore + awayScore
    if (totalGoals > goalsData.length) {
      const diff = totalGoals - goalsData.length
      setGoalsData((prev) => [
        ...prev,
        ...Array.from({ length: diff }, () => ({
          player: "",
          assist: null,
          minute: 0,
          team: "",
          time: "",
        })),
      ])
    } else if (totalGoals < goalsData.length) {
      setGoalsData((prev) => prev.slice(0, totalGoals))
    }
  }, [homeScore, awayScore])

  const submit = async () => {
    if (!date || !homeTeam.trim() || !awayTeam.trim()) {
      alert("Completa todos los campos")
      return
    }

    const incompleteGoal = goalsData.some(
      (g) =>
        !g.player.trim() ||
        !g.team.trim() ||
        g.minute === 0 ||
        (g.assist !== null && g.assist !== "" && !g.assist.trim()),
    )
    if (incompleteGoal) {
      alert("Completá todos los datos de los goles")
      return
    }

    const newMatch = {
      date,
      teamA: homeTeam,
      teamB: awayTeam,
      scoreA: homeScore,
      scoreB: awayScore,
      goals: goalsData.map((g) => ({
        ...g,
        assist: g.assist === null ? "" : g.assist,
      })),
    }

    try {
      setIsSubmitting(true)
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/matches`, newMatch)
      alert("Partido guardado correctamente")
      onAddMatch(response.data)

      // Reset form
      setDate("")
      setHomeTeam("")
      setAwayTeam("")
      setHomeScore(0)
      setAwayScore(0)
      setGoalsData([])
    } catch (error) {
      console.error("Error al guardar el partido:", error)
      alert("Error al guardar el partido")
    } finally {
      setIsSubmitting(false)
    }
  }

  const adjustScore = (team: "home" | "away", delta: number) => {
    if (team === "home") {
      const newScore = Math.max(0, homeScore + delta)
      setHomeScore(newScore)
    } else {
      const newScore = Math.max(0, awayScore + delta)
      setAwayScore(newScore)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Agregar Partido</h1>
          <p className="text-gray-600">Registra un nuevo partido con todos sus detalles</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Información básica del partido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                <span>Información del Partido</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha del Partido</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="max-w-xs"
                />
              </div>

              {/* Equipos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipo Local</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={homeTeam}
                      onChange={(e) => setHomeTeam(e.target.value)}
                      placeholder="Nombre del equipo local"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipo Visitante</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={awayTeam}
                      onChange={(e) => setAwayTeam(e.target.value)}
                      placeholder="Nombre del equipo visitante"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marcador */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <span>Resultado Final</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-x-8">
                {/* Equipo Local */}
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800 mb-4">{homeTeam || "Equipo Local"}</div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustScore("home", -1)}
                      disabled={homeScore === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="text-4xl font-bold text-gray-800 min-w-[4rem] text-center">{homeScore}</div>
                    <Button variant="outline" size="sm" onClick={() => adjustScore("home", 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* VS */}
                <div className="text-2xl font-bold text-gray-400">VS</div>

                {/* Equipo Visitante */}
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800 mb-4">{awayTeam || "Equipo Visitante"}</div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustScore("away", -1)}
                      disabled={awayScore === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="text-4xl font-bold text-gray-800 min-w-[4rem] text-center">{awayScore}</div>
                    <Button variant="outline" size="sm" onClick={() => adjustScore("away", 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Resumen de goles */}
              {(homeScore > 0 || awayScore > 0) && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-4 text-sm text-blue-800">
                    <span>Total de goles: {homeScore + awayScore}</span>
                    <span>•</span>
                    <span>Campos de goles generados automáticamente</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Goles */}
          {goalsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-6 w-6 text-green-600" />
                    <span>Detalles de los Goles</span>
                  </div>
                  <Badge variant="success">{goalsData.length} goles</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {goalsData.map((goal, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Gol #{index + 1}</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Jugador */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Goleador</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            value={goal.player}
                            onChange={(e) => updateGoal(index, { player: e.target.value })}
                            placeholder="Nombre del jugador"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      {/* Minuto */}
                      {goal.player.trim() && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Minuto</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              type="number"
                              value={goal.minute}
                              onChange={(e) => updateGoal(index, { minute: +e.target.value })}
                              placeholder="Minuto"
                              min={1}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Equipo */}
                      {goal.player.trim() && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Equipo</label>
                          <Select
                            value={goal.team}
                            onChange={(e) => updateGoal(index, { team: e.target.value })}
                            required
                          >
                            <option value="">Seleccionar equipo</option>
                            {homeTeam && <option value={homeTeam}>{homeTeam}</option>}
                            {awayTeam && <option value={awayTeam}>{awayTeam}</option>}
                          </Select>
                        </div>
                      )}

                      {/* Asistencia */}
                      {goal.player.trim() && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">¿Hubo asistencia?</label>
                          <Select
                            value={goal.assist !== null ? "yes" : "no"}
                            onChange={(e) => {
                              const selected = e.target.value
                              if (selected === "yes") {
                                updateGoal(index, { assist: "" })
                              } else {
                                updateGoal(index, { assist: null })
                              }
                            }}
                          >
                            <option value="no">No</option>
                            <option value="yes">Sí</option>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Campo de asistencia */}
                    {goal.assist !== null && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Jugador que asistió</label>
                        <div className="relative max-w-md">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            value={goal.assist}
                            onChange={(e) => updateGoal(index, { assist: e.target.value })}
                            placeholder="Nombre del jugador que asistió"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    )}

                    {/* Resumen del gol */}
                    {goal.player.trim() && goal.team && goal.minute > 0 && (
                      <div className="mt-4 p-3 bg-white rounded border-l-4 border-green-500">
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>
                            <strong>{goal.player}</strong> ({goal.team}) - Minuto {goal.minute}'
                            {goal.assist && goal.assist.trim() && (
                              <span className="text-gray-500"> • Asistencia: {goal.assist}</span>
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Botón de guardar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Asegúrate de completar todos los campos antes de guardar</span>
                </div>
                <Button
                  variant="success"
                  size="lg"
                  onClick={submit}
                  disabled={isSubmitting || !date || !homeTeam.trim() || !awayTeam.trim()}
                  className="flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Guardar Partido</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default AddMatch
