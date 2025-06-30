"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Trophy, Calendar, Play, Clock, Target, MapPin, User } from "lucide-react"

// Interfaces
interface Match {
  _id: string
  teamA: {
    _id: string
    name: string
  }
  teamB: {
    _id: string
    name: string
  }
  scoreA: number
  scoreB: number
  tournament: string
  date: string
  status?: string
  time?: string
}

interface ScheduledMatch {
  _id: string
  date: string
  time: string
  teamA: {
    _id: string
    name: string
    abreviation?: string
  }
  teamB: {
    _id: string
    name: string
    abreviation?: string
  }
  tournament: {
    _id: string
    name: string
    type: string
  }
  stadium: string
  referee: string
  notes: string
  matchday: number
  status: "scheduled" | "confirmed" | "postponed" | "cancelled"
  createdAt: string
  updatedAt: string
}

interface Player {
  _id: string
  firstName: string
  lastName: string
  number: number
  team?: {
    _id: string
    name: string
  }
  goals: number
  matches?: number
}

interface Tournament {
  _id: string
  name: string
  startDate: string
  endDate: string
}

interface TeamStanding {
  _id: string
  tournament: string
  team: {
    _id: string
    name: string
  }
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

// Componentes UI inline
const Badge = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode
  variant?: "default" | "secondary" | "destructive" | "success" | "warning"
  className?: string
}) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
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
}: {
  children: React.ReactNode
  variant?: "default" | "ghost" | "outline"
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

const Table = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className="w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className}`}>{children}</table>
  </div>
)

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="[&_tr]:border-b">{children}</thead>
)

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
)

const TableRow = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <tr className={`border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-100 ${className}`}>
    {children}
  </tr>
)

