
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import { LazyDashboard, DashboardLoadingFallback } from '@/components/LazyLoadedComponents';

const Index = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index: useEffect - loading:', loading, 'user:', currentUser?.email);
    
    if (loading) {
      console.log('Index: Still loading auth state');
      return;
    }
    
    if (!currentUser) {
      console.log('Index: No user found, redirecting to login');
      navigate('/login', { replace: true });
    } else {
      console.log('Index: User found, ready to load dashboard for:', currentUser.email);
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    console.log('Index: Showing loading fallback');
    return <DashboardLoadingFallback />;
  }

  if (!currentUser) {
    console.log('Index: No user, returning null while redirect happens');
    return null;
  }

  console.log('Index: Rendering dashboard with Suspense');
  return (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <LazyDashboard />
    </Suspense>
  );
};

export default Index;
