import type { ReactNode } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'

interface LayoutProps {
  children: ReactNode
}

/**
 * đây là layout cố định cho trình duyệt
 * <Layout> ... </Layout> để sử dụng
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='flex pt-16'>
        <Sidebar />
        <main className='flex-1 p-6 ml-64'>{children}</main>
      </div>
    </div>
  )
}
