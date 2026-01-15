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
  ativo: "bg-success/10 text-success border-success/30",
  ferias: "bg-chart-1/10 text-chart-1 border-chart-1/30",
  afastado: "bg-warning/10 text-warning border-warning/30",
  desligado: "bg-destructive/10 text-destructive border-destructive/30",
};

const tipoColors: Record<string, string> = {
  CLT: "bg-primary/10 text-primary",
  PJ: "bg-chart-4/10 text-chart-4",
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
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header">
            <h1 className="page-title">Colaboradores</h1>
            <p className="page-description">
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
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.ativos}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                <Calendar className="h-5 w-5 text-chart-1" />
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
                    <SelectItem value="Recursos Humanos">RH</SelectItem>
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
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum colaborador encontrado</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Adicione seu primeiro colaborador</p>
                <Button className="mt-5 gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Colaborador
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Colaborador</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Admissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColaboradores.map((col) => (
                    <TableRow key={col.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
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
                      <TableCell className="text-sm">{col.setor}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs ${tipoColors[col.tipo]}`}>
                          {col.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{col.admissao}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs capitalize ${statusColors[col.status]}`}>
                          {col.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>Ver timeline</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Desligar</DropdownMenuItem>
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