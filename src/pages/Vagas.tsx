import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Search,
  Plus,
  Clock,
  User,
  Building2,
  Calendar,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Vaga {
  id: number;
  cargo: string;
  setor: string;
  tipo: "CLT" | "PJ" | "Estágio";
  quantidade: number;
  solicitante: string;
  dataSolicitacao: string;
  dataFechamento?: string;
  status: "aberta" | "andamento" | "fechada" | "cancelada";
  prioridade: "baixa" | "media" | "alta";
  diasAberta: number;
}

const vagas: Vaga[] = [];

const statusConfig = {
  aberta: { label: "Aberta", color: "bg-chart-1/10 text-chart-1 border-chart-1/30", icon: AlertCircle },
  andamento: { label: "Em Andamento", color: "bg-warning/10 text-warning border-warning/30", icon: Clock },
  fechada: { label: "Fechada", color: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", color: "bg-destructive/10 text-destructive border-destructive/30", icon: XCircle },
};

const prioridadeColors = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-chart-3/10 text-chart-3",
  alta: "bg-destructive/10 text-destructive",
};

export default function Vagas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSetor, setFilterSetor] = useState("todos");
  const [activeTab, setActiveTab] = useState("todas");

  const filteredVagas = vagas.filter((vaga) => {
    const matchesSearch =
      vaga.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.setor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSetor = filterSetor === "todos" || vaga.setor === filterSetor;
    const matchesTab =
      activeTab === "todas" ||
      (activeTab === "abertas" && (vaga.status === "aberta" || vaga.status === "andamento")) ||
      (activeTab === "fechadas" && vaga.status === "fechada") ||
      (activeTab === "canceladas" && vaga.status === "cancelada");
    return matchesSearch && matchesSetor && matchesTab;
  });

  const stats = {
    abertas: vagas.filter((v) => v.status === "aberta" || v.status === "andamento").length,
    fechadas: vagas.filter((v) => v.status === "fechada").length,
    tempoMedio: Math.round(vagas.filter((v) => v.status === "fechada").reduce((acc, v) => acc + v.diasAberta, 0) / vagas.filter((v) => v.status === "fechada").length) || 0,
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header">
            <h1 className="page-title">Vagas</h1>
            <p className="page-description">Gerencie as solicitações de vagas</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Solicitação
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                <Briefcase className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.abertas}</p>
                <p className="text-xs text-muted-foreground">Em Aberto</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.fechadas}</p>
                <p className="text-xs text-muted-foreground">Fechadas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                <Clock className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.tempoMedio}d</p>
                <p className="text-xs text-muted-foreground">Tempo Médio</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Tabs */}
        <Card>
          <CardContent className="p-5">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <TabsList>
                  <TabsTrigger value="todas">Todas</TabsTrigger>
                  <TabsTrigger value="abertas">Abertas</TabsTrigger>
                  <TabsTrigger value="fechadas">Fechadas</TabsTrigger>
                  <TabsTrigger value="canceladas">Canceladas</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar vaga..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-[180px]"
                    />
                  </div>
                  <Select value={filterSetor} onValueChange={setFilterSetor}>
                    <SelectTrigger className="w-[150px]">
                      <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="Recursos Humanos">RH</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value={activeTab} className="mt-0">
                {filteredVagas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <Briefcase className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">Nenhuma vaga encontrada</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Crie uma nova solicitação</p>
                    <Button className="mt-5 gap-2">
                      <Plus className="h-4 w-4" />
                      Nova Solicitação
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredVagas.map((vaga) => {
                      const StatusIcon = statusConfig[vaga.status].icon;
                      return (
                        <Card key={vaga.id} className="group transition-all hover:shadow-md">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-sm font-medium">{vaga.cargo}</CardTitle>
                                <CardDescription className="flex items-center gap-1 text-xs">
                                  <Building2 className="h-3 w-3" />
                                  {vaga.setor}
                                </CardDescription>
                              </div>
                              <Badge variant="secondary" className={`text-xs ${prioridadeColors[vaga.prioridade]}`}>
                                {vaga.prioridade}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <Badge variant="outline" className={statusConfig[vaga.status].color}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {statusConfig[vaga.status].label}
                              </Badge>
                              <span className="text-muted-foreground">
                                {vaga.tipo} • {vaga.quantidade}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5" />
                                <span>{vaga.solicitante}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{vaga.dataSolicitacao}</span>
                              </div>
                              {vaga.status !== "fechada" && vaga.status !== "cancelada" && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span className={vaga.diasAberta > 10 ? "text-warning font-medium" : ""}>
                                    {vaga.diasAberta} dias
                                  </span>
                                </div>
                              )}
                            </div>

                            <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                              Ver detalhes
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}