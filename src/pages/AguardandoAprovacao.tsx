import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function AguardandoAprovacao() {
  const { signOut, profile, isApproved, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isApproved) {
      navigate("/dashboard", { replace: true });
    }
  }, [isApproved, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleRefresh = async () => {
    await refreshProfile();
  };

  return (
    <div className="min-h-screen gradient-login flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <Card className="glass-card border-white/10">
          <CardHeader className="text-center space-y-4 pb-6 pt-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Aguardando Aprovação
              </CardTitle>
              <CardDescription className="text-base">
                Sua conta foi criada com sucesso!
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pb-10 text-center space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Olá, <span className="font-medium text-foreground">{profile?.full_name || profile?.email}</span>!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Um administrador precisa aprovar seu acesso ao sistema.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleRefresh}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Verificar
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-white/40">
          © 2026 Meep RH. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
