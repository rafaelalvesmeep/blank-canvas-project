import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMonth, getYear, parseISO } from "date-fns";
import { AlertCircle, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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
  startDay?: number;
  endDay?: number;
  daysCount?: number;
}

interface EmployeeVacationRow {
  employeeId: string;
  employeeName: string;
  department: string;
  status: "Ativo" | "Férias";
  saldoInicio: number;
  teamLeader: string;
  meses: MonthVacation[];
  saldoFinal: number;
  totalDiasUsados: number;
}

const ControleFerias = () => {
  const currentYear = getYear(new Date());
  const currentMonth = getMonth(new Date());
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

      if (!isAdmin && isGestor && gestorDepartments.length > 0) {
        query = query.in("department", gestorDepartments);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as VacationRequest[];
    },
  });

  const processVacationData = (): EmployeeVacationRow[] => {
    const employeeMap = new Map<string, EmployeeVacationRow>();

    vacationRequests.forEach((request) => {
      const startDate = parseISO(request.start_date);
      const endDate = parseISO(request.end_date);
      
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
          saldoInicio: 30,
          teamLeader: request.approved_by || "-",
          meses: Array(12).fill(null).map(() => ({ type: "vazio" as const })),
          saldoFinal: 30,
          totalDiasUsados: 0,
        });
      }

      const employee = employeeMap.get(request.employee_id)!;
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
            startDay,
            endDay,
            daysCount: endDay - startDay + 1,
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

  const renderMonthCell = (monthData: MonthVacation) => {
    if (monthData.type === "vazio") {
      return <span className="text-muted-foreground/30">—</span>;
    }

    return (
      <div className="bg-green-500 text-white text-[10px] leading-tight px-1.5 py-1 rounded text-center font-medium min-w-[60px]">
        <div>férias</div>
        <div className="opacity-90">({monthData.startDay?.toString().padStart(2, "0")} a {monthData.endDay?.toString().padStart(2, "0")})</div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Controle de Férias</h1>
            {isAdmin && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Shield className="h-3 w-3" />
                Admin
              </Badge>
            )}
            {!isAdmin && gestorDepartments.map((dept) => (
              <Badge key={dept} variant="outline" className="text-xs">
                {dept}
              </Badge>
            ))}
          </div>
          
          {/* Year Selector */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSelectedYear(selectedYear - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-3 min-w-[60px] text-center">
              {selectedYear}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSelectedYear(selectedYear + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Warning */}
        {!isAdmin && isGestor && gestorDepartments.length === 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você não possui setores atribuídos. Solicite ao administrador que configure seus setores.
            </AlertDescription>
          </Alert>
        )}

        {/* Table Container */}
        <div className="border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="sticky left-0 bg-muted/50 z-10 text-left py-3 px-4 font-medium min-w-[180px]">
                    Nome
                  </th>
                  <th className="text-left py-3 px-3 font-medium min-w-[70px]">Status</th>
                  <th className="text-center py-3 px-2 font-medium min-w-[50px]">Venc.</th>
                  <th className="text-center py-3 px-2 font-medium min-w-[60px]">Saldo Início</th>
                  <th className="text-left py-3 px-3 font-medium min-w-[100px]">Team Leader</th>
                  {MONTH_NAMES.map((month, index) => (
                    <th 
                      key={month} 
                      className={cn(
                        "text-center py-3 px-1 font-medium min-w-[70px]",
                        selectedYear === currentYear && index === currentMonth && "bg-primary/10 text-primary"
                      )}
                    >
                      {month}
                    </th>
                  ))}
                  <th className="text-center py-3 px-2 font-medium min-w-[70px]">Saldo Final</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="sticky left-0 bg-card z-10 py-3 px-4">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="py-3 px-3"><Skeleton className="h-5 w-12" /></td>
                      <td className="py-3 px-2"><Skeleton className="h-4 w-8 mx-auto" /></td>
                      <td className="py-3 px-2"><Skeleton className="h-4 w-6 mx-auto" /></td>
                      <td className="py-3 px-3"><Skeleton className="h-4 w-20" /></td>
                      {Array.from({ length: 12 }).map((_, j) => (
                        <td key={j} className="py-3 px-1"><Skeleton className="h-6 w-14 mx-auto" /></td>
                      ))}
                      <td className="py-3 px-2"><Skeleton className="h-4 w-6 mx-auto" /></td>
                    </tr>
                  ))
                ) : employeeRows.length === 0 ? (
                  <tr>
                    <td colSpan={18} className="text-center py-16 text-muted-foreground">
                      Nenhum registro de férias encontrado para {selectedYear}
                    </td>
                  </tr>
                ) : (
                  employeeRows.map((employee, rowIndex) => (
                    <tr 
                      key={employee.employeeId} 
                      className={cn(
                        "border-b last:border-0 hover:bg-muted/30 transition-colors",
                        rowIndex % 2 === 0 ? "bg-card" : "bg-muted/10"
                      )}
                    >
                      <td className={cn(
                        "sticky left-0 z-10 py-2.5 px-4 font-medium",
                        rowIndex % 2 === 0 ? "bg-card" : "bg-muted/10"
                      )}>
                        {employee.employeeName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                          employee.status === "Férias" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-600"
                        )}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-muted-foreground">—</td>
                      <td className="py-2.5 px-2 text-center">{employee.saldoInicio}</td>
                      <td className="py-2.5 px-3 text-muted-foreground text-xs truncate max-w-[100px]">
                        {employee.teamLeader}
                      </td>
                      {employee.meses.map((mes, index) => (
                        <td 
                          key={index} 
                          className={cn(
                            "py-2 px-1 text-center",
                            selectedYear === currentYear && index === currentMonth && "bg-primary/5"
                          )}
                        >
                          {renderMonthCell(mes)}
                        </td>
                      ))}
                      <td className="py-2.5 px-2 text-center font-semibold">
                        <span className={cn(
                          employee.saldoFinal < 0 && "text-red-500",
                          employee.saldoFinal > 0 && employee.saldoFinal < 10 && "text-orange-500"
                        )}>
                          {employee.saldoFinal}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Legend */}
        {employeeRows.length > 0 && (
          <div className="flex items-center gap-6 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Férias aprovadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/20 border" />
              <span>Mês atual</span>
            </div>
            <div className="ml-auto text-muted-foreground">
              {employeeRows.length} colaborador{employeeRows.length !== 1 && "es"} • {employeeRows.filter(e => e.status === "Férias").length} em férias
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ControleFerias;
