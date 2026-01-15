import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  showSearch?: boolean;
}

export function MainLayout({ children, showSearch = false }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex flex-1 flex-col lg:ml-64">
        <Header showSearch={showSearch} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
