
import { useTransition, startTransition } from 'react';
import { useCallback } from 'react';

export function useAsyncTransition() {
  const [isPending, startAsyncTransition] = useTransition();

  const executeWithTransition = useCallback((callback: () => void | Promise<void>) => {
    startTransition(() => {
      if (callback) {
        callback();
      }
    });
  }, []);

  return {
    isPending,
    executeWithTransition
  };
}
