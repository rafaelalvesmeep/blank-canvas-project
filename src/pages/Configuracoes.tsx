import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Users, UserCheck, Check, X, Edit2, Search, Shield, Building2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type AppRole = "admin" | "rh" | "gestor";
type AppSector = "comercial" | "compliance" | "cs_meep" | "cs_mee" | "desenvolvimento" | "marketing" | "suporte";

interface ProfileWithRole {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  is_approved: boolean;
  sector: AppSector | null;
  created_at: string;
  role: AppRole | null;
}

const SECTORS: { value: AppSector; label: string }[] = [
  { value: "comercial", label: "Comercial" },
  { value: "compliance", label: "Compliance" },
  { value: "cs_meep", label: "CS Meep" },
  { value: "cs_mee", label: "CS Mee" },
  { value: "desenvolvimento", label: "Desenvolvimento" },
  { value: "marketing", label: "Marketing" },
  { value: "suporte", label: "Suporte" },
];

const ROLES: { value: AppRole; label: string; description: string }[] = [
  { value: "admin", label: "Admin", description: "Acesso total ao sistema" },
  { value: "rh", label: "RH", description: "Gestão de pessoas e vagas" },
  { value: "gestor", label: "Gestor", description: "Gestão do setor atribuído" },
];

export default function Configuracoes() {
  const [selectedUser, setSelectedUser] = useState<ProfileWithRole | null>(null);
  const [editRole, setEditRole] = useState<AppRole | "">("");
  const [editSector, setEditSector] = useState<AppSector | "">("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      const usersWithRoles: ProfileWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role as AppRole | null,
        };
      });

      return usersWithRoles;
    },
  });

  const pendingUsers = users.filter((u) => !u.is_approved);
  const approvedUsers = users.filter((u) => u.is_approved);

  // Filter approved users
  const filteredUsers = approvedUsers.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Stats
  const stats = {
    total: approvedUsers.length,
    admins: approvedUsers.filter((u) => u.role === "admin").length,
    rh: approvedUsers.filter((u) => u.role === "rh").length,
    gestores: approvedUsers.filter((u) => u.role === "gestor").length,
    pending: pendingUsers.length,
  };

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast.success("Usuário aprovado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao aprovar usuário");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast.success("Solicitação rejeitada");
    },
    onError: () => {
      toast.error("Erro ao rejeitar usuário");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role, sector }: { userId: string; role: AppRole; sector: AppSector | null }) => {
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (existingRole) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });

        if (error) throw error;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ sector: role === "gestor" ? sector : null })
        .eq("user_id", userId);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast.success("Permissões atualizadas!");
      setDialogOpen(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast.error("Erro ao atualizar permissões");
    },
  });

  const openEditDialog = (user: ProfileWithRole) => {
    setSelectedUser(user);
    setEditRole(user.role || "");
    setEditSector(user.sector || "");
    setDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (!selectedUser || !editRole) return;

    updateRoleMutation.mutate({
      userId: selectedUser.user_id,
      role: editRole as AppRole,
      sector: editRole === "gestor" ? (editSector as AppSector) : null,
    });
  };

  const getRoleBadge = (role: AppRole | null) => {
    if (!role) return <Badge variant="outline" className="text-xs">Sem permissão</Badge>;

    const config: Record<AppRole, { variant: "default" | "secondary" | "destructive"; className: string }> = {
      admin: { variant: "destructive", className: "bg-red-100 text-red-700 hover:bg-red-100" },
      rh: { variant: "default", className: "bg-primary/10 text-primary hover:bg-primary/10" },
      gestor: { variant: "secondary", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
    };

    return (
      <Badge variant={config[role].variant} className={config[role].className}>
        {role.toUpperCase()}
      </Badge>
    );
  };

  const getSectorLabel = (sector: AppSector | null) => {
    if (!sector) return "—";
    return SECTORS.find((s) => s.value === sector)?.label || sector;
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMM yyyy", { locale: ptBR });
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie usuários, permissões e aprovações do sistema
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <Shield className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.admins}</p>
                  <p className="text-xs text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.rh}</p>
                  <p className="text-xs text-muted-foreground">RH</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Building2 className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.gestores}</p>
                  <p className="text-xs text-muted-foreground">Gestores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <UserCheck className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="users" className="data-[state=active]:bg-background">
              Usuários
            </TabsTrigger>
            <TabsTrigger value="approvals" className="data-[state=active]:bg-background">
              Aprovações
              {pendingUsers.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingUsers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as AppRole | "all")}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filtrar por role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="rh">RH</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {searchTerm || roleFilter !== "all"
                      ? "Nenhum usuário encontrado com os filtros aplicados"
                      : "Nenhum usuário ativo"}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-medium">Usuário</TableHead>
                        <TableHead className="font-medium">Role</TableHead>
                        <TableHead className="font-medium">Setor</TableHead>
                        <TableHead className="font-medium">Desde</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.full_name || "—"}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell className="text-sm">
                            {user.role === "gestor" ? getSectorLabel(user.sector) : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(user.created_at)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Solicitações de Acesso</CardTitle>
                <CardDescription>
                  Usuários aguardando aprovação para acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : pendingUsers.length === 0 ? (
                  <div className="p-8 text-center">
                    <UserCheck className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma solicitação pendente</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-muted-foreground">
                              {(user.full_name || user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{user.full_name || "—"}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {formatDate(user.created_at)}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveMutation.mutate(user.user_id)}
                              disabled={approveMutation.isPending}
                              className="h-8"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-destructive hover:text-destructive"
                                  disabled={rejectMutation.isPending}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Rejeitar solicitação?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação irá remover a solicitação de {user.full_name || user.email}. 
                                    O usuário precisará criar uma nova conta.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => rejectMutation.mutate(user.user_id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Rejeitar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Permissões</DialogTitle>
            <DialogDescription>
              Configure o nível de acesso do usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">{selectedUser?.full_name}</p>
              <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <div className="grid gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setEditRole(role.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      editRole === role.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{role.label}</span>
                      {editRole === role.value && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {editRole === "gestor" && (
              <div className="space-y-2">
                <Label>Setor</Label>
                <Select value={editSector} onValueChange={(v) => setEditSector(v as AppSector)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((sector) => (
                      <SelectItem key={sector.value} value={sector.value}>
                        {sector.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveRole}
                disabled={!editRole || (editRole === "gestor" && !editSector) || updateRoleMutation.isPending}
              >
                Salvar alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
