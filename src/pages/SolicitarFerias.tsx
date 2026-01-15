import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Send, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import logoMeepRh from "@/assets/logo-meep-rh.png";

export default function SolicitarFerias() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [setor, setSetor] = useState("");
  const [tipoFerias, setTipoFerias] = useState("");
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataFim, setDataFim] = useState<Date>();
  const [observacoes, setObservacoes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !email || !setor || !tipoFerias || !dataInicio || !dataFim) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);
    
    // Simular envio
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Solicitação enviada com sucesso!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <Card className="max-w-md w-full border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative z-10">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 mb-6 ring-4 ring-emerald-500/30">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Solicitação Enviada!</h2>
            <p className="text-white/60">
              Sua solicitação de férias foi enviada com sucesso. Você receberá uma notificação quando ela for analisada.
            </p>
            <Button 
              variant="gradient" 
              className="mt-8"
              onClick={() => {
                setSubmitted(false);
                setNome("");
                setEmail("");
                setSetor("");
                setTipoFerias("");
                setDataInicio(undefined);
                setDataFim(undefined);
                setObservacoes("");
              }}
            >
              Nova Solicitação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="max-w-2xl w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <img 
              src={logoMeepRh} 
              alt="Meep RH" 
              className="h-20 w-auto object-contain drop-shadow-2xl"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Solicitação de Férias
            </h1>
            <p className="text-white/60 mt-2">
              Preencha o formulário abaixo para solicitar suas férias
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-white/10 bg-gradient-to-r from-primary/20 to-accent/10">
            <CardTitle className="text-white">Dados da Solicitação</CardTitle>
            <CardDescription className="text-white/60">Todos os campos marcados com * são obrigatórios</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-white/80">Nome Completo *</Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="setor" className="text-white/80">Setor *</Label>
                  <Input
                    id="setor"
                    placeholder="Seu setor/departamento"
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Tipo de Férias *</Label>
                  <Select value={tipoFerias} onValueChange={setTipoFerias}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="integral">Integral (30 dias)</SelectItem>
                      <SelectItem value="fracionada">Fracionada</SelectItem>
                      <SelectItem value="venda">Venda de 10 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-white/80">Data de Início *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",
                          !dataInicio && "text-white/40"
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
                  <Label className="text-white/80">Data de Término *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",
                          !dataFim && "text-white/40"
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-white/80">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Informações adicionais (opcional)"
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50 focus:ring-primary/20"
                />
              </div>

              <Button 
                type="submit" 
                variant="gradient" 
                className="w-full gap-2 shadow-lg hover:shadow-xl transition-all h-12 text-base font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar Solicitação
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-white/40">
          Após o envio, sua solicitação será analisada pelo RH.
        </p>
      </div>
    </div>
  );
}