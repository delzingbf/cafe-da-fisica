/** Reais with up to two decimals, with a comma or a dot: `4`, `4,5`, `4,50`, `4.50`. */
const PRICE_PATTERN = /^\d+([.,]\d{1,2})?$/;

export type ParsedPrice = { ok: true; value: number } | { ok: false; error: string };

/**
 * Reads a price typed by the admin. Accepts the Brazilian comma as well as a dot, which a
 * `type="number"` input would not: Chromium drops the comma there, so "4,50" became 450.
 */
export function parsePrice(input: string): ParsedPrice {
    const text = input.trim();
    if (!text) return { ok: false, error: 'Informe o preço.' };
    if (!PRICE_PATTERN.test(text)) {
        return { ok: false, error: 'Use só números e até duas casas decimais, como 4,50.' };
    }

    const value = Number(text.replace(',', '.'));
    if (value <= 0) return { ok: false, error: 'O preço precisa ser maior que zero.' };
    return { ok: true, value };
}

/** A price as the admin would type it, for the edit form: `4.5` → `4,50`. */
export function priceInputValue(value: number): string {
    return value.toFixed(2).replace('.', ',');
}
