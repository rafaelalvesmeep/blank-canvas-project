import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface EditBalancePopoverProps {
  employeeId: string;
  currentBalance: number;
}

export const EditBalancePopover = ({ employeeId, currentBalance }: EditBalancePopoverProps) => {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(currentBalance.toString());
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    const newBalance = parseInt(balance);
    if (isNaN(newBalance) || newBalance < 0) {
      toast.error("Insira um valor válido");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("employees")
        .update({ vacation_balance: newBalance })
        .eq("employee_id", employeeId);

      if (error) throw error;

      toast.success("Saldo atualizado");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setOpen(false);
    } catch (err) {
      toast.error("Erro ao atualizar saldo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (v) setBalance(currentBalance.toString()); }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Pencil className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3" align="center">
        <div className="space-y-2">
          <Label className="text-xs">Saldo (dias)</Label>
          <Input
            type="number"
            min={0}
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="h-8 text-sm"
          />
          <Button size="sm" className="w-full h-7 text-xs" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
