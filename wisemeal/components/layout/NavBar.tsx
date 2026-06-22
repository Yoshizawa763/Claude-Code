'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'ホーム' },
  { href: '/log', icon: '📷', label: '記録' },
  { href: '/diary', icon: '📅', label: '日記' },
  { href: '/health', icon: '💧', label: '健康' },
  { href: '/insights', icon: '📊', label: '分析' },
]

export default function NavBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 max-w-md mx-auto">
      <div className="flex">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
              pathname.startsWith(item.href) ? 'text-emerald-600' : 'text-gray-400'
            }`}>
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
