import { useState } from 'react';

/**
 * A custom hook for managing form state and validation
 * @param initialValues Initial form values
 * @param validate Validation function that returns errors
 * @returns Form state, handlers, and validation
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validate?: (values: T) => Partial<Record<keyof T, string>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  // Update a single field
  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Mark a field as touched when blurred
  const handleBlur = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur if validation function exists
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[name]) {
        setErrors(prev => ({ ...prev, [name]: validationErrors[name] }));
      }
    }
  };

  // Reset form to initial values
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  // Validate all fields and return whether form is valid
  const validateForm = (): boolean => {
    if (!validate) return true;
    
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched as Partial<Record<keyof T, boolean>>);
    
    return Object.keys(validationErrors).length === 0;
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    resetForm,
    validateForm,
    setValues
  };
} 