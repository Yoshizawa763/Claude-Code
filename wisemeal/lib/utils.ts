import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd')
}

export function formatDateJa(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'M月d日(E)', { locale: ja })
}

export function today(): string {
  return formatDate(new Date())
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string
): number {
  if (gender === 'male') {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
  }
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }
  return Math.round(bmr * (multipliers[activityLevel] || 1.55))
}

export function calculateDailyCalories(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string,
  activityLevel: string,
  goal: string
): { calories: number; protein: number; carbs: number; fat: number } {
  const bmr = calculateBMR(weightKg, heightCm, age, gender)
  const tdee = calculateTDEE(bmr, activityLevel)

  let calories = tdee
  if (goal === 'lose_weight') calories = tdee - 500
  if (goal === 'gain_muscle') calories = tdee + 300

  const protein = Math.round(weightKg * 1.8)
  const fat = Math.round((calories * 0.25) / 9)
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4)

  return { calories: Math.round(calories), protein, carbs, fat }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function parseJsonSafe<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}
