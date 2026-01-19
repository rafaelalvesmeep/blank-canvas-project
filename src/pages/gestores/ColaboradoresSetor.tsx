import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Users, Mail, Phone, Sparkles, UserCheck, UserX, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SECTOR_LABEL_MAP: Record<string, string> = {
  administrativo: "Administrativo",
  canais: "Canais",
  comercial: "Comercial",
  compliance: "Compliance",
  compras: "Compras",
  cs: "CS",
  cs_meep: "CS Meep",
  cs_mee: "CS Mee",
  desenvolvimento: "Desenvolvimento",
  eventos: "Eventos",
  financeiro: "Financeiro",
  implantacao: "Implantação",
  integracoes: "Integrações",
  logistica: "Logística",
  marketing: "Marketing",
  produto: "Produto",
  prospeccao: "Prospecção",
  rh: "RH",
  suporte: "Suporte",
  suporte_tecnico: "Suporte Técnico",
};

const colaboradores: {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  status: string;
  avatar: string;
  setor: string;
}[] = [];

const statusColors: Record<string, string> = {
  ativo: "bg-success/10 text-success border-success/20",
  ferias: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  afastado: "bg-warning/10 text-warning border-warning/20",
};

export default function ColaboradoresSetor() {
  const [searchTerm, setSearchTerm] = useState("");
  const { sectors, isGestor, isAdmin } = useAuth();

  // Map sectors to department labels for filtering
  const gestorDepartments = sectors.map(s => SECTOR_LABEL_MAP[s] || s);

  // Admins see all, gestores see only their sectors
  const colaboradoresFiltradosPorSetor = isAdmin 
    ? colaboradores 
    : (isGestor && gestorDepartments.length > 0
        ? colaboradores.filter((colab) => gestorDepartments.includes(colab.setor))
        : colaboradores);

  const filteredColaboradores = colaboradoresFiltradosPorSetor.filter((colab) =>
    colab.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colab.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: colaboradoresFiltradosPorSetor.length,
    ativos: colaboradoresFiltradosPorSetor.filter((c) => c.status === "ativo").length,
    afastados: colaboradoresFiltradosPorSetor.filter((c) => c.status === "ferias" || c.status === "afastado").length,
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                Colaboradores do Setor
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os colaboradores da sua equipe
              </p>
              {isAdmin && (
                <Badge variant="outline" className="mt-2 text-xs bg-primary/10 text-primary border-primary/20">
                  Visualização completa (Admin)
                </Badge>
              )}
              {!isAdmin && isGestor && gestorDepartments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {gestorDepartments.map((dept) => (
                    <Badge key={dept} variant="secondary" className="text-xs">
                      {dept}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Badge variant="outline" className="px-4 py-2 bg-primary/5 border-primary/20 text-primary text-base">
            <Users className="h-4 w-4 mr-2" />
            {colaboradoresFiltradosPorSetor.length} colaboradores
          </Badge>
        </div>

        {/* Aviso se gestor sem setores */}
        {!isAdmin && isGestor && sectors.length === 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-warning shrink-0" />
              <div>
                <p className="text-sm font-medium">Nenhum setor atribuído</p>
                <p className="text-xs text-muted-foreground">
                  Solicite ao administrador que atribua setores ao seu perfil para visualizar os colaboradores.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border-primary/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total na equipe</p>
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
                <p className="text-3xl font-bold">{stats.afastados}</p>
                <p className="text-sm text-muted-foreground">Afastados/Férias</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-border/50 shadow-lg overflow-hidden">
          <CardContent className="p-4 bg-gradient-to-r from-muted/30 to-transparent">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou cargo..."
                className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/50 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <CardTitle>Minha Equipe</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredColaboradores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <Users className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">Nenhum colaborador encontrado</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Sua equipe ainda não possui membros</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColaboradores.map((colab) => (
                    <TableRow key={colab.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-background shadow-md">
                            <AvatarImage src={colab.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                              {colab.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium group-hover:text-primary transition-colors">{colab.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>{colab.cargo}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {colab.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            {colab.telefone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[colab.status]}>
                          {colab.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                          Ver perfil
                        </Button>
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