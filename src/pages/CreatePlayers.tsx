"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { UserPlus, Plus, Minus, CheckCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Select, Badge } from "../components/UI"

const CreatePlayers = () => {
  const navigate = useNavigate()

  const [clubId, setClubId] = useState<string>("")
  const [clubs, setClubs] = useState<{ _id: string; name: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [players, setPlayers] = useState<
    {
      firstName: string
      lastName: string
      number: number
      position: string
    }[]
  >([
    { firstName: "", lastName: "", number: 0, position: "" },
  ])

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/team`)
        setClubs(res.data)
      } catch (err) {
        console.error("Error al traer los clubes:", err)
      }
    }
    fetchClubs()
  }, [])

  const updatePlayer = (
    index: number,
    updated: Partial<{
      firstName: string
      lastName: string
      number: number
      position: string
    }>
  ) => {
    setPlayers((prev) => {
      const newPlayers = [...prev]
      newPlayers[index] = { ...newPlayers[index], ...updated }
      return newPlayers
    })
  }

  const addPlayer = () => {
    setPlayers((prev) => [...prev, { firstName: "", lastName: "", number: 0, position: "" }])
  }

  const removePlayer = (index: number) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index))
  }

  const submit = async () => {
    if (!clubId) {
      alert("Selecciona un club")
      return
    }

    const incomplete = players.some(
      (p) => !p.firstName.trim() || !p.lastName.trim() || !p.position.trim() || p.number <= 0
    )
    if (incomplete) {
      alert("Completa todos los campos de los jugadores")
      return
    }

    try {
      setIsSubmitting(true)
      const payload = players.map((p) => ({
        club: clubId,
        firstName: p.firstName,
        lastName: p.lastName,
        number: p.number,
        position: p.position,
      }))

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/players/bulk`, payload)

      alert("Jugadores creados correctamente")
      navigate("/inicio")
    } catch (err) {
      console.error("Error al crear jugadores:", err)
      alert("Error al crear jugadores")
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
            <UserPlus className="h-8 w-8 text-blue-600" />
            <span>Crear Jugadores</span>
          </h1>
          <p className="text-gray-600">Agrega uno o más jugadores al club seleccionado</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Selección del Club */}
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Club</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={clubId} onChange={(e) => setClubId(e.target.value)} required>
                <option value="">Seleccionar club</option>
                {clubs.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </CardContent>
          </Card>

          {/* Jugadores */}
          {players.map((player, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Jugador #{index + 1}</span>
                  {players.length > 1 && (
                    <Button variant="destructive" size="sm" onClick={() => removePlayer(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              </CardContent>
            </Card>
          ))}

          {/* Acciones */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={addPlayer} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Añadir otro jugador</span>
            </Button>
            <Button
              variant="success"
              size="lg"
              onClick={submit}
              disabled={isSubmitting || !clubId}
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
                  <span>Guardar jugadores</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CreatePlayers
