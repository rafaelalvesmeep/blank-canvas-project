import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Briefcase, Plus, Clock, CheckCircle, XCircle } from "lucide-react";

const solicitacoes: {
  id: string;
  cargo: string;
  tipo: string;
  urgencia: string;
  status: string;
  dataSolicitacao: string;
}[] = [];

const statusColors: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  aprovada: "bg-success/10 text-success border-success/20",
  reprovada: "bg-destructive/10 text-destructive border-destructive/20",
};

const urgenciaColors: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive border-destructive/20",
  media: "bg-warning/10 text-warning border-warning/20",
  baixa: "bg-chart-1/10 text-chart-1 border-chart-1/20",
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "pendente":
      return <Clock className="h-3.5 w-3.5 text-warning" />;
    case "aprovada":
      return <CheckCircle className="h-3.5 w-3.5 text-success" />;
    case "reprovada":
      return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    default:
      return null;
  }
};

export default function SolicitacaoVaga() {
  const [showForm, setShowForm] = useState(false);

  const stats = {
    pendentes: solicitacoes.filter((s) => s.status === "pendente").length,
    aprovadas: solicitacoes.filter((s) => s.status === "aprovada").length,
    total: solicitacoes.length,
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Solicitação de Vaga
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Solicite novas vagas para sua equipe
            </p>
          </div>
          <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Nova Solicitação
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="group hover:border-warning/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 group-hover:bg-warning/20 transition-colors">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.pendentes}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:border-success/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.aprovadas}</p>
                <p className="text-xs text-muted-foreground">Aprovadas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:border-primary/30 transition-colors">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        {showForm && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Nova Solicitação de Vaga</CardTitle>
              <CardDescription className="text-xs">Preencha os dados da vaga que você precisa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cargo" className="text-sm">Cargo</Label>
                  <Input id="cargo" placeholder="Ex: Desenvolvedor Frontend" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tipo" className="text-sm">Tipo de Contratação</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clt">CLT</SelectItem>
                      <SelectItem value="pj">PJ</SelectItem>
                      <SelectItem value="estagio">Estágio</SelectItem>
                      <SelectItem value="temporario">Temporário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="urgencia" className="text-sm">Urgência</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quantidade" className="text-sm">Quantidade de Vagas</Label>
                  <Input id="quantidade" type="number" min="1" defaultValue="1" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="justificativa" className="text-sm">Justificativa</Label>
                  <Textarea
                    id="justificativa"
                    placeholder="Descreva o motivo da solicitação..."
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="requisitos" className="text-sm">Requisitos da Vaga</Label>
                  <Textarea
                    id="requisitos"
                    placeholder="Liste os requisitos necessários..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Button>Enviar Solicitação</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Minhas Solicitações */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Minhas Solicitações</CardTitle>
            <CardDescription className="text-xs">Histórico de solicitações realizadas</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {solicitacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Nenhuma solicitação encontrada</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">Crie uma nova solicitação para começar</p>
                <Button className="mt-4 gap-2" size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4" />
                  Nova Solicitação
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Cargo</TableHead>
                    <TableHead className="text-xs">Tipo</TableHead>
                    <TableHead className="text-xs">Urgência</TableHead>
                    <TableHead className="text-xs">Data</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-right text-xs">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitacoes.map((sol) => (
                    <TableRow key={sol.id} className="group">
                      <TableCell className="text-sm font-medium">{sol.cargo}</TableCell>
                      <TableCell className="text-sm">{sol.tipo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${urgenciaColors[sol.urgencia]}`}>
                          {sol.urgencia}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(sol.dataSolicitacao).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <StatusIcon status={sol.status} />
                          <Badge variant="outline" className={`text-xs ${statusColors[sol.status]}`}>
                            {sol.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Detalhes
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