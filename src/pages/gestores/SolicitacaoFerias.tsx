import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, Umbrella, Sun, Link2, Check } from "lucide-react";
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
  pendente: "bg-warning/10 text-warning border-warning/20",
  aprovada: "bg-success/10 text-success border-success/20",
  reprovada: "bg-destructive/10 text-destructive border-destructive/20",
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "pendente":
      return <Clock className="h-4 w-4 text-warning" />;
    case "aprovada":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "reprovada":
      return <XCircle className="h-4 w-4 text-destructive" />;
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
        description: "Compartilhe o link com os colaboradores para que solicitem férias.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erro ao copiar link", {
        description: "Tente novamente.",
      });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-1 to-blue-500 shadow-lg">
                <Umbrella className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-md">
                <Sun className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Solicitação de Férias
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as solicitações de férias dos colaboradores
              </p>
            </div>
          </div>
          <Button 
            variant="gradient" 
            className="gap-2 shadow-lg hover:shadow-xl transition-all"
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
          <Card className="bg-gradient-to-br from-warning/5 via-warning/10 to-transparent border-warning/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-warning/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/20 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.pendentes}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/5 via-success/10 to-transparent border-success/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.aprovadas}</p>
                <p className="text-sm text-muted-foreground">Aprovadas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border-primary/20 hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <CardContent className="flex items-center gap-4 p-6 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 group-hover:scale-110 transition-transform">
                <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Minhas Solicitações */}
        <Card className="border-border/50 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Solicitações de Férias</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {solicitacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <Umbrella className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">Nenhuma solicitação encontrada</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Compartilhe o link com os colaboradores para que solicitem férias</p>
                <Button 
                  variant="gradient" 
                  className="mt-6 gap-2"
                  onClick={handleCopyLink}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                  {copied ? "Link Copiado!" : "Copiar Link de Solicitação"}
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
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
                    <TableRow key={sol.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium group-hover:text-primary transition-colors">{sol.colaborador}</TableCell>
                      <TableCell>
                        {new Date(sol.dataInicio).toLocaleDateString("pt-BR")} -{" "}
                        {new Date(sol.dataFim).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {sol.dias} dias
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
                        <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
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