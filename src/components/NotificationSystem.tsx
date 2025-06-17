import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Send, Eye, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  user_id: string;
  related_event_id?: string;
}

interface NotificationSystemProps {
  userId?: string;
}

const NOTIFICATION_TYPES = [
  { value: 'info', label: 'Information', color: 'bg-primary' },
  { value: 'success', label: 'Success', color: 'bg-primary' },
  { value: 'warning', label: 'Warning', color: 'bg-destructive' },
  { value: 'error', label: 'Error', color: 'bg-destructive' },
];

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ userId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Notification[];
    }
  });

  // Fetch users for notification targeting
  const { data: users = [] } = useQuery({
    queryKey: ['users-for-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guardians')
        .select('id, first_name, last_name, email')
        .eq('approval_status', 'approved')
        .order('first_name');
      
      if (error) throw error;
      return data;
    },
    enabled: showCreateForm
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });
    }
  });

  // Create notification
  const createNotificationMutation = useMutation({
    mutationFn: async (notificationData: {
      title: string;
      message: string;
      type: string;
      user_ids: string[];
    }) => {
      const notifications = notificationData.user_ids.map(user_id => ({
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        user_id,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setTitle('');
      setMessage('');
      setSelectedUsers([]);
      setShowCreateForm(false);
      toast({
        title: "Success",
        description: "Notifications sent successfully",
      });
    }
  });

  const handleCreateNotification = () => {
    if (!title.trim() || !message.trim() || selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select at least one recipient",
        variant: "destructive",
      });
      return;
    }

    createNotificationMutation.mutate({
      title,
      message,
      type,
      user_ids: selectedUsers,
    });
  };

  const getNotificationIcon = (notificationType: string) => {
    const typeConfig = NOTIFICATION_TYPES.find(t => t.value === notificationType);
    return typeConfig?.color || 'bg-muted';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="outline"
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </CardHeader>

        {showCreateForm && (
          <CardContent className="border-t space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notification-title">Title</Label>
                <Input
                  id="notification-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <Label htmlFor="notification-type">Type</Label>
                <select
                  id="notification-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as 'info' | 'success' | 'warning' | 'error')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {NOTIFICATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="notification-message">Message</Label>
              <Textarea
                id="notification-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows={3}
              />
            </div>

            <div>
              <Label>Recipients</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                <div className="flex items-center space-x-2 p-1">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={selectedUsers.length === users.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    Select All
                  </label>
                </div>
                {users.map(user => (
                  <div key={user.id} className="flex items-center space-x-2 p-1">
                    <input
                      type="checkbox"
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                    />
                    <label htmlFor={`user-${user.id}`} className="text-sm">
                      {user.first_name} {user.last_name} ({user.email})
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedUsers.length} user(s) selected
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateNotification}
                disabled={createNotificationMutation.isPending}
              >
                {createNotificationMutation.isPending ? "Sending..." : "Send Notification"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        )}

        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  notification.read ? 'bg-muted/30' : 'bg-background border-primary/20'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${getNotificationIcon(notification.type)}`}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {NOTIFICATION_TYPES.find(t => t.value === notification.type)?.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notification.message}
                  </p>
                  <div className="flex gap-2 pt-2">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        className="h-6 px-2 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Mark Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotificationMutation.mutate(notification.id)}
                      className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};