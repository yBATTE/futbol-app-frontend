"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { ArrowLeft, Users, Trophy, Shirt, ChevronDown, User } from "lucide-react"
import type { Player, Team } from "../types"

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
  variant?: "default" | "ghost" | "outline" | "secondary"
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
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
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

const Select = ({
  children,
  value,
  onValueChange,
  placeholder,
  className = "",
}: {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
}) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  )
}

interface LocationState {
  team?: Team
}

const TeamLineup: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { team: initialTeam } = (location.state || {}) as LocationState

  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(initialTeam || null)
  const [loading, setLoading] = useState(false)

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/team`)
      setTeams(res.data)
    } catch (error) {
      console.error("Error al obtener los equipos:", error)
    }
  }

  const fetchPlayers = async (teamId: string) => {
    setLoading(true)
    try {
      const res = await axios.get(`${process.env.VITE_BACKEND_URL}/api/players/lineup/${teamId}`)
      setPlayers(res.data)
    } catch (error) {
      console.error("Error al obtener jugadores:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
    if (initialTeam) {
      fetchPlayers(initialTeam._id)
    }
  }, [])

  const handleTeamSelect = (selectedId: string) => {
    const selectedTeam = teams.find((t) => t._id === selectedId)
    if (selectedTeam) {
      setCurrentTeam(selectedTeam)
      fetchPlayers(selectedId)
    }
  }

  // Agrupar jugadores por posición
  const groupPlayersByPosition = (players: Player[]) => {
    const positions = {
      Portero: players.filter((p) => p.position === "Portero"),
      Defensor: players.filter((p) => p.position === "Defensor"),
      Mediocampista: players.filter((p) => p.position === "Mediocampista"),
      Delantero: players.filter((p) => p.position === "Delantero"),
    }
    return positions
  }

  const positionColors = {
    Portero: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Defensor: "bg-blue-100 text-blue-800 border-blue-200",
    Mediocampista: "bg-green-100 text-green-800 border-green-200",
    Delantero: "bg-red-100 text-red-800 border-red-200",
  }

  const positionIcons = {
    Portero: "🥅",
    Defensor: "🛡️",
    Mediocampista: "⚽",
    Delantero: "🎯",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header con botón volver */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Alineaciones</h1>
              <p className="text-gray-600">Consulta los jugadores de cada equipo</p>
            </div>
          </div>
        </div>

        {/* Selector de equipo */}
        {!currentTeam && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-600" />
                <span>Seleccionar Equipo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Elegí un equipo:</label>
                  <Select
                    value=""
                    onValueChange={handleTeamSelect}
                    placeholder="Selecciona un equipo..."
                    className="w-full max-w-md"
                  >
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </Select>
                </div>
                {teams.length === 0 && <p className="text-gray-500 text-sm">Cargando equipos disponibles...</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información del equipo seleccionado */}
        {currentTeam && (
          <>
            {/* Header del equipo */}
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-blue-800">{currentTeam.name}</CardTitle>
                      <p className="text-blue-600">
                        {currentTeam.abreviation} • {players.length} jugadores
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentTeam(null)
                      setPlayers([])
                    }}
                  >
                    Cambiar Equipo
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Estadísticas del equipo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Object.entries(groupPlayersByPosition(players)).map(([position, positionPlayers]) => (
                <Card key={position}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{position}s</CardTitle>
                    <span className="text-2xl">{positionIcons[position as keyof typeof positionIcons]}</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{positionPlayers.length}</div>
                    <p className="text-xs text-gray-500">Jugadores</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Lista de jugadores */}
            {loading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando jugadores...</p>
                </CardContent>
              </Card>
            ) : players.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay jugadores registrados</h3>
                  <p className="text-gray-500">Este equipo aún no tiene jugadores asignados</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupPlayersByPosition(players)).map(([position, positionPlayers]) => {
                  if (positionPlayers.length === 0) return null
                  return (
                    <Card key={position}>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-3">
                          <span className="text-2xl">{positionIcons[position as keyof typeof positionIcons]}</span>
                          <span>{position}s</span>
                          <Badge variant="secondary">{positionPlayers.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {positionPlayers.map((player, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md hover:scale-105 ${
                                positionColors[position as keyof typeof positionColors]
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-gray-800 shadow-sm">
                                  {player.number}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-800 truncate">
                                    {player.firstName} {player.lastName}
                                  </div>
                                  <div className="text-sm opacity-75 flex items-center space-x-1">
                                    <Shirt className="h-3 w-3" />
                                    <span>{position}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Campo de fútbol visual (opcional) */}
            {players.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-6 w-6 text-green-600" />
                    <span>Formación Visual</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-100 rounded-lg p-8 min-h-96 relative overflow-hidden">
                    {/* Campo de fútbol estilizado */}
                    <div className="absolute inset-4 border-2 border-white rounded-lg">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-1/2"></div>
                      <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>

                    {/* Mensaje informativo */}
                    <div className="relative z-10 text-center text-green-800">
                      <p className="text-lg font-semibold mb-2">Formación Táctica</p>
                      <p className="text-sm opacity-75">
                        Visualización del campo disponible para futuras actualizaciones
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default TeamLineup
