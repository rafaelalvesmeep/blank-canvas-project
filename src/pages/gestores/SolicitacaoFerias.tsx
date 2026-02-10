import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, FileText, Loader2, AlertCircle, User, Mail, Building, Hash } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/integrations/supabase/safeClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const SECTOR_LABEL_MAP: Record<string, string> = {
  administrativo: "Administrativo",
  canais: "Canais",
  comercial: "Comercial",
  compliance: "Compliance",
  compras: "Compras",
  cs: "CS",
  cs_meep: "CS Meep",
  cs_mee: "CS Mee",
  desenvolvimento: "Desenvolvimento",
  eventos: "Eventos",
  financeiro: "Financeiro",
  implantacao: "Implantação",
  integracoes: "Integrações",
  logistica: "Logística",
  marketing: "Marketing",
  produto: "Produto",
  prospeccao: "Prospecção",
  rh: "RH",
  suporte: "Suporte",
  suporte_tecnico: "Suporte Técnico",
};

const statusColors: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  aprovada: "bg-success/10 text-success border-success/20",
  reprovada: "bg-destructive/10 text-destructive border-destructive/20",
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "pendente":
      return <Clock className="h-3.5 w-3.5 text-warning" />;
    case "aprovada":
      return <CheckCircle className="h-3.5 w-3.5 text-success" />;
    case "reprovada":
      return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    default:
      return null;
  }
};

