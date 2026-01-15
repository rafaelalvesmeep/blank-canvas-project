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
import { ClipboardCheck, Star, TrendingUp, Users, Calendar } from "lucide-react";

// TODO: Será substituído por dados reais do banco
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
  pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  concluida: "bg-green-500/20 text-green-400 border-green-500/30",
};

const renderStars = (nota: number) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= nota ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{nota.toFixed(1)}</span>
    </div>
  );
};

import { cn } from "@/lib/utils";

export default function Avaliacoes() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Avaliações de Desempenho
            </h1>
            <p className="text-muted-foreground">
              Avalie o desempenho dos colaboradores da sua equipe
            </p>
          </div>
          <Button>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Iniciar Ciclo de Avaliação
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/20 p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{colaboradores.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/20 p-2">
                  <ClipboardCheck className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Concluídas</p>
                  <p className="text-2xl font-bold">{avaliacoesConcluidas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-500/20 p-2">
                  <Calendar className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{avaliacoesPendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/20 p-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Média</p>
                  <p className="text-2xl font-bold">{mediaNota.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso do Ciclo</CardTitle>
            <CardDescription>
              Ciclo de avaliação Q4 2024
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avaliações concluídas</span>
                <span className="font-medium">
                  {avaliacoesConcluidas} de {colaboradores.length}
                </span>
              </div>
              <Progress 
                value={(avaliacoesConcluidas / colaboradores.length) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Colaboradores</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
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
                  <TableRow key={colab.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={colab.avatar} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {colab.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{colab.nome}</span>
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
                      <Button variant="ghost" size="sm">
                        {colab.status === "pendente" ? "Avaliar" : "Ver"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
