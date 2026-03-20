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
                    </RadioGroup
