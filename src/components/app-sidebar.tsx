
"use client"

import { useState, useEffect } from "react"
import { Home, Users, History, LayoutDashboard, LogOut, HeartPulse, UserCog, Settings2 } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Usuario } from "@/lib/types"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<Usuario | null>(null)

  useEffect(() => {
    const session = localStorage.getItem('hge_session')
    if (session) {
      setUser(JSON.parse(session))
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('hge_session')
    router.push('/login')
    // Força um refresh para limpar estados
    window.location.href = '/login'
  }

  if (!user) return null

  const isMaster = user.role === 'master'

  const navItems = [
    { name: "Início", href: "/", icon: Home, visible: true },
    { name: "Lista Internados", href: "/census", icon: Users, visible: true },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, visible: isMaster },
    { name: "Arquivo Histórico", href: "/history", icon: History, visible: true },
    { name: "Usuários", href: "/users", icon: UserCog, visible: isMaster },
    { name: "Config. Procedimentos", href: "/procedures/config", icon: Settings2, visible: true },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
            <HeartPulse size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
            HGE <span className="text-primary">Tórax</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hospitalar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.filter(item => item.visible).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.name}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4 group-data-[collapsible=icon]:hidden">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white">
            {user.nome.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">{user.nome}</span>
            <span className="text-[10px] text-muted-foreground">{user.crm}</span>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut size={18} />
              <span>Sair do Sistema</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
