import { Sidebar } from './Sidebar'

interface ModuleData {
  id: number
  title: string
  description: string
  objectives: string[]
  requiresLogin: boolean
  estimatedTime: string
  difficulty: string
}

interface ModuleLayoutProps {
  children: React.ReactNode
  moduleData?: ModuleData
  currentStep?: string
  progress?: number
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