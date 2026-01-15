import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  CalendarDays,
  Umbrella,
  Sparkles,
  Sun,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SolicitacaoFerias {
  id: number;
  colaborador: string;
  cargo: string;
  setor: string;
  avatar: string;
  dataInicio: string;
  dataFim: string;
  dias: number;
  status: "pendente" | "aprovada" | "reprovada";
  dataSolicitacao: string;
  observacao?: string;
}

const solicitacoes: SolicitacaoFerias[] = [];

const feriasVencendo: { colaborador: string; setor: string; diasRestantes: number; saldo: number }[] = [];

const statusConfig = {
  pendente: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  aprovada: { label: "Aprovada", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  reprovada: { label: "Reprovada", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

export default function Ferias() {
  const [activeTab, setActiveTab] = useState("pendentes");
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoFerias | null>(null);
  const [dialogAction, setDialogAction] = useState<"aprovar" | "reprovar" | null>(null);

  const filteredSolicitacoes = solicitacoes.filter((sol) => {
    if (activeTab === "pendentes") return sol.status === "pendente";
    if (activeTab === "aprovadas") return sol.status === "aprovada";
    if (activeTab === "reprovadas") return sol.status === "reprovada";
    return true;
  });

  const stats = {
    pendentes: solicitacoes.filter((s) => s.status === "pendente").length,
    aprovadas: solicitacoes.filter((s) => s.status === "aprovada").length,
    emFerias: 3,
  };

  const handleAction = (solicitacao: SolicitacaoFerias, action: "aprovar" | "reprovar") => {
    setSelectedSolicitacao(solicitacao);
    setDialogAction(action);
  };

  const confirmAction = () => {
    setSelectedSolicitacao(null);
    setDialogAction(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                Férias
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as solicitações de férias
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
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
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.aprovadas}</p>
                <p className="text-sm text-muted-foreground">Aprovadas (mês)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-1/5 via-chart-1/10 to-transparent border-chart-1/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-chart-1/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/20 group-hover:scale-110 transition-transform">
                <Umbrella className="h-6 w-6 text-chart-1" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.emFerias}</p>
                <p className="text-sm text-muted-foreground">Em férias agora</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Solicitações */}
          <Card className="lg:col-span-2 border-border/50 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Solicitações de Férias</CardTitle>
                  <CardDescription>Aprovar ou reprovar solicitações</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="pendentes" className="gap-2 data-[state=active]:bg-background">
                    Pendentes
                    {stats.pendentes > 0 && (
                      <Badge variant="secondary" className="ml-1 bg-warning/20 text-warning">
                        {stats.pendentes}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="aprovadas" className="data-[state=active]:bg-background">Aprovadas</TabsTrigger>
                  <TabsTrigger value="reprovadas" className="data-[state=active]:bg-background">Reprovadas</TabsTrigger>
                  <TabsTrigger value="todas" className="data-[state=active]:bg-background">Todas</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0 space-y-4">
                  {filteredSolicitacoes.map((sol) => {
                    const StatusIcon = statusConfig[sol.status].icon;
                    return (
                      <div
                        key={sol.id}
                        className="flex items-center justify-between rounded-xl border border-border/50 p-4 transition-all hover:bg-muted/30 hover:border-primary/30 hover:shadow-md group"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                              {sol.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="font-semibold group-hover:text-primary transition-colors">{sol.colaborador}</p>
                            <p className="text-sm text-muted-foreground">
                              {sol.cargo} • {sol.setor}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {sol.dataInicio} - {sol.dataFim}
                              </span>
                              <Badge variant="secondary" className="bg-primary/10 text-primary">{sol.dias} dias</Badge>
                            </div>
                            {sol.observacao && (
                              <p className="text-xs text-muted-foreground italic mt-1">
                                "{sol.observacao}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={statusConfig[sol.status].color}
                          >
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig[sol.status].label}
                          </Badge>

                          {sol.status === "pendente" && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 border-success/30 text-success hover:bg-success hover:text-white hover:border-success"
                                onClick={() => handleAction(sol, "aprovar")}
                              >
                                <ThumbsUp className="h-4 w-4" />
                                Aprovar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 border-destructive/30 text-destructive hover:bg-destructive hover:text-white hover:border-destructive"
                                onClick={() => handleAction(sol, "reprovar")}
                              >
                                <ThumbsDown className="h-4 w-4" />
                                Reprovar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredSolicitacoes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                        <Calendar className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                      <p className="text-lg font-medium text-muted-foreground">Nenhuma solicitação encontrada</p>
                      <p className="text-sm text-muted-foreground/70 mt-1">Não há solicitações nesta categoria</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Férias Vencendo */}
          <Card className="border-border/50 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-warning/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/20">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-lg">Férias Vencendo</CardTitle>
                  <CardDescription>Colaboradores com férias próximas de vencer</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {feriasVencendo.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-success/10 mb-3">
                    <CheckCircle2 className="h-7 w-7 text-success" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Nenhuma férias vencendo</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Tudo em dia!</p>
                </div>
              ) : (
                feriasVencendo.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl border border-border/50 p-4 transition-all hover:bg-muted/30 hover:shadow-sm"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.colaborador}</p>
                      <p className="text-xs text-muted-foreground">{item.setor}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          item.diasRestantes <= 10
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        }
                      >
                        {item.diasRestantes} dias
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Saldo: {item.saldo} dias
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={!!selectedSolicitacao} onOpenChange={() => setSelectedSolicitacao(null)}>
          <DialogContent className="border-border/50">
            <DialogHeader>
              <DialogTitle>
                {dialogAction === "aprovar" ? "Aprovar Férias" : "Reprovar Férias"}
              </DialogTitle>
              <DialogDescription>
                {dialogAction === "aprovar"
                  ? `Confirma a aprovação das férias de ${selectedSolicitacao?.colaborador}?`
                  : `Confirma a reprovação das férias de ${selectedSolicitacao?.colaborador}?`}
              </DialogDescription>
            </DialogHeader>
            {selectedSolicitacao && (
              <div className="space-y-2 text-sm p-4 rounded-lg bg-muted/50">
                <p><strong>Período:</strong> {selectedSolicitacao.dataInicio} - {selectedSolicitacao.dataFim}</p>
                <p><strong>Duração:</strong> {selectedSolicitacao.dias} dias</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedSolicitacao(null)}>
                Cancelar
              </Button>
              <Button
                variant={dialogAction === "aprovar" ? "default" : "destructive"}
                onClick={confirmAction}
              >
                {dialogAction === "aprovar" ? "Aprovar" : "Reprovar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}