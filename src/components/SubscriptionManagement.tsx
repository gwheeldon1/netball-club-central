import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_end?: string;
}

interface SubscriptionManagementProps {
  playerId: string;
  playerName: string;
}

export const SubscriptionManagement = ({ playerId, playerName }: SubscriptionManagementProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const checkSubscription = async () => {
    if (!currentUser) return;

    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { playerId }
      });

      if (error) throw error;
      setSubscriptionInfo(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const createSubscription = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { playerId }
      });

      if (error) throw error;
      
      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Redirecting to Payment",
        description: "You'll be redirected to Stripe to complete your subscription",
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const manageSubscription = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;
      
      // Open customer portal in new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Opening Subscription Management",
        description: "You'll be redirected to manage your subscription",
      });
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && playerId) {
      checkSubscription();
    }
  }, [currentUser, playerId]);

  if (!subscriptionInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Status - {playerName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          <Badge variant={subscriptionInfo.subscribed ? "default" : "secondary"}>
            {subscriptionInfo.subscribed ? (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Inactive
              </div>
            )}
          </Badge>
        </div>

        {subscriptionInfo.subscribed && subscriptionInfo.subscription_end && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Next Billing:</span>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-4 w-4" />
              {format(new Date(subscriptionInfo.subscription_end), 'PPP')}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          {subscriptionInfo.subscribed ? (
            <Button 
              onClick={manageSubscription} 
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading ? "Loading..." : "Manage Subscription"}
            </Button>
          ) : (
            <Button 
              onClick={createSubscription} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Loading..." : "Start Subscription"}
            </Button>
          )}
          
          <Button 
            onClick={checkSubscription} 
            disabled={refreshing}
            variant="ghost"
            size="sm"
          >
            {refreshing ? "Checking..." : "Refresh"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};