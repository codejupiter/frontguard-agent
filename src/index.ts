// src/index.ts
import type { FrontGuardConfig, SecurityEvent } from './types';

class FrontGuardAgent {
  private config: FrontGuardConfig;

  constructor(config: FrontGuardConfig = {}) {
    this.config = config;
  }

  init(): void {
    if (this.config.disabled) return;
    console.log('[FrontGuard] Agent initialized');
    // We'll wire up the monitors in step 2
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