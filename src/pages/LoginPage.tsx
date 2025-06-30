// src/pages/LoginPage.tsx
import React, { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
  const { loginWithRedirect, isAuthenticated, logout, user } = useAuth0()
  const navigate = useNavigate()

  // Redirigir a /inicio si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/inicio')
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md text-center w-80">
          <h2 className="text-xl font-bold mb-2">¡Hola, {user?.name}!</h2>
          {user?.picture && (
            <img
              src={user.picture}
              alt="Foto de perfil"
              className="w-20 h-20 rounded-full mx-auto mb-4"
            />
          )}
          <p className="text-gray-600 mb-4">Redirigiendo...</p>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center w-80">
        <h1 className="text-2xl font-bold mb-4">Bienvenido a Fútbol App ⚽</h1>
        <p className="text-gray-600 mb-4">Iniciá sesión para continuar</p>
        <button
          onClick={() => loginWithRedirect()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  )
}

export default LoginPage
