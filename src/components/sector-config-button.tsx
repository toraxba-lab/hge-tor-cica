
'use client';

import { useState, useEffect } from "react";
import { Settings, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Usuario } from "@/lib/types";

export function SectorConfigButton() {
  const [mounted, setMounted] = useState(false);
  const [sectors, setSectors] = useState<string[]>([]);
  const [newSectorName, setNewSectorName] = useState("");
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    setMounted(true);
    
    // Carrega sessão real
    const session = localStorage.getItem('hge_session');
    if (session) {
      setCurrentUser(JSON.parse(session));
    }

    const storedS = localStorage.getItem('hge_sectors');
    if (storedS) {
      setSectors(JSON.parse(storedS));
    } else {
      const defaultSectors = ["UTI", "Enfermaria", "Vermelha", "Observacao"];
      setSectors(defaultSectors);
      localStorage.setItem('hge_sectors', JSON.stringify(defaultSectors));
    }
  }, []);

  const isMaster = currentUser?.role === 'master';

  const handleAddSector = () => {
    if (!newSectorName.trim()) return;
    if (sectors.includes(newSectorName.trim())) {
      toast({ variant: "destructive", title: "Erro", description: "Este setor já existe." });
      return;
    }
    const updated = [...sectors, newSectorName.trim()];
    setSectors(updated);
    localStorage.setItem('hge_sectors', JSON.stringify(updated));
    setNewSectorName("");
    toast({ title: "Setor Adicionado", description: "O novo local já está disponível para uso." });
    window.dispatchEvent(new Event('sectorsUpdated'));
  };

  const handleDeleteSector = (name: string) => {
    if (!isMaster) {
      toast({ variant: "destructive", title: "Acesso Negado", description: "Apenas administradores podem excluir unidades." });
      return;
    }
    const updated = sectors.filter(s => s !== name);
    setSectors(updated);
    localStorage.setItem('hge_sectors', JSON.stringify(updated));
    toast({ title: "Setor Removido", description: "O local foi excluído das opções." });
    window.dispatchEvent(new Event('sectorsUpdated'));
  };

  if (!mounted || !currentUser) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2 h-8 px-2">
          <Settings size={18} />
          <span className="hidden sm:inline text-xs">Unidades</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Locais de Internamento</DialogTitle>
          <DialogDescription>
            Adicione novos setores. Apenas administradores Master podem remover unidades existentes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Nome do novo setor (ex: Semi-Intensiva)" 
              value={newSectorName}
              onChange={(e) => setNewSectorName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSector()}
            />
            <Button onClick={handleAddSector} size="icon">
              <Plus size={18} />
            </Button>
          </div>
          <div className="border rounded-md divide-y max-h-[300px] overflow-auto">
            {sectors.map((sector) => (
              <div key={sector} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                <span className="text-sm font-medium">{sector}</span>
                {isMaster && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive h-8 w-8"
                    onClick={() => handleDeleteSector(sector)}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            ))}
            {sectors.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Nenhum setor cadastrado.
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <p className="text-[10px] text-muted-foreground">As alterações são salvas localmente no navegador.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
