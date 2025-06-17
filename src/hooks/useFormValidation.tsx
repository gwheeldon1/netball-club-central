import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { validateAndSanitize } from '@/utils/validation';

interface FormField {
  value: string | boolean | number;
  error?: string;
  touched: boolean;
}

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  initialValues: Partial<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialValues,
  validateOnChange = false,
  validateOnBlur = true,
  // debounceMs = 300, // debounceMs removed
}: UseFormValidationOptions<T>) {
  const [fields, setFields] = useState<Record<keyof T, FormField>>(() => {
    const initial: Record<string, FormField> = {};
    Object.keys(initialValues).forEach((key) => {
      initial[key] = {
        value: initialValues[key as keyof T] || '',
        touched: false,
        error: undefined,
      };
    });
    return initial as Record<keyof T, FormField>;
  });

  const [isValidating, setIsValidating] = useState(false);

  // Get current form values
  const values = useMemo(() => {
    const result: Record<string, any> = {};
    Object.keys(fields).forEach((key) => {
      result[key] = fields[key as keyof T].value;
    });
    return result as T;
  }, [fields]);

  // Validate a single field
  const validateField = useCallback(
    (fieldName: keyof T, value: any) => {
      try {
        // Validate the entire form and extract field-specific error
        const testData = { ...values, [fieldName]: value };
        const result = validateAndSanitize(schema, testData);
        return result.errors?.[fieldName as string];
      } catch {
        return undefined;
      }
    },
    [schema, values]
  );

  // Validate all fields
  const validateAll = useCallback(() => {
    setIsValidating(true);
    const result = validateAndSanitize(schema, values);
    
    setFields((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        updated[key as keyof T] = {
          ...updated[key as keyof T],
          error: result.errors?.[key],
          touched: true,
        };
      });
      return updated;
    });

    setIsValidating(false);
    return result;
  }, [schema, values]);

  // Set field value
  const setFieldValue = useCallback(
    (fieldName: keyof T, value: any) => {
      setFields((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          value,
          error: validateOnChange ? validateField(fieldName, value) : prev[fieldName]?.error,
        },
      }));
    },
    [validateOnChange, validateField]
  );

  // Set field touched
  const setFieldTouched = useCallback(
    (fieldName: keyof T, touched: boolean = true) => {
      setFields((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          touched,
          error: validateOnBlur && touched ? validateField(fieldName, prev[fieldName]?.value) : prev[fieldName]?.error,
        },
      }));
    },
    [validateOnBlur, validateField]
  );

  // Set multiple field values
  const setValues = useCallback((newValues: Partial<T>) => {
    setFields((prev) => {
      const updated = { ...prev };
      Object.keys(newValues).forEach((key) => {
        const fieldName = key as keyof T;
        updated[fieldName] = {
          ...updated[fieldName],
          value: newValues[fieldName],
          error: validateOnChange ? validateField(fieldName, newValues[fieldName]) : updated[fieldName]?.error,
        };
      });
      return updated;
    });
  }, [validateOnChange, validateField]);

  // Reset form
  const reset = useCallback((newInitialValues?: Partial<T>) => {
    const valuesToUse = newInitialValues || initialValues;
    setFields(() => {
      const resetFields: Record<string, FormField> = {};
      Object.keys(valuesToUse).forEach((key) => {
        resetFields[key] = {
          value: valuesToUse[key as keyof T] || '',
          touched: false,
          error: undefined,
        };
      });
      return resetFields as Record<keyof T, FormField>;
    });
  }, [initialValues]);

  // Get field props for easy binding
  const getFieldProps = useCallback(
    (fieldName: keyof T) => ({
      value: fields[fieldName]?.value || '',
      onChange: (value: any) => setFieldValue(fieldName, value),
      onBlur: () => setFieldTouched(fieldName, true),
      error: fields[fieldName]?.error,
      required: false, // This would need to be determined from schema
    }),
    [fields, setFieldValue, setFieldTouched]
  );

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.values(fields).every((field) => !field.error);
  }, [fields]);

  // Check if form has been touched
  const isDirty = useMemo(() => {
    return Object.values(fields).some((field) => field.touched);
  }, [fields]);

  // Get all errors
  const errors = useMemo(() => {
    const result: Record<string, string> = {};
    Object.keys(fields).forEach((key) => {
      const error = fields[key as keyof T].error;
      if (error) {
        result[key] = error;
      }
    });
    return result;
  }, [fields]);

  return {
    values,
    fields,
    errors,
    isValid,
    isDirty,
    isValidating,
    setFieldValue,
    setFieldTouched,
    setValues,
    validateAll,
    validateField,
    reset,
    getFieldProps,
  };
}