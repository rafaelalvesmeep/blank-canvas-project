import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  ClipboardCheck,
  Settings,
  ChevronDown,
  Menu,
  X,
  Tv,
  UserCog,
  LogOut,
  List,
  PlusCircle,
  UsersRound,
  FileText,
  CalendarPlus,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logoMeepRh from "@/assets/logo-meep-rh.png";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }[];
}

// TODO: Replace with actual user role from auth context
const isAdmin = true; // Temporary - will be replaced with real auth logic

const rhNavItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { 
    title: "Vagas", 
    url: "/vagas", 
    icon: Briefcase,
    children: [
      { title: "Todas as Vagas", url: "/vagas", icon: List },
      { title: "Nova Solicitação", url: "/vagas/nova", icon: PlusCircle },
    ]
  },
  { title: "Colaboradores", url: "/colaboradores", icon: Users },
  { title: "Férias", url: "/ferias", icon: Calendar },
  { 
    title: "Gestores", 
    url: "/gestores", 
    icon: UserCog,
    children: [
      { title: "Colaboradores do Setor", url: "/gestores/colaboradores", icon: UsersRound },
      { title: "Solicitação de Vaga", url: "/gestores/solicitacao-vaga", icon: FileText },
      { title: "Solicitação de Férias", url: "/gestores/solicitacao-ferias", icon: CalendarPlus },
      { title: "Avaliações", url: "/gestores/avaliacoes", icon: Star },
    ]
  },
  { title: "Modo TV", url: "/modo-tv", icon: Tv },
  ...(isAdmin ? [{ title: "Configurações", url: "/configuracoes", icon: Settings }] : []),
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Determina quais menus devem estar expandidos baseado na rota atual
  const getExpandedItemsFromRoute = () => {
    const expanded: string[] = [];
    rhNavItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => 
          location.pathname === child.url || location.pathname.startsWith(child.url + "/")
        );
        if (isChildActive) {
          expanded.push(item.title);
        }
      }
    });
    return expanded;
  };

  const [expandedItems, setExpandedItems] = useState<string[]>(getExpandedItemsFromRoute);

  // Atualiza os itens expandidos quando a rota muda
  useState(() => {
    const activeParents = getExpandedItemsFromRoute();
    activeParents.forEach((parent) => {
      if (!expandedItems.includes(parent)) {
        setExpandedItems((prev) => [...prev, parent]);
      }
    });
  });

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (url: string) => location.pathname === url;
  const isParentActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((child) => location.pathname.startsWith(child.url));
    }
    return location.pathname.startsWith(item.url);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden text-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-center border-b border-sidebar-border px-4">
            <img 
              src={logoMeepRh} 
              alt="Meep RH" 
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {rhNavItems.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isParentActive(item)
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedItems.includes(item.title) && "rotate-180"
                        )}
                      />
                    </button>
                    {expandedItems.includes(item.title) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.url}
                            to={child.url}
                            onClick={() => {
                              // Apenas fecha o sidebar mobile, não afeta o submenu expandido
                              if (window.innerWidth < 1024) {
                                setIsOpen(false);
                              }
                            }}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                              isActive(child.url)
                                ? "bg-primary text-primary-foreground"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                            )}
                          >
                            <child.icon className="h-4 w-4" />
                            {child.title}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.url}
                    onClick={() => {
                      // Apenas fecha o sidebar mobile
                      if (window.innerWidth < 1024) {
                        setIsOpen(false);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive(item.url)
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

        </div>
      </aside>
    </>
  );
}
