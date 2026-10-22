import { useState } from 'react';

export type CheckoutValues = {
    name: string;
    phone: string;
    email: string;
    deliveryMethod: 'pickup' | 'delivery';
    location: string;
    scheduledAt: string;
    payment: 'cash' | 'pix';
};
export type CheckoutErrors = Partial<Record<keyof CheckoutValues, string>>;

export function validateCheckout(values: CheckoutValues, now = new Date()): CheckoutErrors {
    const errors: CheckoutErrors = {};
    if (!values.name.trim()) errors.name = 'Informe seu nome.';
    if (!/^\d{10,11}$/.test(values.phone.replace(/\D/g, ''))) errors.phone = 'Informe o telefone com DDD.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Informe um e-mail válido.';
    if (values.deliveryMethod === 'delivery' && !values.location.trim()) errors.location = 'Informe o local de entrega.';
    const date = new Date(values.scheduledAt);
    if (!values.scheduledAt || !Number.isFinite(date.getTime()) || date <= now) errors.scheduledAt = 'Escolha uma data e um horário futuros.';
    
    return errors;
}

export function useCheckoutForm() {
    const [values, setValues] = useState<CheckoutValues>({
        name: '', phone: '', email: '', deliveryMethod: 'pickup', location: '', scheduledAt: '', payment: 'cash',
    });
    const [errors, setErrors] = useState<CheckoutErrors>({});
    const [reviewed, setReviewed] = useState(false);

    function setField<K extends keyof CheckoutValues>(field: K, value: CheckoutValues[K]) {
        setValues((previous) => ({ ...previous, [field]: value }));
        setErrors((previous) => ({ ...previous, [field]: undefined }));
        setReviewed(false);
    }

    function validate() {
        const nextErrors = validateCheckout(values);
        setErrors(nextErrors);
        const valid = Object.keys(nextErrors).length === 0;
        setReviewed(valid);

        return valid;
    }

    return { values, errors, reviewed, setField, validate };
}
