// src/types.ts

export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

export type EventType =
  | 'dom.script-injected'
  | 'dom.iframe-injected'
  | 'dom.suspicious-attribute';

export interface SecurityEvent {
  type: EventType;
  severity: EventSeverity;
  timestamp: number;
  details: Record<string, unknown>;
  url: string;
}

export interface FrontGuardConfig {
  /** Allowed script source domains. If set, scripts from other domains are flagged. */
  scriptAllowlist?: string[];
  /** Callback fired for every event. Useful for debugging or custom handling. */
  onEvent?: (event: SecurityEvent) => void;
  /** Disable the agent (e.g., in dev). Default: false */
  disabled?: boolean;
}

export interface FrontGuardInstance {
  /** Disconnects observers and stops collecting new events. */
  stop(): void;
  /** Returns the in-memory events captured by this agent instance. */
  getEvents(): readonly SecurityEvent[];
}

export interface FrontGuardGlobal {
  /** Starts a new runtime monitoring instance. */
  init(config?: FrontGuardConfig): FrontGuardInstance;
}
