import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Star } from "lucide-react";
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
  pendente: "bg-amber-100 text-amber-700",
  concluida: "bg-green-100 text-green-700",
};

const renderStars = (nota: number) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= nota ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
          )}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{nota.toFixed(1)}</span>
    </div>
  );
};

export default function Avaliacoes() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Avaliações de Desempenho</h1>
            <p className="text-sm text-muted-foreground">
              Avalie o desempenho dos colaboradores da sua equipe
            </p>
          </div>
          <Button>Iniciar Ciclo de Avaliação</Button>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{colaboradores.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-semibold">{avaliacoesConcluidas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-semibold">{avaliacoesPendentes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Média Geral</p>
              <p className="text-2xl font-semibold">{mediaNota.toFixed(1)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Progresso do Ciclo</CardTitle>
            <p className="text-sm text-muted-foreground">Ciclo de avaliação Q4 2024</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avaliações concluídas</span>
                <span className="font-medium">
                  {avaliacoesConcluidas} de {colaboradores.length}
                </span>
              </div>
              <Progress 
                value={colaboradores.length > 0 ? (avaliacoesConcluidas / colaboradores.length) * 100 : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Colaboradores</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {colaboradores.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Nenhum colaborador para avaliar</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Inicie um ciclo de avaliação para começar
                </p>
              </div>
            ) : (
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
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={colab.avatar} />
                            <AvatarFallback className="text-xs">
                              {colab.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{colab.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{colab.cargo}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {colab.ultimaAvaliacao
                          ? new Date(colab.ultimaAvaliacao).toLocaleDateString("pt-BR")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {colab.nota ? renderStars(colab.nota) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[colab.status]}>
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
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
