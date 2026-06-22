'use client'
import NavBar from './NavBar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-white relative">
      <main className="pb-20">{children}</main>
      <NavBar />
    </div>
  )
}
