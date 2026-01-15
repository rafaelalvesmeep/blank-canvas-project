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
  Users,
  Umbrella,
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
    // Handle action confirmation
    setSelectedSolicitacao(null);
    setDialogAction(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Férias</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie as solicitações de férias
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
            <CardContent className="flex items-center gap-4 p-6">
              <Clock className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{stats.pendentes}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <CardContent className="flex items-center gap-4 p-6">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{stats.aprovadas}</p>
                <p className="text-sm text-muted-foreground">Aprovadas (mês)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 border-chart-1/20">
            <CardContent className="flex items-center gap-4 p-6">
              <Umbrella className="h-8 w-8 text-chart-1" />
              <div>
                <p className="text-2xl font-bold">{stats.emFerias}</p>
                <p className="text-sm text-muted-foreground">Em férias agora</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Solicitações */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Solicitações de Férias</CardTitle>
              <CardDescription>Aprovar ou reprovar solicitações</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                  <TabsTrigger value="pendentes" className="gap-2">
                    Pendentes
                    {stats.pendentes > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {stats.pendentes}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="aprovadas">Aprovadas</TabsTrigger>
                  <TabsTrigger value="reprovadas">Reprovadas</TabsTrigger>
                  <TabsTrigger value="todas">Todas</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0 space-y-4">
                  {filteredSolicitacoes.map((sol) => {
                    const StatusIcon = statusConfig[sol.status].icon;
                    return (
                      <div
                        key={sol.id}
                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                              {sol.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="font-medium">{sol.colaborador}</p>
                            <p className="text-sm text-muted-foreground">
                              {sol.cargo} • {sol.setor}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {sol.dataInicio} - {sol.dataFim}
                              </span>
                              <Badge variant="secondary">{sol.dias} dias</Badge>
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
                                className="gap-1 text-success hover:bg-success hover:text-white"
                                onClick={() => handleAction(sol, "aprovar")}
                              >
                                <ThumbsUp className="h-4 w-4" />
                                Aprovar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-destructive hover:bg-destructive hover:text-white"
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
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Férias Vencendo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <CardTitle className="text-lg">Férias Vencendo</CardTitle>
              </div>
              <CardDescription>Colaboradores com férias próximas de vencer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {feriasVencendo.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
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
              ))}
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
              <div className="space-y-2 text-sm">
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
