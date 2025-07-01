import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Clock, Trophy, Target, Zap, Calendar } from "lucide-react"

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

// Interfaces
interface Team {
  _id: string
  name: string
}

interface Tournament {
  _id: string
  name: string
  startDate: string
  endDate: string
}

interface GoalType {
  _id: string
  player: {
    _id: string
    firstName: string
    lastName: string
    number: number
  }
  assist?: {
    _id: string
    firstName: string
    lastName: string
    number: number
  }
  team: string
  minute: number
  createdAt: string
}

interface Match {
  _id: string
    teamA: Team | string  
    teamB: Team | string
    scoreA: number
    scoreB: number
    goals?: GoalType[]
    date: string
    status: "not_started" | "live" | "paused" | "suspended" | "finished"
    startTime?: string
    pausedTime?: string
    resumeOffset?: number
    currentStage?: "regular" | "extra_time" | "penalties"
    tournament: Tournament | string
}

interface LiveMatch extends Match {
  status: "not_started" | "live" | "paused" | "suspended" | "finished"
  startTime?: string
  pausedTime?: string
  resumeOffset?: number
  currentStage?: "regular" | "extra_time" | "penalties"
  teamA: Team
  teamB: Team
  tournament: Tournament
  goals?: GoalType[]
  date: string
}

