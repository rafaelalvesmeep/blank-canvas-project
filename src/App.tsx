import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Colaboradores from "./pages/Colaboradores";
import Vagas from "./pages/Vagas";
import Ferias from "./pages/Ferias";
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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/colaboradores" element={<Colaboradores />} />
          <Route path="/vagas" element={<Vagas />} />
          <Route path="/vagas/nova" element={<Vagas />} />
          <Route path="/ferias" element={<Ferias />} />
          <Route path="/gestores/colaboradores" element={<ColaboradoresSetor />} />
          <Route path="/gestores/solicitacao-vaga" element={<SolicitacaoVaga />} />
          <Route path="/gestores/solicitacao-ferias" element={<SolicitacaoFerias />} />
          <Route path="/gestores/avaliacoes" element={<Avaliacoes />} />
          <Route path="/docs/integracao-ferias" element={<IntegracaoFerias />} />
          <Route
            path="/modo-tv"
            element={
              <Suspense fallback={null}>
                <ModoTV />
              </Suspense>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
