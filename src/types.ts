import { ReactNode } from "react"

export interface Player {
  [x: string]: ReactNode
  _id: string
  firstName: string
  lastName: string
  number: number
  team: string
  goals: number
  assists: number
  matchesPlayed: number
}

export interface Goal {
  _id: string
  player: Player
  assist?: Player | null
  minute: number
  team: string
}

export interface Team {
  _id: string
  name: string
  abreviation: string
  players: Player[]
}

export interface Match {
  _id: string
  date: string
  teamA: Team
  teamB: Team
  scoreA: number
  scoreB: number
  goals: Goal[]
}
