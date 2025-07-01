"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import axios from "axios"
import { User, Mail, Key, LogOut, Shield, CheckCircle, AlertCircle, Settings, Camera } from "lucide-react"

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
}: {
  children: React.ReactNode
  variant?: "default" | "ghost" | "outline" | "destructive" | "secondary"
  size?: "default" | "sm" | "lg"
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
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
  }
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-12 px-6 text-base",
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

const Profile: React.FC = () => {
  const { user, isAuthenticated, logout, getAccessTokenSilently } = useAuth0()
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const [syncMessage, setSyncMessage] = useState("")

  useEffect(() => {
    const syncUser = async () => {
      try {
        setSyncStatus("syncing")
        setSyncMessage("Sincronizando perfil...")

        const token = await getAccessTokenSilently()

        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/users`,
          {
            auth0Id: user?.sub,
            email: user?.email,
            name: user?.name,
            picture: user?.picture,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        console.log("🟢 Usuario sincronizado con el backend")
        setSyncStatus("success")
        setSyncMessage("Perfil sincronizado correctamente")

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          setSyncStatus("idle")
          setSyncMessage("")
        }, 3000)
      } catch (err) {
        console.error("🔴 Error al sincronizar usuario:", err)
        setSyncStatus("error")
        setSyncMessage("Error al sincronizar el perfil")

        // Limpiar mensaje después de 5 segundos
        setTimeout(() => {
          setSyncStatus("idle")
          setSyncMessage("")
        }, 5000)
      }
    }

    if (isAuthenticated && user) {
      syncUser()
    }
  }, [isAuthenticated, user, getAccessTokenSilently])

  const handleChangePassword = () => {
    window.location.href = `https://${import.meta.env.VITE_AUTH0_DOMAIN}/u/change-password`
  }

const handleLogout = () => {
  logout({ logoutParams: { returnTo: window.location.origin } });
}

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Acceso Requerido</h3>
            <p className="text-gray-500">Necesitas iniciar sesión para ver tu perfil</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Estado de sincronización */}
          {syncStatus !== "idle" && (
            <Card
              className={`border-l-4 ${
                syncStatus === "success"
                  ? "border-green-500 bg-green-50"
                  : syncStatus === "error"
                    ? "border-red-500 bg-red-50"
                    : "border-blue-500 bg-blue-50"
              }`}
            >
              <CardContent className="pt-4">
                <div className="flex items-center space-x-3">
                  {syncStatus === "syncing" && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                  {syncStatus === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {syncStatus === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}
                  <span
                    className={`text-sm font-medium ${
                      syncStatus === "success"
                        ? "text-green-800"
                        : syncStatus === "error"
                          ? "text-red-800"
                          : "text-blue-800"
                    }`}
                  >
                    {syncMessage}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del perfil */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                {/* Foto de perfil */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {user.picture ? (
                      <img
                        src={user.picture || "/placeholder.svg"}
                        alt={user.name || "Perfil"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <User className="h-16 w-16 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* Nombre y estado */}
                <div className="text-center">
                  <CardTitle className="text-gray-800">{user.name || "Usuario"}</CardTitle>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <Badge variant="success">Cuenta Verificada</Badge>
                    <Badge variant="default">Administrador</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Detalles de la cuenta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Información personal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-6 w-6 text-blue-600" />
                  <span>Información Personal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nombre */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Nombre completo</div>
                      <div className="font-medium text-gray-800">{user.name || "No especificado"}</div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Correo electrónico</div>
                      <div className="font-medium text-gray-800">{user.email}</div>
                    </div>
                  </div>
                  {user.email_verified && <Badge variant="success">Verificado</Badge>}
                </div>

                {/* ID de usuario */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">ID de usuario</div>
                      <div className="font-mono text-sm text-gray-800">{user.sub}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuración de cuenta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-6 w-6 text-gray-600" />
                  <span>Configuración de Cuenta</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cambiar contraseña */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Key className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Contraseña</div>
                        <div className="text-sm text-gray-500">Actualiza tu contraseña de acceso</div>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleChangePassword} className="flex items-center space-x-2">
                      <Key className="h-4 w-4" />
                      <span>Cambiar</span>
                    </Button>
                  </div>
                </div>

                {/* Información de sesión */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div className="font-medium text-blue-800">Estado de la sesión</div>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>• Sesión activa y segura</div>
                    <div>• Última sincronización: {new Date().toLocaleString()}</div>
                    <div>• Proveedor: Auth0</div>
                  </div>
                </div>

                {/* Cerrar sesión */}
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <LogOut className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-red-800">Cerrar sesión</div>
                        <div className="text-sm text-red-600">Salir de tu cuenta de forma segura</div>
                      </div>
                    </div>
                    <Button variant="destructive" onClick={handleLogout} className="flex items-center space-x-2">
                      <LogOut className="h-4 w-4" />
                      <span>Salir</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas de actividad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-green-600" />
                <span>Actividad Reciente</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">5</div>
                  <div className="text-sm text-blue-800">Partidos creados</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-sm text-green-800">Sesiones activas</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">3</div>
                  <div className="text-sm text-purple-800">Equipos gestionados</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Profile
