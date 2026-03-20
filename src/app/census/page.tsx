
"use client"

import { useState, useEffect } from "react"
import { MOCK_PACIENTES } from "@/lib/mock-data"
import { Paciente } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, User, Calendar, ArrowRight, Users, Scissors } from "lucide-react"
import Link from "next/link"

export default function CensusPage() {
  const [mounted, setMounted] = useState(false)
  const [patients, setPatients] = useState<Paciente[]>([])
  
  useEffect(() => {
    setMounted(true)
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
    
    setPatients(combined.filter(p => p.status === 'internado'))
  }, [])

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const sectors = patients.reduce((acc, p) => {
    if (!acc[p.unidade_setor]) acc[p.unidade_setor] = []
    acc[p.unidade_setor].push(p)
    return acc
  }, {} as Record<string, Paciente[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Lista de Internados</h1>
          <p className="text-muted-foreground">Pacientes atualmente internados no setor de Tórax.</p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/patients/new">
            <Plus size={18} />
            Novo Paciente
          </Link>
        </Button>
      </div>

      <div className="grid gap-8">
        {Object.entries(sectors).map(([sectorName, sectorPatients]) => (
          <section key={sectorName} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <h2 className="text-xl font-semibold">{sectorName}</h2>
              <Badge variant="secondary" className="ml-2">
                {sectorPatients.length} {sectorPatients.length === 1 ? 'Paciente' : 'Pacientes'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectorPatients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-all border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 overflow-hidden">
                        <CardTitle className="text-lg font-bold flex flex-wrap items-baseline gap-x-2">
                          <span className="truncate">{patient.nome}</span>
                          <span className="text-xs font-normal text-muted-foreground shrink-0">
                            ({mounted ? calculateAge(patient.data_nasc) : '--'} anos • {mounted ? new Date(patient.data_nasc).toLocaleDateString('pt-BR') : '--/--/----'})
                          </span>
                        </CardTitle>
                        {patient.indicacao_cirurgica && (
                          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 gap-1">
                            <Scissors size={10} />
                            INDICADO
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="font-mono text-[10px] shrink-0 ml-2">
                        HC: {patient.registro_hc}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <Calendar size={14} />
                      Entrada: {mounted ? new Date(patient.data_entrada).toLocaleDateString('pt-BR') : '--/--/----'}
                    </div>
                    
                    <Button asChild variant="outline" size="sm" className="w-full mt-2 group">
                      <Link href={`/patients/${patient.id}`}>
                        Ver Evolução
                        <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
        
        {mounted && patients.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
            <Users size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground font-medium">Nenhum paciente internado no momento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
