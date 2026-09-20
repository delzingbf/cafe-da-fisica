import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { HealthResponse } from '@cafe-da-fisica/shared';
import { HomePage } from './HomePage';

const health: HealthResponse = {
    status: 'ok',
    database: 'up',
    uptime: 42,
    timestamp: '2026-01-01T12:00:00.000Z',
};

describe('HomePage', () => {
    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it('shows the API health once it loads', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(health)));

        render(<HomePage />);

        expect(await screen.findByText('up')).toBeTruthy();
        expect(screen.getByText('42s')).toBeTruthy();
    });

    it('shows an error when the API is unreachable', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

        render(<HomePage />);

        expect(await screen.findByRole('alert')).toBeTruthy();
        expect(screen.getByText(/Failed to fetch/)).toBeTruthy();
    });
});
