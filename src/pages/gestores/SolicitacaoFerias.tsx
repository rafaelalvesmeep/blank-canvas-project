import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, Umbrella, Sun, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/integrations/supabase/safeClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

const statusColors: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  aprovada: "bg-success/10 text-success border-success/20",
  reprovada: "bg-destructive/10 text-destructive border-destructive/20",
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "pendente":
      return <Clock className="h-4 w-4 text-warning" />;
    case "aprovada":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "reprovada":
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return null;
  }
};

export default function SolicitacaoFerias() {
  const queryClient = useQueryClient();

  const { data: solicitacoes = [], isLoading } = useQuery({
    queryKey: ["vacation-requests"],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Backend indisponível: variáveis de ambiente não carregadas.");

      const { data, error } = await supabase
        .from("vacation_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Backend indisponível: variáveis de ambiente não carregadas.");

      const { error } = await supabase
        .from("vacation_requests")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vacation-requests"] });
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

  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: "aprovada" });
  };

  const handleReject = (id: string) => {
    updateStatusMutation.mutate({ id, status: "reprovada" });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-1 to-blue-500 shadow-lg">
                <Umbrella className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-md">
                <Sun className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Solicitação de Férias
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as solicitações de férias dos colaboradores
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="gap-2"
            asChild
          >
            <Link to="/docs/integracao-ferias">
              <FileText className="h-4 w-4" />
              Documentação da API
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-warning/5 via-warning/10 to-transparent border-warning/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-warning/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/20 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.pendentes}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/5 via-success/10 to-transparent border-success/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.aprovadas}</p>
                <p className="text-sm text-muted-foreground">Aprovadas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border-primary/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 group-hover:scale-110 transition-transform">
                <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Solicitações */}
        <Card className="border-border/50 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Solicitações de Férias</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : solicitacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <Umbrella className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">Nenhuma solicitação encontrada</p>
                <p className="text-sm text-muted-foreground/70 mt-1 max-w-md">
                  As solicitações de férias serão exibidas aqui quando recebidas via integração com o sistema SIM.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-6 gap-2"
                  asChild
                >
                  <Link to="/docs/integracao-ferias">
                    <FileText className="h-4 w-4" />
                    Ver Documentação da API
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Dias</TableHead>
                    <TableHead>Solicitado em</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitacoes.map((sol) => (
                    <TableRow key={sol.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">{sol.employee_name}</p>
                          <p className="text-xs text-muted-foreground">{sol.employee_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{sol.department}</TableCell>
                      <TableCell>
                        {format(new Date(sol.start_date), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                        {format(new Date(sol.end_date), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {sol.days_count} dias
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(sol.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={sol.status} />
                          <Badge variant="outline" className={statusColors[sol.status]}>
                            {sol.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {sol.status === "pendente" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-success/10 hover:text-success"
                              onClick={() => handleApprove(sol.id)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleReject(sol.id)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reprovar
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
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
    </MainLayout>
  );
}
