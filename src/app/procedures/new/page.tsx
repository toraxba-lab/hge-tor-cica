
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MOCK_PACIENTES } from "@/lib/mock-data"
import { Paciente, CategoriaPorte, ProcedimentoRealizado } from "@/lib/types"
import { SIGTAP_PROCEDURES, SigtapProcedure } from "@/lib/sigtap-data"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, ClipboardPlus, User, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

function ProcedureForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null)
  const [search, setSearch] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sigtapSuggestions, setSigtapSuggestions] = useState<SigtapProcedure[]>([])
  const [allPatients, setAllPatients] = useState<Paciente[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [allSigtap, setAllSigtap] = useState<SigtapProcedure[]>([])
  
  const [form, setForm] = useState({
    porte: "" as CategoriaPorte,
    sigtapNome: "",
    sigtapCod: "",
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    cirurgiao: "",
    unidade: ""
  })

  useEffect(() => {
    setMounted(true)
    
    // Carrega Sessão Real
    const session = localStorage.getItem('hge_session')
    if (session) {
      const user = JSON.parse(session)
      setForm(prev => ({ ...prev, cirurgiao: user.crm }))
    }
    
    // Load Procedures (Static + Custom)
    const storedCustom = localStorage.getItem('hge_custom_procedures')
    const custom = storedCustom ? JSON.parse(storedCustom) : []
    setAllSigtap([...SIGTAP_PROCEDURES, ...custom])

    // Load Patients
    const stored = localStorage.getItem('hge_patients')
    const localPatients = stored ? JSON.parse(stored) : []
    const combined = [...MOCK_PACIENTES]
    localPatients.forEach((lp: Paciente) => {
      const idx = combined.findIndex(p => p.id === lp.id)
      if (idx !== -1) combined[idx] = lp
      else combined.push(lp)
    })
    setAllPatients(combined)

    // Load Sectors
    const storedS = localStorage.getItem('hge_sectors')
    if (storedS) {
      setSectors(JSON.parse(storedS))
    } else {
      const defaultSectors = ["UTI", "Enfermaria", "Vermelha", "Observacao"]
      setSectors(defaultSectors)
      localStorage.setItem('hge_sectors', JSON.stringify(defaultSectors))
    }

    const preSelectedId = searchParams.get('id')
    if (preSelectedId) {
      const found = combined.find(p => p.id === preSelectedId && p.status === 'internado')
      if (found) {
        setSelectedPatient(found)
        setForm(prev => ({ ...prev, unidade: found.unidade_setor }))
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (form.sigtapNome.length > 1) {
      const filtered = allSigtap.filter(p => 
        p.nome.toLowerCase().includes(form.sigtapNome.toLowerCase()) ||
        p.codigo.includes(form.sigtapNome)
      )
      setSigtapSuggestions(filtered)
    } else {
      setSigtapSuggestions([])
    }
  }, [form.sigtapNome, allSigtap])

  const internados = allPatients.filter(p => 
    p.status === 'internado' && 
    (p.nome.toLowerCase().includes(search.toLowerCase()) || p.registro_hc.includes(search))
  )

  const handleSelectSigtap = (proc: SigtapProcedure) => {
    setForm(prev => ({ ...prev, sigtapNome: proc.nome, sigtapCod: proc.codigo, porte: proc.porte }))
    setSigtapSuggestions([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    setIsSubmitting(true)
    
    const newProcedure: ProcedimentoRealizado = {
      id: Math.random().toString(36).substr(2, 9),
      id_paciente: selectedPatient.id,
      crm_cirurgiao: form.cirurgiao,
      data_hora: `${form.data}T${form.hora}:00`,
      unidade_origem: form.unidade,
      categoria_porte: form.porte,
      nome_procedimento_sigtap: form.sigtapNome,
      cod_sigtap: form.sigtapCod
    }

    const storedProc = localStorage.getItem('hge_procedures')
    const savedProcedures = storedProc ? JSON.parse(storedProc) : []
    localStorage.setItem('hge_procedures', JSON.stringify([...savedProcedures, newProcedure]))
    
    const storedPatients = localStorage.getItem('hge_patients')
    let localPatients = storedPatients ? JSON.parse(storedPatients) : []
    
    const existingPatientIdx = localPatients.findIndex((p: Paciente) => p.id === selectedPatient.id)
    
    if (existingPatientIdx !== -1) {
      localPatients[existingPatientIdx] = { 
        ...localPatients[existingPatientIdx], 
        indicacao_cirurgica: "", 
        data_indicacao: undefined 
      }
    } else {
      localPatients.push({ 
        ...selectedPatient, 
        indicacao_cirurgica: "", 
        data_indicacao: undefined 
      })
    }
    
    localStorage.setItem('hge_patients', JSON.stringify(localPatients))
    
    setTimeout(() => {
      toast({ title: "Procedimento registrado!", description: "Dados salvos e indicação removida da lista." })
      router.push(`/patients/${selectedPatient.id}`)
    }, 800)
  }

  if (!mounted) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => selectedPatient ? setSelectedPatient(null) : router.push("/")}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {selectedPatient ? "Registrar Procedimento" : "Selecionar Paciente"}
        </h1>
      </div>

      {!selectedPatient ? (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Buscar por nome ou HC..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </Card>
          <div className="grid gap-3">
            {internados.map((patient) => (
              <Card key={patient.id} className="cursor-pointer hover:border-primary transition-colors border-l-4 border-l-primary" onClick={() => { setSelectedPatient(patient); setForm(prev => ({ ...prev, unidade: patient.unidade_setor })) }}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-full"><User className="text-primary" size={20} /></div>
                    <div><p className="font-bold">{patient.nome}</p><p className="text-xs text-muted-foreground">HC: {patient.registro_hc} • {patient.unidade_setor}</p></div>
                  </div>
                  <Badge variant="outline">Selecionar</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="shadow-md">
            <CardHeader className="border-b bg-muted/10">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2"><ClipboardPlus className="text-accent" size={20} /> Dados do Procedimento</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Paciente: <span className="font-semibold">{selectedPatient.nome}</span></p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>Trocar</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2 relative">
                <Label>Procedimento (SIGTAP)</Label>
                <div className="relative">
                  <Input 
                    placeholder="Busque por nome ou código SIGTAP..." 
                    value={form.sigtapNome} 
                    onChange={(e) => setForm({...form, sigtapNome: e.target.value})} 
                    required 
                  />
                  {sigtapSuggestions.length > 0 && (
                    <Card className="absolute z-50 w-full mt-1 shadow-xl max-h-[250px] overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-1">
                          {sigtapSuggestions.map((proc) => (
                            <button 
                              key={proc.codigo} 
                              type="button" 
                              className="w-full text-left px-4 py-2 hover:bg-muted text-sm border-b last:border-0 flex flex-col gap-0.5" 
                              onClick={() => handleSelectSigtap(proc)}
                            >
                              <p className="font-semibold">{proc.nome}</p>
                              <p className="text-xs text-muted-foreground">{proc.codigo} • <span className="uppercase">{proc.porte}</span></p>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Porte</Label>
                  <Select required value={form.porte} onValueChange={(v) => setForm({...form, porte: v as CategoriaPorte})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Broncoscopia">Broncoscopia</SelectItem>
                      <SelectItem value="Traqueostomia">Traqueostomia</SelectItem>
                      <SelectItem value="Pequeno Porte">Pequeno Porte</SelectItem>
                      <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Cód. SIGTAP</Label><Input value={form.sigtapCod} onChange={(e) => setForm({...form, sigtapCod: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Data</Label><Input type="date" value={form.data} onChange={(e) => setForm({...form, data: e.target.value})} required /></div>
                <div className="space-y-2"><Label>Hora</Label><Input type="time" value={form.hora} onChange={(e) => setForm({...form, hora: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Cirurgião</Label><Input value={form.cirurgiao} readOnly /></div>
                <div className="space-y-2">
                  <Label>Local / Unidade</Label>
                  <Select 
                    required 
                    value={form.unidade} 
                    onValueChange={(v) => setForm({...form, unidade: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o local" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 bg-muted/20 p-6 border-t">
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Registrar"}</Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  )
}

export default function NewProcedurePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ProcedureForm />
    </Suspense>
  )
}
