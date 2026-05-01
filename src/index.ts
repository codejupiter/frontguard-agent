// src/index.ts
import { DOMMonitor } from './dom-monitor';
import type { FrontGuardConfig, SecurityEvent } from './types';

class FrontGuardAgent {
  private config: FrontGuardConfig;
  private domMonitor: DOMMonitor | null = null;
  private events: SecurityEvent[] = [];

  constructor(config: FrontGuardConfig = {}) {
    this.config = config;
  }

  init(): void {
    if (this.config.disabled) return;

    this.domMonitor = new DOMMonitor({
      onEvent: (event) => this.handleEvent(event),
      scriptAllowlist: this.config.scriptAllowlist,
    });
    this.domMonitor.start();

    // Expose for debugging — useful for the demo page
    if (typeof window !== 'undefined') {
      (window as unknown as { __FRONTGUARD__: unknown }).__FRONTGUARD__ = this;
    }
  }

  stop(): void {
    this.domMonitor?.stop();
  }

  /** Returns all events captured so far. Useful for demos and testing. */
  getEvents(): readonly SecurityEvent[] {
    return this.events;
  }

  private handleEvent(event: SecurityEvent): void {
    this.events.push(event);
    this.config.onEvent?.(event);
    // Reporter integration comes in step 5
  }
}

export default {
  init(config?: FrontGuardConfig) {
    const agent = new FrontGuardAgent(config);
    agent.init();
    return agent;
  },
};

export type { FrontGuardConfig, SecurityEvent };