import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import EventForm from "@/components/EventForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NewEventPage = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  // Check permissions - only admins, coaches, and managers can create events
  if (!hasRole("admin") && !hasRole("coach") && !hasRole("manager")) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to create events.
          </p>
          <Button onClick={() => navigate("/events")} className="mt-4">
            Back to Events
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/events")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
            <p className="text-muted-foreground mt-1">
              Schedule a new training, match, or team event
            </p>
          </div>
        </div>

        <EventForm mode="create" />
      </div>
    </Layout>
  );
};

export default NewEventPage;