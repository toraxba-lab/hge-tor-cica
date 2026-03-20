
"use client"

import { useState, useEffect } from "react"
import { MOCK_PACIENTES } from "@/lib/mock-data"
import { Paciente, Usuario } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Archive, ShieldAlert, Skull, CheckCircle2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function HistoryPage() {
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [search, setSearch] = useState("")
  const [allPatients, setAllPatients] = useState<Paciente[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    
    // Load session
    const session = localStorage.getItem('hge_session')
    if (session) {
      setCurrentUser(JSON.parse(session))
    }

    const stored = localStorage.getItem('hge_patients')
    const localPatients = stored ? JSON.parse(stored) : []
    
    const combined = [...MOCK_PACIENTES]
    localPatients.forEach((lp: Paciente) => {
      const idx = combined.findIndex(p => p.id === lp.id)
      if (idx !== -1) {
        combined[idx] = lp
      } else {
        combined.push(lp)
      }
    })
    setAllPatients(combined)
  }, [])

  const isMaster = currentUser?.role === 'master'
  const history = allPatients.filter(p => p.status === 'alta')

  const filtered = history.filter(p => 
    p.nome.toLowerCase().includes(search.toLowerCase()) || 
    p.registro_hc.includes(search)
  )

  const handleDeletePatient = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este registro histórico?")) return
    
    // Remove do localStorage
    const stored = localStorage.getItem('hge_patients')
    const localPatients = stored ? JSON.parse(stored) : []
    const updatedLocal = localPatients.filter((p: Paciente) => p.id !== id)
    localStorage.setItem('hge_patients', JSON.stringify(updatedLocal))

    // Atualiza estado local (incluindo mock na sessão atual)
    setAllPatients(prev => prev.filter(p => p.id !== id))
    
    toast({
      title: "Registro Removido",
      description: "O paciente foi excluído do arquivo com sucesso.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Arquivo Histórico</h1>
          <p className="text-muted-foreground">Consulta de pacientes que já receberam alta hospitalar ou faleceram.</p>
        </div>
        {isMaster && (
          <Badge variant="outline" className="border-primary text-primary gap-2 px-3 py-1">
            <ShieldAlert size={14} /> Modo Administrador Ativo
          </Badge>
        )}
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Buscar por Nome ou Registro HC..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registro HC</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Saída</TableHead>
              <TableHead>Desfecho</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-mono">{patient.registro_hc}</TableCell>
                <TableCell className="font-medium">{patient.nome}</TableCell>
                <TableCell>{mounted ? new Date(patient.data_entrada).toLocaleDateString('pt-BR') : '--/--/----'}</TableCell>
                <TableCell>{mounted && patient.data_desfecho ? new Date(patient.data_desfecho).toLocaleDateString('pt-BR') : '--/--/----'}</TableCell>
                <TableCell>
                  {patient.desfecho === 'obito' ? (
                    <Badge variant="destructive" className="gap-1 px-2">
                      <Skull size={10} /> ÓBITO
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1 px-2 bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 size={10} /> ALTA
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right flex items-center justify-end gap-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/patients/${patient.id}`}>
                      <Eye size={16} className="mr-2" />
                      Visualizar
                    </Link>
                  </Button>
                  {isMaster && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeletePatient(patient.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-dashed">
        <Archive size={14} />
        {isMaster 
          ? "Como administrador Master, você pode visualizar e excluir registros permanentemente."
          : "Registros históricos são preservados para fins de auditoria e conformidade clínica."}
      </div>
    </div>
  )
}
