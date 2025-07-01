"use client"

import React, { useState } from "react"
import axios from "axios"
import { Trophy, Users, MapPin, Flag, User, Building, AlertCircle, CheckCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, Input, Select, Button, Badge } from "../components/UI"


// Tus componentes UI (Button, Card, Input, etc.) deberían estar importados aquí
// Si los tienes en otro archivo, importa desde allí

const CreateClub: React.FC = () => {
  const [name, setName] = useState("")
  const [abreviation, setAbreviation] = useState("")
  const [location, setLocation] = useState("")
  const [division, setDivision] = useState("")
  const [coach, setCoach] = useState("")
  const [stadium, setStadium] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !abreviation.trim() || !coach.trim() || !stadium.trim()) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    const newTeam = {
      name,
      abreviation,
      location,
      division,
      coach,
      stadium,
    }

    try {
      setIsSubmitting(true)
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/team`, newTeam)
      alert("Club creado correctamente")

      // Reset form
      setName("")
      setAbreviation("")
      setLocation("")
      setDivision("")
      setCoach("")
      setStadium("")
    } catch (error) {
      console.error("Error al crear el club:", error)
      alert("Ocurrió un error al guardar el club")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Crear Club</h1>
          <p className="text-gray-600">Completa los datos para registrar un nuevo club</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <span>Información del Club</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Club *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: River Plate"
                  required
                />
              </div>

              {/* Abreviatura */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Abreviatura *</label>
                <Input
                  value={abreviation}
                  onChange={(e) => setAbreviation(e.target.value)}
                  placeholder="Ej: RIV"
                  required
                />
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ciudad o región"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* División */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">División</label>
                <div className="relative">
                  <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    placeholder="Ej: Primera División"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Entrenador */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entrenador *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={coach}
                    onChange={(e) => setCoach(e.target.value)}
                    placeholder="Nombre del entrenador"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Estadio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estadio *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={stadium}
                    onChange={(e) => setStadium(e.target.value)}
                    placeholder="Nombre del estadio"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botón de guardar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Los campos marcados con * son obligatorios</span>
                </div>
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
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
                      <span>Crear Club</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default CreateClub
