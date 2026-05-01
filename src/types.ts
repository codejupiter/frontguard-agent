// src/types.ts

export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

export type EventType =
  | 'dom.script-injected'
  | 'dom.iframe-injected'
  | 'dom.suspicious-attribute'
  | 'dom.unexpected-mutation'
  | 'script.dynamic-create'
  | 'network.unauthorized-domain'
  | 'network.request';

export interface SecurityEvent {
  type: EventType;
  severity: EventSeverity;
  timestamp: number;
  details: Record<string, unknown>;
  url: string;
}

export interface FrontGuardConfig {
  /** Endpoint to POST telemetry events to. Optional. */
  endpoint?: string;
  /** Allowed script source domains. If set, scripts from other domains are flagged. */
  scriptAllowlist?: string[];
  /** Allowed network request domains. If set, fetch/XHR to other domains are flagged. */
  networkAllowlist?: string[];
  /** Callback fired for every event. Useful for debugging or custom handling. */
  onEvent?: (event: SecurityEvent) => void;
  /** Disable the agent (e.g., in dev). Default: false */
  disabled?: boolean;
}