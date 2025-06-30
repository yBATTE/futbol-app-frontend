import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import AddMatch from './pages/AddMatch'
import MatchHistory from './pages/MatchHistory'
import TeamLineup from './pages/TeamLineup'
import LiveMatches from './pages/LiveMatches'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import Profile from './pages/Profile'
import Inicio from './pages/Inicio'

import { Match } from './types'
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import CreateClub from './pages/CreateClub'
import CreatePlayers from './pages/CreatePlayers'
import CreateTournament from './pages/CreateTournament'

function App() {
  const [matches, setMatches] = useState<Match[]>([])

  const addMatch = (match: Match) => {
    setMatches(prev => [...prev, match])
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* Acceso público */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/history" element={<MatchHistory />} />
        <Route path="/lineup" element={<TeamLineup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-club" element={<CreateClub />} />
        <Route path="/admin/create-players" element={<CreatePlayers />} />
        <Route path="/admin/create-tournament" element={<CreateTournament />} />

        {/* Acceso restringido (logueado) */}
        <Route
          path="/live"
          element={
            <ProtectedRoute>
              <LiveMatches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addMatch"
          element={
            <ProtectedRoute>
              <AddMatch onAddMatch={addMatch} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
