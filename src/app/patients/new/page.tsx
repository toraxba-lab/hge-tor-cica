"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase" // CONEXÃO COM BANCO
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
  
  const [formData, setFormData] = useState({
    nome: "",
    hc: "",
    nasc: "",
    entrada: new Date().toISOString().split('T')[0],
    setor: ""
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Por enquanto, vamos direto para o cadastro real no banco
    processSubmit()
  }

  const processSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // 1. SALVA NO SUPABASE
      const { data, error } = await supabase
        .from('patients')
        .insert([
          { 
            name: formData.nome,
            nome: formData.nome,
            registro_hc: formData.hc,
            data_nasc: formData.nasc,
            data_entrada: formData.entrada,
            unidade_setor: formData.setor,
            status: 'internado'
          }
        ])
        .select()

      if (error) throw error

      toast({
        title: "Paciente cadastrado com sucesso!",
        description: "O prontuário digital foi criado no banco de dados.",
      })

      // 2. REDIRECIONA DIRETO PARA O PRONTUÁRIO DELE
      const novoId = data[0].id
      router.push(`/patients/${novoId}`)

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/patients">
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admitir Paciente</h1>
      </div>

      <form onSubmit={handlePreSubmit}>
        <Card className="shadow-lg border-blue-100">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2 text-blue-700 text-lg">
              <UserPlus size={20} />
              Identificação e Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input 
                  id="nome" 
                  placeholder="Ex: José da Silva" 
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
                <SelectTrigger id="setor" className="bg-white">
                  <SelectValue placeholder="Selecione onde o paciente está" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTI">UTI</SelectItem>
                  <SelectItem value="Enfermaria">Enfermaria</SelectItem>
                  <SelectItem value="Centro Cirúrgico">Centro Cirúrgico</SelectItem>
                  <SelectItem value="Emergência">Emergência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 bg-slate-50 p-6 border-t">
            <Button variant="outline" type="button" asChild disabled={isSubmitting}>
              <Link href="/patients">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Gravando no Banco..." : "Confirmar Internamento"}
              <Save size={16} className="ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
