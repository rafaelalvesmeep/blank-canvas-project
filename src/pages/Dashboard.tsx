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
  Sparkles,
  Activity,
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-md">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Dashboard
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Activity className="h-4 w-4 text-primary" />
                Visão geral do RH • Janeiro 2026
              </p>
            </div>
          </div>
          <Badge variant="outline" className="px-4 py-2 bg-primary/5 border-primary/20 text-primary">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
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
          <Card className="lg:col-span-2 overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Evolução do Headcount</CardTitle>
                  <CardDescription>Número de colaboradores nos últimos 6 meses</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
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
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
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
          <Card className="overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">Distribuição por Gênero</CardTitle>
                  <CardDescription>Colaboradores ativos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
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
              {genderData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <p className="text-sm text-muted-foreground">Sem dados disponíveis</p>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>

        {/* Open Vacancies */}
        <Card className="overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-1/10">
                <Briefcase className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <CardTitle className="text-lg">Vagas em Aberto</CardTitle>
                <CardDescription>Recrutamento em andamento</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {openVacancies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <Briefcase className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">Nenhuma vaga em aberto</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Todas as posições estão preenchidas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {openVacancies.map((vaga) => (
                  <div
                    key={vaga.id}
                    className="flex items-center justify-between rounded-xl border border-border/50 p-4 transition-all hover:bg-muted/30 hover:border-primary/30 hover:shadow-md group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold group-hover:text-primary transition-colors">{vaga.cargo}</p>
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
                        className="capitalize"
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
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Vagas Fechadas (mês)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-2/5 via-chart-2/10 to-chart-2/5 border-chart-2/20 hover:border-chart-2/40 transition-all hover:shadow-lg group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-2/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-2/20 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-3xl font-bold">— dias</p>
                <p className="text-sm text-muted-foreground">Tempo médio fechamento</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-4/5 via-chart-4/10 to-chart-4/5 border-chart-4/20 hover:border-chart-4/40 transition-all hover:shadow-lg group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-4/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-4/20 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-chart-4" />
              </div>
              <div>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Férias pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-3/5 via-chart-3/10 to-chart-3/5 border-chart-3/20 hover:border-chart-3/40 transition-all hover:shadow-lg group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-3/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Avaliações este mês</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}