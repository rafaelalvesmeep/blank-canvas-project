import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Code, FileJson, Key, AlertTriangle, CheckCircle, XCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const WEBHOOK_URL = `https://sbasetmesbveocyeauua.supabase.co/functions/v1/webhook-vacation-request`;

const payloadExample = `{
  "external_id": "SIM-2024-001",
  "employee": {
    "id": "EMP-123",
    "name": "Maria Silva",
    "email": "maria.silva@empresa.com",
    "department": "Tecnologia"
  },
  "vacation": {
    "start_date": "2024-02-01",
    "end_date": "2024-02-15",
    "days_count": 15,
    "notes": "Férias de verão"
  }
}`;

const curlExample = `curl -X POST "${WEBHOOK_URL}" \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Secret: SEU_WEBHOOK_SECRET" \\
  -d '${payloadExample.replace(/\n/g, "\\n").replace(/'/g, "\\'")}'`;

const jsExample = `const response = await fetch("${WEBHOOK_URL}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Webhook-Secret": process.env.WEBHOOK_SECRET
  },
  body: JSON.stringify({
    external_id: "SIM-2024-001",
    employee: {
      id: "EMP-123",
      name: "Maria Silva",
      email: "maria.silva@empresa.com",
      department: "Tecnologia"
    },
    vacation: {
      start_date: "2024-02-01",
      end_date: "2024-02-15",
      days_count: 15,
      notes: "Férias de verão"
    }
  })
});

const data = await response.json();
console.log(data);`;

const responseSuccess = `{
  "success": true,
  "message": "Vacation request created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "external_id": "SIM-2024-001",
    "status": "pendente",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}`;

const responseError = `{
  "error": "Missing required field: external_id"
}`;

const responseDuplicate = `{
  "error": "Duplicate request",
  "message": "A vacation request with external_id 'SIM-2024-001' already exists",
  "existing_id": "550e8400-e29b-41d4-a716-446655440000"
}`;

export default function IntegracaoFerias() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copiado!");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
              <FileJson className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Documentação da API
              </h1>
              <p className="text-muted-foreground mt-1">
                Integração de Solicitações de Férias via Webhook
              </p>
            </div>
          </div>
        </div>

        {/* URL do Webhook */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              URL do Webhook
            </CardTitle>
            <CardDescription>
              Endpoint para enviar solicitações de férias do sistema SIM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
              <code className="flex-1 break-all">{WEBHOOK_URL}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(WEBHOOK_URL, "url")}
              >
                {copiedField === "url" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Autenticação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Todas as requisições devem incluir o header <code className="bg-muted px-1.5 py-0.5 rounded">X-Webhook-Secret</code> com o valor do secret configurado.
            </p>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                O <code>WEBHOOK_SECRET</code> deve ser o mesmo configurado no sistema SIM e no Meep RH. Mantenha este valor em segredo.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Payload */}
        <Card>
          <CardHeader>
            <CardTitle>Estrutura do Payload</CardTitle>
            <CardDescription>
              Formato JSON esperado no corpo da requisição POST
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                <code>{payloadExample}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(payloadExample, "payload")}
              >
                {copiedField === "payload" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Campos Obrigatórios:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">external_id</code> - ID único da solicitação no sistema SIM</li>
                <li><code className="bg-muted px-1 rounded">employee.id</code> - ID do colaborador</li>
                <li><code className="bg-muted px-1 rounded">employee.name</code> - Nome completo</li>
                <li><code className="bg-muted px-1 rounded">employee.email</code> - E-mail do colaborador</li>
                <li><code className="bg-muted px-1 rounded">employee.department</code> - Setor/Departamento</li>
                <li><code className="bg-muted px-1 rounded">vacation.start_date</code> - Data de início (YYYY-MM-DD)</li>
                <li><code className="bg-muted px-1 rounded">vacation.end_date</code> - Data de término (YYYY-MM-DD)</li>
                <li><code className="bg-muted px-1 rounded">vacation.days_count</code> - Número de dias</li>
              </ul>
              <h4 className="font-medium mt-4">Campos Opcionais:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">vacation.notes</code> - Observações adicionais</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Exemplos */}
        <Card>
          <CardHeader>
            <CardTitle>Exemplos de Requisição</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="curl">
              <TabsList className="mb-4">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
                    <code>{curlExample}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(curlExample, "curl")}
                  >
                    {copiedField === "curl" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="javascript">
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                    <code>{jsExample}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(jsExample, "js")}
                  >
                    {copiedField === "js" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Códigos de Resposta */}
        <Card>
          <CardHeader>
            <CardTitle>Códigos de Resposta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge className="bg-success/10 text-success border-success/20">201</Badge>
                <div className="flex-1">
                  <p className="font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Criado com Sucesso
                  </p>
                  <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    <code>{responseSuccess}</code>
                  </pre>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="bg-warning/10 text-warning border-warning/20">400</Badge>
                <div className="flex-1">
                  <p className="font-medium flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-warning" />
                    Campos Inválidos
                  </p>
                  <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    <code>{responseError}</code>
                  </pre>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="bg-destructive/10 text-destructive border-destructive/20">401</Badge>
                <div className="flex-1">
                  <p className="font-medium flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    Não Autorizado
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    O header X-Webhook-Secret está ausente ou inválido.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">409</Badge>
                <div className="flex-1">
                  <p className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Duplicado
                  </p>
                  <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    <code>{responseDuplicate}</code>
                  </pre>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="bg-destructive/10 text-destructive border-destructive/20">500</Badge>
                <div className="flex-1">
                  <p className="font-medium flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    Erro Interno
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Erro inesperado no servidor. Tente novamente ou contate o suporte.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="font-medium">Erro 401 - Não Autorizado</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                  <li>Verifique se o header X-Webhook-Secret está presente</li>
                  <li>Confirme que o valor do secret está correto</li>
                  <li>Certifique-se de que não há espaços extras no valor</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Erro 409 - Duplicado</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                  <li>O external_id já foi usado em uma solicitação anterior</li>
                  <li>Use um external_id único para cada nova solicitação</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Erro 400 - Campos Inválidos</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                  <li>Verifique se todos os campos obrigatórios estão presentes</li>
                  <li>Confirme o formato das datas (YYYY-MM-DD)</li>
                  <li>Certifique-se de que days_count é um número inteiro</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
