
"use client"

import { useState, useEffect } from "react"
import { MOCK_PROCEDIMENTOS } from "@/lib/mock-data"
import { ProcedimentoRealizado, CategoriaPorte, Usuario } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldAlert, FilterX, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from "recharts"

const MONTHS_LABELS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
]

const CATEGORIES: CategoriaPorte[] = ['Broncoscopia', 'Traqueostomia', 'Pequeno Porte', 'Cirurgia']
const COLORS = ['#3366B3', '#664CCC', '#00C49F', '#FFBB28', '#FF8042']

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedSurgeon, setSelectedSurgeon] = useState("all")
  const [allProcedures, setAllProcedures] = useState<ProcedimentoRealizado[]>([])

  useEffect(() => {
    setMounted(true)
    
    // Load session
    const session = localStorage.getItem('hge_session')
    if (session) {
      setCurrentUser(JSON.parse(session))
    }

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
    const lastDay = now.toISOString().split('T')[0]
    setStartDate(firstDay)
    setEndDate(lastDay)

    const stored = localStorage.getItem('hge_procedures')
    const localProcedures = stored ? JSON.parse(stored) : []
    setAllProcedures([...MOCK_PROCEDIMENTOS, ...localProcedures])
  }, [])

  if (mounted && currentUser?.role !== 'master') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
        <div className="bg-destructive/10 p-4 rounded-full text-destructive">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-bold">Acesso Restrito</h2>
        <p className="text-muted-foreground max-w-md">
          Você não tem permissão para visualizar estatísticas de produtividade. 
          Esta funcionalidade é exclusiva para administradores Master.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Voltar para o Início</Link>
        </Button>
      </div>
    )
  }

  const surgeons = Array.from(new Set(allProcedures.map(p => p.crm_cirurgiao))).sort()

  const filteredProcedures = allProcedures.filter(p => {
    const procDate = new Date(p.data_hora).toISOString().split('T')[0]
    const matchesStart = !startDate || procDate >= startDate
    const matchesEnd = !endDate || procDate <= endDate
    const matchesSurgeon = selectedSurgeon === "all" || p.crm_cirurgiao === selectedSurgeon
    
    return matchesStart && matchesEnd && matchesSurgeon
  })

  const porteCounts = filteredProcedures.reduce((acc, p) => {
    acc[p.categoria_porte] = (acc[p.categoria_porte] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(porteCounts).map(([name, value]) => ({ name, value }))

  const surgeonCounts = filteredProcedures.reduce((acc, p) => {
    const crm = p.crm_cirurgiao.split(' ')[1] || p.crm_cirurgiao
    acc[crm] = (acc[crm] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(surgeonCounts).map(([crm, count]) => ({ crm, count }))

  const lineData = MONTHS_LABELS.map((month, index) => {
    const monthData: any = { month }
    CATEGORIES.forEach(cat => {
      monthData[cat] = filteredProcedures.filter(p => {
        const d = new Date(p.data_hora)
        return d.getMonth() === index && p.categoria_porte === cat
      }).length
    })
    return monthData
  })

  const resetFilters = () => {
    const now = new Date()
    setStartDate(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0])
    setEndDate(now.toISOString().split('T')[0])
    setSelectedSurgeon("all")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Produtividade</h1>
          <p className="text-muted-foreground">Análise estatística baseada nos filtros selecionados.</p>
        </div>
        
        <Card className="p-4 border-accent/20 bg-accent/5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="surgeon" className="text-[10px] uppercase font-bold text-accent">Cirurgião</Label>
              <Select value={selectedSurgeon} onValueChange={setSelectedSurgeon}>
                <SelectTrigger id="surgeon" className="h-8 text-xs w-[180px] bg-background">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Cirurgiões</SelectItem>
                  {surgeons.map(crm => (
                    <SelectItem key={crm} value={crm}>{crm}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start" className="text-[10px] uppercase font-bold text-accent">Data Inicial</Label>
              <Input 
                id="start" 
                type="date" 
                className="h-8 text-xs w-[140px] bg-background" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end" className="text-[10px] uppercase font-bold text-accent">Data Final</Label>
              <Input 
                id="end" 
                type="date" 
                className="h-8 text-xs w-[140px] bg-background" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-accent hover:bg-accent/10">
              <FilterX size={16} />
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              Evolução Mensal por Tipo de Procedimento
            </CardTitle>
            <CardDescription>Volume de atendimentos distribuído pelos meses do ano.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  {CATEGORIES.map((cat, idx) => (
                    <Line key={cat} type="monotone" dataKey={cat} stroke={COLORS[idx % COLORS.length]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} name={cat} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Porte</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {mounted && pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name }) => name}>
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-muted-foreground italic">Sem dados.</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Produtividade por Cirurgião</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {mounted && barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="crm" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="count" fill="#3366B3" radius={[4, 4, 0, 0]} name="Procedimentos" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-muted-foreground italic">Sem dados.</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
