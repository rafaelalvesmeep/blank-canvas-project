import { MainLayout } from "@/components/layout/MainLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  UserPlus,
  UserMinus,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const headcountData = [
  { month: "Jan", colaboradores: 120 },
  { month: "Fev", colaboradores: 125 },
  { month: "Mar", colaboradores: 128 },
  { month: "Abr", colaboradores: 132 },
  { month: "Mai", colaboradores: 138 },
  { month: "Jun", colaboradores: 145 },
];

const genderData = [
  { name: "Masculino", value: 85, color: "hsl(220, 70%, 50%)" },
  { name: "Feminino", value: 60, color: "hsl(280, 65%, 60%)" },
];

const openVacancies = [
  { id: 1, cargo: "Desenvolvedor Full Stack", setor: "TI", dias: 7, prioridade: "alta" },
  { id: 2, cargo: "Analista de RH", setor: "RH", dias: 3, prioridade: "media" },
  { id: 3, cargo: "Designer UX/UI", setor: "Design", dias: 12, prioridade: "alta" },
  { id: 4, cargo: "Assistente Administrativo", setor: "Administrativo", dias: 5, prioridade: "baixa" },
];

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Visão geral do RH • Janeiro 2026
              </p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total de Colaboradores"
            value={145}
            subtitle="Ativos no sistema"
            icon={Users}
            trend={{ value: 5.2, isPositive: true }}
          />
          <KPICard
            title="Admissões"
            value={8}
            subtitle="Este mês"
            icon={UserPlus}
            trend={{ value: 12, isPositive: true }}
          />
          <KPICard
            title="Desligamentos"
            value={2}
            subtitle="Este mês"
            icon={UserMinus}
            trend={{ value: -15, isPositive: true }}
          />
          <KPICard
            title="Vagas Abertas"
            value={12}
            subtitle="Em recrutamento"
            icon={Briefcase}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Headcount Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Evolução do Headcount</CardTitle>
              <CardDescription>Número de colaboradores nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={headcountData}>
                    <defs>
                      <linearGradient id="colorColaboradores" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="colaboradores"
                      stroke="hsl(239, 84%, 67%)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorColaboradores)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gender Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Gênero</CardTitle>
              <CardDescription>Colaboradores ativos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {genderData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Vacancies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Vagas em Aberto</CardTitle>
              <CardDescription>Recrutamento em andamento</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {openVacancies.map((vaga) => (
                <div
                  key={vaga.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{vaga.cargo}</p>
                      <p className="text-sm text-muted-foreground">{vaga.setor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{vaga.dias} dias</span>
                    </div>
                    <Badge
                      variant={
                        vaga.prioridade === "alta"
                          ? "destructive"
                          : vaga.prioridade === "media"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {vaga.prioridade}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="flex items-center gap-4 p-6">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm text-muted-foreground">Vagas Fechadas (mês)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 border-chart-2/20">
            <CardContent className="flex items-center gap-4 p-6">
              <Clock className="h-8 w-8 text-chart-2" />
              <div>
                <p className="text-2xl font-bold">15 dias</p>
                <p className="text-sm text-muted-foreground">Tempo médio fechamento</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-4/5 to-chart-4/10 border-chart-4/20">
            <CardContent className="flex items-center gap-4 p-6">
              <Users className="h-8 w-8 text-chart-4" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Férias pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 border-chart-3/20">
            <CardContent className="flex items-center gap-4 p-6">
              <TrendingUp className="h-8 w-8 text-chart-3" />
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">Avaliações este mês</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
