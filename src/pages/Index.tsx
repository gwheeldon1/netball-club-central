
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';

const Index = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If no user is logged in, redirect to login page
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // If user is logged in, show dashboard
  return currentUser ? <Dashboard /> : null;
};

export default Index;
