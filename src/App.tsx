import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import LoginMeep from "./pages/LoginMeep";
import SignupMeep from "./pages/SignupMeep";
import AguardandoAprovacao from "./pages/AguardandoAprovacao";
import Dashboard from "./pages/Dashboard";
import Colaboradores from "./pages/Colaboradores";
import Vagas from "./pages/Vagas";
import Ferias from "./pages/Ferias";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import ColaboradoresSetor from "./pages/gestores/ColaboradoresSetor";
import SolicitacaoVaga from "./pages/gestores/SolicitacaoVaga";
import SolicitacaoFerias from "./pages/gestores/SolicitacaoFerias";
import Avaliacoes from "./pages/gestores/Avaliacoes";
import IntegracaoFerias from "./pages/docs/IntegracaoFerias";

const ModoTV = lazy(() => import("./pages/ModoTV"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginMeep />} />
            <Route path="/signup-meep" element={<SignupMeep />} />
            <Route path="/aguardando-aprovacao" element={<AguardandoAprovacao />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/colaboradores"
              element={
                <ProtectedRoute>
                  <Colaboradores />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vagas"
              element={
                <ProtectedRoute>
                  <Vagas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vagas/nova"
              element={
                <ProtectedRoute>
                  <Vagas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ferias"
              element={
                <ProtectedRoute>
                  <Ferias />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gestores/colaboradores"
              element={
                <ProtectedRoute>
                  <ColaboradoresSetor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gestores/solicitacao-vaga"
              element={
                <ProtectedRoute>
                  <SolicitacaoVaga />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gestores/solicitacao-ferias"
              element={
                <ProtectedRoute>
                  <SolicitacaoFerias />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gestores/avaliacoes"
              element={
                <ProtectedRoute>
                  <Avaliacoes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <ProtectedRoute requireAdmin>
                  <Configuracoes />
                </ProtectedRoute>
              }
            />
            <Route path="/docs/integracao-ferias" element={<IntegracaoFerias />} />
            <Route
              path="/modo-tv"
              element={
                <ProtectedRoute>
                  <Suspense fallback={null}>
                    <ModoTV />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
