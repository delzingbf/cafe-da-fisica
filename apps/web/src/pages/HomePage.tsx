import { useEffect, useState } from 'react';
import type { HealthResponse } from '@cafe-da-fisica/shared';
import { api } from '../api/client';
import './HomePage.css';

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; health: HealthResponse }
  | { kind: 'error'; message: string };

export function HomePage() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    api
      .get<HealthResponse>('/health', { signal: controller.signal })
      .then((health) => setState({ kind: 'ready', health }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          kind: 'error',
          message: error instanceof Error ? error.message : String(error),
        });
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="home">
      <h2>API status</h2>

      {state.kind === 'loading' && <p role="status">Checking…</p>}

      {state.kind === 'error' && (
        <p role="alert" className="home__error">
          Could not reach the API: {state.message}
        </p>
      )}

      {state.kind === 'ready' && (
        <dl className={`home__health home__health--${state.health.status}`}>
          <dt>Status</dt>
          <dd>{state.health.status}</dd>
          <dt>Database</dt>
          <dd>{state.health.database}</dd>
          <dt>Uptime</dt>
          <dd>{state.health.uptime}s</dd>
          <dt>Checked at</dt>
          <dd>{new Date(state.health.timestamp).toLocaleTimeString()}</dd>
        </dl>
      )}
    </section>
  );
}
