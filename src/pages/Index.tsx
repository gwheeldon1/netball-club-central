
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import { LazyDashboard, DashboardLoadingFallback } from '@/components/LazyLoadedComponents';

const Index = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth loading to complete
    if (loading) return;
    
    // If no user is logged in, redirect to login page
    if (!currentUser) {
      console.log('No user found, redirecting to login');
      navigate('/login', { replace: true });
    } else {
      console.log('User found, loading dashboard for:', currentUser.email);
    }
  }, [currentUser, loading, navigate]);

  // Show loading while auth is checking
  if (loading) {
    return <DashboardLoadingFallback />;
  }

  // If user is logged in, show dashboard with proper lazy loading
  return currentUser ? (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <LazyDashboard />
    </Suspense>
  ) : null;
};

export default Index;
