import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { meepLogin, meepValidate, MeepAuthManager } from "@/lib/meep-auth-manager";
import { Loader2, Mail, KeyRound, ArrowLeft } from "lucide-react";
import logoMeep from "@/assets/logo-meep-rh.png";

type Step = "credentials" | "mfa";

export default function LoginMeep() {
  const navigate = useNavigate();
  const { loginWithMeep } = useAuth();
  
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      // Validate MFA code with Meep
      const validateResult = await meepValidate(email, mfaCode);

      if (!validateResult.success || !validateResult.token) {
        toast.error(validateResult.message || "Código inválido");
        setIsLoading(false);
        return;
      }

      // Store Meep user data for potential registration
      if (validateResult.user) {
        MeepAuthManager.setUserData(validateResult.user);
      }

      // Authenticate with Supabase using Meep token
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={logoMeep} alt="Meep RH" className="h-16 object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "credentials" ? "Entrar com Meep" : "Verificação MFA"}
          </CardTitle>
          <CardDescription>
            {step === "credentials" 
              ? "Use suas credenciais da conta Meep" 
              : "Digite o código enviado para seu email"
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "credentials" ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@meep.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando código...
                  </>
                ) : (
                  "Enviar código MFA"
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate("/login")}
                  className="text-sm text-muted-foreground"
                >
                  Voltar para login tradicional
                </Button>
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

              <Button type="submit" className="w-full" disabled={isLoading || mfaCode.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar código"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
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
    </div>
  );
}
