import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getYear } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Employee {
  employee_id: string;
  name: string;
}

interface RegisterCreditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  currentYear: number;
  createdBy?: string;
}

export function RegisterCreditDialog({ open, onOpenChange, employees, currentYear, createdBy }: RegisterCreditDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [creditDays, setCreditDays] = useState("");
  const [reason, setReason] = useState("");
  const [referenceYear, setReferenceYear] = useState(currentYear.toString());

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee || !creditDays) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione o colaborador e informe os dias de crédito.",
        variant: "destructive",
      });
      return;
    }

    const days = parseInt(creditDays);
    if (isNaN(days) || days === 0) {
      toast({
        title: "Valor inválido",
        description: "Informe um número válido de dias (positivo para adicionar, negativo para remover).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("vacation_credits").insert({
        employee_id: selectedEmployee,
        credit_days: days,
        reason: reason || null,
        reference_year: parseInt(referenceYear),
        created_by: createdBy || "Sistema",
      });

      if (error) throw error;

      toast({
        title: "Crédito registrado",
        description: `${days > 0 ? "+" : ""}${days} dias registrados com sucesso.`,
      });

      queryClient.invalidateQueries({ queryKey: ["vacation-credits"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onOpenChange(false);
      resetForm();
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

  const resetForm = () => {
    setSelectedEmployee("");
    setCreditDays("");
    setReason("");
    setReferenceYear(currentYear.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Crédito de Férias</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Colaborador *</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o colaborador" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.employee_id} value={emp.employee_id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creditDays">Dias *</Label>
              <Input
                id="creditDays"
                type="number"
                value={creditDays}
                onChange={(e) => setCreditDays(e.target.value)}
                placeholder="Ex: 10 ou -5"
              />
              <p className="text-xs text-muted-foreground">
                Positivo para adicionar, negativo para remover
              </p>
            </div>
            <div className="space-y-2">
              <Label>Ano de Referência</Label>
              <Select value={referenceYear} onValueChange={setReferenceYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Motivo</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo do ajuste (opcional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
