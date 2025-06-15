import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Award, LockIcon, MailIcon } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { ForgotPasswordDialog } from "@/components/ForgotPasswordDialog";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <img 
              src="/lovable-uploads/e6754ad1-0a60-46b4-89e8-a3398e86eacb" 
              alt="Club Manager Logo" 
              className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">Club Manager</h1>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl text-center">Sign In</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit} autoComplete="on">
            <CardContent className="space-y-4 pt-1 px-4 sm:px-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MailIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                   <Input 
                     id="email" 
                     type="email" 
                     placeholder="name@example.com" 
                     value={email} 
                     onChange={e => setEmail(e.target.value)} 
                     required 
                     className="pl-9 sm:pl-10 h-10 sm:h-11 text-base"
                     autoComplete="email"
                     name="email"
                   />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <ForgotPasswordDialog>
                    <button type="button" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                      Forgot Password?
                    </button>
                  </ForgotPasswordDialog>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                   <Input 
                     id="password" 
                     type="password" 
                     placeholder="••••••••" 
                     value={password} 
                     onChange={e => setPassword(e.target.value)} 
                     required 
                     className="pl-9 sm:pl-10 h-10 sm:h-11 text-base"
                     autoComplete="current-password"
                     name="password"
                   />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4 pt-2 px-4 sm:px-6 pb-4 sm:pb-6">
              <Button type="submit" className="w-full h-10 sm:h-11 text-base" disabled={loading}>
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <a href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Register
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
            <CardTitle className="text-center text-sm font-medium">Demo Accounts</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center p-3 bg-accent rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">P</span>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-medium text-foreground">Parent</p>
                  <p className="text-xs text-muted-foreground truncate">sarah.johnson@example.com</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-accent rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">C</span>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-medium text-foreground">Coach</p>
                  <p className="text-xs text-muted-foreground truncate">james.williams@example.com</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-accent rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">M</span>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-medium text-foreground">Manager</p>
                  <p className="text-xs text-muted-foreground truncate">emma.davis@example.com</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-accent rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">A</span>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-medium text-foreground">Admin</p>
                  <p className="text-xs text-muted-foreground truncate">michael.brown@example.com</p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground italic">
              Use any password to login for demo purposes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
