"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Trophy, Plus, CheckCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Select } from "../components/UI"

const CreateTournament = () => {
  const navigate = useNavigate()

  const [teams, setTeams] = useState<{ _id: string; name: string }[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [season, setSeason] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/team`)
        setTeams(res.data)
      } catch (err) {
        console.error("Error al traer los equipos:", err)
      }
    }
    fetchTeams()
  }, [])

  const toggleTeam = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    )
  }

  const submit = async () => {
    if (!name.trim() || !type || !season.trim()) {
      alert("Completa al menos nombre, tipo y temporada")
      return
    }

    try {
      setIsSubmitting(true)

      const payload = {
        name,
        type,
        season,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        teams: selectedTeams,
      }

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/tournaments`, payload)

      alert("Torneo creado correctamente")
      navigate("/inicio")
    } catch (err) {
      console.error("Error al crear torneo:", err)
      alert("Error al crear torneo")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <span>Crear Torneo</span>
          </h1>
          <p className="text-gray-600">Define los detalles del torneo y asigna equipos participantes</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Información del Torneo */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Torneo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del torneo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="copa">copa</option>
                  <option value="liga">liga</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporada</label>
                <Input
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  placeholder="Ej: 2025/2026"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selección de Equipos */}
          <Card>
            <CardHeader>
              <CardTitle>Equipos Participantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {teams.map((team) => (
                <div key={team._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTeams.includes(team._id)}
                    onChange={() => toggleTeam(team._id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-800">{team.name}</span>
                </div>
              ))}
              {teams.length === 0 && (
                <p className="text-gray-500 text-sm">No hay equipos disponibles.</p>
              )}
            </CardContent>
          </Card>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <Button
              variant="success"
              size="lg"
              onClick={submit}
              disabled={isSubmitting || !name.trim() || !type || !season.trim()}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Guardar Torneo</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CreateTournament
