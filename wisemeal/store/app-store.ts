'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
  id: string
  name: string
  age: number
  gender: string
  heightCm: number
  weightKg: number
  goalWeightKg: number
  activityLevel: string
  goal: string
  allergies: string[]
  dietaryRestrictions: string[]
  dailyCalorieGoal: number
  proteinGoalG: number
  carbGoalG: number
  fatGoalG: number
  waterGoalMl: number
}

interface AppState {
  user: UserProfile | null
  selectedDate: string
  setUser: (user: UserProfile) => void
  clearUser: () => void
  setSelectedDate: (date: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      selectedDate: new Date().toISOString().split('T')[0],
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setSelectedDate: (date) => set({ selectedDate: date }),
    }),
    { name: 'wisemeal-store' }
  )
)
