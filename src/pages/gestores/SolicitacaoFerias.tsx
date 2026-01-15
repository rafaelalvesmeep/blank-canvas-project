import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { Calendar as CalendarIcon, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Mock data - será substituído por dados reais
const colaboradores = [
  { id: "1", nome: "Ana Silva" },
  { id: "2", nome: "Carlos Santos" },
  { id: "3", nome: "Maria Oliveira" },
  { id: "4", nome: "João Pereira" },
];

const solicitacoes = [
  {
    id: "1",
    colaborador: "Ana Silva",
    dataInicio: "2025-02-01",
    dataFim: "2025-02-15",
    dias: 15,
    status: "pendente",
    dataSolicitacao: "2025-01-10",
  },
  {
    id: "2",
    colaborador: "Carlos Santos",
    dataInicio: "2025-03-10",
    dataFim: "2025-03-24",
    dias: 15,
    status: "aprovada",
    dataSolicitacao: "2025-01-08",
  },
  {
    id: "3",
    colaborador: "Maria Oliveira",
    dataInicio: "2025-01-20",
    dataFim: "2025-01-30",
    dias: 10,
    status: "reprovada",
    dataSolicitacao: "2025-01-05",
  },
];

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  aprovada: "bg-green-500/20 text-green-400 border-green-500/30",
  reprovada: "bg-red-500/20 text-red-400 border-red-500/30",
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

export default function SolicitacaoFerias() {
  const [showForm, setShowForm] = useState(false);
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataFim, setDataFim] = useState<Date>();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Solicitação de Férias
            </h1>
            <p className="text-muted-foreground">
              Lance as férias dos colaboradores da sua equipe
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
              <CardTitle>Nova Solicitação de Férias</CardTitle>
              <CardDescription>
                Selecione o colaborador e o período de férias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Colaborador</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o colaborador..." />
                    </SelectTrigger>
                    <SelectContent>
                      {colaboradores.map((colab) => (
                        <SelectItem key={colab.id} value={colab.id}>
                          {colab.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Férias</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="integral">Integral (30 dias)</SelectItem>
                      <SelectItem value="fracionada">Fracionada</SelectItem>
                      <SelectItem value="venda">Venda de 10 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataInicio && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataInicio ? format(dataInicio, "PPP", { locale: ptBR }) : "Selecione..."}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dataInicio}
                        onSelect={setDataInicio}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Data de Término</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataFim && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataFim ? format(dataFim, "PPP", { locale: ptBR }) : "Selecione..."}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dataFim}
                        onSelect={setDataFim}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Observações adicionais..."
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
              <CalendarIcon className="h-5 w-5 text-primary" />
              Solicitações de Férias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Solicitado em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitacoes.map((sol) => (
                  <TableRow key={sol.id}>
                    <TableCell className="font-medium">{sol.colaborador}</TableCell>
                    <TableCell>
                      {new Date(sol.dataInicio).toLocaleDateString("pt-BR")} -{" "}
                      {new Date(sol.dataFim).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{sol.dias} dias</TableCell>
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
