
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LockIcon, MailIcon } from "lucide-react";
import { toast } from "sonner";
// import { useIsMobile } from "@/hooks/use-mobile"; // isMobile removed
import { ForgotPasswordDialog } from "@/components/ForgotPasswordDialog";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  // const isMobile = useIsMobile(); // isMobile removed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    console.log('Login form submitted', { email, hasPassword: !!password });
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await login(email, password);
      console.log('Login result:', success);
      
      if (success) {
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("An error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-secondary px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
              <img 
                src="/shot-tracker-main-logo.png" 
                alt="Club Manager Logo" 
                className="w-full h-full object-contain animate-scale-in" 
                style={{
                  filter: 'drop-shadow(0 0 0 transparent)',
                  mixBlendMode: 'multiply'
                }} 
              />
            </div>
          </div>
          <p className="text-muted-foreground">Your premier club management platform</p>
        </div>

        <Card className="glass-card shadow-elevation-high animate-scale-in" style={{ animationDelay: '200ms' }}>
          <form onSubmit={handleSubmit} autoComplete="on">
            <CardContent className="space-y-6 pt-6 px-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MailIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="pl-10 h-11 text-base border-2 focus:border-primary transition-colors" 
                    autoComplete="email" 
                    name="email"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <ForgotPasswordDialog>
                    <button 
                      type="button" 
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      disabled={isLoading}
                    >
                      Forgot Password?
                    </button>
                  </ForgotPasswordDialog>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LockIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="pl-10 h-11 text-base border-2 focus:border-primary transition-colors" 
                    autoComplete="current-password" 
                    name="password"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex-col space-y-6 pt-4 px-6 pb-6">
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold shadow-glow" 
                disabled={isLoading}
              >
                {isLoading ? (
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
                  Register here
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
