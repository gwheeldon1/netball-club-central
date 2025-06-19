
// Simplified hooks without Redux
import { useAuth } from '@/context/AuthContext';

export const useAppSelector = (selector: any) => {
  // For now, return empty function - we'll use React Context instead
  return {};
};

export const useAppDispatch = () => {
  // For now, return empty function - we'll use React Context instead
  return () => {};
};

// Re-export auth hook for convenience
export { useAuth };
