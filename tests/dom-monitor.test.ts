// tests/dom-monitor.test.ts
import { DOMMonitor } from '../src/dom-monitor';
import type { SecurityEvent } from '../src/types';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('DOMMonitor', () => {
  let events: SecurityEvent[];
  let monitor: DOMMonitor;

  beforeEach(() => {
    monitor?.stop();           // clean up previous observer
    document.body.innerHTML = '';
    events = [];
    monitor = new DOMMonitor({ onEvent: (e) => events.push(e) });
  });
  
  afterEach(() => {
    monitor?.stop();
  });

  it('flags a script injected after init', async () => {
    monitor.start();

    const script = document.createElement('script');
    script.src = 'https://evil.example.com/payload.js';
    document.body.appendChild(script);

    // MutationObserver fires asynchronously
    await new Promise((r) => setTimeout(r, 10));

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('dom.script-injected');
    expect(events[0].severity).toBe('critical');
    expect((events[0].details as { src: string }).src).toBe(
      'https://evil.example.com/payload.js'
    );
  });

  it('flags an iframe injected after init', async () => {
    monitor.start();

    const iframe = document.createElement('iframe');
    iframe.src = 'https://tracker.example.com';
    document.body.appendChild(iframe);

    await new Promise((r) => setTimeout(r, 10));

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('dom.iframe-injected');
  });

  it('does not flag scripts that existed at init time', async () => {
    const trusted = document.createElement('script');
    trusted.src = 'https://cdn.trusted.com/app.js';
    document.body.appendChild(trusted);

    monitor.start();

    await new Promise((r) => setTimeout(r, 10));

    expect(events).toHaveLength(0);
  });

  it('respects the script allowlist', async () => {
    monitor = new DOMMonitor({
      onEvent: (e) => events.push(e),
      scriptAllowlist: ['cdn.example.com'],
    });
    monitor.start();

    const allowed = document.createElement('script');
    allowed.src = 'https://cdn.example.com/lib.js';
    document.body.appendChild(allowed);

    await new Promise((r) => setTimeout(r, 10));

    expect(events).toHaveLength(1);
    expect(events[0].severity).toBe('low');
    expect((events[0].details as { allowlisted: boolean }).allowlisted).toBe(true);
  });

  it('flags scripts nested inside an injected container', async () => {
    monitor.start();

    const container = document.createElement('div');
    container.innerHTML = '<script src="https://evil.com/x.js"></script>';
    document.body.appendChild(container);

    await new Promise((r) => setTimeout(r, 10));

    expect(events.some((e) => e.type === 'dom.script-injected')).toBe(true);
  });
});