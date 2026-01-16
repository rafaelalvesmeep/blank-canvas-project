import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Plus,
  Eye,
  MoreHorizontal,
  Building2,
  Calendar,
  UserCheck,
  CalendarDays,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Colaborador {
  id: number;
  nome: string;
  cargo: string;
  setor: string;
  tipo: string;
  admissao: string;
  status: string;
  avatar: string;
}

const colaboradores: Colaborador[] = [];

const statusColors: Record<string, string> = {
  ativo: "bg-success/10 text-success border-success/20",
  ferias: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  afastado: "bg-warning/10 text-warning border-warning/20",
  desligado: "bg-destructive/10 text-destructive border-destructive/20",
};

const tipoColors: Record<string, string> = {
  CLT: "bg-primary/10 text-primary",
  PJ: "bg-accent/10 text-accent",
  Estágio: "bg-chart-3/10 text-chart-3",
};

export default function Colaboradores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSetor, setFilterSetor] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");

  const filteredColaboradores = colaboradores.filter((col) => {
    const matchesSearch =
      col.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSetor = filterSetor === "todos" || col.setor === filterSetor;
    const matchesStatus = filterStatus === "todos" || col.status === filterStatus;
    return matchesSearch && matchesSetor && matchesStatus;
  });

  const stats = {
    total: colaboradores.length,
    ativos: colaboradores.filter((c) => c.status === "ativo").length,
    ferias: colaboradores.filter((c) => c.status === "ferias").length,
  };

  return (
    <MainLayout showSearch>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Colaboradores
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {colaboradores.length} colaboradores cadastrados
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Colaborador
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="group hover:border-primary/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:border-success/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                <UserCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.ativos}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:border-chart-1/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10 group-hover:bg-chart-1/20 transition-colors">
                <CalendarDays className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.ferias}</p>
                <p className="text-xs text-muted-foreground">Em Férias</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterSetor} onValueChange={setFilterSetor}>
                  <SelectTrigger className="w-[160px]">
                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os setores</SelectItem>
                    <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Operações">Operações</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="ferias">Férias</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {filteredColaboradores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Nenhum colaborador encontrado</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">Adicione seu primeiro colaborador para começar</p>
                <Button className="mt-4 gap-2" size="sm">
                  <Plus className="h-4 w-4" />
                  Adicionar Colaborador
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[280px] text-xs">Colaborador</TableHead>
                    <TableHead className="text-xs">Setor</TableHead>
                    <TableHead className="text-xs">Tipo</TableHead>
                    <TableHead className="text-xs">Admissão</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="w-[80px] text-xs">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColaboradores.map((col) => (
                    <TableRow key={col.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                              {col.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{col.nome}</p>
                            <p className="text-xs text-muted-foreground">{col.cargo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{col.setor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={tipoColors[col.tipo]}>
                          {col.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-sm">{col.admissao}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[col.status]}>
                          {col.status.charAt(0).toUpperCase() + col.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem className="text-xs">Ver perfil</DropdownMenuItem>
                              <DropdownMenuItem className="text-xs">Editar</DropdownMenuItem>
                              <DropdownMenuItem className="text-xs">Ver timeline</DropdownMenuItem>
                              <DropdownMenuItem className="text-xs text-destructive">
                                Desligar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}