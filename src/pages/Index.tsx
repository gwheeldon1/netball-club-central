
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import { LazyDashboard, DashboardLoadingFallback } from '@/components/LazyLoadedComponents';

const Index = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If no user is logged in, redirect to login page
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // If user is logged in, show dashboard with proper lazy loading
  return currentUser ? (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <LazyDashboard />
    </Suspense>
  ) : null;
};

export default Index;
