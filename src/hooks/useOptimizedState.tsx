import { useState, useCallback, useMemo } from 'react';

/**
 * Enhanced state hook with built-in optimization patterns
 */
export function useOptimizedState<T>(initialValue: T | (() => T)) {
  const [state, setState] = useState<T>(initialValue);

  const optimizedSetState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(prev => {
      const nextValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev)
        : newValue;
      
      // Prevent unnecessary re-renders by checking if value actually changed
      return Object.is(prev, nextValue) ? prev : nextValue;
    });
  }, []);

  const reset = useCallback(() => {
    setState(typeof initialValue === 'function' 
      ? (initialValue as () => T)() 
      : initialValue
    );
  }, [initialValue]);

  return useMemo(() => ({
    value: state,
    setValue: optimizedSetState,
    reset
  }), [state, optimizedSetState, reset]);
}

/**
 * State hook for managing loading states with automatic error handling
 */
export function useLoadingState(initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<Error | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoadingError = useCallback((error: Error | string) => {
    setIsLoading(false);
    setError(error instanceof Error ? error : new Error(error));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(initialLoading);
    setError(null);
  }, [initialLoading]);

  return useMemo(() => ({
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    clearError,
    reset,
    hasError: error !== null
  }), [isLoading, error, startLoading, stopLoading, setLoadingError, clearError, reset]);
}

/**
 * State hook for managing form validation state
 */
export function useValidationState<T extends Record<string, any>>(initialState: T) {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setFieldTouched = useCallback(<K extends keyof T>(field: K, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  const isValid = useMemo(() => 
    Object.keys(errors).length === 0, [errors]);

  const hasErrors = useMemo(() => 
    Object.values(errors).some(error => error !== undefined), [errors]);

  return useMemo(() => ({
    values,
    errors,
    touched,
    setValue,
    setFieldError,
    setFieldTouched,
    clearErrors,
    reset,
    isValid,
    hasErrors
  }), [
    values, errors, touched, setValue, setFieldError, 
    setFieldTouched, clearErrors, reset, isValid, hasErrors
  ]);
}