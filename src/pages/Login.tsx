import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserCog, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen gradient-login flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <Card className="glass-card border-white/10">
          <CardHeader className="text-center space-y-4 pb-6 pt-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow">
              <UserCog className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Meep RH
              </CardTitle>
              <CardDescription className="text-base">
                Sistema de Gestão de Pessoas
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pb-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-semibold">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-modern pl-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-semibold">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-modern pl-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => navigate("/login-meep")}
              >
                Entrar com conta Meep (MFA)
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Problemas para acessar?{" "}
                <a
                  href="#"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Contate o suporte
                </a>
              </p>
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
