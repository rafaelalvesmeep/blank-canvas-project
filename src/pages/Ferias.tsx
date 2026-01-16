import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  CheckCircle2,
  CalendarDays,
  Umbrella,
  Sun,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/integrations/supabase/safeClient";
import { format, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Ferias() {
  const { data: feriasAprovadas = [], isLoading } = useQuery({
    queryKey: ["vacation-requests-approved"],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Backend indisponível.");

      const { data, error } = await supabase
        .from("vacation_requests")
        .select("*")
        .eq("status", "aprovada")
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const today = new Date();
  const emFeriasAgora = feriasAprovadas.filter((f) => {
    try {
      const start = parseISO(f.start_date);
      const end = parseISO(f.end_date);
      return isWithinInterval(today, { start, end });
    } catch {
      return false;
    }
  }).length;

  const proximasFerias = feriasAprovadas.filter((f) => {
    try {
      const start = parseISO(f.start_date);
      return start > today;
    } catch {
      return false;
    }
  }).length;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
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
                Férias Aprovadas
              </h1>
              <p className="text-muted-foreground mt-1">
                Visualização das férias aprovadas pelos gestores
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-success/5 via-success/10 to-transparent border-success/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold">{feriasAprovadas.length}</p>
                <p className="text-sm text-muted-foreground">Total Aprovadas</p>
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
                <p className="text-3xl font-bold">{emFeriasAgora}</p>
                <p className="text-sm text-muted-foreground">Em férias agora</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border-primary/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 group-hover:scale-110 transition-transform">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{proximasFerias}</p>
                <p className="text-sm text-muted-foreground">Próximas férias</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approved Vacations Table */}
        <Card className="border-border/50 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Férias Aprovadas</CardTitle>
                <CardDescription>
                  Lista de férias aprovadas pelos gestores de cada setor
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : feriasAprovadas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <Calendar className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">
                  Nenhuma férias aprovada
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  As férias aprovadas pelos gestores aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead className="text-center">Dias</TableHead>
                      <TableHead>Aprovado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feriasAprovadas.map((ferias) => (
                      <TableRow key={ferias.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-background shadow-md">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold text-sm">
                                {getInitials(ferias.employee_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{ferias.employee_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {ferias.employee_email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-muted/50">
                            {ferias.department}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatDate(ferias.start_date)} - {formatDate(ferias.end_date)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            {ferias.days_count} dias
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(ferias.updated_at.split("T")[0])}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
