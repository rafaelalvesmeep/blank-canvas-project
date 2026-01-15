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

// TODO: Será substituído por dados reais do banco
const solicitacoes: {
  id: string;
  cargo: string;
  tipo: string;
  urgencia: string;
  status: string;
  dataSolicitacao: string;
}[] = [];

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  aprovada: "bg-green-500/20 text-green-400 border-green-500/30",
  reprovada: "bg-red-500/20 text-red-400 border-red-500/30",
};

const urgenciaColors: Record<string, string> = {
  alta: "bg-red-500/20 text-red-400 border-red-500/30",
  media: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  baixa: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "pendente":
      return <Clock className="h-4 w-4 text-yellow-400" />;
    case "aprovada":
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    case "reprovada":
      return <XCircle className="h-4 w-4 text-red-400" />;
    default:
      return null;
  }
};

export default function SolicitacaoVaga() {
  const [showForm, setShowForm] = useState(false);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Solicitação de Vaga
            </h1>
            <p className="text-muted-foreground">
              Solicite novas vagas para sua equipe
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Solicitação
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Nova Solicitação de Vaga</CardTitle>
              <CardDescription>
                Preencha os dados da vaga que você precisa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" placeholder="Ex: Desenvolvedor Frontend" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Contratação</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="urgencia">Urgência</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade de Vagas</Label>
                  <Input id="quantidade" type="number" min="1" defaultValue="1" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="justificativa">Justificativa</Label>
                  <Textarea
                    id="justificativa"
                    placeholder="Descreva o motivo da solicitação..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="requisitos">Requisitos da Vaga</Label>
                  <Textarea
                    id="requisitos"
                    placeholder="Liste os requisitos necessários..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Minhas Solicitações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Urgência</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitacoes.map((sol) => (
                  <TableRow key={sol.id}>
                    <TableCell className="font-medium">{sol.cargo}</TableCell>
                    <TableCell>{sol.tipo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={urgenciaColors[sol.urgencia]}>
                        {sol.urgencia}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(sol.dataSolicitacao).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusIcon status={sol.status} />
                        <Badge variant="outline" className={statusColors[sol.status]}>
                          {sol.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detalhes
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
