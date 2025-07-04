import { Sidebar } from './Sidebar'

interface ModuleLayoutProps {
  children: React.ReactNode
}

export function ModuleLayout({ children }: ModuleLayoutProps) {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}