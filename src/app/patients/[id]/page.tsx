"use client"

import { use, useState, useEffect } from "react"
import { MOCK_PACIENTES, MOCK_EVOLUCOES, MOCK_PROCEDIMENTOS } from "@/lib/mock-data"
import { Evolucao, Paciente, ProcedimentoRealizado, DesfechoPaciente, Usuario } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Save, ShieldCheck, Clock, UserCheck, Scissors, CheckCircle2, ClipboardPlus, LogOut, Eye, Stethoscope, MapPin, Skull } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"

export default function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const { toast } = useToast()

  const [patient, setPatient] = useState<Paciente | null>(null)
  const [localEvolutions, setLocalEvolutions] = useState<Evolucao[]>([])
  const [allEvolutions, setAllEvolutions] = useState<Evolucao[]>([])
  const [historyItems, setHistoryItems] = useState<(ProcedimentoRealizado & { isVirtual?: boolean })[]>([])
  const [newEvol, setNewEvol] = useState("")
  const [indicatedSurgery, setIndicatedSurgery] = useState("")
  const [isIndicateDialogOpen, setIsIndicateDialogOpen] = useState(false)
  const [isDischargeDialogOpen, setIsDischargeDialogOpen] = useState(false)
  const [dischargeOutcome, setDischargeOutcome] = useState<DesfechoPaciente>("alta_medica")
  const [sectors, setSectors] = useState<string[]>([])
  
  const [selectedInternmentEvolutions, setSelectedInternmentEvolutions] = useState<Evolucao[]>([])
  const [isEvolViewOpen, setIsEvolViewOpen] = useState(false)

  const loadData = (userSession: Usuario) => {
    const storedS = localStorage.getItem('hge_sectors')
    if (storedS) {
      setSectors(JSON.parse(storedS))
    } else {
      const defaultSectors = ["UTI", "Enfermaria", "Vermelha", "Observacao"]
      setSectors(defaultSectors)
      localStorage.setItem('hge_sectors', JSON.stringify(defaultSectors))
    }

    const storedP = localStorage.getItem('hge_patients')
    const localPatients = storedP ? JSON.parse(storedP) : []
    const combinedP = [...MOCK_PACIENTES, ...localPatients]
    
    const found = combinedP.find(p => p.id === id)
    if (!found) return

    setPatient(found)
    setIndicatedSurgery(found.indicacao_cirurgica || "")

    const allStays = combinedP.filter(p => 
      p.nome === found.nome && p.data_nasc === found.data_nasc
    )

    const storedE = localStorage.getItem('hge_evolutions')
    const savedEvolutions = storedE ? JSON.parse(storedE) : []
    const combinedE = [...MOCK_EVOLUCOES, ...savedEvolutions]
    
    setAllEvolutions(combinedE)
    setLocalEvolutions(combinedE
      .filter(e => e.pacienteId === id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))

    const storedProc = localStorage.getItem('hge_procedures')
    const savedProcedures = storedProc ? JSON.parse(storedProc) : []
    const realProcedures = [...MOCK_PROCEDIMENTOS, ...savedProcedures]
      .filter(p => allStays.some(stay => stay.id === p.id_paciente))

    const history: (ProcedimentoRealizado & { isVirtual?: boolean })[] = [...realProcedures]

    allStays.forEach(stay => {
      const hasProcedure = realProcedures.some(rp => rp.id_paciente === stay.id)
      if (!hasProcedure) {
        history.push({
          id: `virtual-${stay.id}`,
          id_paciente: stay.id,
          crm_cirurgiao: "Equipe Tórax",
          data_hora: stay.data_entrada + "T08:00:00",
          unidade_origem: stay.unidade_setor,
          categoria_porte: "Pequeno Porte",
          nome_procedimento_sigtap: "Visita Hospitalar / Avaliação Clínica",
          cod_sigtap: "03.01.01.007-2",
          isVirtual: true
        })
      }
    })

    setHistoryItems(history.sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()))
  }

  useEffect(() => {
    setMounted(true)
    const session = localStorage.getItem('hge_session')
    if (session) {
      const user = JSON.parse(session)
      setCurrentUser(user)
      loadData(user)
    }
  }, [id])

  if (!mounted) return null
  if (!patient) return <div className="p-8 text-center">Paciente não encontrado.</div>

  const isAlta = patient.status === 'alta'
  const isMaster = currentUser?.role === 'master'

  const handleAddEvolution = () => {
    if (isAlta) {
      toast({ variant: "destructive", title: "Erro de Segurança", description: "Não é permitido evoluir pacientes com alta." })
      return
    }

    if (!newEvol.trim() || !currentUser) return

    const newEntry: Evolucao = {
      id: Math.random().toString(36).substr(2, 9),
      pacienteId: id,
      timestamp: new Date().toISOString(),
      texto_evolucao: newEvol,
      autor_crm: currentUser.crm
    }

    const stored = localStorage.getItem('hge_evolutions')
    const saved = stored ? JSON.parse(stored) : []
    localStorage.setItem('hge_evolutions', JSON.stringify([...saved, newEntry]))

    setLocalEvolutions(prev => [newEntry, ...prev])
    setAllEvolutions(prev => [...prev, newEntry])
    setNewEvol("")
    
    toast({ 
      title: "Evolução Registrada", 
      description: "O registro foi assinado digitalmente para este internamento." 
    })
  }

  const handleIndicateSurgery = () => {
    if (!indicatedSurgery) return
    const updatedPatient = { ...patient, indicacao_cirurgica: indicatedSurgery, data_indicacao: new Date().toISOString() }
    setPatient(updatedPatient)
    
    const stored = localStorage.getItem('hge_patients')
    const localPatients = stored ? JSON.parse(stored) : []
    const idx = localPatients.findIndex((p: Paciente) => p.id === id)
    if (idx !== -1) {
      localPatients[idx] = updatedPatient
      localStorage.setItem('hge_patients', JSON.stringify(localPatients))
    }
    
    toast({ title: "Cirurgia Indicada", description: "Agendamento registrado." })
    setIsIndicateDialogOpen(false)
  }

  const handleUpdateSector = (newSector: string) => {
    if (!patient || isAlta) return
    const updatedPatient = { ...patient, unidade_setor: newSector }
    setPatient(updatedPatient)
    
    const stored = localStorage.getItem('hge_patients')
    const localPatients = stored ? JSON.parse(stored) : []
    const idx = localPatients.findIndex((p: Paciente) => p.id === id)
    if (idx !== -1) {
      localPatients[idx] = updatedPatient
      localStorage.setItem('hge_patients', JSON.stringify(localPatients))
    }
    
    toast({ title: "Setor Atualizado", description: `Paciente transferido para ${newSector}.` })
  }

  const handleDischarge = () => {
    const updatedPatient: Paciente = { 
      ...patient, 
      status: 'alta', 
      desfecho: dischargeOutcome,
      data_desfecho: new Date().toISOString()
    }
    setPatient(updatedPatient)
    
    const stored = localStorage.getItem('hge_patients')
    const localPatients = stored ? JSON.parse(stored) : []
    const idx = localPatients.findIndex((p: Paciente) => p.id === id)
    if (idx !== -1) {
      localPatients[idx] = updatedPatient
      localStorage.setItem('hge_patients', JSON.stringify(localPatients))
    }
    
    toast({ 
      title: dischargeOutcome === 'alta_medica' ? "Alta Hospitalar" : "Óbito Registrado", 
      description: "O internamento foi encerrado no sistema." 
    })
    setIsDischargeDialogOpen(false)
  }

  const viewInternmentEvolutions = (internmentId: string) => {
    const evols = allEvolutions
      .filter(e => e.pacienteId === internmentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setSelectedInternmentEvolutions(evols)
    setIsEvolViewOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{patient.nome}</h1>
            <Badge variant={isAlta ? "secondary" : "default"}>
              {isAlta ? (patient.desfecho === 'obito' ? "ÓBITO" : "ALTA") : "INTERNADO"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-muted-foreground text-sm font-medium">HC: {patient.registro_hc}</span>
            <span className="text-muted-foreground text-sm">•</span>
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-muted-foreground" />
              {!isAlta ? (
                <Select 
                  value={patient.unidade_setor} 
                  onValueChange={handleUpdateSector}
                >
                  <SelectTrigger className="h-7 min-w-[130px] text-xs py-0 border-none bg-muted/50 hover:bg-muted font-bold">
                    <SelectValue placeholder="Setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">{patient.unidade_setor}</span>
              )}
            </div>
            <span className="text-muted-foreground text-sm">• Entrada: {new Date(patient.data_entrada).toLocaleDateString('pt-BR')}</span>
            {isAlta && patient.data_desfecho && (
              <>
                <span className="text-muted-foreground text-sm">• Saída: {new Date(patient.data_desfecho).toLocaleDateString('pt-BR')}</span>
                <Badge variant="outline" className="ml-2 text-[10px] uppercase font-bold">
                  {patient.desfecho === 'obito' ? 'Óbito' : 'Alta Médica'}
                </Badge>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isAlta && (
            <>
              <Dialog open={isDischargeDialogOpen} onOpenChange={setIsDischargeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 border-destructive text-destructive hover:bg-destructive/10">
                    <LogOut size={16} /> Encerrar Internamento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar Desfecho</DialogTitle>
                    <DialogDescription>
                      Selecione o tipo de saída para o paciente <strong>{patient.nome}</strong>. Esta ação é irreversível.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6">
                    <RadioGroup 
                      defaultValue="alta_medica" 
                      onValueChange={(val) => setDischargeOutcome(val as DesfechoPaciente)}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex items-center space-x-3 space-y-0 bg-muted/30 p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="alta_medica" id="alta" />
                        <Label htmlFor="alta" className="flex-1 cursor-pointer font-bold flex items-center gap-2">
                          <CheckCircle2 className="text-green-600" size={18} />
                          Alta Médica
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 space-y-0 bg-destructive/5 p-4 rounded-lg cursor-pointer hover:bg-destructive/10 transition-colors">
                        <RadioGroupItem value="obito" id="obito" />
                        <Label htmlFor="obito" className="flex-1 cursor-pointer font-bold flex items-center gap-2">
                          <Skull className="text-destructive" size={18} />
                          Óbito
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDischargeDialogOpen(false)}>Cancelar</Button>
                    <Button 
                      variant={dischargeOutcome === 'obito' ? 'destructive' : 'default'}
                      onClick={handleDischarge}
                    >
                      Confirmar {dischargeOutcome === 'obito' ? 'Óbito' : 'Alta'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isIndicateDialogOpen} onOpenChange={setIsIndicateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50">
                    <Scissors size={16} /> {patient.indicacao_cirurgica ? "Alterar Indicação" : "Indicar Cirurgia"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Indicação Cirúrgica</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Label>Procedimento</Label>
                    <Input value={indicatedSurgery} onChange={(e) => setIndicatedSurgery(e.target.value)} placeholder="Ex: Lobectomia..." />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsIndicateDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleIndicateSurgery}>Confirmar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button asChild variant="secondary">
                <Link href={`/procedures/new?id=${patient.id}`} className="gap-2">
                  <ClipboardPlus size={16} /> Novo Procedimento
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="evolutions" className="w-full">
        <TabsList className={`grid w-full ${isMaster ? 'max-w-2xl grid-cols-3' : 'max-w-md grid-cols-2'}`}>
          <TabsTrigger value="evolutions">Evoluções (Este Internamento)</TabsTrigger>
          <TabsTrigger value="procedures">Histórico / Procedimentos</TabsTrigger>
          {isMaster && <TabsTrigger value="audit" className="gap-2"><ShieldCheck size={14} /> Auditoria</TabsTrigger>}
        </TabsList>

        <TabsContent value="evolutions" className="space-y-6">
          {!isAlta && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs font-bold uppercase text-primary">Nova Evolução Clínica</Label>
                  <Badge variant="outline" className="text-[10px] gap-1 bg-white">
                    <MapPin size={10} /> {patient.unidade_setor}
                  </Badge>
                </div>
                <Textarea value={newEvol} onChange={(e) => setNewEvol(e.target.value)} placeholder="Evolução diária..." className="min-h-[100px] bg-background" />
                <div className="flex justify-between items-center text-xs text-muted-foreground uppercase">
                  <span className="flex items-center gap-1 font-semibold">
                    <UserCheck size={12} /> Responsável: {currentUser?.crm}
                  </span>
                  <Button onClick={handleAddEvolution} disabled={!newEvol.trim()} size="sm" className="gap-2">
                    <Save size={14} /> Assinar e Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="space-y-4">
            {localEvolutions.map((e) => (
              <Card key={e.id} className="border-l-4 border-l-primary/30 relative overflow-hidden">
                <div className="absolute top-2 right-2 opacity-10">
                  <ShieldCheck size={40} />
                </div>
                <CardContent className="pt-6">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-primary">{e.autor_crm}</span>
                      <span className="uppercase tracking-tighter">Registro Imutável</span>
                    </div>
                    <span>{new Date(e.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">{e.texto_evolucao}</p>
                </CardContent>
              </Card>
            ))}
            {localEvolutions.length === 0 && (
              <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg flex flex-col items-center gap-2">
                <Activity className="opacity-20" size={48} />
                <p>Nenhuma evolução registrada neste internamento.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="procedures" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Linha do Tempo de Estadias</h3>
          </div>
          {historyItems.map((p) => (
            <Card key={p.id} className={p.id_paciente === id ? "border-primary/40 bg-primary/5 shadow-sm" : "opacity-80 border-dashed"}>
              <CardContent className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-4">
                  <div className={p.isVirtual ? "bg-muted p-2 rounded-full" : "bg-accent/10 p-2 rounded-full"}>
                    {p.isVirtual ? <Stethoscope className="text-muted-foreground" size={20} /> : <Scissors className="text-accent" size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.isVirtual ? "outline" : "default"} className="text-[10px]">
                        {p.isVirtual ? "VISITA" : p.cod_sigtap}
                      </Badge>
                      {p.id_paciente !== id && (
                        <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700">INTERNAMENTO ANTERIOR</Badge>
                      )}
                      {p.id_paciente === id && (
                        <Badge variant="outline" className="text-[10px] border-primary text-primary">ATUAL</Badge>
                      )}
                    </div>
                    <p className="mt-1 font-bold">{p.nome_procedimento_sigtap}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Clock size={10} /> 
                      {new Date(p.data_hora).toLocaleDateString('pt-BR')} • {p.unidade_origem} • {p.crm_cirurgiao}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => viewInternmentEvolutions(p.id_paciente)} className="gap-2 shrink-0">
                  <Eye size={14} /> Ver Evoluções do Período
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {isMaster && (
          <TabsContent value="audit" className="space-y-6">
            <Card className="border-destructive/20">
              <CardHeader className="bg-destructive/5 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <ShieldCheck size={18} /> Cadeia de Custódia (Master)
                </CardTitle>
                <CardDescription>Trilha de auditoria completa de todas as interações no prontuário.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {[...localEvolutions, ...historyItems.filter(h => !h.isVirtual)].sort((a,b) => new Date((b as any).timestamp || (b as any).data_hora).getTime() - new Date((a as any).timestamp || (a as any).data_hora).getTime()).map((item, idx) => (
                    <div key={idx} className="text-sm pb-3 border-b last:border-0 flex gap-4">
                      <div className="w-1 h-full bg-primary/20 rounded-full shrink-0" />
                      <div className="w-full">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold">{'texto_evolucao' in item ? 'Registro de Evolução' : 'Cadastro de Procedimento'}</p>
                          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded">ID: {item.id}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><UserCheck size={10} /> {(item as any).autor_crm || (item as any).crm_cirurgiao}</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {new Date((item as any).timestamp || (item as any).data_hora).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isEvolViewOpen} onOpenChange={setIsEvolViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Evoluções do Internamento</DialogTitle>
            <DialogDescription>Registros clínicos vinculados a este período de permanência.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[450px] pr-4 mt-4">
            <div className="space-y-4">
              {selectedInternmentEvolutions.map((e) => (
                <div key={e.id} className="p-4 bg-muted/30 rounded-lg border-l-2 border-l-primary/50">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-2">
                    <span className="text-primary">{e.autor_crm}</span>
                    <span>{new Date(e.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{e.texto_evolucao}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setIsEvolViewOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
