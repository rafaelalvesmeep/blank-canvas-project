import { MainLayout } from "@/components/layout/MainLayout";
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
  Calendar,
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
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">
              Visão geral do RH • Janeiro 2026
            </p>
          </div>
          <Badge variant="secondary" className="w-fit text-xs font-medium">
            <span className="relative flex h-1.5 w-1.5 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
            </span>
            Atualizado agora
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Colaboradores</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <UserPlus className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Admissões</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <UserMinus className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Desligamentos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Briefcase className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Vagas Abertas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Headcount Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Evolução do Headcount</CardTitle>
              <CardDescription>Colaboradores nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                {headcountData.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Sem dados disponíveis</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={headcountData}>
                      <defs>
                        <linearGradient id="colorColaboradores" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(20, 10%, 45%)' }} />
                      <YAxis className="text-xs" tick={{ fill: 'hsl(20, 10%, 45%)' }} />
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
                        stroke="hsl(173, 58%, 39%)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorColaboradores)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gender Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Distribuição por Gênero</CardTitle>
              <CardDescription>Colaboradores ativos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                {genderData.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Sem dados</p>
                    </div>
                  </div>
                ) : (
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
                )}
              </div>
              {genderData.length > 0 && (
                <div className="flex justify-center gap-6 mt-3">
                  {genderData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
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
              <CardDescription>Recrutamento em andamento</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5">
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {openVacancies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhuma vaga em aberto</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Todas as posições estão preenchidas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openVacancies.map((vaga) => (
                  <div
                    key={vaga.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
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
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{vaga.dias}d</span>
                      </div>
                      <Badge
                        variant={vaga.prioridade === "alta" ? "destructive" : "secondary"}
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
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                <CheckCircle2 className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Vagas Fechadas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                <Clock className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-semibold">— d</p>
                <p className="text-xs text-muted-foreground">Tempo Médio</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                <Calendar className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Férias Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                <TrendingUp className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Avaliações</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}