import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserCog, Lock, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { meepLogin, meepValidate, MeepAuthManager } from "@/lib/meep-auth-manager";

type Step = "credentials" | "mfa";

export default function LoginMeep() {
  const navigate = useNavigate();
  const { loginWithMeep } = useAuth();
  
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Preencha email e senha");
      return;
    }

    setIsLoading(true);

    try {
      const result = await meepLogin(email, password);

      if (result.success) {
        toast.success("Código MFA enviado para seu email");
        setStep("mfa");
      } else {
        toast.error(result.message || "Credenciais inválidas");
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mfaCode.length !== 6) {
      toast.error("Digite o código de 6 dígitos");
      return;
    }

    setIsLoading(true);

    try {
      const validateResult = await meepValidate(email, mfaCode);

      if (!validateResult.success || !validateResult.token) {
        toast.error(validateResult.message || "Código inválido");
        setIsLoading(false);
        return;
      }

      if (validateResult.user) {
        MeepAuthManager.setUserData(validateResult.user);
      }

      const loginResult = await loginWithMeep(email, validateResult.token);

      if (loginResult.error) {
        toast.error(loginResult.error.message || "Erro ao autenticar");
        setIsLoading(false);
        return;
      }

      if (loginResult.needsRegistration) {
        toast.info("Complete seu cadastro para continuar");
        navigate("/signup-meep", { 
          state: { 
            email, 
            meepToken: validateResult.token,
            meepData: loginResult.meepData 
          } 
        });
        return;
      }

      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Erro durante a autenticação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
    setMfaCode("");
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
                {step === "credentials" 
                  ? "Sistema de Gestão de Pessoas" 
                  : "Digite o código enviado para seu email"
                }
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pb-10">
            {step === "credentials" ? (
              <form onSubmit={handleCredentialsSubmit} className="space-y-6">
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      Enviando código...
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </Button>

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
              </form>
            ) : (
              <form onSubmit={handleMfaSubmit} className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Enviamos um código para <strong>{email}</strong>
                  </p>
                  
                  <InputOTP
                    maxLength={6}
                    value={mfaCode}
                    onChange={setMfaCode}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || mfaCode.length !== 6}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Verificando...
                    </span>
                  ) : (
                    "Verificar código"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleBackToCredentials}
                  className="w-full"
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-white/40">
          © 2026 Meep RH. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}