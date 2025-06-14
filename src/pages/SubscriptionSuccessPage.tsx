import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

const SubscriptionSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId] = useState(searchParams.get('session_id'));

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/children');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
            Subscription Active!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your subscription has been successfully activated. You now have full access to all club features.
          </p>
          
          {sessionId && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-mono text-muted-foreground">
                Session ID: {sessionId.substring(0, 20)}...
              </p>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <Button 
              onClick={() => navigate('/children')} 
              className="w-full"
            >
              View My Children
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/events')}
              className="w-full"
            >
              Browse Events
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            You'll be automatically redirected to your children page in a few seconds.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccessPage;