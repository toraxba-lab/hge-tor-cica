
"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Se for a página de login, não precisa verificar
    if (pathname === '/login') {
      setAuthorized(true)
      return
    }

    const session = localStorage.getItem('hge_session')
    
    if (!session) {
      setAuthorized(false)
      router.push('/login')
    } else {
      setAuthorized(true)
    }
  }, [pathname, router])

  // Evita flash de conteúdo protegido
  if (!authorized && pathname !== '/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary font-bold">Verificando credenciais...</div>
      </div>
    )
  }

  return <>{children}</>
}
