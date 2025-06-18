
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({ children }) => {
  const handleError = (error: Error, errorInfo: any) => {
    console.error('Error Boundary caught an error:', error, errorInfo);
  };

  const handleReset = () => {
    console.log('Error boundary reset');
    window.location.reload();
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
};
