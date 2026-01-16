import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  CheckCircle2,
  CalendarDays,
  Loader2,
  Building2,
  FileText,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const formatDateTime = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Férias Aprovadas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhamento das férias aprovadas pelos gestores
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="group hover:border-success/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{feriasAprovadas.length}</p>
                <p className="text-xs text-muted-foreground">Total aprovadas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:border-chart-1/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10 group-hover:bg-chart-1/20 transition-colors">
                <CalendarDays className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{emFeriasAgora}</p>
                <p className="text-xs text-muted-foreground">Em férias agora</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:border-primary/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{proximasFerias}</p>
                <p className="text-xs text-muted-foreground">Próximas férias</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approved Vacations Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Registro de Férias</CardTitle>
            <CardDescription className="text-xs">
              Férias aprovadas pelos gestores de cada setor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : feriasAprovadas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nenhuma férias aprovada
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  As férias aprovadas pelos gestores aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="text-xs">Colaborador</TableHead>
                      <TableHead className="text-xs">Setor</TableHead>
                      <TableHead className="text-xs">Período</TableHead>
                      <TableHead className="text-xs text-center">Dias</TableHead>
                      <TableHead className="text-xs">Aprovado por</TableHead>
                      <TableHead className="text-xs">Data</TableHead>
                      <TableHead className="text-xs">Obs.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feriasAprovadas.map((ferias) => (
                      <TableRow key={ferias.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                {getInitials(ferias.employee_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{ferias.employee_name}</p>
                              <p className="text-xs text-muted-foreground">{ferias.employee_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{ferias.department}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDate(ferias.start_date)} - {formatDate(ferias.end_date)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-xs">
                            {ferias.days_count}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(ferias as { approved_by?: string }).approved_by ? (
                            <span className="text-sm">
                              {(ferias as { approved_by?: string }).approved_by}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(ferias.updated_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {ferias.notes ? (
                            <span className="text-sm text-muted-foreground">
                              {ferias.notes}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
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
