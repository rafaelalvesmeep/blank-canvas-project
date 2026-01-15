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
  origem?: string;
}

const vagas: Vaga[] = [
  {
    id: 1,
    cargo: "Desenvolvedor Full Stack",
    setor: "Tecnologia",
    tipo: "CLT",
    quantidade: 2,
    solicitante: "Carlos Mendes",
    dataSolicitacao: "08/01/2026",
    status: "andamento",
    prioridade: "alta",
    diasAberta: 7,
  },
  {
    id: 2,
    cargo: "Analista de RH",
    setor: "Recursos Humanos",
    tipo: "CLT",
    quantidade: 1,
    solicitante: "Ana Paula",
    dataSolicitacao: "12/01/2026",
    status: "aberta",
    prioridade: "media",
    diasAberta: 3,
  },
  {
    id: 3,
    cargo: "Designer UX/UI",
    setor: "Design",
    tipo: "PJ",
    quantidade: 1,
    solicitante: "Marcos Silva",
    dataSolicitacao: "03/01/2026",
    status: "andamento",
    prioridade: "alta",
    diasAberta: 12,
  },
  {
    id: 4,
    cargo: "Estagiário de Marketing",
    setor: "Marketing",
    tipo: "Estágio",
    quantidade: 2,
    solicitante: "Fernanda Lima",
    dataSolicitacao: "10/01/2026",
    status: "aberta",
    prioridade: "baixa",
    diasAberta: 5,
  },
  {
    id: 5,
    cargo: "Gerente de Projetos",
    setor: "Operações",
    tipo: "CLT",
    quantidade: 1,
    solicitante: "Roberto Alves",
    dataSolicitacao: "20/12/2025",
    dataFechamento: "10/01/2026",
    status: "fechada",
    prioridade: "alta",
    diasAberta: 21,
    origem: "LinkedIn",
  },
  {
    id: 6,
    cargo: "Assistente Administrativo",
    setor: "Administrativo",
    tipo: "CLT",
    quantidade: 1,
    solicitante: "Maria Costa",
    dataSolicitacao: "05/01/2026",
    status: "cancelada",
    prioridade: "baixa",
    diasAberta: 10,
  },
];

const statusConfig = {
  aberta: { label: "Aberta", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: AlertCircle },
  andamento: { label: "Em Andamento", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  fechada: { label: "Fechada", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Vagas</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie as solicitações de vagas
              </p>
            </div>
          </div>
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Solicitação
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 border-chart-1/20">
            <CardContent className="flex items-center gap-4 p-6">
              <Briefcase className="h-8 w-8 text-chart-1" />
              <div>
                <p className="text-2xl font-bold">{stats.abertas}</p>
                <p className="text-sm text-muted-foreground">Vagas em Aberto</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <CardContent className="flex items-center gap-4 p-6">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{stats.fechadas}</p>
                <p className="text-sm text-muted-foreground">Fechadas (mês)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-4/5 to-chart-4/10 border-chart-4/20">
            <CardContent className="flex items-center gap-4 p-6">
              <Clock className="h-8 w-8 text-chart-4" />
              <div>
                <p className="text-2xl font-bold">{stats.tempoMedio} dias</p>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Tabs */}
        <Card>
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  <Select value={filterSetor} onValueChange={setFilterSetor}>
                    <SelectTrigger className="w-[180px]">
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredVagas.map((vaga) => {
                    const StatusIcon = statusConfig[vaga.status].icon;
                    return (
                      <Card
                        key={vaga.id}
                        className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                      >
                        <CardHeader className="pb-3">
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
                            className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          >
                            Ver detalhes
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {filteredVagas.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Nenhuma vaga encontrada</p>
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
