import FrontGuard from '../src/index';
import type { SecurityEvent } from '../src/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('FrontGuard public API', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    const exposed = (window as unknown as { __FRONTGUARD__?: { stop(): void } })
      .__FRONTGUARD__;
    exposed?.stop();
    delete (window as unknown as { __FRONTGUARD__?: unknown }).__FRONTGUARD__;
  });

  it('starts an agent instance and exposes captured events', async () => {
    const onEvent = vi.fn<(event: SecurityEvent) => void>();
    const agent = FrontGuard.init({ onEvent });

    const script = document.createElement('script');
    script.src = 'https://evil.example.com/payload.js';
    document.body.appendChild(script);

    await waitForObserver();

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(agent.getEvents()).toHaveLength(1);
    expect(agent.getEvents()[0].type).toBe('dom.script-injected');
    expect((window as unknown as { __FRONTGUARD__?: unknown }).__FRONTGUARD__)
      .toBe(agent);

    agent.stop();
  });

  it('does not start monitoring when disabled', async () => {
    const onEvent = vi.fn<(event: SecurityEvent) => void>();
    const agent = FrontGuard.init({ disabled: true, onEvent });

    const iframe = document.createElement('iframe');
    iframe.src = 'https://tracker.example.com';
    document.body.appendChild(iframe);

    await waitForObserver();

    expect(onEvent).not.toHaveBeenCalled();
    expect(agent.getEvents()).toHaveLength(0);
  });

  it('stops observing new mutations', async () => {
    const onEvent = vi.fn<(event: SecurityEvent) => void>();
    const agent = FrontGuard.init({ onEvent });
    agent.stop();

    const iframe = document.createElement('iframe');
    iframe.src = 'https://tracker.example.com';
    document.body.appendChild(iframe);

    await waitForObserver();

    expect(onEvent).not.toHaveBeenCalled();
    expect(agent.getEvents()).toHaveLength(0);
  });
});

function waitForObserver() {
  return new Promise((resolve) => setTimeout(resolve, 10));
}
