

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLayoutHeader } from "@/hooks/useLayoutHeader";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Sidebar } from "@/components/layout/Sidebar";
interface LayoutProps {
  children: ReactNode;
}
const Layout = ({ children }: LayoutProps) => {
  const headerHeight = useLayoutHeader();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle();
  return (
    <div className="flex min-h-screen bg-background">
      <MobileHeader onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* Main content */}
      <div className="flex-1 lg:pl-[280px] w-full">
        <main 
          className={cn("min-h-screen w-full max-w-[1920px] mx-auto", "p-4 lg:pt-6 lg:p-8")} 
          style={{ paddingTop: `${headerHeight + 16}px` }}
        >
          {children}
        </main>
      </div>

      {/* Overlay for mobile/tablet sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden" 
          onClick={closeSidebar} 
        />
      )}
    </div>
  );
};
export default Layout;

