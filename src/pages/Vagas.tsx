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
  Sparkles,
  Target,
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
  origem?: string;
}

const vagas: Vaga[] = [];

const statusConfig = {
  aberta: { label: "Aberta", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: AlertCircle },
  andamento: { label: "Em Andamento", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  fechada: { label: "Fechada", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const prioridadeColors = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-chart-3/10 text-chart-3 border-chart-3/30",
  alta: "bg-destructive/10 text-destructive border-destructive/30",
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
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-1 to-primary shadow-lg">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-md">
                <Target className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Vagas
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as solicitações de vagas
              </p>
            </div>
          </div>
          <Button variant="gradient" className="gap-2 shadow-lg hover:shadow-xl transition-all">
            <Plus className="h-4 w-4" />
            Nova Solicitação
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-chart-1/5 via-chart-1/10 to-transparent border-chart-1/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-chart-1/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/20 group-hover:scale-110 transition-transform">
                <Briefcase className="h-6 w-6 text-chart-1" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.abertas}</p>
                <p className="text-sm text-muted-foreground">Vagas em Aberto</p>
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
                <p className="text-3xl font-bold">{stats.fechadas}</p>
                <p className="text-sm text-muted-foreground">Fechadas (mês)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-4/5 via-chart-4/10 to-transparent border-chart-4/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-chart-4/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-4/20 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-chart-4" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.tempoMedio} dias</p>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Tabs */}
        <Card className="border-border/50 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="todas" className="data-[state=active]:bg-background">Todas</TabsTrigger>
                  <TabsTrigger value="abertas" className="data-[state=active]:bg-background">Abertas</TabsTrigger>
                  <TabsTrigger value="fechadas" className="data-[state=active]:bg-background">Fechadas</TabsTrigger>
                  <TabsTrigger value="canceladas" className="data-[state=active]:bg-background">Canceladas</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar vaga..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-[200px] bg-background/50 border-border/50"
                    />
                  </div>
                  <Select value={filterSetor} onValueChange={setFilterSetor}>
                    <SelectTrigger className="w-[180px] bg-background/50 border-border/50">
                      <Building2 className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os setores</SelectItem>
                      <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="Recursos Humanos">RH</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Operações">Operações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value={activeTab} className="mt-0">
                {filteredVagas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                      <Briefcase className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-lg font-medium text-muted-foreground">Nenhuma vaga encontrada</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Crie uma nova solicitação para começar</p>
                    <Button variant="gradient" className="mt-6 gap-2">
                      <Plus className="h-4 w-4" />
                      Nova Solicitação
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredVagas.map((vaga) => {
                      const StatusIcon = statusConfig[vaga.status].icon;
                      return (
                        <Card
                          key={vaga.id}
                          className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 border-border/50 overflow-hidden"
                        >
                          <CardHeader className="pb-3 bg-gradient-to-r from-muted/20 to-transparent">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-base group-hover:text-primary transition-colors">
                                  {vaga.cargo}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {vaga.setor}
                                </CardDescription>
                              </div>
                              <Badge
                                variant="outline"
                                className={prioridadeColors[vaga.prioridade]}
                              >
                                {vaga.prioridade}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <Badge
                                variant="outline"
                                className={statusConfig[vaga.status].color}
                              >
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {statusConfig[vaga.status].label}
                              </Badge>
                              <span className="text-muted-foreground">
                                {vaga.tipo} • {vaga.quantidade} vaga{vaga.quantidade > 1 ? "s" : ""}
                              </span>
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>Solicitado por {vaga.solicitante}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{vaga.dataSolicitacao}</span>
                              </div>
                              {vaga.status !== "fechada" && vaga.status !== "cancelada" && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span className={vaga.diasAberta > 10 ? "text-warning font-medium" : ""}>
                                    {vaga.diasAberta} dias em aberto
                                  </span>
                                </div>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                            >
                              Ver detalhes
                              <ArrowUpRight className="h-4 w-4" />
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