import { describe, expect, it } from 'vitest';
import { parsePrice, priceInputValue } from './parsePrice';

describe('parsePrice', () => {
    it.each([
        ['4,50', 4.5],
        ['4.50', 4.5],
        ['4,5', 4.5],
        ['12', 12],
        [' 0,99 ', 0.99],
    ])('reads %p as %p', (input, value) => {
        expect(parsePrice(input)).toEqual({ ok: true, value });
    });

    it.each(['4,5,0', '4,505', 'R$ 4,50', '-4', 'abc', '1.000,00'])('rejects %p', (input) => {
        expect(parsePrice(input)).toMatchObject({ ok: false });
    });

    it('asks for a price when empty and refuses zero', () => {
        expect(parsePrice('  ')).toEqual({ ok: false, error: 'Informe o preço.' });
        expect(parsePrice('0,00')).toEqual({
            ok: false,
            error: 'O preço precisa ser maior que zero.',
        });
    });
});

describe('priceInputValue', () => {
    it('writes the price with a comma and two decimals', () => {
        expect(priceInputValue(4.5)).toBe('4,50');
        expect(priceInputValue(12)).toBe('12,00');
    });
});
