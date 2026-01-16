import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import logoMeep from "@/assets/logo-meep-rh.png";

const SECTOR_OPTIONS = [
  { value: "comercial", label: "Comercial" },
  { value: "compliance", label: "Compliance" },
  { value: "cs_meep", label: "CS Meep" },
  { value: "cs_mee", label: "CS Mee" },
  { value: "desenvolvimento", label: "Desenvolvimento" },
  { value: "marketing", label: "Marketing" },
  { value: "suporte", label: "Suporte" },
];

interface LocationState {
  email?: string;
  meepToken?: string;
  meepData?: {
    name?: string;
    email?: string;
  };
}

export default function SignupMeep() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [sector, setSector] = useState("");
  const [meepToken, setMeepToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if no state (user navigated directly)
    if (!state?.email || !state?.meepToken) {
      toast.error("Sessão expirada. Faça login novamente.");
      navigate("/login-meep");
      return;
    }

    setEmail(state.email);
    setMeepToken(state.meepToken);
    
    // Pre-fill name if available from Meep data
    if (state.meepData?.name) {
      setFullName(state.meepData.name);
    }
  }, [state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Digite seu nome completo");
      return;
    }

    if (!sector) {
      toast.error("Selecione um setor");
      return;
    }

    setIsLoading(true);

    try {
      // Call edge function to complete registration
      const { data, error } = await supabase.functions.invoke("meep-complete-registration", {
        body: {
          email,
          fullName: fullName.trim(),
          sector,
          meepToken,
        },
      });

      if (error) {
        console.error("Registration error:", error);
        toast.error("Erro ao completar cadastro");
        setIsLoading(false);
        return;
      }

      if (data.error) {
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      // Verify OTP to create Supabase session
      if (data.token) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.token,
          type: "magiclink",
        });

        if (verifyError) {
          console.error("OTP verification error:", verifyError);
          toast.error("Erro ao criar sessão");
          setIsLoading(false);
          return;
        }
      }

      toast.success("Cadastro realizado com sucesso!");
      
      // New users go to pending approval page
      navigate("/aguardando-aprovacao");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={logoMeep} alt="Meep RH" className="h-16 object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete seu cadastro</CardTitle>
          <CardDescription>
            Precisamos de algumas informações adicionais para criar sua conta
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email da sua conta Meep (não pode ser alterado)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Setor</Label>
              <Select value={sector} onValueChange={setSector} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu setor" />
                </SelectTrigger>
                <SelectContent>
                  {SECTOR_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Completar cadastro"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/login-meep")}
              className="w-full"
              disabled={isLoading}
            >
              Voltar para login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
