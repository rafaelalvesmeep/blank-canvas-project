import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, Link2, Check } from "lucide-react";
import { toast } from "sonner";

const solicitacoes: {
  id: string;
  colaborador: string;
  dataInicio: string;
  dataFim: string;
  dias: number;
  status: string;
  dataSolicitacao: string;
}[] = [];

const statusColors: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/30",
  aprovada: "bg-success/10 text-success border-success/30",
  reprovada: "bg-destructive/10 text-destructive border-destructive/30",
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

export default function SolicitacaoFerias() {
  const [copied, setCopied] = useState(false);

  const stats = {
    pendentes: solicitacoes.filter((s) => s.status === "pendente").length,
    aprovadas: solicitacoes.filter((s) => s.status === "aprovada").length,
    total: solicitacoes.length,
  };

  const handleCopyLink = async () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/solicitar-ferias`;
    
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copiado!", {
        description: "Compartilhe com os colaboradores.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erro ao copiar link");
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="page-header">
            <h1 className="page-title">Solicitação de Férias</h1>
            <p className="page-description">
              Gerencie as solicitações de férias dos colaboradores
            </p>
          </div>
          <Button 
            className="gap-2"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Link Copiado!
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                Copiar Link de Solicitação
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.pendentes}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.aprovadas}</p>
                <p className="text-xs text-muted-foreground">Aprovadas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Solicitações */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Solicitações de Férias</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {solicitacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <CalendarIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhuma solicitação encontrada</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Compartilhe o link com os colaboradores</p>
                <Button 
                  className="mt-5 gap-2"
                  onClick={handleCopyLink}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                  {copied ? "Link Copiado!" : "Copiar Link"}
                </Button>
              </div>
            ) : (
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
                    <TableRow key={sol.id} className="group">
                      <TableCell className="font-medium">{sol.colaborador}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(sol.dataInicio).toLocaleDateString("pt-BR")} - {new Date(sol.dataFim).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          {sol.dias} dias
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(sol.dataSolicitacao).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs capitalize ${statusColors[sol.status]}`}>
                          <StatusIcon status={sol.status} />
                          <span className="ml-1">{sol.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-xs">
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