
"use client"

import { MOCK_PACIENTES } from "@/lib/mock-data"
import { Paciente, Usuario } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  UserPlus, 
  ClipboardPlus, 
  Users, 
  Scissors,
  Clock,
  MapPin
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<Usuario | null>(null)
  const [indicados, setIndicados] = useState<Paciente[]>([])
  
  const loadData = () => {
    // Carregar sessão do usuário
    const session = localStorage.getItem('hge_session')
    if (session) {
      setUser(JSON.parse(session))
    }

    // Carregar Pacientes
    const storedP = localStorage.getItem('hge_patients')
    const localPatients = storedP ? JSON.parse(storedP) : []
    const combined = [...MOCK_PACIENTES]
    localPatients.forEach((lp: Paciente) => {
      const idx = combined.findIndex(p => p.id === lp.id)
      if (idx !== -1) combined[idx] = lp
      else combined.push(lp)
    })

    const filtered = combined.filter(p => p.status === 'internado' && !!p.indicacao_cirurgica)
    setIndicados(filtered)
  }

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Bem-vindo, <span className="text-primary text-3xl block md:inline">
              {mounted && user ? user.nome : 'Doutor'}
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Unidade de Cirurgia Torácica - HGE
          </p>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-primary/50 transition-colors shadow-sm">
          <CardHeader>
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
              <UserPlus className="text-primary" size={24} />
            </div>
            <CardTitle>Novo Paciente</CardTitle>
            <CardDescription>Cadastrar entrada de paciente no setor.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/patients/new">Ir para Cadastro</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-accent/50 transition-colors shadow-sm border-l-4 border-l-accent">
          <CardHeader>
            <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
              <ClipboardPlus className="text-accent" size={24} />
            </div>
            <CardTitle>Procedimento</CardTitle>
            <CardDescription>Registrar produtividade cirúrgica (SIGTAP).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-accent hover:bg-accent/90" asChild>
              <Link href="/procedures/new">Selecionar Paciente</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors shadow-sm">
          <CardHeader>
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-2">
              <Users className="text-primary" size={24} />
            </div>
            <CardTitle>Lista Internados</CardTitle>
            <CardDescription>Visualizar todos os pacientes no mapa.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="default" asChild>
              <Link href="/census">Acessar Lista</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Cirurgias Indicadas */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-t pt-8">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Scissors className="text-amber-500" />
            Cirurgias Indicadas / Agendadas
            <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
              {mounted ? indicados.length : '...'}
            </Badge>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {indicados.map((patient) => (
            <Card key={patient.id} className="border-l-4 border-l-amber-500 bg-amber-50/30">
              <CardContent className="pt-6 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{patient.nome}</span>
                    <Badge variant="outline" className="font-mono text-[10px]">HC: {patient.registro_hc}</Badge>
                  </div>
                  <div className="p-2 bg-white/80 rounded border border-amber-100">
                    <p className="text-xs font-semibold text-amber-900 uppercase tracking-tighter">Procedimento Indicado:</p>
                    <p className="text-sm font-medium text-amber-800">{patient.indicacao_cirurgica}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {patient.unidade_setor}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> 
                      Indicado em: {mounted ? new Date(patient.data_indicacao!).toLocaleDateString('pt-BR') : '...'}
                    </span>
                  </div>
                </div>
                <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/patients/${patient.id}`}>Prontuário</Link>
                  </Button>
                  <Button size="sm" className="bg-accent hover:bg-accent/90" asChild>
                    <Link href={`/procedures/new?id=${patient.id}`}>Realizar</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {mounted && indicados.length === 0 && (
            <div className="col-span-full py-12 text-center bg-muted/20 rounded-xl border border-dashed text-muted-foreground">
              Não há cirurgias pendentes ou indicadas no momento.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
