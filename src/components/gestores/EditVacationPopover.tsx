import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Pencil, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VacationRequest {
  id: string;
  employee_name: string;
  start_date: string;
  end_date: string;
  days_count: number;
}

interface EditVacationPopoverProps {
  vacation: VacationRequest;
  children: React.ReactNode;
}

export function EditVacationPopover({ vacation, children }: EditVacationPopoverProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [startDate, setStartDate] = useState<Date>(parseISO(vacation.start_date));
  const [endDate, setEndDate] = useState<Date>(parseISO(vacation.end_date));
  const [isSaving, setIsSaving] = useState(false);

  const calculateDays = () => {
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSave = async () => {
    if (endDate < startDate) {
      toast({ title: "Data inválida", description: "A data final deve ser posterior à inicial.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("vacation_requests")
        .update({
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          days_count: calculateDays(),
        })
        .eq("id", vacation.id);
      if (error) throw error;
      toast({ title: "Férias atualizadas", description: `Período de ${vacation.employee_name} atualizado.` });
      queryClient.invalidateQueries({ queryKey: ["vacation-requests-control"] });
      setOpen(false);
      setIsEditing(false);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("vacation_requests")
        .update({ status: "cancelada" })
        .eq("id", vacation.id);
      if (error) throw error;
      toast({ title: "Férias removidas", description: `Férias de ${vacation.employee_name} foram canceladas.` });
      queryClient.invalidateQueries({ queryKey: ["vacation-requests-control"] });
      setOpen(false);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="center">
          <div className="space-y-3">
            <div className="text-sm font-medium">{vacation.employee_name}</div>

            {!isEditing ? (
              <>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Início: {format(parseISO(vacation.start_date), "dd/MM/yyyy")}</div>
                  <div>Fim: {format(parseISO(vacation.end_date), "dd/MM/yyyy")}</div>
                  <div>Dias: {vacation.days_count}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Remover
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {format(startDate, "dd/MM/yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Fim</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {format(endDate, "dd/MM/yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={endDate} onSelect={(d) => d && setEndDate(d)} locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                </div>
                {endDate >= startDate && (
                  <div className="text-xs text-muted-foreground">
                    Total: <span className="font-medium text-foreground">{calculateDays()} dias</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover férias?</AlertDialogTitle>
            <AlertDialogDescription>
              As férias de {vacation.employee_name} ({format(parseISO(vacation.start_date), "dd/MM/yyyy")} - {format(parseISO(vacation.end_date), "dd/MM/yyyy")}) serão canceladas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSaving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isSaving ? "Removendo..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