export default function SolicitacaoFerias() {
  const queryClient = useQueryClient();
  const { profile, sectors, isGestor, isAdmin } = useAuth();
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<any | null>(null);

  // Map sectors to department labels for filtering
  const gestorDepartments = sectors.map(s => SECTOR_LABEL_MAP[s] || s);

  const { data: solicitacoes = [], isLoading } = useQuery({
    queryKey: ["vacation-requests", gestorDepartments],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Backend indisponível: variáveis de ambiente não carregadas.");

      let query = supabase
        .from("vacation_requests")
        .select("*")
        .order("created_at", { ascending: false });

      // Admins see all, gestores see only their sectors
      if (!isAdmin && isGestor && gestorDepartments.length > 0) {
        query = query.in("department", gestorDepartments);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, approvedBy }: { id: string; status: string; approvedBy?: string }) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Backend indisponível: variáveis de ambiente não carregadas.");

      const updateData: { status: string; approved_by?: string } = { status };
      if (approvedBy) {
        updateData.approved_by = approvedBy;
      }

      const { error } = await supabase
        .from("vacation_requests")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vacation-requests"] });
      queryClient.invalidateQueries({ queryKey: ["vacation-requests-approved"] });
      setSelectedSolicitacao(null);
      toast.success(
        variables.status === "aprovada"
          ? "Solicitação aprovada com sucesso!"
          : "Solicitação reprovada."
      );
    },
    onError: () => {
      toast.error("Erro ao atualizar status da solicitação");
    },
  });

  const stats = {
    pendentes: solicitacoes.filter((s) => s.status === "pendente").length,
    aprovadas: solicitacoes.filter((s) => s.status === "aprovada").length,
    total: solicitacoes.length,
  };

  const gestorNome = profile?.full_name || "Gestor do Setor";

  const handleApprove = (id: string, department: string) => {
    updateStatusMutation.mutate({ 
      id, 
      status: "aprovada", 
      approvedBy: `${gestorNome} (${department})` 
    });
  };

  const handleReject = (id: string) => {
    updateStatusMutation.mutate({ id, status: "reprovada" });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Solicitação de Férias
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie as solicitações de férias dos colaboradores
            </p>
            {isAdmin && (
              <Badge variant="outline" className="mt-2 text-xs bg-primary/10 text-primary border-primary/20">
                Visualização completa (Admin)
              </Badge>
            )}
            {!isAdmin && isGestor && gestorDepartments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {gestorDepartments.map((dept) => (
                  <Badge key={dept} variant="secondary" className="text-xs">
                    {dept}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link to="/docs/integracao-ferias">
              <FileText className="h-4 w-4" />
              Documentação da API
            </Link>
          </Button>
        </div>

        {/* Aviso se gestor sem setores */}
        {!isAdmin && isGestor && sectors.length === 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-warning shrink-0" />
              <div>
                <p className="text-sm font-medium">Nenhum setor atribuído</p>
                <p className="text-xs text-muted-foreground">
                  Solicite ao administrador que atribua setores ao seu perfil para visualizar as solicitações.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="group hover:border-warning/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 group-hover:bg-warning/20 transition-colors">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.pendentes}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:border-success/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.aprovadas}</p>
                <p className="text-xs text-muted-foreground">Aprovadas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:border-primary/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Solicitações */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Solicitações de Férias</CardTitle>
            <CardDescription className="text-xs">
              Solicitações recebidas via integração
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : solicitacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-3">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Nenhuma solicitação encontrada</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5 max-w-sm">
                  As solicitações serão exibidas aqui quando recebidas via integração
                </p>
                <Button variant="outline" size="sm" className="mt-4 gap-2" asChild>
                  <Link to="/docs/integracao-ferias">
                    <FileText className="h-4 w-4" />
                    Ver Documentação
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Colaborador</TableHead>
                    <TableHead className="text-xs">Setor</TableHead>
                    <TableHead className="text-xs">Período</TableHead>
                    <TableHead className="text-xs">Dias</TableHead>
                    <TableHead className="text-xs">Solicitado em</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-right text-xs">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitacoes.map((sol) => (
                    <TableRow key={sol.id} className="group cursor-pointer hover:bg-muted/50" onClick={() => setSelectedSolicitacao(sol)}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{sol.employee_name}</p>
                          <p className="text-xs text-muted-foreground">{sol.employee_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{sol.department}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(sol.start_date), "dd/MM/yyyy", { locale: ptBR })} –{" "}
                        {format(new Date(sol.end_date), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {sol.days_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(sol.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <StatusIcon status={sol.status} />
                          <Badge variant="outline" className={`text-xs ${statusColors[sol.status]}`}>
                            {sol.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {sol.status === "pendente" ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs hover:bg-success/10 hover:text-success"
                              onClick={() => handleApprove(sol.id, sol.department)}
                              disabled={updateStatusMutation.isPending}
                            >
                              Aprovar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleReject(sol.id)}
                              disabled={updateStatusMutation.isPending}
                            >
                              Reprovar
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedSolicitacao} onOpenChange={(open) => !open && setSelectedSolicitacao(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
          </DialogHeader>

          {selectedSolicitacao && (
            <div className="space-y-4">
              {/* Colaborador */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedSolicitacao.employee_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{selectedSolicitacao.employee_email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedSolicitacao.department}</span>
                </div>
              </div>

              <Separator />

              {/* Período */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Período</p>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(selectedSolicitacao.start_date), "dd/MM/yyyy", { locale: ptBR })} –{" "}
                    {format(new Date(selectedSolicitacao.end_date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="text-xs">{selectedSolicitacao.days_count} dias</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Solicitado em {format(new Date(selectedSolicitacao.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>

              <Separator />

              {/* Status */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                <div className="flex items-center gap-1.5">
                  <StatusIcon status={selectedSolicitacao.status} />
                  <Badge variant="outline" className={`text-xs ${statusColors[selectedSolicitacao.status]}`}>
                    {selectedSolicitacao.status}
                  </Badge>
                </div>
                {selectedSolicitacao.approved_by && (
                  <p className="text-xs text-muted-foreground">
                    Aprovado por: <span className="font-medium">{selectedSolicitacao.approved_by}</span>
                  </p>
                )}
              </div>

              <Separator />

              {/* Observações */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Observações</p>
                <p className="text-sm whitespace-pre-wrap rounded-md bg-muted/50 p-3">
                  {selectedSolicitacao.notes || "Nenhuma observação registrada."}
                </p>
              </div>

              <Separator />

              {/* ID Externo */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                <span>ID Externo: {selectedSolicitacao.external_id}</span>
              </div>

              {/* Ações */}
              {selectedSolicitacao.status === "pendente" && (
                <>
                  <Separator />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleReject(selectedSolicitacao.id)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reprovar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-success hover:bg-success/90"
                      onClick={() => handleApprove(selectedSolicitacao.id, selectedSolicitacao.department)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
