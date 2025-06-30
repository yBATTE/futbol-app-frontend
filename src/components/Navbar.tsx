"use client"

import React from "react"
import { Link } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import { Trophy, User, LogOut, LogIn, Menu, X, Shield } from "lucide-react"

// Componentes UI inline (los mismos del inicio)
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

const Badge = ({
  children,
  variant = "default",
  className = "",
}: { children: React.ReactNode; variant?: "default" | "secondary" | "success"; className?: string }) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
  }
  return <span className={`${baseClasses} ${variants[variant]} ${className}`}>{children}</span>
}

const Navbar = () => {
  const { isAuthenticated, user, logout, loginWithRedirect } = useAuth0()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <Trophy className="h-8 w-8 text-blue-600" />
            <Link to="/inicio" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
              Liga Manager
            </Link>
          </div>

          {/* Navegación desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/inicio">
              <Button variant="ghost" className="text-gray-700">
                Inicio
              </Button>
            </Link>

            <Link to="/history">
              <Button variant="ghost" className="text-gray-700">
                Historial
              </Button>
            </Link>

            <Link to="/lineup">
              <Button variant="ghost" className="text-gray-700">
                Alineaciones
              </Button>
            </Link>

            {isAuthenticated && (
              <Link to="/live">
                <Button variant="ghost" className="text-gray-700 relative">
                  Partidos en Vivo
                  <Badge variant="default" className="ml-2 animate-pulse">
                    LIVE
                  </Badge>
                </Button>
              </Link>
            )}

            {/* Solo mostrar Admin Panel si el usuario es admin */}
            {isAuthenticated && (
              <Link to="/admin/dashboard">
                <Button variant="ghost" className="text-gray-700 relative">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </div>
                </Button>
              </Link>
            )}
          </div>

          {/* Sección de usuario desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Perfil de usuario con indicador de admin */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  {user.picture ? (
                    <img
                      src={user.picture || "/placeholder.svg"}
                      alt="Perfil"
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">{user.name || user.nickname}</span>
                  </div>
                </Link>

                {/* Botón cerrar sesión */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => logout({ returnTo: window.location.origin })}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </Button>
              </>
            ) : (
              <Button onClick={() => loginWithRedirect()} className="flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>Iniciar sesión</span>
              </Button>
            )}
          </div>

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="text-gray-700">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Enlaces de navegación móvil */}
              <Link
                to="/inicio"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </Link>

              <Link
                to="/history"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Historial
              </Link>

              <Link
                to="/lineup"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Alineaciones
              </Link>

              {isAuthenticated && (
                <Link
                  to="/live"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center justify-between">
                    Partidos en Vivo
                    <Badge variant="default" className="animate-pulse">
                      LIVE
                    </Badge>
                  </div>
                </Link>
              )}

              {/* Solo mostrar Admin Panel en móvil si es admin */}
              {isAuthenticated && (
                <Link
                  to="/admin/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </div>
                </Link>
              )}

              {/* Sección de usuario móvil */}
              <div className="border-t pt-4 mt-4">
                {isAuthenticated && user ? (
                  <>
                    {/* Perfil móvil */}
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {user.picture ? (
                        <img
                          src={user.picture || "/placeholder.svg"}
                          alt="Perfil"
                          className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{user.name || user.nickname}</span>
                      </div>
                    </Link>

                    {/* Cerrar sesión móvil */}
                    <button
                      onClick={() => {
                        logout({ returnTo: window.location.origin })
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors mt-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      loginWithRedirect()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Iniciar sesión</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
