"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import {
  Shield,
  Users,
  Trophy,
  Settings,
  Plus,
  UserPlus,
  Calendar,
  Crown,
  Database,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  MapPin,
  Flag,
  User,
  Building,
  Minus,
  Pause,
  Timer,
  Target,
  Zap,
  X,
} from "lucide-react"
import axios from "axios"

// Componentes UI mejorados
const Badge = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode
  variant?: "default" | "secondary" | "success" | "warning" | "destructive"
  className?: string
}) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
  const variants = {
    default: "bg-blue-50 text-blue-700 border-blue-200",
    secondary: "bg-gray-50 text-gray-700 border-gray-200",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    destructive: "bg-red-50 text-red-700 border-red-200",
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
  variant?: "default" | "ghost" | "outline" | "destructive" | "secondary" | "success"
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
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
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
  <div
    className={`rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
  >
    {children}
  </div>
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

const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

const Select = ({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </select>
)

// Interfaces
interface AdminAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  route: string
  category: "management" | "creation" | "configuration" | "reports"
  priority: "high" | "medium" | "low"
  status?: "active" | "maintenance" | "new"
}

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

interface Player {
  firstName: string
  lastName: string
  number: number
  position: string
}

interface LiveMatch {
  _id: string
  teamA: Team
  teamB: Team
  scoreA: number
  scoreB: number
  tournament: Tournament
  status: "not_started" | "live" | "paused" | "suspended" | "finished"
  startTime?: string
  pausedTime?: string
  resumeOffset?: number
  currentStage?: "regular" | "extra_time" | "penalties"
  date: string
}

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([])

  // Estados para modales
  const [showMatchForm, setShowMatchForm] = useState(false)
  const [showClubForm, setShowClubForm] = useState(false)
  const [showPlayersForm, setShowPlayersForm] = useState(false)
  const [showTournamentForm, setShowTournamentForm] = useState(false)
  const [showScheduledMatchForm, setShowScheduledMatchForm] = useState(false)
  const [showLiveMatchesControl, setShowLiveMatchesControl] = useState(false)
  const [isSubmittingScheduledMatch, setIsSubmittingScheduledMatch] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalFormData, setGoalFormData] = useState({
    matchId: "",
    team: "A" as "A" | "B",
    teamId: "",
    playerId: "",
    customName: "",
    customNumber: "",
    assistId: "",
    assistCustomName: "",
    assistCustomNumber: "",
  })
  const [teamPlayers, setTeamPlayers] = useState<any[]>([])
  const [showCustomPlayer, setShowCustomPlayer] = useState(false)
  const [showCustomAssist, setShowCustomAssist] = useState(false)

  // Estados para formularios
  const [isSubmittingMatch, setIsSubmittingMatch] = useState(false)
  const [isSubmittingClub, setIsSubmittingClub] = useState(false)
  const [isSubmittingPlayers, setIsSubmittingPlayers] = useState(false)
  const [isSubmittingTournament, setIsSubmittingTournament] = useState(false)

  // Datos de formularios
  const [matchFormData, setMatchFormData] = useState({
    teamA: "",
    teamB: "",
    scoreA: 0,
    scoreB: 0,
    tournament: "",
  })

  const [clubFormData, setClubFormData] = useState({
    name: "",
    abreviation: "",
    location: "",
    division: "",
    coach: "",
    stadium: "",
  })

  const [playersFormData, setPlayersFormData] = useState({
    clubId: "",
    players: [{ firstName: "", lastName: "", number: 0, position: "" }] as Player[],
  })

  const [tournamentFormData, setTournamentFormData] = useState({
    name: "",
    type: "",
    season: "",
    description: "",
    startDate: "",
    endDate: "",
    selectedTeams: [] as string[],
  })

  const [scheduledMatchFormData, setScheduledMatchFormData] = useState({
    date: "",
    time: "",
    teamA: "",
    teamB: "",
    tournament: "",
    stadium: "",
    referee: "",
    notes: "",
    matchday: 1,
    status: "scheduled",
  })

  // Función para verificar permisos de admin
  const checkAdminStatus = async () => {
    if (!isAuthenticated || !user) {
      setError("Debes iniciar sesión para acceder al panel de administración")
      setLoading(false)
      return
    }

    try {
      console.log("🔍 Información del usuario Auth0:", {
        sub: user.sub,
        email: user.email,
        name: user.name,
        fullUser: user,
      })

      const token = await getAccessTokenSilently()
      console.log("🔑 Token obtenido:", token.substring(0, 50) + "...")

      const response = await axios.get(`${process.env.BACKEND_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("✅ Respuesta del servidor:", response.data)

      if (response.data.isAdmin) {
        setIsAdmin(true)
        setUserProfile(response.data.user)
        setError(null)
        console.log("🎉 Acceso de admin concedido!")
      } else {
        setIsAdmin(false)
        setError("No tienes permisos de administrador para acceder a esta sección")
        console.log("❌ Usuario sin permisos de admin")
      }

      setDebugInfo({
        auth0User: user,
        serverResponse: response.data,
        tokenPreview: token.substring(0, 50) + "...",
      })
    } catch (error: any) {
      console.error("❌ Error verificando permisos:", error)
      setDebugInfo({
        auth0User: user,
        error: error.response?.data || error.message,
        status: error.response?.status,
        tokenPreview: "Error obteniendo token",
      })

      if (error.response?.status === 403) {
        setError("Usuario no autorizado. Contacta al administrador para obtener acceso.")
      } else if (error.response?.status === 401) {
        setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente")
      } else {
        setError("Error verificando permisos. Intenta nuevamente")
      }

      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${process.env.BACKEND_URL}/team`)
      setTeams(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchTournaments = async () => {
    try {
      const res = await axios.get(`${process.env.BACKEND_URL}/tournaments`)
      setTournaments(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchLiveMatches = async () => {
    try {
      const res = await axios.get(`${process.env.BACKEND_URL}/live-matches`)
      setLiveMatches(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  // Handlers para controlar partidos en vivo
  const handleMatchAction = async (id: string, action: string, body?: any) => {
    try {
      console.log(`Ejecutando acción ${action} para partido ${id}`, body)
      await axios.post(`${process.env.BACKEND_URL}/live-matches/${id}/${action}`, body)
      fetchLiveMatches()
      alert(`Acción ${action} ejecutada correctamente`)
    } catch (error) {
      console.error("Error en handleMatchAction:", error)
      alert("Error en la acción del partido")
    }
  }

  // Handlers para crear partido
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (matchFormData.teamA === matchFormData.teamB) {
      alert("Los equipos no pueden ser iguales")
      return
    }

    if (!matchFormData.tournament) {
      alert("Debes seleccionar un torneo")
      return
    }

    try {
      setIsSubmittingMatch(true)
      const token = await getAccessTokenSilently()
      await axios.post(
        `${process.env.BACKEND_URL}/live-matches`,
        { ...matchFormData, date: new Date() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      alert("Partido creado exitosamente")
      setMatchFormData({ teamA: "", teamB: "", scoreA: 0, scoreB: 0, tournament: "" })
      setShowMatchForm(false)
      fetchLiveMatches()
    } catch (e: any) {
      console.error(e)
      if (e.response && e.response.data && e.response.data.message) {
        alert(`Error: ${e.response.data.message}`)
      } else {
        alert("Error creando partido")
      }
    } finally {
      setIsSubmittingMatch(false)
    }
  }

  // Handlers para crear club
  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !clubFormData.name.trim() ||
      !clubFormData.abreviation.trim() ||
      !clubFormData.coach.trim() ||
      !clubFormData.stadium.trim()
    ) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    try {
      setIsSubmittingClub(true)
      await axios.post(`${process.env.BACKEND_URL}/team`, clubFormData)
      alert("Club creado correctamente")
      setClubFormData({
        name: "",
        abreviation: "",
        location: "",
        division: "",
        coach: "",
        stadium: "",
      })
      setShowClubForm(false)
      fetchTeams() // Actualizar lista de equipos
    } catch (error) {
      console.error("Error al crear el club:", error)
      alert("Ocurrió un error al guardar el club")
    } finally {
      setIsSubmittingClub(false)
    }
  }

  // Handlers para crear jugadores
  const updatePlayer = (index: number, updated: Partial<Player>) => {
    setPlayersFormData((prev) => ({
      ...prev,
      players: prev.players.map((player, i) => (i === index ? { ...player, ...updated } : player)),
    }))
  }

  const addPlayer = () => {
    setPlayersFormData((prev) => ({
      ...prev,
      players: [...prev.players, { firstName: "", lastName: "", number: 0, position: "" }],
    }))
  }

  const removePlayer = (index: number) => {
    setPlayersFormData((prev) => ({
      ...prev,
      players: prev.players.filter((_, i) => i !== index),
    }))
  }

  const handleCreatePlayers = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playersFormData.clubId) {
      alert("Selecciona un club")
      return
    }

    const incomplete = playersFormData.players.some(
      (p) => !p.firstName.trim() || !p.lastName.trim() || !p.position.trim() || p.number <= 0,
    )

    if (incomplete) {
      alert("Completa todos los campos de los jugadores")
      return
    }

    try {
      setIsSubmittingPlayers(true)
      const payload = playersFormData.players.map((p) => ({
        club: playersFormData.clubId,
        firstName: p.firstName,
        lastName: p.lastName,
        number: p.number,
        position: p.position,
      }))

      await axios.post(`${process.env.BACKEND_URL}/players/bulk`, payload)
      alert("Jugadores creados correctamente")
      setPlayersFormData({
        clubId: "",
        players: [{ firstName: "", lastName: "", number: 0, position: "" }],
      })
      setShowPlayersForm(false)
    } catch (err) {
      console.error("Error al crear jugadores:", err)
      alert("Error al crear jugadores")
    } finally {
      setIsSubmittingPlayers(false)
    }
  }

  // Handlers para crear torneo
  const toggleTeam = (teamId: string) => {
    setTournamentFormData((prev) => ({
      ...prev,
      selectedTeams: prev.selectedTeams.includes(teamId)
        ? prev.selectedTeams.filter((id) => id !== teamId)
        : [...prev.selectedTeams, teamId],
    }))
  }

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tournamentFormData.name.trim() || !tournamentFormData.type || !tournamentFormData.season.trim()) {
      alert("Completa al menos nombre, tipo y temporada")
      return
    }

    try {
      setIsSubmittingTournament(true)
      const payload = {
        name: tournamentFormData.name,
        type: tournamentFormData.type,
        season: tournamentFormData.season,
        description: tournamentFormData.description,
        startDate: tournamentFormData.startDate ? new Date(tournamentFormData.startDate) : null,
        endDate: tournamentFormData.endDate ? new Date(tournamentFormData.endDate) : null,
        teams: tournamentFormData.selectedTeams,
      }

      await axios.post(`${process.env.BACKEND_URL}/tournaments`, payload)
      alert("Torneo creado correctamente")
      setTournamentFormData({
        name: "",
        type: "",
        season: "",
        description: "",
        startDate: "",
        endDate: "",
        selectedTeams: [],
      })
      setShowTournamentForm(false)
      fetchTournaments() // Actualizar lista de torneos
    } catch (err) {
      console.error("Error al crear torneo:", err)
      alert("Error al crear torneo")
    } finally {
      setIsSubmittingTournament(false)
    }
  }

  const handleCreateScheduledMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (scheduledMatchFormData.teamA === scheduledMatchFormData.teamB) {
      alert("Los equipos no pueden ser iguales")
      return
    }

    if (!scheduledMatchFormData.tournament || !scheduledMatchFormData.date || !scheduledMatchFormData.time) {
      alert("Debes completar fecha, hora, equipos y torneo")
      return
    }

    try {
      setIsSubmittingScheduledMatch(true)
      const token = await getAccessTokenSilently()
      await axios.post(`${process.env.BACKEND_URL}/scheduled-matches`, scheduledMatchFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      alert("Partido programado exitosamente")
      setScheduledMatchFormData({
        date: "",
        time: "",
        teamA: "",
        teamB: "",
        tournament: "",
        stadium: "",
        referee: "",
        notes: "",
        matchday: 1,
        status: "scheduled",
      })
      setShowScheduledMatchForm(false)
    } catch (e: any) {
      console.error(e)
      if (e.response && e.response.data && e.response.data.message) {
        alert(`Error: ${e.response.data.message}`)
      } else {
        alert("Error programando partido")
      }
    } finally {
      setIsSubmittingScheduledMatch(false)
    }
  }

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

  useEffect(() => {
    checkAdminStatus()
    fetchTeams()
    fetchTournaments()
    fetchLiveMatches()
  }, [isAuthenticated, user])

  // Definición de todas las acciones administrativas
  const adminActions: AdminAction[] = [
    // Gestión
    {
      id: "manage-roles",
      title: "Administrar Roles",
      description: "Gestionar permisos y roles de usuarios",
      icon: <Crown className="h-6 w-6" />,
      route: "/admin/manage-roles",
      category: "management",
      priority: "high",
      status: "maintenance",
    },
    {
      id: "manage-users",
      title: "Gestionar Usuarios",
      description: "Ver y administrar todos los usuarios del sistema",
      icon: <Users className="h-6 w-6" />,
      route: "/admin/manage-users",
      category: "management",
      priority: "high",
      status: "maintenance",
    },
    {
      id: "manage-live-matches",
      title: "Controlar Partidos en Vivo",
      description: "Iniciar, pausar, suspender y controlar partidos en tiempo real",
      icon: <Zap className="h-6 w-6" />,
      route: "live-matches-control",
      category: "management",
      priority: "high",
      status: "active",
    },
    // Creación
    {
      id: "create-club",
      title: "Crear Club",
      description: "Registrar nuevos clubes en el sistema",
      icon: <Shield className="h-6 w-6" />,
      route: "/admin/create-club",
      category: "creation",
      priority: "high",
      status: "active",
    },
    {
      id: "create-players",
      title: "Gestionar Jugadores",
      description: "Agregar y administrar jugadores",
      icon: <UserPlus className="h-6 w-6" />,
      route: "/admin/create-players",
      category: "creation",
      priority: "medium",
      status: "active",
    },
    {
      id: "create-tournament",
      title: "Crear Torneos",
      description: "Configurar nuevos torneos y competencias",
      icon: <Trophy className="h-6 w-6" />,
      route: "/admin/create-tournament",
      category: "creation",
      priority: "high",
      status: "new",
    },
    {
      id: "schedule-matches",
      title: "Programar Partidos",
      description: "Crear calendario de partidos y fixtures",
      icon: <Calendar className="h-6 w-6" />,
      route: "/admin/schedule-matches",
      category: "creation",
      priority: "medium",
      status: "active",
    },
    {
      id: "create-match",
      title: "Crear Partido en Vivo",
      description: "Crear un nuevo partido para gestionar en tiempo real",
      icon: <Play className="h-6 w-6" />,
      route: "/admin/create-match",
      category: "creation",
      priority: "high",
      status: "active",
    },
    // Configuración
    {
      id: "database-management",
      title: "Gestión de Base de Datos",
      description: "Backup, restore y mantenimiento de datos",
      icon: <Database className="h-6 w-6" />,
      route: "/admin/database-management",
      category: "configuration",
      priority: "high",
      status: "maintenance",
    },
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "management":
        return <Crown className="h-5 w-5 text-purple-600" />
      case "creation":
        return <Plus className="h-5 w-5 text-green-600" />
      case "configuration":
        return <Settings className="h-5 w-5 text-blue-600" />
      case "reports":
        return <BarChart3 className="h-5 w-5 text-orange-600" />
      default:
        return <Shield className="h-5 w-5 text-gray-600" />
    }
  }

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "management":
        return "Gestión de Partidos"
      case "creation":
        return "Creación de Contenido"
      case "configuration":
        return "Configuración"
      case "reports":
        return "Reportes y Análisis"
      default:
        return "Otros"
    }
  }

  const getStatusBadgeAction = (status?: string) => {
    switch (status) {
      case "new":
        return <Badge variant="success">Nuevo</Badge>
      case "maintenance":
        return <Badge variant="warning">Mantenimiento</Badge>
      case "active":
        return <Badge variant="default">Activo</Badge>
      default:
        return null
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const handleGoalClick = async (matchId: string, team: "A" | "B", teamId: string) => {
    try {
      const res = await axios.get(`${process.env.BACKEND_URL}/players/lineup/${teamId}`)
      setTeamPlayers(res.data)
      setGoalFormData({
        matchId,
        team,
        teamId,
        playerId: "",
        customName: "",
        customNumber: "",
        assistId: "",
        assistCustomName: "",
        assistCustomNumber: "",
      })
      setShowCustomPlayer(false)
      setShowCustomAssist(false)
      setShowGoalForm(true)
    } catch (error) {
      console.error("Error al obtener jugadores:", error)
      alert("Error cargando jugadores")
    }
  }

  const confirmGoal = async () => {
    const body: any = { team: goalFormData.team, delta: 1 }

    if (goalFormData.playerId && goalFormData.playerId !== "custom") {
      body.scorerId = goalFormData.playerId
    } else if (goalFormData.customName) {
      body.scorerCustom = {
        firstName: goalFormData.customName,
        lastName: "",
        number: goalFormData.customNumber,
        team: goalFormData.teamId,
      }
    }

    if (goalFormData.assistId && goalFormData.assistId !== "custom") {
      body.assistId = goalFormData.assistId
    } else if (goalFormData.assistCustomName) {
      body.assistCustom = {
        firstName: goalFormData.assistCustomName,
        lastName: "",
        number: goalFormData.assistCustomNumber,
        team: goalFormData.teamId,
      }
    }

    try {
      await axios.put(`${process.env.BACKEND_URL}/live-matches/${goalFormData.matchId}/score`, body)
      setShowGoalForm(false)
      fetchLiveMatches()
      alert("Gol registrado correctamente")
    } catch (error) {
      console.error("Error al registrar goleador:", error)
      alert("Error registrando gol")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Verificando permisos...</h3>
            <p className="text-gray-500">Consultando con el servidor</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-red-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Acceso Restringido</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <div className="space-y-2">
              <Button variant="default" onClick={() => checkAdminStatus()}>
                Reintentar
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                Volver
              </Button>
            </div>
            {debugInfo && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                <h4 className="font-medium text-yellow-800 mb-2">🔧 Información de Debug:</h4>
                <div className="text-sm text-yellow-700 space-y-2">
                  <div>
                    <strong>Auth0 ID:</strong>{" "}
                    <code className="bg-yellow-100 px-1 rounded text-xs break-all">
                      {debugInfo.auth0User?.sub || "No disponible"}
                    </code>
                  </div>
                  <div>
                    <strong>Email:</strong>{" "}
                    <code className="bg-yellow-100 px-1 rounded">{debugInfo.auth0User?.email}</code>
                  </div>
                  <div>
                    <strong>Nombre:</strong>{" "}
                    <code className="bg-yellow-100 px-1 rounded">{debugInfo.auth0User?.name}</code>
                  </div>
                  {debugInfo.error && (
                    <div>
                      <strong>Error del servidor:</strong>
                      <pre className="bg-red-100 p-2 rounded text-xs mt-1 overflow-auto">
                        {JSON.stringify(debugInfo.error, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Permisos Insuficientes</h3>
            <p className="text-gray-500 mb-4">Necesitas permisos de administrador para acceder a esta sección</p>
            <p className="text-sm text-gray-400 mb-6">
              Si crees que esto es un error, contacta al administrador del sistema
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Agrupar acciones por categoría
  const groupedActions = adminActions.reduce(
    (acc, action) => {
      if (!acc[action.category]) {
        acc[action.category] = []
      }
      acc[action.category].push(action)
      return acc
    },
    {} as Record<string, AdminAction[]>,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Panel de Administración</h1>
              <p className="text-gray-600">Gestiona todos los aspectos del sistema de liga de fútbol</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="success" className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Administrador</span>
              </Badge>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">{user?.name}</div>
                <div className="text-xs text-gray-500">Sesión activa</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Funciones Disponibles</CardTitle>
              <Settings className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{adminActions.length}</div>
              <p className="text-xs text-gray-500">Herramientas administrativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Partidos Activos</CardTitle>
              <Zap className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{liveMatches.length}</div>
              <p className="text-xs text-gray-500">En el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">En Vivo</CardTitle>
              <Play className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {liveMatches.filter((m) => m.status === "live").length}
              </div>
              <p className="text-xs text-gray-500">Partidos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Equipos</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{teams.length}</div>
              <p className="text-xs text-gray-500">Registrados</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions Grid */}
        <div className="space-y-8">
          {Object.entries(groupedActions).map(([category, actions]) => (
            <div key={category}>
              <div className="flex items-center space-x-2 mb-6">
                {getCategoryIcon(category)}
                <h2 className="text-xl font-semibold text-gray-800">{getCategoryTitle(category)}</h2>
                <Badge variant="secondary">{actions.length}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actions.map((action) => (
                  <Card key={action.id} className="group hover:scale-105 transition-all duration-200 cursor-pointer">
                    <CardContent className="p-10 pt-12">
                      <div className="flex items-start justify-between mb-6 mt-2">
                        <div className="flex items-center space-x-5">
                          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl group-hover:from-blue-100 group-hover:to-indigo-200 transition-colors mt-1">
                            {action.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">{action.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              {getPriorityIcon(action.priority)}
                              <span className="text-xs text-gray-500 capitalize font-medium">{action.priority}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">{getStatusBadgeAction(action.status)}</div>
                      </div>

                      <p className="text-sm text-gray-600 mb-6 leading-relaxed">{action.description}</p>

                      <div className="flex justify-between items-center">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (action.id === "create-match") {
                              setShowMatchForm(true)
                            } else if (action.id === "create-club") {
                              setShowClubForm(true)
                            } else if (action.id === "create-players") {
                              setShowPlayersForm(true)
                            } else if (action.id === "create-tournament") {
                              setShowTournamentForm(true)
                            } else if (action.id === "schedule-matches") {
                              setShowScheduledMatchForm(true)
                            } else if (action.id === "manage-live-matches") {
                              setShowLiveMatchesControl(true)
                            } else {
                              alert(`Navegando a: ${action.route}`)
                            }
                          }}
                          disabled={action.status === "maintenance"}
                          className="group-hover:bg-blue-700 transition-colors"
                        >
                          {action.status === "maintenance" ? "En Mantenimiento" : "Acceder"}
                        </Button>
                        <span className="text-xs text-gray-400 font-mono">#{action.id}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal para controlar partidos en vivo */}
        {showLiveMatchesControl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-6 w-6 text-red-600" />
                    <span>Control de Partidos en Vivo</span>
                  </CardTitle>
                  <Button variant="outline" onClick={() => setShowLiveMatchesControl(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {liveMatches.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay partidos activos</h3>
                    <p className="text-gray-500">Crea un nuevo partido para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {liveMatches.map((match) => (
                      <div key={match._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {match.teamA.name} vs {match.teamB.name}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              {getStatusBadge(match.status)}
                              <Badge variant="secondary">{match.tournament.name}</Badge>
                            </div>
                          </div>
                          <div className="text-3xl font-bold text-gray-800">
                            {match.scoreA} - {match.scoreB}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {match.status === "not_started" && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleMatchAction(match._id, "start")}
                              className="flex items-center space-x-2"
                            >
                              <Play className="h-4 w-4" />
                              <span>Iniciar</span>
                            </Button>
                          )}
                          {match.status === "live" && (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleMatchAction(match._id, "pause")}
                              className="flex items-center space-x-2"
                            >
                              <Pause className="h-4 w-4" />
                              <span>Pausar</span>
                            </Button>
                          )}
                          {match.status === "paused" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleMatchAction(match._id, "resume")}
                              className="flex items-center space-x-2"
                            >
                              <Play className="h-4 w-4" />
                              <span>Reanudar</span>
                            </Button>
                          )}
                          {["live", "paused"].includes(match.status) && (
                            <>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleMatchAction(match._id, "suspend")}
                                className="flex items-center space-x-2"
                              >
                                <AlertTriangle className="h-4 w-4" />
                                <span>Suspender</span>
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleMatchAction(match._id, "stage", { stage: "extra_time" })}
                                className="flex items-center space-x-2"
                              >
                                <Timer className="h-4 w-4" />
                                <span>Alargue</span>
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleMatchAction(match._id, "stage", { stage: "penalties" })}
                                className="flex items-center space-x-2"
                              >
                                <Target className="h-4 w-4" />
                                <span>Penales</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMatchAction(match._id, "finish")}
                                className="flex items-center space-x-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span>Finalizar</span>
                              </Button>
                            </>
                          )}
                          {match.status === "live" && (
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleGoalClick(match._id, "A", match.teamA._id)}
                                className="flex items-center space-x-1"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Gol {match.teamA.name}</span>
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleGoalClick(match._id, "B", match.teamB._id)}
                                className="flex items-center space-x-1"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Gol {match.teamB.name}</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resto de modales existentes... */}
        {/* Modal para crear partido */}
        {showMatchForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Crear Nuevo Partido</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateMatch} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipo A</label>
                    <Select
                      value={matchFormData.teamA}
                      onChange={(e) => setMatchFormData({ ...matchFormData, teamA: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar equipo</option>
                      {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipo B</label>
                    <Select
                      value={matchFormData.teamB}
                      onChange={(e) => setMatchFormData({ ...matchFormData, teamB: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar equipo</option>
                      {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Torneo</label>
                    <Select
                      value={matchFormData.tournament}
                      onChange={(e) => setMatchFormData({ ...matchFormData, tournament: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar torneo</option>
                      {tournaments.map((tournament) => (
                        <option key={tournament._id} value={tournament._id}>
                          {tournament.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Goles Equipo A</label>
                      <Input
                        type="number"
                        min="0"
                        value={matchFormData.scoreA}
                        onChange={(e) =>
                          setMatchFormData({ ...matchFormData, scoreA: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Goles Equipo B</label>
                      <Input
                        type="number"
                        min="0"
                        value={matchFormData.scoreB}
                        onChange={(e) =>
                          setMatchFormData({ ...matchFormData, scoreB: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" disabled={isSubmittingMatch} className="flex-1">
                      {isSubmittingMatch ? "Creando..." : "Crear Partido"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowMatchForm(false)} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Los demás modales permanecen igual... */}
        {/* Modal para crear club */}
        {showClubForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  <span>Crear Nuevo Club</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateClub} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Club *</label>
                    <Input
                      value={clubFormData.name}
                      onChange={(e) => setClubFormData({ ...clubFormData, name: e.target.value })}
                      placeholder="Ej: River Plate"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abreviatura *</label>
                    <Input
                      value={clubFormData.abreviation}
                      onChange={(e) => setClubFormData({ ...clubFormData, abreviation: e.target.value })}
                      placeholder="Ej: RIV"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={clubFormData.location}
                        onChange={(e) => setClubFormData({ ...clubFormData, location: e.target.value })}
                        placeholder="Ciudad o región"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">División</label>
                    <div className="relative">
                      <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={clubFormData.division}
                        onChange={(e) => setClubFormData({ ...clubFormData, division: e.target.value })}
                        placeholder="Ej: Primera División"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entrenador *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={clubFormData.coach}
                        onChange={(e) => setClubFormData({ ...clubFormData, coach: e.target.value })}
                        placeholder="Nombre del entrenador"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estadio *</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={clubFormData.stadium}
                        onChange={(e) => setClubFormData({ ...clubFormData, stadium: e.target.value })}
                        placeholder="Nombre del estadio"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" disabled={isSubmittingClub} className="flex-1">
                      {isSubmittingClub ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Crear Club
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowClubForm(false)} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal para crear jugadores */}
        {showPlayersForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                  <span>Crear Jugadores</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePlayers} className="space-y-6">
                  {/* Selección del Club */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Club *</label>
                    <Select
                      value={playersFormData.clubId}
                      onChange={(e) => setPlayersFormData({ ...playersFormData, clubId: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar club</option>
                      {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Jugadores */}
                  <div className="space-y-4">
                    {playersFormData.players.map((player, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-800">Jugador #{index + 1}</h4>
                          {playersFormData.players.length > 1 && (
                            <Button type="button" variant="destructive" size="sm" onClick={() => removePlayer(index)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <Input
                              value={player.firstName}
                              onChange={(e) => updatePlayer(index, { firstName: e.target.value })}
                              placeholder="Nombre"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                            <Input
                              value={player.lastName}
                              onChange={(e) => updatePlayer(index, { lastName: e.target.value })}
                              placeholder="Apellido"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                            <Input
                              type="number"
                              min={1}
                              value={player.number}
                              onChange={(e) => updatePlayer(index, { number: +e.target.value })}
                              placeholder="Número de camiseta"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Posición</label>
                            <Select
                              value={player.position}
                              onChange={(e) => updatePlayer(index, { position: e.target.value })}
                              required
                            >
                              <option value="">Seleccionar posición</option>
                              <option value="Delantero">Delantero</option>
                              <option value="Mediocampista">Mediocampista</option>
                              <option value="Defensor">Defensor</option>
                              <option value="Portero">Portero</option>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPlayer}
                      className="flex items-center space-x-2 bg-transparent"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Añadir otro jugador</span>
                    </Button>

                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={isSubmittingPlayers || !playersFormData.clubId}
                        className="flex items-center space-x-2"
                      >
                        {isSubmittingPlayers ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Guardando...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Guardar jugadores</span>
                          </>
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowPlayersForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal para crear torneo */}
        {showTournamentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  <span>Crear Nuevo Torneo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTournament} className="space-y-6">
                  {/* Información del Torneo */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Datos del Torneo</h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <Input
                        value={tournamentFormData.name}
                        onChange={(e) => setTournamentFormData({ ...tournamentFormData, name: e.target.value })}
                        placeholder="Nombre del torneo"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                      <Select
                        value={tournamentFormData.type}
                        onChange={(e) => setTournamentFormData({ ...tournamentFormData, type: e.target.value })}
                        required
                      >
                        <option value="">Seleccionar tipo</option>
                        <option value="copa">Copa</option>
                        <option value="liga">Liga</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Temporada *</label>
                      <Input
                        value={tournamentFormData.season}
                        onChange={(e) => setTournamentFormData({ ...tournamentFormData, season: e.target.value })}
                        placeholder="Ej: 2025/2026"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <Input
                        value={tournamentFormData.description}
                        onChange={(e) => setTournamentFormData({ ...tournamentFormData, description: e.target.value })}
                        placeholder="Opcional"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
                        <Input
                          type="date"
                          value={tournamentFormData.startDate}
                          onChange={(e) => setTournamentFormData({ ...tournamentFormData, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
                        <Input
                          type="date"
                          value={tournamentFormData.endDate}
                          onChange={(e) => setTournamentFormData({ ...tournamentFormData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Selección de Equipos */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Equipos Participantes</h4>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-2">
                      {teams.map((team) => (
                        <div key={team._id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={tournamentFormData.selectedTeams.includes(team._id)}
                            onChange={() => toggleTeam(team._id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-800">{team.name}</span>
                        </div>
                      ))}
                      {teams.length === 0 && <p className="text-gray-500 text-sm">No hay equipos disponibles.</p>}
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex space-x-2 pt-4">
                    <Button
                      type="submit"
                      disabled={
                        isSubmittingTournament ||
                        !tournamentFormData.name.trim() ||
                        !tournamentFormData.type ||
                        !tournamentFormData.season.trim()
                      }
                      className="flex-1"
                    >
                      {isSubmittingTournament ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Guardar Torneo
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTournamentForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal para programar partidos */}
        {showScheduledMatchForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <span>Programar Nuevo Partido</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateScheduledMatch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                      <Input
                        type="date"
                        value={scheduledMatchFormData.date}
                        onChange={(e) => setScheduledMatchFormData({ ...scheduledMatchFormData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
                      <Input
                        type="time"
                        value={scheduledMatchFormData.time}
                        onChange={(e) => setScheduledMatchFormData({ ...scheduledMatchFormData, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipo A *</label>
                    <Select
                      value={scheduledMatchFormData.teamA}
                      onChange={(e) => setScheduledMatchFormData({ ...scheduledMatchFormData, teamA: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar equipo</option>
                      {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipo B *</label>
                    <Select
                      value={scheduledMatchFormData.teamB}
                      onChange={(e) => setScheduledMatchFormData({ ...scheduledMatchFormData, teamB: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar equipo</option>
                      {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Torneo *</label>
                    <Select
                      value={scheduledMatchFormData.tournament}
                      onChange={(e) =>
                        setScheduledMatchFormData({ ...scheduledMatchFormData, tournament: e.target.value })
                      }
                      required
                    >
                      <option value="">Seleccionar torneo</option>
                      {tournaments.map((tournament) => (
                        <option key={tournament._id} value={tournament._id}>
                          {tournament.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estadio</label>
                    <Input
                      value={scheduledMatchFormData.stadium}
                      onChange={(e) =>
                        setScheduledMatchFormData({ ...scheduledMatchFormData, stadium: e.target.value })
                      }
                      placeholder="Nombre del estadio"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Árbitro</label>
                    <Input
                      value={scheduledMatchFormData.referee}
                      onChange={(e) =>
                        setScheduledMatchFormData({ ...scheduledMatchFormData, referee: e.target.value })
                      }
                      placeholder="Nombre del árbitro"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jornada</label>
                      <Input
                        type="number"
                        min="1"
                        value={scheduledMatchFormData.matchday}
                        onChange={(e) =>
                          setScheduledMatchFormData({
                            ...scheduledMatchFormData,
                            matchday: Number.parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <Select
                        value={scheduledMatchFormData.status}
                        onChange={(e) =>
                          setScheduledMatchFormData({ ...scheduledMatchFormData, status: e.target.value })
                        }
                      >
                        <option value="scheduled">Programado</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="postponed">Pospuesto</option>
                        <option value="cancelled">Cancelado</option>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                    <Input
                      value={scheduledMatchFormData.notes}
                      onChange={(e) => setScheduledMatchFormData({ ...scheduledMatchFormData, notes: e.target.value })}
                      placeholder="Notas adicionales (opcional)"
                    />
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" disabled={isSubmittingScheduledMatch} className="flex-1">
                      {isSubmittingScheduledMatch ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Programando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Programar Partido
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowScheduledMatchForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de goleador */}
        {showGoalForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">¿Quién hizo el gol?</h3>
                <button
                  onClick={() => setShowGoalForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Goleador */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goleador</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={goalFormData.playerId}
                    onChange={(e) => {
                      const sel = e.target.value
                      setGoalFormData({ ...goalFormData, playerId: sel })
                      setShowCustomPlayer(sel === "custom")
                    }}
                  >
                    <option value="">Seleccionar jugador</option>
                    {teamPlayers.map((p) => (
                      <option key={p._id} value={p._id}>
                        #{p.number} - {p.firstName} {p.lastName}
                      </option>
                    ))}
                    <option value="custom">Otro jugador...</option>
                  </select>
                </div>

                {showCustomPlayer && (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre del jugador"
                      value={goalFormData.customName}
                      onChange={(e) => setGoalFormData({ ...goalFormData, customName: e.target.value })}
                    />
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Número del jugador"
                      value={goalFormData.customNumber}
                      onChange={(e) => setGoalFormData({ ...goalFormData, customNumber: e.target.value })}
                    />
                  </div>
                )}

                {/* Asistencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asistencia (opcional)</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={goalFormData.assistId || ""}
                    onChange={(e) => {
                      const sel = e.target.value
                      setGoalFormData({ ...goalFormData, assistId: sel })
                      setShowCustomAssist(sel === "custom")
                    }}
                  >
                    <option value="">Sin asistencia</option>
                    {teamPlayers.map((p) => (
                      <option key={p._id} value={p._id}>
                        #{p.number} - {p.firstName} {p.lastName}
                      </option>
                    ))}
                    <option value="custom">Otro jugador...</option>
                  </select>
                </div>

                {showCustomAssist && (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre del jugador asistente"
                      value={goalFormData.assistCustomName || ""}
                      onChange={(e) => setGoalFormData({ ...goalFormData, assistCustomName: e.target.value })}
                    />
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Número del jugador asistente"
                      value={goalFormData.assistCustomNumber || ""}
                      onChange={(e) => setGoalFormData({ ...goalFormData, assistCustomNumber: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 p-6 border-t">
                <Button variant="outline" onClick={() => setShowGoalForm(false)}>
                  Cancelar
                </Button>
                <Button variant="success" onClick={confirmGoal}>
                  Confirmar Gol
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