// Componente Cronómetro
const Cronometro: React.FC<{
  startTime: string
  resumeOffset?: number
  status: string
  pausedTime?: string
}> = ({ startTime, resumeOffset = 0, status, pausedTime }) => {
  const [elapsed, setElapsed] = useState<number>(0)

  useEffect(() => {
    let interval: number

    const calcularTiempo = () => {
      const ahora = Date.now()
      const inicio = new Date(startTime).getTime()
      const offset = resumeOffset || 0

      if ((status === "paused" || status === "suspended") && pausedTime) {
        const pausa = new Date(pausedTime).getTime()
        return Math.floor((pausa - inicio) / 1000 - offset)
      }

      if (status === "live") {
        return Math.floor((ahora - inicio) / 1000 - offset)
      }

      return elapsed
    }

    if (["live", "paused", "suspended"].includes(status)) {
      setElapsed(calcularTiempo())
    }

    if (status === "live") {
      interval = window.setInterval(() => {
        setElapsed(calcularTiempo())
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [startTime, resumeOffset, status, pausedTime])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  return (
    <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
      <Clock className="h-5 w-5 text-gray-600" />
      <span className="font-mono text-xl font-bold text-gray-800">
        {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  )
}

// Componente para mostrar goles
const GoalsList: React.FC<{ goals?: GoalType[]; teamId: string; teamName: string }> = ({
  goals = [],
  teamId,
  teamName,
}) => {
  const teamGoals = goals.filter((goal) => goal?.team === teamId)

  if (teamGoals.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <span className="text-2xl mb-2 block opacity-50">⚽</span>
        <p className="text-sm">Sin goles</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {teamGoals.map((goal) => (
        <li
          key={goal._id}
          className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
        >
          <span>
            {goal.player.firstName} {goal.player.lastName} #{goal.player.number}
          </span>
          <span>{goal.minute}'</span>
        </li>
      ))}
    </ul>
  )
}


// Componente de reloj en tiempo real
const LiveClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
      <Clock className="h-5 w-5 text-blue-600" />
      <div className="text-blue-800">
        <div className="font-mono text-lg font-bold">
          {currentTime.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
        <div className="text-xs">
          {currentTime.toLocaleDateString("es-ES", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </div>
      </div>
    </div>
  )
}

const LiveMatches: React.FC = () => {
  const [matches, setMatches] = useState<LiveMatch[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  const fetchMatches = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/live-matches`)
      console.log("Live matches data:", res.data)

      // Fetch tournament data for each match if not populated
      const matchesWithTournaments = await Promise.all(
        res.data.map(async (match: any) => {
          if (typeof match.tournament === "string") {
            try {
              const tournamentRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/tournaments/${match.tournament}`)
              return { ...match, tournament: tournamentRes.data }
            } catch (error) {
              console.error("Error fetching tournament:", error)
              return { ...match, tournament: { name: "Torneo no disponible", _id: match.tournament } }
            }
          }
          return match
        }),
      )

      setMatches(matchesWithTournaments)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/team`)
      setTeams(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    console.log("Fetching initial data...")
    fetchMatches()
    fetchTeams()
  }, [])

  // Actualizar partidos cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Refreshing matches...")
      fetchMatches()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <Badge variant="destructive" className="animate-pulse">
            🔴 EN VIVO
          </Badge>
        )
      case "paused":
        return <Badge variant="warning">⏸️ PAUSADO</Badge>
      case "suspended":
        return <Badge variant="secondary">⚠️ SUSPENDIDO</Badge>
      case "not_started":
        return <Badge variant="default">⏳ NO INICIADO</Badge>
      case "finished":
        return <Badge variant="success">✅ FINALIZADO</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStageBadge = (stage?: string) => {
    switch (stage) {
      case "extra_time":
        return <Badge variant="warning">🕐 ALARGUE</Badge>
      case "penalties":
        return <Badge variant="destructive">🥅 PENALES</Badge>
      default:
        return <Badge variant="default">⚽ TIEMPO REGULAR</Badge>
    }
  }

  const formatMatchDate = (dateString: string) => {
    try {
      if (!dateString) {
        // Si no hay fecha, usar la fecha de hoy
        const today = new Date()
        return today.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }

      let date = new Date(dateString)

      if (isNaN(date.getTime())) {
        date = new Date(Date.parse(dateString))
      }

      if (isNaN(date.getTime())) {
        // Si la fecha sigue siendo inválida, usar hoy
        const today = new Date()
        return today.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }

      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error, dateString)
      // En caso de error, usar la fecha de hoy
      const today = new Date()
      return today.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  const formatMatchTime = (dateString: string) => {
    try {
      if (!dateString) {
        // Si no hay hora específica, mostrar "En vivo ahora"
        return "En vivo ahora"
      }

      let date = new Date(dateString)

      if (isNaN(date.getTime())) {
        date = new Date(Date.parse(dateString))
      }

      if (isNaN(date.getTime())) {
        return "En vivo ahora"
      }

      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting time:", error, dateString)
      return "En vivo ahora"
    }
  }

  const getTournamentName = (tournament: Tournament | any) => {
    if (!tournament) return "Torneo no disponible"

    // If it's a string (ID), return a placeholder
    if (typeof tournament === "string") {
      return "Cargando torneo..."
    }

    // If it's an object, get the name
    if (typeof tournament === "object" && tournament.name) {
      return tournament.name
    }

    return "Torneo no disponible"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Partidos en Vivo</h1>
            <p className="text-gray-600">Visualiza y sigue los partidos en tiempo real</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Partidos Activos</CardTitle>
              <Trophy className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{matches.length}</div>
              <p className="text-xs text-gray-500">Total de partidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">En Vivo</CardTitle>
              <Zap className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{matches.filter((m) => m.status === "live").length}</div>
              <p className="text-xs text-gray-500">Partidos en curso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Finalizados</CardTitle>
              <span className="h-4 w-4 text-green-500">🏁</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {matches.filter((m) => m.status === "finished").length}
              </div>
              <p className="text-xs text-gray-500">Partidos terminados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Goles</CardTitle>
              <Target className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {matches.reduce((total, match) => total + match.scoreA + match.scoreB, 0)}
              </div>
              <p className="text-xs text-gray-500">En todos los partidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de partidos */}
        {matches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay partidos en vivo</h3>
              <p className="text-gray-500 mb-6">
                Los partidos aparecerán aquí cuando sean creados por un administrador
              </p>
              <div className="text-sm text-gray-400">
                Los administradores pueden crear nuevos partidos desde el panel de administración
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => (
              <Card key={match._id} className="overflow-hidden">
                {/* Header del partido */}
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <CardTitle className="text-xl text-gray-800">
                          {match.teamA.name} vs {match.teamB.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          {getStatusBadge(match.status)}
                          {getStageBadge(match.currentStage)}
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <Trophy className="h-3 w-3" />
                            <span>{getTournamentName(match.tournament)}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatMatchDate(match.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatMatchTime(match.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {match.startTime && (
                        <Cronometro
                          startTime={match.startTime}
                          resumeOffset={match.resumeOffset}
                          status={match.status}
                          pausedTime={match.pausedTime}
                        />
                      )}
                      <LiveClock />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Marcador */}
                  <div className="flex items-center justify-center mb-8">
                    {/* Team A */}
                    <div className="flex-1 text-center">
                      <div className="text-lg font-semibold text-gray-800 mb-2">{match.teamA.name}</div>
                      <div className="text-5xl font-bold text-gray-800 min-w-[4rem]">{match.scoreA}</div>
                    </div>

                    {/* VS */}
                    <div className="px-8">
                      <div className="text-3xl font-bold text-gray-400">VS</div>
                    </div>

                    {/* Team B */}
                    <div className="flex-1 text-center">
                      <div className="text-lg font-semibold text-gray-800 mb-2">{match.teamB.name}</div>
                      <div className="text-5xl font-bold text-gray-800 min-w-[4rem]">{match.scoreB}</div>
                    </div>
                  </div>

                  {/* Detalles del partido */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Goles del equipo A */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <GoalsList goals={match.goals || []} teamId={match.teamA._id} teamName={match.teamA.name} />
                    </div>

                    {/* Goles del equipo B */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <GoalsList goals={match.goals || []} teamId={match.teamB._id} teamName={match.teamB.name} />
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4" />
                        <span>Torneo: {getTournamentName(match.tournament)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Fecha: {formatMatchDate(match.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Inicio: {formatMatchTime(match.date)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default LiveMatches
