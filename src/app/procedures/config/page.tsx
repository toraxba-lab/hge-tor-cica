
"use client"

import { useState, useEffect } from "react"
import { SigtapProcedure } from "@/lib/sigtap-data"
import { CategoriaPorte, Usuario } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShieldAlert, Plus, Trash2, ArrowLeft, Settings2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export default function ProceduresConfigPage() {
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const [customProcedures, setCustomProcedures] = useState<SigtapProcedure[]>([])
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    porte: "Pequeno Porte" as CategoriaPorte
  })

  useEffect(() => {
    setMounted(true)
    
    const session = localStorage.getItem('hge_session')
    if (session) {
      setCurrentUser(JSON.parse(session))
    }

    const stored = localStorage.getItem('hge_custom_procedures')
    if (stored) {
      setCustomProcedures(JSON.parse(stored))
    }
  }, [])

  if (!mounted || !currentUser) {
    return null
  }

  const handleAddProcedure = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.codigo || !formData.nome) return

    if (customProcedures.some(p => p.codigo === formData.codigo)) {
      toast({ variant: "destructive", title: "Erro", description: "Este código SIGTAP já está cadastrado na lista customizada." })
      return
    }

    const newProc: SigtapProcedure = {
      codigo: formData.codigo,
      nome: formData.nome,
      porte: formData.porte
    }
    
    const updated = [...customProcedures, newProc]
    setCustomProcedures(updated)
    localStorage.setItem('hge_custom_procedures', JSON.stringify(updated))
    
    setFormData({ codigo: "", nome: "", porte: "Pequeno Porte" })
    toast({ title: "Procedimento Adicionado", description: "O novo código já está disponível para uso nos registros." })
  }

  const handleDeleteProcedure = (codigo: string) => {
    const updated = customProcedures.filter(p => p.codigo !== codigo)
    setCustomProcedures(updated)
    localStorage.setItem('hge_custom_procedures', JSON.stringify(updated))
    toast({ title: "Procedimento Removido", description: "O código foi removido da lista customizada." })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuração de Procedimentos</h1>
          <p className="text-muted-foreground">Adicione códigos SIGTAP que não constam na base padrão do sistema.</p>
        </div>
      </div>

      <Card className="border-primary/20 shadow-md">
        <form onSubmit={handleAddProcedure}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus size={18} className="text-primary" />
              Novo Procedimento Customizado
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cod">Código SIGTAP</Label>
              <Input 
                id="cod" 
                placeholder="00.00.00.000-0" 
                required 
                value={formData.codigo}
                onChange={(e) => setFormData({...formData, codigo: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="nome">Descrição do Procedimento</Label>
              <Input 
                id="nome" 
                placeholder="Ex: Toracoplastia com retalho..." 
                required 
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="porte">Categoria / Porte</Label>
              <Select value={formData.porte} onValueChange={(v) => setFormData({...formData, porte: v as CategoriaPorte})}>
                <SelectTrigger id="porte">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Broncoscopia">Broncoscopia</SelectItem>
                  <SelectItem value="Traqueostomia">Traqueostomia</SelectItem>
                  <SelectItem value="Pequeno Porte">Pequeno Porte</SelectItem>
                  <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full gap-2">
                <Plus size={16} /> Adicionar à Tabela
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Procedimentos Cadastrados</CardTitle>
          <CardDescription>Estes procedimentos aparecem na busca de novos registros.</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Porte</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customProcedures.map((proc) => (
              <TableRow key={proc.codigo}>
                <TableCell className="font-mono text-xs">{proc.codigo}</TableCell>
                <TableCell className="font-medium">{proc.nome}</TableCell>
                <TableCell className="text-xs uppercase text-muted-foreground">{proc.porte}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive" 
                    onClick={() => handleDeleteProcedure(proc.codigo)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {customProcedures.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                  Nenhum procedimento customizado cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
