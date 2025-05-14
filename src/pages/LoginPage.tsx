
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Award, LockIcon, MailIcon } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success("Logged in successfully");
        navigate("/");
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      toast.error("An error occurred during login");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/95 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-netball-400 rounded-full flex items-center justify-center shadow-lg">
                <Award className="h-9 w-9 md:h-11 md:w-11 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <div className="w-4 h-4 bg-netball-500 rounded-full"></div>
              </div>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Netball Club</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-lg">Management System</p>
        </div>

        <Card className="shadow-lg border-gray-200 dark:border-gray-800">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl md:text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-base">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-1">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <a
                    href="#"
                    className="text-xs font-medium text-netball-500 hover:text-netball-700 transition-colors"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-11 text-base"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4 pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 text-base bg-netball-500 hover:bg-netball-600 transition-colors shadow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : "Sign In"}
              </Button>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <a href="/register" className="font-medium text-netball-500 hover:text-netball-700 transition-colors">
                  Register
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Demo accounts</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">P</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-700 dark:text-gray-300">Parent</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">sarah.johnson@example.com</p>
              </div>
            </div>
            <div className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                <span className="text-xs font-medium text-green-600 dark:text-green-400">C</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-700 dark:text-gray-300">Coach</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">james.williams@example.com</p>
              </div>
            </div>
            <div className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2">
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">M</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-700 dark:text-gray-300">Manager</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">emma.davis@example.com</p>
              </div>
            </div>
            <div className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-2">
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">A</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-700 dark:text-gray-300">Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">michael.brown@example.com</p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400 italic">
            Use any password to login for demo purposes
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
