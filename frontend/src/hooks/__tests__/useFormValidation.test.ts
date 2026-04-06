import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '../useFormValidation';
import { validationRules } from '../../utils/validation';

interface TestFormData {
  email: string;
  password: string;
  name: string;
}

describe('useFormValidation', () => {
  const initialValues: TestFormData = {
    email: '',
    password: '',
    name: '',
  };

  const validationSchema = [
    {
      field: 'email' as keyof TestFormData,
      validate: validationRules.email,
    },
    {
      field: 'password' as keyof TestFormData,
      validate: validationRules.password,
    },
    {
      field: 'name' as keyof TestFormData,
      validate: validationRules.name,
    },
  ];

  it('initializes with correct default values', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validationRules: validationSchema,
      })
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
    expect(result.current.isValidating).toBe(false);
  });

  it('updates values when handleChange is called', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validationRules: validationSchema,
      })
    );

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@example.com', type: 'email' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  it('validates form and returns correct validation state', async () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validationRules: validationSchema,
      })
    );

    // Set invalid values
    act(() => {
      result.current.setFieldValue('email', 'invalid-email');
      result.current.setFieldValue('password', '123'); // Too short
      result.current.setFieldValue('name', 'A'); // Too short
    });

    let isValid: boolean;
    await act(async () => {
      isValid = await result.current.validateForm();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.email).toBeDefined();
    expect(result.current.errors.password).toBeDefined();
    expect(result.current.errors.name).toBeDefined();
  });

  it('validates individual fields correctly', async () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validationRules: validationSchema,
      })
    );

    act(() => {
      result.current.setFieldValue('email', 'invalid-email');
    });

    let isFieldValid: boolean;
    await act(async () => {
      isFieldValid = await result.current.validateField('email');
    });

    expect(isFieldValid!).toBe(false);
    expect(result.current.errors.email).toBeDefined();
  });

  it('clears errors when clearErrors is called', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validationRules: validationSchema,
      })
    );

    act(() => {
      result.current.setFieldError('email', 'Test error');
    });

    expect(result.current.errors.email).toBe('Test error');

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual({});
  });

  it('resets form to initial values', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validationRules: validationSchema,
      })
    );

    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldError('email', 'Test error');
    });

    expect(result.current.values.email).toBe('test@example.com');
    expect(result.current.errors.email).toBe('Test error');

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
  });

  it('provides correct field props', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validationRules: validationSchema,
      })
    );

    act(() => {
      result.current.setFieldValue('email', 'test@example.com');
      result.current.setFieldError('email', 'Test error');
    });

    const fieldProps = result.current.getFieldProps('email');

    expect(fieldProps.name).toBe('email');
    expect(fieldProps.value).toBe('test@example.com');
    expect(fieldProps.error).toBe('Test error');
    expect(fieldProps.hasError).toBe(true);
    expect(typeof fieldProps.onChange).toBe('function');
    expect(typeof fieldProps.onBlur).toBe('function');
  });
});