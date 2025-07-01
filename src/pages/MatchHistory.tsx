"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Calendar, Clock, Trophy, Target, Users, X, ChevronRight } from "lucide-react"
import type { Match, Goal } from "../types"

// Componentes UI inline
const Badge = ({
  children,
  variant = "default",
  className = "",
}: { children: React.ReactNode; variant?: "default" | "secondary" | "outline"; className?: string }) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    outline: "border border-gray-300 text-gray-700",
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
}: {
  children: React.ReactNode
  variant?: "default" | "ghost" | "outline" | "destructive"
  size?: "default" | "sm"
  className?: string
  onClick?: () => void
  disabled?: boolean
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "hover:bg-gray-100 hover:text-gray-900",
    outline: "border border-gray-300 hover:bg-gray-50 hover:text-gray-900",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  }
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
  }
  return (
    <button
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

type MatchHistoryProps = {}

const MatchHistory: React.FC<MatchHistoryProps> = () => {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/matches`)
        setMatches(res.data)
      } catch (err) {
        console.error("Error al obtener partidos:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchMatches()
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial de partidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Historial de Partidos</h1>
          <p className="text-gray-600">Revisa todos los partidos jugados y sus estadísticas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Partidos</CardTitle>
              <Trophy className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{matches.length}</div>
              <p className="text-xs text-gray-500">Partidos completados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Goles</CardTitle>
              <Target className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {matches.reduce((total, match) => total + (match.goals?.length || 0), 0)}
              </div>
              <p className="text-xs text-gray-500">Goles anotados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Promedio de Goles</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {matches.length > 0
                  ? (matches.reduce((total, match) => total + (match.goals?.length || 0), 0) / matches.length).toFixed(
                      1,
                    )
                  : "0"}
              </div>
              <p className="text-xs text-gray-500">Por partido</p>
            </CardContent>
          </Card>
        </div>

        {/* Matches List */}
        {matches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay partidos guardados</h3>
              <p className="text-gray-500 mb-6">Cuando se jueguen partidos, aparecerán aquí</p>
              <Button onClick={() => navigate("/addMatch")}>Agregar Nuevo Partido</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => (
              <Card key={match._id} className="overflow-hidden hover:shadow-md transition-shadow">
                {/* Match Header */}
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{formatDate(match.date)}</span>
                    </div>
                    <Badge variant="outline">{formatShortDate(match.date)}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Teams and Score */}
                  <div className="flex items-center justify-center mb-6">
                    {/* Team A */}
                    <div
                      className="flex-1 text-right cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors group"
                      onClick={() =>
                        navigate("/lineup", {
                          state: {
                            team: match.teamA,
                            players: match.teamA.players || [],
                          },
                        })
                      }
                    >
                      <div className="text-xs text-gray-500 mb-1">{match.teamA.abreviation}</div>
                      <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {match.teamA.name}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors ml-auto mt-1" />
                    </div>

                    {/* Score */}
                    <div className="px-8">
                      <div className="text-4xl font-bold text-gray-800 text-center">
                        {match.scoreA} - {match.scoreB}
                      </div>
                      <div className="text-xs text-gray-500 text-center mt-1">RESULTADO FINAL</div>
                    </div>

                    {/* Team B */}
                    <div
                      className="flex-1 text-left cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors group"
                      onClick={() =>
                        navigate("/lineup", {
                          state: {
                            team: match.teamB,
                            players: match.teamB.players || [],
                          },
                        })
                      }
                    >
                      <div className="text-xs text-gray-500 mb-1">{match.teamB.abreviation}</div>
                      <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {match.teamB.name}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors mr-auto mt-1" />
                    </div>
                  </div>

                  {/* Goals Section */}
                  {match.goals && match.goals.length > 0 && (
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-green-600" />
                        Goles del Partido
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Team A Goals */}
                        <div className="space-y-3">
                          <h5 className="font-medium text-gray-700 border-b pb-2">{match.teamA.name}</h5>
                          {match.goals
                            .filter((g) => g.team === match.teamA._id)
                            .map((goal, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">⚽</span>
                                  </div>
                                  <div>
                                    {goal.player && typeof goal.player === "object" && "firstName" in goal.player ? (
                                      <button
                                        onClick={() => setSelectedGoal(goal)}
                                        className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                                      >
                                        {goal.player.firstName} {goal.player.lastName}
                                      </button>
                                    ) : (
                                      <span className="text-gray-500">Jugador desconocido</span>
                                    )}
                                    {goal.assist && typeof goal.assist === "object" && "firstName" in goal.assist && (
                                      <div className="text-xs text-gray-500">
                                        Asistencia: {goal.assist.firstName} {goal.assist.lastName}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-600">{goal.minute}'</span>
                                </div>
                              </div>
                            ))}
                          {match.goals.filter((g) => g.team === match.teamA._id).length === 0 && (
                            <p className="text-gray-500 text-sm italic">Sin goles</p>
                          )}
                        </div>

                        {/* Team B Goals */}
                        <div className="space-y-3">
                          <h5 className="font-medium text-gray-700 border-b pb-2">{match.teamB.name}</h5>
                          {match.goals
                            .filter((g) => g.team === match.teamB._id)
                            .map((goal, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">⚽</span>
                                  </div>
                                  <div>
                                    {goal.player && typeof goal.player === "object" && "firstName" in goal.player ? (
                                      <button
                                        onClick={() => setSelectedGoal(goal)}
                                        className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                                      >
                                        {goal.player.firstName} {goal.player.lastName}
                                      </button>
                                    ) : (
                                      <span className="text-gray-500">Jugador desconocido</span>
                                    )}
                                    {goal.assist && typeof goal.assist === "object" && "firstName" in goal.assist && (
                                      <div className="text-xs text-gray-500">
                                        Asistencia: {goal.assist.firstName} {goal.assist.lastName}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-600">{goal.minute}'</span>
                                </div>
                              </div>
                            ))}
                          {match.goals.filter((g) => g.team === match.teamB._id).length === 0 && (
                            <p className="text-gray-500 text-sm italic">Sin goles</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Goal Details Modal */}
        {selectedGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Detalles del Gol</h3>
                <button
                  onClick={() => setSelectedGoal(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">⚽</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {selectedGoal.player &&
                      typeof selectedGoal.player === "object" &&
                      "firstName" in selectedGoal.player
                        ? `${selectedGoal.player.firstName} ${selectedGoal.player.lastName}`
                        : "Jugador desconocido"}
                    </div>
                    <div className="text-sm text-gray-500">Goleador</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Minuto</div>
                    <div className="font-medium">{selectedGoal.minute}'</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Fecha</div>
                    <div className="font-medium">
                      {matches.find((m) => m.goals?.includes(selectedGoal))
                        ? formatShortDate(matches.find((m) => m.goals?.includes(selectedGoal))!.date)
                        : "N/A"}
                    </div>
                  </div>
                </div>

                {selectedGoal.assist &&
                  typeof selectedGoal.assist === "object" &&
                  "firstName" in selectedGoal.assist && (
                    <div>
                      <div className="text-gray-500 text-sm">Asistencia</div>
                      <div className="font-medium">
                        {selectedGoal.assist.firstName} {selectedGoal.assist.lastName}
                      </div>
                    </div>
                  )}

                <div>
                  <div className="text-gray-500 text-sm">Partido</div>
                  <div className="font-medium">
                    {matches.find((m) => m.goals?.includes(selectedGoal))
                      ? `${matches.find((m) => m.goals?.includes(selectedGoal))!.teamA.name} vs ${
                          matches.find((m) => m.goals?.includes(selectedGoal))!.teamB.name
                        }`
                      : "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex justify-end p-6 border-t">
                <Button variant="outline" onClick={() => setSelectedGoal(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default MatchHistory
