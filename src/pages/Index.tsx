
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import { LazyDashboard, DashboardLoadingFallback } from '@/components/LazyLoadedComponents';

const Index = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (!currentUser) {
      console.log('No user found, redirecting to login');
      navigate('/login', { replace: true });
    } else {
      console.log('User found, loading dashboard for:', currentUser.email);
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return <DashboardLoadingFallback />;
  }

  return currentUser ? (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <LazyDashboard />
    </Suspense>
  ) : null;
};

export default Index;
