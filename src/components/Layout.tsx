
import { ReactNode } from "react";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen w-full">
        {/* Desktop Sidebar */}
        <DesktopSidebar />

        {/* Mobile Navigation */}
        <MobileNavigation />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
