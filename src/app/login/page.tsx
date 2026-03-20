
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HeartPulse, Lock, User, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Usuario } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [crm, setCrm] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Se já estiver logado, vai para a home
    const session = localStorage.getItem('hge_session')
    if (session) {
      router.push('/')
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Busca usuários cadastrados no localStorage
    const storedUsers = localStorage.getItem('hge_users')
    
    // Usuário master padrão com CRM numérico conforme nova regra
    const defaultMaster: Usuario = { 
      uid: 'admin-master', 
      nome: 'Administrador Master', 
      crm: '123456', 
      role: 'master', 
      password: "1234" 
    }

    const users: Usuario[] = storedUsers 
      ? JSON.parse(storedUsers) 
      : [defaultMaster]

    // Valida CRM e Senha rigorosamente
    const user = users.find(u => u.crm === crm)

    if (user && user.password === password) {
      // Login bem sucedido
      const { password: _, ...userSession } = user
      localStorage.setItem('hge_session', JSON.stringify(userSession))
      
      toast({
        title: "Acesso Autorizado",
        description: `Bem-vindo, ${user.nome}.`,
      })
      
      window.location.href = '/'
    } else {
      setError("Credenciais inválidas. Verifique o CRM e a senha.")
      setIsLoading(false)
    }
  }

  // Função para permitir apenas números no input
  const handleCrmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setCrm(value)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-lg shadow-primary/20">
            <HeartPulse size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">HGE <span className="text-primary">Tórax</span></h1>
          <p className="text-muted-foreground italic">Unidade de Cirurgia Torácica</p>
        </div>

        <Card className="shadow-xl border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>Informe seu CRM (apenas números) e senha.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="crm">CRM (Apenas Números)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    id="crm" 
                    placeholder="Ex: 123456" 
                    className="pl-10" 
                    required 
                    value={crm}
                    onChange={handleCrmChange}
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Sua senha" 
                    className="pl-10" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Autenticando..." : "Entrar no Sistema"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-[10px] text-muted-foreground text-center">
          <p>Acesso Master: CRM <code className="bg-muted px-1 font-bold">123456</code> | Senha <code className="bg-muted px-1 font-bold">1234</code></p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Hospital Geral do Estado - Cirurgia Torácica
        </p>
      </div>
    </div>
  )
}
