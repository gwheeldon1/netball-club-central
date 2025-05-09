
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <X className="h-10 w-10 text-red-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <div className="space-y-2">
          <Button
            onClick={() => navigate("/")}
            className="bg-netball-500 hover:bg-netball-600 w-full"
          >
            Return to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
