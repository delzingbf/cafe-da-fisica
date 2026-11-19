const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Formats a price in reais, e.g. `4` → `R$ 4,00`. */
export function formatPrice(value: number): string {
    return brl.format(value);
}
