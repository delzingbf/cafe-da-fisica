import { useId } from 'react';
import type { useCheckoutForm } from '../hooks/useCheckoutForm';

type Props = {
    form: ReturnType<typeof useCheckoutForm>;
    onBack: () => void;
};

export function CheckoutForm({ form, onBack }: Props) {
    const id = useId();
    const { values, errors, setField } = form;
    
    function field(name: 'name' | 'phone' | 'email' | 'location' | 'scheduledAt', label: string, type = 'text', autoComplete?: string) {
        return (
            <div className="checkout-field">
                <label htmlFor={`${id}-${name}`}>{label}</label>
                <input id={`${id}-${name}`} name={name} type={type} autoComplete={autoComplete}
                    value={values[name]} required aria-invalid={Boolean(errors[name])}
                    aria-describedby={errors[name] ? `${id}-${name}-error` : undefined}
                    onChange={(event) => setField(name, event.target.value)} />
                {errors[name] && <span className="checkout-error" id={`${id}-${name}-error`}>{errors[name]}</span>}
            </div>
        );
    }

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!form.validate()) {
            // Wait for React to render the field errors before moving focus.
            const element = event.currentTarget;
            requestAnimationFrame(() => element.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus());
            return;
        }

        console.log(values);
    }

    return (
        <form className="checkout-form" noValidate onSubmit={handleSubmit}>
            <fieldset>
                <legend>Seus dados</legend>
                {field('name', 'Nome completo', 'text', 'name')}
                <div className="checkout-columns">
                    {field('phone', 'Telefone com DDD', 'tel', 'tel')}
                    {field('email', 'E-mail', 'email', 'email')}
                </div>
            </fieldset>
            <fieldset>
                <legend>Como deseja receber?</legend>
                <div className="checkout-options">
                    {([['pickup', 'Retirar no Café'], ['delivery', 'Entregar em outro local']] as const).map(([value, label]) => (
                        <label key={value}><input type="radio" name={`${id}-deliveryMethod`} value={value}
                            checked={values.deliveryMethod === value} onChange={() => setField('deliveryMethod', value)} /><span>{label}</span></label>
                    ))}
                </div>
                {values.deliveryMethod === 'delivery' && <>
                    {field('location', 'Local de entrega')}
                    <small>Exemplo: Prédio 43164, sala 203.</small>
                </>}
                {field('scheduledAt', 'Data e horário desejados', 'datetime-local')}
            </fieldset>
            <fieldset>
                <legend>Pagamento</legend>
                <div className="checkout-options">
                    {([['cash', 'Dinheiro'], ['pix', 'Pix']] as const).map(([value, label]) => (
                        <label key={value}><input type="radio" name={`${id}-payment`} value={value}
                            checked={values.payment === value} onChange={() => setField('payment', value)} /><span>{label}</span></label>
                    ))}
                </div>
                {values.payment === 'pix' && <div className="checkout-receipt">
                    <p><strong>Comprovante Pix</strong></p>
                    <button type="button" disabled>Anexar comprovante</button>
                </div>}
            </fieldset>
            {form.reviewed && <p role="status" className="checkout-feedback">Dados validados. Pedido enviado com sucesso!</p>}
            <div className="checkout-actions">
                <button type="button" onClick={onBack}>Voltar ao carrinho</button>
                <button type="submit" className="checkout-primary">Finalizar pedido</button>
            </div>
        </form>
    );
}