const TableHead = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-gray-600 [&:has([role=checkbox])]:pr-0 ${className}`}
  >
    {children}
  </th>
)

const TableCell = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>
)

// Función para formatear fecha
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Función para formatear hora
const formatTime = (timeString: string) => {
  return timeString
}

// Función para obtener el badge del estado
const getStatusBadge = (status: string) => {
  switch (status) {
    case "scheduled":
      return <Badge variant="secondary">Programado</Badge>
    case "confirmed":
      return <Badge variant="success">Confirmado</Badge>
    case "postponed":
      return <Badge variant="warning">Pospuesto</Badge>
    case "cancelled":
      return <Badge variant="destructive">Cancelado</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

// Componente principal
const Inicio: React.FC = () => {
  const [topScorer, setTopScorer] = useState<Player | null>(null)
  const [liveMatches, setLiveMatches] = useState<Match[]>([])
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [topScorers, setTopScorers] = useState<Player[]>([])
  const [scheduledMatches, setScheduledMatches] = useState<ScheduledMatch[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournament, setSelectedTournament] = useState<string>("")
  const [selectedUpcomingTournament, setSelectedUpcomingTournament] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [loadingStandings, setLoadingStandings] = useState(false)
  const [loadingScheduledMatches, setLoadingScheduledMatches] = useState(false)

  const navigate = useNavigate()

  // Estados para goleadores
  const [topScorersByTournament, setTopScorersByTournament] = useState<any[]>([])
  const [selectedScorerTournament, setSelectedScorerTournament] = useState<string>("")
  const [loadingScorers, setLoadingScorers] = useState(false)

  // Estado para controlar qué tab está activo
  const [activeTab, setActiveTab] = useState("standings")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Llamadas principales
        const [topScorerRes, liveMatchesRes, tournamentsRes] = await Promise.all([
          axios.get(`${process.env.BACKEND_URL}/players/topscorer`),
          axios.get(`${process.env.BACKEND_URL}/live-matches`),
          axios.get(`${process.env.BACKEND_URL}/tournaments`),
        ])

        setTopScorer(topScorerRes.data)
        setLiveMatches(liveMatchesRes.data)
        setTournaments(tournamentsRes.data)

        // Seleccionar el primer torneo automáticamente
        if (tournamentsRes.data.length > 0) {
          setSelectedTournament(tournamentsRes.data[0]._id)
          setSelectedScorerTournament(tournamentsRes.data[0]._id)
          setSelectedUpcomingTournament(tournamentsRes.data[0]._id)
        }

        // Llamadas adicionales opcionales
        try {
          const [topScorersRes] = await Promise.all([
            axios.get(`${process.env.BACKEND_URL}/players/top-scorers`).catch(() => ({ data: [] })),
          ])

          setTopScorers(topScorersRes.data)
        } catch (e) {
          console.log("Algunas funciones adicionales no están disponibles aún")
        }
      } catch (e) {
        console.error("Error cargando datos:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchStandingsByTournament = async (tournamentId: string) => {
    if (!tournamentId) return

    try {
      setLoadingStandings(true)
      const standingsRes = await axios.get(`${process.env.BACKEND_URL}/team-tournament-standings/${tournamentId}/standings`)
      setStandings(standingsRes.data)
    } catch (error) {
      console.error("Error cargando tabla de posiciones:", error)
      setStandings([])
    } finally {
      setLoadingStandings(false)
    }
  }

  const fetchScheduledMatches = async (tournamentId?: string) => {
    try {
      setLoadingScheduledMatches(true)
      console.log("🔍 Fetching upcoming matches for tournament:", tournamentId)

      // Usar el nuevo endpoint de upcoming
      let url = `${process.env.BACKEND_URL}/scheduled-matches/upcoming`

      // Agregar filtros si es necesario
      const params = new URLSearchParams()
      if (tournamentId) {
        params.append("tournament", tournamentId)
      }
      params.append("limit", "10") // Limitar a 10 partidos

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      console.log("📡 API URL:", url)
      const scheduledRes = await axios.get(url)
      console.log("📊 Upcoming matches data:", scheduledRes.data)

      setScheduledMatches(scheduledRes.data)
    } catch (error) {
      console.error("❌ Error cargando partidos programados:", error)
      if (error.response) {
        console.error("📄 Error response:", error.response.data)
        console.error("🔢 Error status:", error.response.status)
      }
      setScheduledMatches([])
    } finally {
      setLoadingScheduledMatches(false)
    }
  }

  const fetchScorersByTournament = async (tournamentId: string) => {
    if (!tournamentId) return

    try {
      setLoadingScorers(true)
      console.log("Cargando goleadores para torneo:", tournamentId)
      const scorersRes = await axios.get(`${process.env.BACKEND_URL}/goal`)
      console.log("Datos de goles obtenidos:", scorersRes.data)

      // Filtrar goles por torneo y agrupar por jugador
      const goalsByTournament = scorersRes.data.filter(
        (goal: any) => goal.match && goal.match.tournament === tournamentId,
      )
      console.log("Goles filtrados por torneo:", goalsByTournament)

      // Agrupar goles por jugador
      const playerGoals: { [key: string]: any } = {}
      goalsByTournament.forEach((goal: any) => {
        const playerId = goal.player._id
        if (!playerGoals[playerId]) {
          playerGoals[playerId] = {
            _id: goal.player._id,
            firstName: goal.player.firstName,
            lastName: goal.player.lastName,
            number: goal.player.number,
            team: {
              _id: goal.player.team,
              name: "Equipo", // Por ahora usamos un nombre genérico
            },
            goals: 0,
            matches: new Set(),
          }
        }

        playerGoals[playerId].goals += 1
        playerGoals[playerId].matches.add(goal.match._id)
      })

      // Convertir a array y ordenar por goles
      const scorersArray = Object.values(playerGoals)
        .map((player: any) => ({
          ...player,
          matches: player.matches.size,
        }))
        .sort((a: any, b: any) => b.goals - a.goals)

      console.log("Goleadores procesados:", scorersArray)
      setTopScorersByTournament(scorersArray)
    } catch (error) {
      console.error("Error cargando goleadores por torneo:", error)
      setTopScorersByTournament([])
    } finally {
      setLoadingScorers(false)
    }
  }

  useEffect(() => {
    if (selectedTournament) {
      fetchStandingsByTournament(selectedTournament)
    }
  }, [selectedTournament])

  useEffect(() => {
    if (selectedScorerTournament) {
      fetchScorersByTournament(selectedScorerTournament)
    }
  }, [selectedScorerTournament])

  useEffect(() => {
    // Cargar partidos programados al inicio, sin filtro de torneo
    fetchScheduledMatches()
  }, [])

  useEffect(() => {
    if (selectedUpcomingTournament) {
      fetchScheduledMatches(selectedUpcomingTournament)
    } else {
      // Si no hay torneo seleccionado, mostrar todos
      fetchScheduledMatches()
    }
  }, [selectedUpcomingTournament])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Título de bienvenida */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard de Liga</h1>
          <p className="text-gray-600">Bienvenido al sistema de gestión de tu liga de fútbol</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Máximo Goleador</CardTitle>
              <Target className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {topScorer ? (
                <>
                  <div className="text-2xl font-bold text-gray-900">{topScorer.goals}</div>
                  <p className="text-xs text-gray-500">
                    {topScorer.firstName} {topScorer.lastName}
                  </p>
                </>
              ) : (
                <div className="text-sm text-gray-400">Sin datos</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Partidos en Vivo</CardTitle>
              <Play className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{liveMatches.length}</div>
              <p className="text-xs text-gray-500">Ahora mismo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Próximos Partidos</CardTitle>
              <Calendar className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{scheduledMatches.length}</div>
              <p className="text-xs text-gray-500">Programados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Torneos Activos</CardTitle>
              <Trophy className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{tournaments.length}</div>
              <p className="text-xs text-gray-500">Disponibles</p>
            </CardContent>
          </Card>
        </div>

        {/* Máximo Goleador Destacado */}
        {topScorer && (
          <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Trophy className="h-5 w-5 text-yellow-600" />🏆 Máximo Goleador del Torneo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between flex-wrap">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-yellow-600">{topScorer.goals}</div>
                  <div>
                    <div className="text-xl font-bold text-gray-800">
                      {topScorer.firstName} {topScorer.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      #{topScorer.number} • {topScorer.team?.name}
                    </div>
                  </div>
                </div>
                <Button onClick={() => navigate("/players")}>Ver Todos los Goleadores</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Play className="h-5 w-5 text-red-500" />📺 Partidos en Vivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveMatches.map((match) => (
                  <div
                    key={match._id}
                    onClick={() => navigate("/live")}
                    className="flex items-center justify-between p-4 border rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <Badge variant="destructive" className="animate-pulse">
                        EN VIVO
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{match.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium text-gray-800">{match.teamA.name}</div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {match.scoreA} - {match.scoreB}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-800">{match.teamB.name}</div>
                      </div>
                    </div>

                    <Button size="sm" variant="outline">
                      Ver Detalles
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600">
            <button
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === "standings" ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-200/50"
              }`}
              onClick={() => setActiveTab("standings")}
            >
              Tabla de Posiciones
            </button>
            <button
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === "scorers" ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-200/50"
              }`}
              onClick={() => setActiveTab("scorers")}
            >
              Goleadores
            </button>
            <button
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === "upcoming" ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-200/50"
              }`}
              onClick={() => setActiveTab("upcoming")}
            >
              Próximos Partidos
            </button>
          </div>

          {/* Tab Content - Tabla de Posiciones */}
          {activeTab === "standings" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-800">Tabla de Posiciones</CardTitle>
                  <div className="flex items-center space-x-2">
                    <label htmlFor="tournament-select" className="text-sm font-medium text-gray-600">
                      Torneo:
                    </label>
                    <select
                      id="tournament-select"
                      value={selectedTournament}
                      onChange={(e) => setSelectedTournament(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Seleccionar torneo</option>
                      {tournaments.map((tournament) => (
                        <option key={tournament._id} value={tournament._id}>
                          {tournament.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedTournament ? (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecciona un torneo para ver la tabla de posiciones</p>
                  </div>
                ) : loadingStandings ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando tabla de posiciones...</p>
                  </div>
                ) : standings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Pos</TableHead>
                        <TableHead>Equipo</TableHead>
                        <TableHead className="text-center">PJ</TableHead>
                        <TableHead className="text-center">G</TableHead>
                        <TableHead className="text-center">E</TableHead>
                        <TableHead className="text-center">P</TableHead>
                        <TableHead className="text-center">GF</TableHead>
                        <TableHead className="text-center">GC</TableHead>
                        <TableHead className="text-center">DG</TableHead>
                        <TableHead className="text-center">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standings
                        .sort((a, b) => {
                          if (b.points !== a.points) return b.points - a.points
                          return b.goalDifference - a.goalDifference
                        })
                        .map((teamStanding, index) => (
                          <TableRow key={teamStanding._id}>
                            <TableCell className="font-medium">
                              <Badge variant={index < 4 ? "default" : "secondary"}>{index + 1}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{teamStanding.team.name}</TableCell>
                            <TableCell className="text-center">{teamStanding.matchesPlayed}</TableCell>
                            <TableCell className="text-center">{teamStanding.wins}</TableCell>
                            <TableCell className="text-center">{teamStanding.draws}</TableCell>
                            <TableCell className="text-center">{teamStanding.losses}</TableCell>
                            <TableCell className="text-center">{teamStanding.goalsFor}</TableCell>
                            <TableCell className="text-center">{teamStanding.goalsAgainst}</TableCell>
                            <TableCell className="text-center">
                              {teamStanding.goalDifference > 0
                                ? `+${teamStanding.goalDifference}`
                                : teamStanding.goalDifference}
                            </TableCell>
                            <TableCell className="text-center font-bold">{teamStanding.points}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay datos de tabla de posiciones para este torneo</p>
                    <p className="text-sm mt-2">Los datos aparecerán cuando se jueguen partidos en este torneo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tab Content - Goleadores */}
          {activeTab === "scorers" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-800">Tabla de Goleadores</CardTitle>
                  <div className="flex items-center space-x-2">
                    <label htmlFor="scorer-tournament-select" className="text-sm font-medium text-gray-600">
                      Torneo:
                    </label>
                    <select
                      id="scorer-tournament-select"
                      value={selectedScorerTournament}
                      onChange={(e) => setSelectedScorerTournament(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Seleccionar torneo</option>
                      {tournaments.map((tournament) => (
                        <option key={tournament._id} value={tournament._id}>
                          {tournament.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedScorerTournament ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecciona un torneo para ver los goleadores</p>
                  </div>
                ) : loadingScorers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando goleadores...</p>
                  </div>
                ) : topScorersByTournament.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Pos</TableHead>
                        <TableHead>Jugador</TableHead>
                        <TableHead>Equipo</TableHead>
                        <TableHead className="text-center">Goles</TableHead>
                        <TableHead className="text-center">Partidos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topScorersByTournament.map((scorer, index) => (
                        <TableRow key={scorer._id}>
                          <TableCell>
                            <Badge variant={index === 0 ? "default" : "secondary"}>{index + 1}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {scorer.firstName} {scorer.lastName}
                          </TableCell>
                          <TableCell>{scorer.team?.name}</TableCell>
                          <TableCell className="text-center font-bold">{scorer.goals}</TableCell>
                          <TableCell className="text-center">{scorer.matches}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay goleadores registrados en este torneo</p>
                    <p className="text-sm mt-2">Los goleadores aparecerán cuando se registren goles en los partidos</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tab Content - Próximos Partidos */}
          {activeTab === "upcoming" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-800">Próximos Partidos</CardTitle>
                  <div className="flex items-center space-x-2">
                    <label htmlFor="upcoming-tournament-select" className="text-sm font-medium text-gray-600">
                      Torneo:
                    </label>
                    <select
                      id="upcoming-tournament-select"
                      value={selectedUpcomingTournament}
                      onChange={(e) => setSelectedUpcomingTournament(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Todos los torneos</option>
                      {tournaments.map((tournament) => (
                        <option key={tournament._id} value={tournament._id}>
                          {tournament.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingScheduledMatches ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando partidos programados...</p>
                  </div>
                ) : scheduledMatches.length > 0 ? (
                  <div className="space-y-4">
                    {scheduledMatches.map((match) => (
                      <div
                        key={match._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center min-w-[100px]">
                            <div className="text-sm font-medium text-gray-900">{formatDate(match.date)}</div>
                            <div className="text-lg font-bold text-blue-600">{formatTime(match.time)}</div>
                          </div>
                          <div className="flex flex-col space-y-1">
                            {getStatusBadge(match.status)}
                            <div className="text-xs text-gray-500">Jornada {match.matchday}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-right min-w-[120px]">
                            <div className="font-medium text-gray-800">{match.teamA.name}</div>
                            <div className="text-xs text-gray-500">{match.teamA.abreviation}</div>
                          </div>
                          <div className="text-xl font-bold text-gray-500">VS</div>
                          <div className="text-left min-w-[120px]">
                            <div className="font-medium text-gray-800">{match.teamB.name}</div>
                            <div className="text-xs text-gray-500">{match.teamB.abreviation}</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-1 min-w-[150px]">
                          <div className="text-sm font-medium text-gray-700">{match.tournament.name}</div>
                          {match.stadium && (
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {match.stadium}
                            </div>
                          )}
                          {match.referee && (
                            <div className="flex items-center text-xs text-gray-500">
                              <User className="h-3 w-3 mr-1" />
                              {match.referee}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay partidos programados próximamente</p>
                    <Button variant="outline" className="mt-4 bg-transparent" onClick={() => navigate("/admin")}>
                      Programar Partidos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default Inicio
