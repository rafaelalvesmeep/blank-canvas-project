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
  Filter,
  Eye,
  MoreHorizontal,
  Building2,
  Calendar,
  Sparkles,
  UserCheck,
  UserX,
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
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-md">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Colaboradores
              </h1>
              <p className="text-muted-foreground mt-1">
                {colaboradores.length} colaboradores cadastrados
              </p>
            </div>
          </div>
          <Button variant="gradient" className="gap-2 shadow-lg hover:shadow-xl transition-all">
            <Plus className="h-4 w-4" />
            Novo Colaborador
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border-primary/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/5 via-success/10 to-transparent border-success/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20 group-hover:scale-110 transition-transform">
                <UserCheck className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.ativos}</p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-1/5 via-chart-1/10 to-transparent border-chart-1/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-chart-1/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-1/20 group-hover:scale-110 transition-transform">
                <UserX className="h-6 w-6 text-chart-1" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.ferias}</p>
                <p className="text-sm text-muted-foreground">Em Férias</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/50 shadow-lg overflow-hidden">
          <CardContent className="p-4 bg-gradient-to-r from-muted/30 to-transparent">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-background/50 border-border/50 focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterSetor} onValueChange={setFilterSetor}>
                  <SelectTrigger className="w-[180px] bg-background/50 border-border/50">
                    <Building2 className="mr-2 h-4 w-4" />
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
                  <SelectTrigger className="w-[150px] bg-background/50 border-border/50">
                    <Filter className="mr-2 h-4 w-4" />
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
        <Card className="border-border/50 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            {filteredColaboradores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <Users className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">Nenhum colaborador encontrado</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Adicione seu primeiro colaborador para começar</p>
                <Button variant="gradient" className="mt-6 gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Colaborador
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[300px]">Colaborador</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Admissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColaboradores.map((col) => (
                    <TableRow key={col.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-background shadow-md">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm font-semibold">
                              {col.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium group-hover:text-primary transition-colors">{col.nome}</p>
                            <p className="text-sm text-muted-foreground">{col.cargo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {col.setor}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={tipoColors[col.tipo]}>
                          {col.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {col.admissao}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[col.status]}
                        >
                          {col.status.charAt(0).toUpperCase() + col.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>Ver timeline</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
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