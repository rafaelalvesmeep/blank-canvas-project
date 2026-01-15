import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardCheck, Star, TrendingUp, Users, Calendar, Sparkles, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const colaboradores: {
  id: string;
  nome: string;
  cargo: string;
  ultimaAvaliacao: string | null;
  nota: number | null;
  status: string;
  avatar: string;
}[] = [];

const avaliacoesPendentes = colaboradores.filter((c) => c.status === "pendente").length;
const avaliacoesConcluidas = colaboradores.filter((c) => c.status === "concluida").length;
const mediaNota = avaliacoesConcluidas > 0
  ? colaboradores.filter((c) => c.nota !== null).reduce((acc, c) => acc + (c.nota || 0), 0) / avaliacoesConcluidas
  : 0;

const statusColors: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  concluida: "bg-success/10 text-success border-success/20",
};

const renderStars = (nota: number) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4 transition-colors",
            star <= nota ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="ml-2 text-sm font-semibold">{nota.toFixed(1)}</span>
    </div>
  );
};

export default function Avaliacoes() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-4 to-purple-600 shadow-lg">
                <ClipboardCheck className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-md">
                <Award className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Avaliações de Desempenho
              </h1>
              <p className="text-muted-foreground mt-1">
                Avalie o desempenho dos colaboradores da sua equipe
              </p>
            </div>
          </div>
          <Button variant="gradient" className="gap-2 shadow-lg hover:shadow-xl transition-all">
            <ClipboardCheck className="h-4 w-4" />
            Iniciar Ciclo de Avaliação
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border-primary/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{colaboradores.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/5 via-success/10 to-transparent border-success/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-3xl font-bold">{avaliacoesConcluidas}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-warning/5 via-warning/10 to-transparent border-warning/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-warning/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/20 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-3xl font-bold">{avaliacoesPendentes}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-chart-4/5 via-chart-4/10 to-transparent border-chart-4/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-chart-4/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-4/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-chart-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Média</p>
                <p className="text-3xl font-bold">{mediaNota.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card className="border-border/50 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Progresso do Ciclo</CardTitle>
                <CardDescription>Ciclo de avaliação Q4 2024</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avaliações concluídas</span>
                <span className="font-semibold">
                  {avaliacoesConcluidas} de {colaboradores.length}
                </span>
              </div>
              <Progress 
                value={colaboradores.length > 0 ? (avaliacoesConcluidas / colaboradores.length) * 100 : 0} 
                className="h-3"
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
              <CardTitle>Colaboradores</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {colaboradores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <Users className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">Nenhum colaborador para avaliar</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Inicie um ciclo de avaliação para começar</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Última Avaliação</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colaboradores.map((colab) => (
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
                        {colab.ultimaAvaliacao
                          ? new Date(colab.ultimaAvaliacao).toLocaleDateString("pt-BR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {colab.nota ? renderStars(colab.nota) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[colab.status]}>
                          {colab.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                          {colab.status === "pendente" ? "Avaliar" : "Ver"}
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