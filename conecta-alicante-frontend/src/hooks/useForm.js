// src/hooks/useForm.js
import { useState, useCallback } from 'react';

export const useForm = ({ initialValues, validationRules = {} }) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = useCallback((field) => (value) => {
        setValues(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    }, [errors]);

    const handleBlur = useCallback((field) => () => {
        setTouched(prev => ({ ...prev, [field]: true }));

        // Validate single field on blur
        if (validationRules[field]) {
            const error = validationRules[field](values[field]);
            setErrors(prev => ({ ...prev, [field]: error }));
        }
    }, [validationRules, values]);

    const validateForm = useCallback(() => {
        const newErrors = {};
        let isValid = true;

        Object.keys(validationRules).forEach(field => {
            const error = validationRules[field](values[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        setTouched(Object.keys(validationRules).reduce((acc, field) => ({
            ...acc,
            [field]: true
        }), {}));

        return isValid;
    }, [validationRules, values]);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateForm,
        resetForm,
        setValues,
        setErrors,
    };
};
