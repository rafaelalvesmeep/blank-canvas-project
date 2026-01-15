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
  pendente: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/30", icon: Clock },
  aprovada: { label: "Aprovada", color: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
  reprovada: { label: "Reprovada", color: "bg-destructive/10 text-destructive border-destructive/30", icon: XCircle },
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
    emFerias: 0,
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
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Férias</h1>
          <p className="page-description">Gerencie as solicitações de férias</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.pendentes}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.aprovadas}</p>
                <p className="text-xs text-muted-foreground">Aprovadas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                <Calendar className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.emFerias}</p>
                <p className="text-xs text-muted-foreground">Em Férias</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Solicitações */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Solicitações de Férias</CardTitle>
              <CardDescription>Aprovar ou reprovar solicitações</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                  <TabsTrigger value="pendentes" className="gap-1.5">
                    Pendentes
                    {stats.pendentes > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-warning/20 text-warning">
                        {stats.pendentes}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="aprovadas">Aprovadas</TabsTrigger>
                  <TabsTrigger value="reprovadas">Reprovadas</TabsTrigger>
                  <TabsTrigger value="todas">Todas</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0 space-y-3">
                  {filteredSolicitacoes.map((sol) => {
                    const StatusIcon = statusConfig[sol.status].icon;
                    return (
                      <div
                        key={sol.id}
                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                              {sol.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">{sol.colaborador}</p>
                            <p className="text-xs text-muted-foreground">
                              {sol.cargo} • {sol.setor}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {sol.dataInicio} - {sol.dataFim}
                              </span>
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                {sol.dias} dias
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${statusConfig[sol.status].color}`}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig[sol.status].label}
                          </Badge>

                          {sol.status === "pendente" && (
                            <div className="flex gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 text-xs text-success hover:bg-success hover:text-white"
                                onClick={() => handleAction(sol, "aprovar")}
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                                Aprovar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 text-xs text-destructive hover:bg-destructive hover:text-white"
                                onClick={() => handleAction(sol, "reprovar")}
                              >
                                <ThumbsDown className="h-3.5 w-3.5" />
                                Reprovar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredSolicitacoes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Calendar className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">Nenhuma solicitação</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Não há solicitações nesta categoria</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Férias Vencendo */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <CardTitle className="text-base font-medium">Férias Vencendo</CardTitle>
              </div>
              <CardDescription>Próximas de vencer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {feriasVencendo.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-success/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma férias vencendo</p>
                  <p className="text-xs text-muted-foreground/70">Tudo em dia!</p>
                </div>
              ) : (
                feriasVencendo.map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{item.colaborador}</p>
                      <p className="text-xs text-muted-foreground">{item.setor}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={`text-xs ${item.diasRestantes <= 10 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}
                      >
                        {item.diasRestantes}d
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-0.5">Saldo: {item.saldo}d</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={!!selectedSolicitacao} onOpenChange={() => setSelectedSolicitacao(null)}>
          <DialogContent>
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
              <div className="space-y-1.5 text-sm p-3 rounded-lg bg-muted/50">
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