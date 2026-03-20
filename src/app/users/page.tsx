
"use client"

import { useState, useEffect } from "react"
import { Usuario, Role } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShieldAlert, UserPlus, Trash2, Pencil, User, Key, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function UsersManagementPage() {
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const [users, setUsers] = useState<Usuario[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingUid, setEditingUid] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  
  const [formData, setFormData] = useState({
    nome: "",
    crm: "",
    role: "master" as Role,
    password: ""
  })

  useEffect(() => {
    setMounted(true)
    
    // Carrega sessão atual
    const session = localStorage.getItem('hge_session')
    if (session) {
      setCurrentUser(JSON.parse(session))
    }

    // Carrega usuários
    const stored = localStorage.getItem('hge_users')
    if (stored) {
      setUsers(JSON.parse(stored))
    } else {
      const initial: Usuario[] = [
        { uid: 'admin-master', nome: 'Administrador Master', crm: '123456', role: 'master', password: '1234' }
      ]
      setUsers(initial)
      localStorage.setItem('hge_users', JSON.stringify(initial))
    }
  }, [])

  if (!currentUser || currentUser.role !== 'master') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
        <div className="bg-destructive/10 p-4 rounded-full text-destructive">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-bold">Acesso Restrito</h2>
        <p className="text-muted-foreground max-w-md">
          Apenas administradores Master podem gerenciar a equipe de cirurgiões.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Voltar para o Início</Link>
        </Button>
      </div>
    )
  }

  const handleCrmChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "")
    setFormData({...formData, crm: numericValue})
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (users.some(u => u.crm === formData.crm)) {
      toast({ variant: "destructive", title: "Erro", description: "Este CRM já está cadastrado." })
      return
    }

    const newUser: Usuario = {
      uid: Math.random().toString(36).substr(2, 9),
      nome: formData.nome,
      crm: formData.crm,
      role: formData.role,
      password: formData.password
    }
    const updated = [...users, newUser]
    setUsers(updated)
    localStorage.setItem('hge_users', JSON.stringify(updated))
    toast({ title: "Usuário Cadastrado", description: `O acesso para ${formData.nome} foi criado com sucesso.` })
    setFormData({ nome: "", crm: "", role: "master", password: "" })
    setIsAdding(false)
  }

  const handleStartEdit = (user: Usuario) => {
    setEditingUid(user.uid)
    setFormData({
      nome: user.nome,
      crm: user.crm,
      role: user.role,
      password: user.password || ""
    })
    setIsAdding(false)
  }

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUid) return

    const updated = users.map(u => {
      if (u.uid === editingUid) {
        return {
          ...u,
          nome: formData.nome,
          crm: formData.crm,
          role: formData.role,
          password: formData.password
        }
      }
      return u
    })

    setUsers(updated)
    localStorage.setItem('hge_users', JSON.stringify(updated))
    toast({ title: "Usuário Atualizado", description: `Os dados de ${formData.nome} foram salvos.` })
    
    // Se o usuário editado for o logado, atualiza a sessão também
    if (currentUser.uid === editingUid) {
      const updatedSession = {
        ...currentUser,
        nome: formData.nome,
        crm: formData.crm,
        role: formData.role
      }
      localStorage.setItem('hge_session', JSON.stringify(updatedSession))
      setCurrentUser(updatedSession)
    }

    setEditingUid(null)
    setFormData({ nome: "", crm: "", role: "master", password: "" })
  }

  const handleDeleteUser = (uid: string) => {
    if (uid === currentUser.uid) {
      toast({ variant: "destructive", title: "Erro", description: "Você não pode excluir seu próprio usuário." })
      return
    }
    const updated = users.filter(u => u.uid !== uid)
    setUsers(updated)
    localStorage.setItem('hge_users', JSON.stringify(updated))
    toast({ title: "Usuário Removido", description: "O acesso foi revogado." })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão da Equipe</h1>
          <p className="text-muted-foreground">Cadastre novos cirurgiões e gerencie níveis de acesso.</p>
        </div>
        {!isAdding && !editingUid && (
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <UserPlus size={18} /> Novo Usuário
          </Button>
        )}
      </div>

      {(isAdding || editingUid) && (
        <Card className="border-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4">
          <form onSubmit={editingUid ? handleUpdateUser : handleAddUser}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{editingUid ? "Editar Usuário" : "Novo Cadastro"}</CardTitle>
                <CardDescription>
                  Preencha o CRM apenas com números.
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                type="button" 
                onClick={() => { setIsAdding(false); setEditingUid(null); setFormData({ nome: "", crm: "", role: "master", password: "" }) }}
              >
                <X size={18} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" required value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} placeholder="Dr. Fulano" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crm">CRM (Apenas Números)</Label>
                  <Input 
                    id="crm" 
                    required 
                    value={formData.crm} 
                    onChange={(e) => handleCrmChange(e.target.value)} 
                    placeholder="Ex: 123456" 
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pass">Senha</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input id="pass" type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Papel / Nível de Acesso</Label>
                  <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v as Role})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="master">Master (Administrador)</SelectItem>
                      <SelectItem value="cirurgiao">Cirurgião (Operacional)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardContent className="flex justify-end gap-3 pt-0">
              <Button type="button" variant="ghost" onClick={() => { setIsAdding(false); setEditingUid(null); setFormData({ nome: "", crm: "", role: "master", password: "" }) }}>Cancelar</Button>
              <Button type="submit">{editingUid ? "Salvar Alterações" : "Salvar Usuário"}</Button>
            </CardContent>
          </form>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>CRM / Login</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mounted && users.map((user) => (
              <TableRow key={user.uid} className={editingUid === user.uid ? "bg-primary/5" : ""}>
                <TableCell className="font-medium">{user.nome}</TableCell>
                <TableCell className="font-mono text-xs">{user.crm}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'master' ? "default" : "secondary"}>
                    {user.role === 'master' ? "MASTER" : "CIRURGIÃO"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => handleStartEdit(user)}>
                    <Pencil size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteUser(user.uid)} disabled={user.uid === currentUser.uid}>
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
