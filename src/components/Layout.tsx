
import { ReactNode } from "react";
import { AdminNavigation } from "@/components/navigation/AdminNavigation";
import { UserButton } from "@/components/auth/UserButton";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col h-full bg-card border-r">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-primary">Shot Tracker</h1>
            </div>
            
            <div className="flex-1 px-4 pb-4">
              <AdminNavigation />
            </div>
            
            {currentUser && (
              <div className="p-4 border-t">
                <UserButton />
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
