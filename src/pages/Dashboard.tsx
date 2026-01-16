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
  BarChart3,
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

const headcountData: { month: string; colaboradores: number }[] = [];

const genderData: { name: string; value: number; color: string }[] = [];

const openVacancies: { id: number; cargo: string; setor: string; dias: number; prioridade: string }[] = [];

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Visão geral do RH • Janeiro 2026
            </p>
          </div>
          <Badge variant="outline" className="w-fit px-3 py-1.5 text-xs font-medium">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Atualizado agora
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total de Colaboradores"
            value={0}
            subtitle="Ativos no sistema"
            icon={Users}
          />
          <KPICard
            title="Admissões"
            value={0}
            subtitle="Este mês"
            icon={UserPlus}
          />
          <KPICard
            title="Desligamentos"
            value={0}
            subtitle="Este mês"
            icon={UserMinus}
          />
          <KPICard
            title="Vagas Abertas"
            value={0}
            subtitle="Em recrutamento"
            icon={Briefcase}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Headcount Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Evolução do Headcount</CardTitle>
                  <CardDescription className="text-xs">Últimos 6 meses</CardDescription>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={headcountData}>
                    <defs>
                      <linearGradient id="colorColaboradores" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="month" className="text-xs" tickLine={false} axisLine={false} />
                    <YAxis className="text-xs" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="colaboradores"
                      stroke="hsl(var(--primary))"
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
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Distribuição por Gênero</CardTitle>
                  <CardDescription className="text-xs">Colaboradores ativos</CardDescription>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
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
              {genderData.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-2">Sem dados disponíveis</p>
              ) : (
                <div className="flex justify-center gap-4 mt-2">
                  {genderData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Open Vacancies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-medium">Vagas em Aberto</CardTitle>
              <CardDescription className="text-xs">Recrutamento em andamento</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {openVacancies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Nenhuma vaga em aberto</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">Todas as posições estão preenchidas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openVacancies.map((vaga) => (
                  <div
                    key={vaga.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Briefcase className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{vaga.cargo}</p>
                        <p className="text-xs text-muted-foreground">{vaga.setor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs">{vaga.dias}d</span>
                      </div>
                      <Badge
                        variant={
                          vaga.prioridade === "alta"
                            ? "destructive"
                            : vaga.prioridade === "media"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs capitalize"
                      >
                        {vaga.prioridade}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group hover:border-primary/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Vagas fechadas (mês)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:border-primary/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10 group-hover:bg-chart-2/20 transition-colors">
                <Clock className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-semibold">— dias</p>
                <p className="text-xs text-muted-foreground">Tempo médio fechamento</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:border-primary/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10 group-hover:bg-chart-4/20 transition-colors">
                <Users className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Férias pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:border-primary/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10 group-hover:bg-chart-3/20 transition-colors">
                <TrendingUp className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Avaliações este mês</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}