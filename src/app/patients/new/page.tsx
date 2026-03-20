
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MOCK_PACIENTES } from "@/lib/mock-data"
import { Paciente } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, UserPlus, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function NewPatientPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false)
  const [duplicatePatient, setDuplicatePatient] = useState<Paciente | null>(null)
  const [allPatients, setAllPatients] = useState<Paciente[]>([])
  const [sectors, setSectors] = useState<string[]>([])

  const [formData, setFormData] = useState({
    nome: "",
    hc: "",
    nasc: "",
    entrada: new Date().toISOString().split('T')[0],
    setor: ""
  })

  useEffect(() => {
    setMounted(true)
    // Load Patients
    const storedP = localStorage.getItem('hge_patients')
    const localPatients = storedP ? JSON.parse(storedP) : []
    setAllPatients([...MOCK_PACIENTES, ...localPatients])

    // Load Sectors
    const storedS = localStorage.getItem('hge_sectors')
    if (storedS) {
      setSectors(JSON.parse(storedS))
    } else {
      const defaultSectors = ["UTI", "Enfermaria", "Vermelha", "Observacao"]
      setSectors(defaultSectors)
      localStorage.setItem('hge_sectors', JSON.stringify(defaultSectors))
    }
  }, [])

  const checkDuplicate = () => {
    return allPatients.find(
      p => p.nome.toLowerCase() === formData.nome.toLowerCase() && 
      p.data_nasc === formData.nasc &&
      p.status === 'alta'
    )
  }

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const duplicate = checkDuplicate()
    
    if (duplicate) {
      setDuplicatePatient(duplicate)
      setShowDuplicateAlert(true)
    } else {
      processSubmit()
    }
  }

  const processSubmit = (isReactivation = false) => {
    setIsSubmitting(true)
    
    const newId = Math.random().toString(36).substr(2, 9)

    const newPatient: Paciente = {
      id: newId,
      nome: isReactivation && duplicatePatient ? duplicatePatient.nome : formData.nome,
      registro_hc: isReactivation && duplicatePatient ? duplicatePatient.registro_hc : formData.hc,
      data_nasc: isReactivation && duplicatePatient ? duplicatePatient.data_nasc : formData.nasc,
      data_entrada: formData.entrada,
      unidade_setor: formData.setor,
      status: 'internado'
    }

    const stored = localStorage.getItem('hge_patients')
    const localPatients = stored ? JSON.parse(stored) : []
    
    const updatedLocal = [...localPatients, newPatient]
    localStorage.setItem('hge_patients', JSON.stringify(updatedLocal))

    setTimeout(() => {
      toast({
        title: isReactivation ? "Nova Internação Iniciada!" : "Paciente cadastrado!",
        description: isReactivation 
          ? "Um novo registro de internamento foi criado para o paciente existente."
          : "O paciente foi adicionado à lista de internados com sucesso.",
      })
      router.push("/census")
    }, 800)
  }

  if (!mounted) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Novo Paciente</h1>
      </div>

      <form onSubmit={handlePreSubmit}>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="text-primary" size={20} />
              Dados de Identificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input 
                  id="nome" 
                  placeholder="Nome do paciente" 
                  required 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hc">Registro HC</Label>
                <Input 
                  id="hc" 
                  placeholder="0000000" 
                  required 
                  value={formData.hc}
                  onChange={(e) => setFormData({...formData, hc: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nasc">Data de Nascimento</Label>
                <Input 
                  id="nasc" 
                  type="date" 
                  required 
                  value={formData.nasc}
                  onChange={(e) => setFormData({...formData, nasc: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entrada">Data de Entrada</Label>
                <Input 
                  id="entrada" 
                  type="date" 
                  required 
                  value={formData.entrada}
                  onChange={(e) => setFormData({...formData, entrada: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor">Unidade / Setor</Label>
              <Select 
                required 
                onValueChange={(v) => setFormData({...formData, setor: v})}
              >
                <SelectTrigger id="setor">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                  {sectors.length === 0 && (
                    <p className="p-2 text-xs text-muted-foreground text-center">Nenhum setor disponível</p>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 bg-muted/20 p-6 border-t">
            <Button variant="outline" type="button" asChild disabled={isSubmitting}>
              <Link href="/">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Cadastrar Paciente"}
              <Save size={16} className="ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </form>

      <AlertDialog open={showDuplicateAlert} onOpenChange={setShowDuplicateAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertCircle size={24} />
              <AlertDialogTitle>Paciente já possui histórico</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Encontramos um registro histórico para <strong>{duplicatePatient?.nome}</strong>.
              <br /><br />
              Deseja iniciar um <strong>novo internamento</strong> para este paciente? O histórico anterior será preservado e vinculado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => processSubmit(false)}>Não, criar novo registro</AlertDialogCancel>
            <AlertDialogAction onClick={() => processSubmit(true)} className="bg-primary">
              Sim, novo internamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
