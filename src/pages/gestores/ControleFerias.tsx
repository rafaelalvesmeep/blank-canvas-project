import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMonth, getYear, parseISO } from "date-fns";
import { CalendarRange, Users, Palmtree, AlertCircle, Calendar, Plus, CreditCard } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterVacationDialog } from "@/components/gestores/RegisterVacationDialog";
import { RegisterCreditDialog } from "@/components/gestores/RegisterCreditDialog";
import { EditVacationPopover } from "@/components/gestores/EditVacationPopover";

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

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  department: string;
  team_leader: string | null;
  vacation_balance: number;
}

interface MonthVacation {
  type: "ferias" | "vazio";
  label?: string;
  startDay?: number;
  endDay?: number;
  requestId?: string;
  requestData?: {
    id: string;
    employee_name: string;
    start_date: string;
    end_date: string;
    days_count: number;
  };
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

const ALL_SECTORS = [
  "Administrativo", "Canais", "Comercial", "Compliance", "Compras", "CS",
  "Desenvolvimento", "Eventos", "Financeiro", "Implantação", "Integrações",
  "Logística", "Marketing", "Produto", "Prospecção", "RH", "Suporte Técnico"
];

const ControleFerias = () => {
  const currentYear = getYear(new Date());
  const currentMonth = getMonth(new Date());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const { sectors: gestorSectors, isAdmin, isGestor, profile } = useAuth();
  
  // Dialogs state
  const [showVacationDialog, setShowVacationDialog] = useState(false);
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  
  const gestorDepartments = gestorSectors.map((s) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );

  const activeSectors = isAdmin 
    ? (selectedSector ? [selectedSector] : []) 
    : gestorDepartments;

  // Fetch employees from the new employees table
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees", activeSectors, isAdmin],
    queryFn: async () => {
      let query = supabase.from("employees").select("*");

      if (activeSectors.length > 0) {
        query = query.in("department", activeSectors);
      } else if (isAdmin && !selectedSector) {
        return [];
      }

      const { data, error } = await query.order("name");
      if (error) throw error;
      return data as Employee[];
    },
    enabled: isAdmin ? !!selectedSector : gestorDepartments.length > 0,
  });

  // Fetch vacation requests
  const { data: vacationRequests = [], isLoading: isLoadingVacations } = useQuery({
    queryKey: ["vacation-requests-control", selectedYear, activeSectors, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from("vacation_requests")
        .select("*")
        .eq("status", "aprovada");

      if (activeSectors.length > 0) {
        query = query.in("department", activeSectors);
      } else if (isAdmin && !selectedSector) {
        return [];
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as VacationRequest[];
    },
    enabled: isAdmin ? !!selectedSector : gestorDepartments.length > 0,
  });

  const isLoading = isLoadingEmployees || isLoadingVacations;

  // Helper: find matching employee by name (case-insensitive, partial match)
  const findEmployeeByName = (name: string, employeeMap: Map<string, EmployeeVacationRow>): EmployeeVacationRow | undefined => {
    const normalizedName = name.toUpperCase().trim();
    // Exact match first
    for (const emp of employeeMap.values()) {
      if (emp.employeeName.toUpperCase().trim() === normalizedName) return emp;
    }
    // Partial match: check if request name is contained in employee name or vice versa
    for (const emp of employeeMap.values()) {
      const empUpper = emp.employeeName.toUpperCase().trim();
      if (empUpper.includes(normalizedName) || normalizedName.includes(empUpper)) return emp;
    }
    // Match by first + last name tokens
    const nameParts = normalizedName.split(/\s+/);
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      for (const emp of employeeMap.values()) {
        const empUpper = emp.employeeName.toUpperCase().trim();
        if (empUpper.includes(firstName) && empUpper.includes(lastName)) return emp;
      }
    }
    return undefined;
  };

  const processVacationData = (): EmployeeVacationRow[] => {
    const employeeMap = new Map<string, EmployeeVacationRow>();

    // Step 1: Create entry for all employees from the employees table
    employees.forEach((emp) => {
      employeeMap.set(emp.employee_id, {
        employeeId: emp.employee_id,
        employeeName: emp.name,
        department: emp.department,
        status: "Ativo",
        vencimento: "-",
        saldoInicio: emp.vacation_balance,
        teamLeader: emp.team_leader || "-",
        meses: Array(12).fill(null).map(() => ({ type: "vazio" as const })),
        saldoFinal: emp.vacation_balance,
        totalDiasUsados: 0,
      });
    });

    // Step 2: Apply vacation periods from vacation_requests for the selected year
    vacationRequests.forEach((request) => {
      const startDate = parseISO(request.start_date);
      const endDate = parseISO(request.end_date);
      
      const startYear = getYear(startDate);
      const endYear = getYear(endDate);
      
      // Skip if vacation is not in the selected year
      if (startYear !== selectedYear && endYear !== selectedYear) {
        return;
      }

      // Try to match to existing employee by employee_id first, then by name
      let employee = employeeMap.get(request.employee_id);
      if (!employee) {
        employee = findEmployeeByName(request.employee_name, employeeMap);
      }
      
      if (!employee) {
        // Fallback: create entry only if no match found at all
        employee = {
          employeeId: request.employee_id,
          employeeName: request.employee_name,
          department: request.department,
          status: "Ativo",
          vencimento: "-",
          saldoInicio: 20,
          teamLeader: request.approved_by || "-",
          meses: Array(12).fill(null).map(() => ({ type: "vazio" as const })),
          saldoFinal: 20,
          totalDiasUsados: 0,
        };
        employeeMap.set(request.employee_id, employee);
      }

      employee.totalDiasUsados += request.days_count;
      
      const startMonth = getMonth(startDate);
      const endMonth = getMonth(endDate);
      
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
            requestId: request.id,
            requestData: {
              id: request.id,
              employee_name: request.employee_name,
              start_date: request.start_date,
              end_date: request.end_date,
              days_count: request.days_count,
            },
          };
        }
      }

      const today = new Date();
      if (today >= startDate && today <= endDate) {
        employee.status = "Férias";
      }
    });

    employeeMap.forEach((employee) => {
      employee.saldoFinal = employee.saldoInicio - employee.totalDiasUsados;
    });

    return Array.from(employeeMap.values()).sort((a, b) => 
      a.employeeName.localeCompare(b.employeeName)
    );
  };

  const employeeRows = processVacationData();

  const totalEmployees = employeeRows.length;
  const employeesOnVacation = employeeRows.filter((e) => e.status === "Férias").length;
  const totalDaysUsed = employeeRows.reduce((sum, e) => sum + e.totalDiasUsados, 0);

  const renderMonthCell = (monthData: MonthVacation, monthIndex: number) => {
    const isCurrentMonth = selectedYear === currentYear && monthIndex === currentMonth;
    
    if (monthData.type === "vazio") {
      return (
        <div className={`h-10 flex items-center justify-center ${isCurrentMonth ? "bg-muted/50 rounded" : ""}`}>
          <span className="text-muted-foreground/40">—</span>
        </div>
      );
    }

    const cellContent = (
      <div className="bg-primary text-primary-foreground text-[10px] leading-tight px-2 py-1.5 rounded-md text-center font-medium shadow-sm cursor-pointer hover:bg-primary/80 transition-colors">
        <div>Férias</div>
        <div className="opacity-80">
          {monthData.startDay?.toString().padStart(2, "0")}-{monthData.endDay?.toString().padStart(2, "0")}
        </div>
      </div>
    );

    if (monthData.requestData) {
      return (
        <EditVacationPopover vacation={monthData.requestData}>
          {cellContent}
        </EditVacationPopover>
      );
    }

    return cellContent;
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Prepare employee list for dialogs
  const employeesForDialog = employees.map((e) => ({
    employee_id: e.employee_id,
    name: e.name,
    email: e.email,
    department: e.department,
  }));

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Controle de Férias
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Acompanhe as férias dos colaboradores ao longo do ano
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isAdmin ? (
              <Select
                value={selectedSector}
                onValueChange={setSelectedSector}
              >
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_SECTORS.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              gestorDepartments.map((dept) => (
                <Badge key={dept} variant="outline">
                  {dept}
                </Badge>
              ))
            )}
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[100px] h-8">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
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

        {/* Action Buttons - only show when sector is active */}
        {(!isAdmin || selectedSector) && (isAdmin || gestorDepartments.length > 0) && (
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setShowVacationDialog(true)} disabled={employees.length === 0}>
              <Plus className="h-4 w-4 mr-1.5" />
              Cadastrar Férias
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowCreditDialog(true)} disabled={employees.length === 0}>
              <CreditCard className="h-4 w-4 mr-1.5" />
              Cadastrar Crédito
            </Button>
          </div>
        )}

        {/* Warning for admins without sector selected */}
        {isAdmin && !selectedSector && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="p-4 rounded-full bg-muted">
              <CalendarRange className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Selecione um setor</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Escolha um setor no filtro acima para visualizar o controle de férias dos colaboradores.
              </p>
            </div>
          </div>
        )}

        {/* Warning for managers without sectors */}
        {!isAdmin && isGestor && gestorDepartments.length === 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você não possui setores atribuídos. Solicite ao administrador que configure seus setores.
            </AlertDescription>
          </Alert>
        )}

        {/* Content - only show when sector is active */}
        {(!isAdmin || selectedSector) && (<>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{totalEmployees}</p>
                  <p className="text-xs text-muted-foreground">Colaboradores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background">
                  <Palmtree className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{employeesOnVacation}</p>
                  <p className="text-xs text-muted-foreground">Em férias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background">
                  <CalendarRange className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{totalDaysUsed}</p>
                  <p className="text-xs text-muted-foreground">Dias usados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="sticky left-0 bg-muted/30 z-10 min-w-[200px] font-semibold">
                    Colaborador
                  </TableHead>
                  <TableHead className="min-w-[80px] text-center font-semibold">Status</TableHead>
                  <TableHead className="min-w-[70px] text-center font-semibold">Saldo</TableHead>
                  {MONTH_NAMES.map((month, index) => (
                    <TableHead 
                      key={month} 
                      className={`min-w-[80px] text-center font-semibold ${
                        selectedYear === currentYear && index === currentMonth 
                          ? "bg-primary/10 text-primary" 
                          : ""
                      }`}
                    >
                      {month}
                    </TableHead>
                  ))}
                  <TableHead className="min-w-[70px] text-center font-semibold">Restante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="sticky left-0 bg-background z-10">
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-14 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      {Array.from({ length: 12 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-8 w-14 mx-auto" /></TableCell>
                      ))}
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : employeeRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={16} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="h-8 w-8 opacity-40" />
                        <p>Nenhum colaborador encontrado neste setor</p>
                        <p className="text-xs">Os colaboradores são inseridos via API</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  employeeRows.map((employee) => (
                    <TableRow key={employee.employeeId} className="group">
                      <TableCell className="sticky left-0 bg-background z-10 group-hover:bg-muted/50 transition-colors">
                        <div>
                          <div className="font-medium">{employee.employeeName}</div>
                          <div className="text-xs text-muted-foreground">{employee.department}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={employee.status === "Férias" ? "default" : "outline"}
                          className={employee.status === "Férias" ? "bg-primary" : ""}
                        >
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {employee.saldoInicio}d
                      </TableCell>
                      {employee.meses.map((mes, index) => (
                        <TableCell 
                          key={index} 
                          className={`text-center p-1.5 ${
                            selectedYear === currentYear && index === currentMonth 
                              ? "bg-primary/5" 
                              : ""
                          }`}
                        >
                          {renderMonthCell(mes, index)}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <span className={`font-semibold ${
                          employee.saldoFinal < 0 
                            ? "text-destructive" 
                            : employee.saldoFinal < 10 
                              ? "text-orange-500" 
                              : "text-foreground"
                        }`}>
                          {employee.saldoFinal}d
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Legend */}
        {employeeRows.length > 0 && (
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span>Período de férias</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/10 border border-primary/20" />
              <span>Mês atual</span>
            </div>
          </div>
        )}
        </>)}
      </div>

      {/* Dialogs */}
      <RegisterVacationDialog
        open={showVacationDialog}
        onOpenChange={setShowVacationDialog}
        employees={employeesForDialog}
        approverName={profile?.full_name || "Sistema"}
      />
      <RegisterCreditDialog
        open={showCreditDialog}
        onOpenChange={setShowCreditDialog}
        employees={employeesForDialog}
        currentYear={selectedYear}
        createdBy={profile?.full_name || "Sistema"}
      />
    </MainLayout>
  );
};

export default ControleFerias;
