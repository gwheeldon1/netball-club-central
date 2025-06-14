import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Layout from "@/components/Layout";
import EventForm from "@/components/EventForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Event } from "@/types";
import { api } from '@/services/api';
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Trash } from "lucide-react";
import { logger } from "@/utils/logger";

const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        toast.error("Event ID is missing");
        navigate("/events");
        return;
      }

      try {
        const eventData = await api.getEventById(id);

        if (!eventData) {
          toast.error("Event not found");
          navigate("/events");
          return;
        }

        setEvent(eventData);
      } catch (error) {
        logger.error("Error loading event:", error);
        toast.error("Failed to load event data");
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, navigate]);

  const handleDeleteEvent = async () => {
    if (!id) return;

    setIsDeleting(true);

    try {
      await api.deleteEvent(id);
      toast.success("Event deleted successfully");
      navigate("/events");
    } catch (error) {
      logger.error("Error deleting event:", error);
      toast.error("An error occurred while deleting the event");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Only admins, coaches, and managers can edit events
  useEffect(() => {
    if (!loading && !hasRole("admin") && !hasRole("coach") && !hasRole("manager")) {
      toast.error("You don't have permission to edit events");
      navigate("/events");
    }
  }, [loading, hasRole, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Event not found.</p>
          <Button className="mt-6" variant="outline" onClick={() => navigate("/events")}>
            Back to Events
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/events")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
              <p className="text-muted-foreground mt-2">
                Update the event information and settings
              </p>
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="sm:self-start"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Event
          </Button>
        </div>

        <EventForm event={event} mode="edit" />

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Are you sure you want to delete this event?</DialogTitle>
              <DialogDescription className="mt-2">
                This action cannot be undone. This will permanently delete the event
                "{event.name}" and remove it from our servers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteEvent}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default EditEventPage;