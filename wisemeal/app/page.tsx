'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'

export default function RootPage() {
  const router = useRouter()
  const user = useAppStore(s => s.user)

  useEffect(() => {
    if (user) {
      router.replace('/dashboard')
    } else {
      router.replace('/onboarding')
    }
  }, [user, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-emerald-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🥗</div>
        <h1 className="text-2xl font-bold text-emerald-700">WiseMeal</h1>
        <p className="text-gray-500 mt-2">読み込み中...</p>
      </div>
    </div>
  )
}
