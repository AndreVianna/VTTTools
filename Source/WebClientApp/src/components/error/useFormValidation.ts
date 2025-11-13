import React from 'react';

export function useFormValidation() {
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const markAsTouched = React.useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const markAllAsTouched = React.useCallback((fields: string[]) => {
    const touchedFields = fields.reduce(
      (acc, field) => {
        acc[field] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    setTouched((prev) => ({ ...prev, ...touchedFields }));
  }, []);

  const resetTouched = React.useCallback(() => {
    setTouched({});
  }, []);

  return {
    touched,
    markAsTouched,
    markAllAsTouched,
    resetTouched,
  };
}
