
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Award } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOffline } from "@/hooks/use-offline";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isOffline = useOffline();

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 md:mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-netball-400 rounded-full">
              <Award className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Netball Club</h1>
          <p className="text-gray-600 mt-1">Management System</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className={isMobile ? "text-lg" : "text-xl"}>Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access the system
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-9 md:h-10"
                />
              </div>
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-9 md:h-10"
                />
              </div>
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-xs md:text-sm text-netball-500 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-3 md:space-y-4 pt-0">
              <Button 
                type="submit" 
                className="w-full bg-netball-500 hover:bg-netball-600 h-9 md:h-10 text-sm"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-center text-xs md:text-sm text-gray-600">
                Don't have an account?{" "}
                <a href="/register" className="text-netball-500 hover:underline">
                  Register
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-4 text-center text-xs md:text-sm text-gray-500">
          <p>Demo accounts:</p>
          <div className="grid grid-cols-2 gap-1 mt-1">
            <p>
              <span className="font-medium">Parent:</span> sarah.johnson@example.com
            </p>
            <p>
              <span className="font-medium">Coach:</span> james.williams@example.com
            </p>
            <p>
              <span className="font-medium">Manager:</span> emma.davis@example.com
            </p>
            <p>
              <span className="font-medium">Admin:</span> michael.brown@example.com
            </p>
          </div>
          <p className="mt-2 italic text-xs">
            Use any password to login for demo purposes
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
