
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Child, Event, Attendance } from "@/types";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Calendar, Activity, Trophy, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabaseChildrenApi } from "@/services/supabaseApi";
import { toast } from "sonner";
import FileUpload from "@/components/FileUpload";
import { SubscriptionManagement } from "@/components/SubscriptionManagement";

const ChildDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [attendanceHistory, setAttendanceHistory] = useState<{ event: Event; attendance: Attendance }[]>([]);
  const [performanceStats, setPerformanceStats] = useState({
    eventsAttended: 0,
    totalEvents: 0,
    attendanceRate: 0,
    goals: 0,
    playerOfMatch: 0,
  });

  useEffect(() => {
    const fetchChild = async () => {
      if (id && currentUser) {
        const children = await api.getChildren();
        const childData = children.find(c => c.id === id);
      
      if (childData) {
        // Check if this child belongs to the current user
        if (childData.parentId !== currentUser.id) {
          navigate("/unauthorized");
          return;
        }
        setChild(childData);
      } else {
        toast.error("Child not found");
        navigate("/children");
      }
      
      setLoading(false);
      
      // Load attendance history and performance stats
      loadChildStats(id);
      }
    };
    fetchChild();
  }, [id, currentUser, navigate]);

  const loadChildStats = async (childId: string) => {
    try {
      // Mock data for attendance and performance
      // In a real implementation, this would come from your events/attendance API
      const mockAttendance = [
        {
          event: {
            id: "1",
            name: "Training Session",
            date: "2024-01-15",
            time: "18:00",
            location: "Sports Hall A",
            eventType: "training" as const,
            teamId: "team-1",
          },
          attendance: {
            childId,
            eventId: "1",
            status: "present" as const,
            rsvp: "going" as const,
          },
        },
        {
          event: {
            id: "2",
            name: "Match vs Eagles",
            date: "2024-01-20",
            time: "10:00",
            location: "Home Court",
            eventType: "match" as const,
            teamId: "team-1",
            opponent: "Eagles",
          },
          attendance: {
            childId,
            eventId: "2",
            status: "present" as const,
            rsvp: "going" as const,
          },
        },
      ];
      
      setAttendanceHistory(mockAttendance);
      setPerformanceStats({
        eventsAttended: 2,
        totalEvents: 3,
        attendanceRate: 67,
        goals: 5,
        playerOfMatch: 1,
      });
    } catch (error) {
      console.error("Error loading child stats:", error);
    }
  };

  const getStatusBadgeColor = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return "bg-green-100 text-green-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };
  
  const handleImageUpload = async (url: string) => {
    if (child && id) {
      try {
        // Profile image update functionality needs to be implemented in unified API
        toast.info('Profile image update coming soon');
      } catch (error) {
        console.error("Error updating profile image:", error);
        toast.error("Failed to update profile image");
      }
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    toast.info("Edit functionality will be implemented soon.");
    // In a real app, this would open a form to edit the child's details
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!child) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Child Not Found</h2>
          <Button onClick={() => navigate("/children")}>Return to My Children</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/children")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Children
          </Button>
          
          <h1 className="text-3xl font-bold">{child.name}</h1>
          
          <div 
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(child.status)}`}
          >
            {child.status.charAt(0).toUpperCase() + child.status.slice(1)}
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Image and Quick Info */}
          <Card className="md:col-span-1">
            <div className="p-6 flex justify-center">
              <FileUpload 
                currentImage={child.profileImage}
                onUpload={handleImageUpload}
                aspectRatio={1}
              />
            </div>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Age Group</p>
                  <p className="font-medium">{child.ageGroup || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{new Date(child.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Team</p>
                  <p className="font-medium">{child.teamId ? "Assigned" : "Not assigned"}</p>
                </div>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={handleEditProfile}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Main Content with Tabs */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="medical">Medical</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-6 space-y-6">
                  {child.notes && (
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Additional Notes
                      </h3>
                      <p className="text-sm bg-muted p-3 border rounded">
                        {child.notes}
                      </p>
                    </div>
                  )}
                  
                  {child.status === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                      <h3 className="font-medium mb-1">Registration Status</h3>
                      <p className="text-sm">
                        Your child's registration is currently pending approval. 
                        You will be notified once it has been reviewed by our staff.
                      </p>
                    </div>
                  )}
                  
                  {child.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded">
                      <h3 className="font-medium mb-1">Registration Status</h3>
                      <p className="text-sm">
                        Your child's registration has been rejected. Please contact
                        the club administrators for more information.
                      </p>
                    </div>
                  )}
                  
                  {(!child.notes && child.status === 'approved') && (
                    <p className="text-muted-foreground">No additional information provided.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="subscription" className="mt-6">
                  <SubscriptionManagement 
                    playerId={child.id}
                    playerName={child.name}
                  />
                </TabsContent>
                
                <TabsContent value="performance" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Performance Summary
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{performanceStats.eventsAttended}</div>
                        <div className="text-sm text-muted-foreground">Events Attended</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{performanceStats.attendanceRate}%</div>
                        <div className="text-sm text-muted-foreground">Attendance Rate</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{performanceStats.goals}</div>
                        <div className="text-sm text-muted-foreground">Goals Scored</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{performanceStats.playerOfMatch}</div>
                        <div className="text-sm text-muted-foreground">Player of Match</div>
                      </div>
                    </div>
                    
                    {performanceStats.eventsAttended === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No performance data available yet</p>
                        <p className="text-sm">Data will appear after attending events</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="attendance" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Attendance History
                    </h3>
                    
                    {attendanceHistory.length > 0 ? (
                      <div className="space-y-3">
                        {attendanceHistory.map(({ event, attendance }) => (
                          <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{event.name}</h4>
                                <Badge variant={event.eventType === 'match' ? 'default' : 'secondary'}>
                                  {event.eventType}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(event.date).toLocaleDateString()} at {event.time} • {event.location}
                              </p>
                            </div>
                            <Badge 
                              variant={attendance.status === 'present' ? 'default' : 'destructive'}
                              className={attendance.status === 'present' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {attendance.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No attendance history available</p>
                        <p className="text-sm">History will appear after attending events</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="medical" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Medical Information
                    </h3>
                    
                    {child.medicalInfo ? (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Heart className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-amber-800 mb-1">Important Medical Information</h4>
                            <p className="text-sm text-amber-700">{child.medicalInfo}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No medical information provided</p>
                        <p className="text-sm">Contact your coach if medical conditions need to be recorded</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ChildDetailPage;
