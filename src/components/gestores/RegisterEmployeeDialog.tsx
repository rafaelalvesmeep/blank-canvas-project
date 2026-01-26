import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ALL_SECTORS = [
  "Administrativo", "Canais", "Comercial", "Compliance", "Compras", "CS",
  "Desenvolvimento", "Eventos", "Financeiro", "Implantação", "Integrações",
  "Logística", "Marketing", "Produto", "Prospecção", "RH", "Suporte Técnico"
];

interface RegisterEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSector?: string;
}

export function RegisterEmployeeDialog({ open, onOpenChange, defaultSector }: RegisterEmployeeDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: defaultSector || "",
    teamLeader: "",
    vacationBalance: "30",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.department) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, email e setor.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const employeeId = `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await supabase.from("employees").insert({
        employee_id: employeeId,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        team_leader: formData.teamLeader || null,
        vacation_balance: parseInt(formData.vacationBalance) || 30,
      });

      if (error) throw error;

      toast({
        title: "Colaborador cadastrado",
        description: `${formData.name} foi adicionado com sucesso.`,
      });

      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onOpenChange(false);
      setFormData({
        name: "",
        email: "",
        department: defaultSector || "",
        teamLeader: "",
        vacationBalance: "30",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Colaborador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome completo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@empresa.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Setor *</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {ALL_SECTORS.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="teamLeader">Líder</Label>
            <Input
              id="teamLeader"
              value={formData.teamLeader}
              onChange={(e) => setFormData({ ...formData, teamLeader: e.target.value })}
              placeholder="Nome do líder (opcional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vacationBalance">Saldo de Férias (dias)</Label>
            <Input
              id="vacationBalance"
              type="number"
              min="0"
              max="60"
              value={formData.vacationBalance}
              onChange={(e) => setFormData({ ...formData, vacationBalance: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
