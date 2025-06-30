// src/components/ProtectedRoute.tsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

interface Props {
  children: JSX.Element
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return <div className="p-4">Cargando autenticación...</div>
  }

if (!isAuthenticated) {
    return <div className="p-4">Necesitas autenticarte para acceder a esta página.</div>
}

  return children
}

export default ProtectedRoute
