import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WiseMeal - AIカロリー計算・食事管理',
  description: 'AIを使ったスマートな食事管理アプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
