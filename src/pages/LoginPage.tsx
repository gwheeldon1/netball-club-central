
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Award } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-netball-400 rounded-full">
              <Award className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Netball Club</h1>
          <p className="text-gray-600 mt-1">Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access the system
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-sm text-netball-500 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-netball-500 hover:bg-netball-600"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <a href="/register" className="text-netball-500 hover:underline">
                  Register
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Demo accounts:</p>
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
          <p className="mt-1">
            <span className="italic">Use any password to login for demo purposes</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
