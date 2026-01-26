import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, getMonth, getYear, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarRange, Users, Palmtree, AlertCircle, Shield } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MONTH_NAMES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

interface VacationRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  department: string;
  start_date: string;
  end_date: string;
  days_count: number;
  status: string;
  approved_by: string | null;
}

interface MonthVacation {
  type: "ferias" | "vazio";
  label?: string;
  startDay?: number;
  endDay?: number;
}

interface EmployeeVacationRow {
  employeeId: string;
  employeeName: string;
  department: string;
  status: "Ativo" | "Férias";
  vencimento: string;
  saldoInicio: number;
  teamLeader: string;
  meses: MonthVacation[];
  saldoFinal: number;
  totalDiasUsados: number;
}

const ControleFerias = () => {
  const currentYear = getYear(new Date());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { sectors: gestorSectors, isAdmin, isGestor } = useAuth();
  
  const gestorDepartments = gestorSectors.map((s) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );

  const { data: vacationRequests = [], isLoading } = useQuery({
    queryKey: ["vacation-requests-control", selectedYear, gestorDepartments, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from("vacation_requests")
        .select("*")
        .eq("status", "aprovado");

      // Filter by department for gestores
      if (!isAdmin && isGestor && gestorDepartments.length > 0) {
        query = query.in("department", gestorDepartments);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as VacationRequest[];
    },
  });

  // Process vacation data into spreadsheet format
  const processVacationData = (): EmployeeVacationRow[] => {
    const employeeMap = new Map<string, EmployeeVacationRow>();

    vacationRequests.forEach((request) => {
      const startDate = parseISO(request.start_date);
      const endDate = parseISO(request.end_date);
      
      // Only process vacations for the selected year
      const startYear = getYear(startDate);
      const endYear = getYear(endDate);
      
      if (startYear !== selectedYear && endYear !== selectedYear) {
        return;
      }

      if (!employeeMap.has(request.employee_id)) {
        employeeMap.set(request.employee_id, {
          employeeId: request.employee_id,
          employeeName: request.employee_name,
          department: request.department,
          status: "Ativo",
          vencimento: "-",
          saldoInicio: 30, // Default 30 days
          teamLeader: request.approved_by || "-",
          meses: Array(12).fill(null).map(() => ({ type: "vazio" as const })),
          saldoFinal: 30,
          totalDiasUsados: 0,
        });
      }

      const employee = employeeMap.get(request.employee_id)!;
      employee.totalDiasUsados += request.days_count;
      
      // Mark months with vacation
      const startMonth = getMonth(startDate);
      const endMonth = getMonth(endDate);
      
      // Handle vacation within selected year
      for (let month = startMonth; month <= endMonth; month++) {
        if (month >= 0 && month < 12) {
          const isStartMonth = month === startMonth;
          const isEndMonth = month === endMonth;
          
          const startDay = isStartMonth ? startDate.getDate() : 1;
          const endDay = isEndMonth ? endDate.getDate() : new Date(selectedYear, month + 1, 0).getDate();
          
          employee.meses[month] = {
            type: "ferias",
            label: `férias`,
            startDay,
            endDay,
          };
        }
      }

      // Check if currently on vacation
      const today = new Date();
      if (today >= startDate && today <= endDate) {
        employee.status = "Férias";
      }
    });

    // Calculate final balance
    employeeMap.forEach((employee) => {
      employee.saldoFinal = employee.saldoInicio - employee.totalDiasUsados;
    });

    return Array.from(employeeMap.values()).sort((a, b) => 
      a.employeeName.localeCompare(b.employeeName)
    );
  };

  const employeeRows = processVacationData();

  // Stats
  const totalEmployees = employeeRows.length;
  const employeesOnVacation = employeeRows.filter((e) => e.status === "Férias").length;
  const totalDaysUsed = employeeRows.reduce((sum, e) => sum + e.totalDiasUsados, 0);

  const renderMonthCell = (monthData: MonthVacation) => {
    if (monthData.type === "vazio") {
      return <span className="text-muted-foreground">-</span>;
    }

    return (
      <div className="bg-primary/20 text-primary text-[10px] leading-tight px-1 py-0.5 rounded text-center whitespace-nowrap">
        {monthData.label}
        <br />
        ({monthData.startDay?.toString().padStart(2, "0")} a {monthData.endDay?.toString().padStart(2, "0")})
      </div>
    );
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CalendarRange className="h-8 w-8" />
              Controle de Férias
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão anual de férias por colaborador
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                <Shield className="h-3 w-3 mr-1" />
                Visualização completa (Admin)
              </Badge>
            )}
            {!isAdmin && gestorDepartments.map((dept) => (
              <Badge key={dept} variant="secondary">
                {dept}
              </Badge>
            ))}
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Warning for managers without sectors */}
        {!isAdmin && isGestor && gestorDepartments.length === 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você não possui setores atribuídos. Solicite ao administrador que configure seus setores.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Colaboradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">com férias registradas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Férias Agora</CardTitle>
              <Palmtree className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employeesOnVacation}</div>
              <p className="text-xs text-muted-foreground">colaboradores</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dias Utilizados</CardTitle>
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDaysUsed}</div>
              <p className="text-xs text-muted-foreground">no ano de {selectedYear}</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[180px]">Nome</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="min-w-[80px]">Venc.</TableHead>
                    <TableHead className="min-w-[80px] text-center">Saldo Início</TableHead>
                    <TableHead className="min-w-[120px]">Team Leader</TableHead>
                    {MONTH_NAMES.map((month) => (
                      <TableHead key={month} className="min-w-[90px] text-center">
                        {month}
                      </TableHead>
                    ))}
                    <TableHead className="min-w-[80px] text-center">Saldo Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={18} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : employeeRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={18} className="text-center py-8 text-muted-foreground">
                        Nenhum registro de férias encontrado para {selectedYear}
                      </TableCell>
                    </TableRow>
                  ) : (
                    employeeRows.map((employee) => (
                      <TableRow key={employee.employeeId}>
                        <TableCell className="sticky left-0 bg-background z-10 font-medium">
                          <div>
                            <div>{employee.employeeName}</div>
                            <div className="text-xs text-muted-foreground">{employee.department}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={employee.status === "Férias" ? "default" : "secondary"}
                            className={employee.status === "Férias" ? "bg-emerald-500" : ""}
                          >
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{employee.vencimento}</TableCell>
                        <TableCell className="text-center">{employee.saldoInicio}</TableCell>
                        <TableCell className="text-muted-foreground">{employee.teamLeader}</TableCell>
                        {employee.meses.map((mes, index) => (
                          <TableCell key={index} className="text-center p-1">
                            {renderMonthCell(mes)}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-semibold">
                          <span className={employee.saldoFinal < 0 ? "text-destructive" : ""}>
                            {employee.saldoFinal}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ControleFerias;
