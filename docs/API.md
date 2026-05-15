# FrontGuard Agent API

FrontGuard Agent exposes one small API: start a runtime monitor, receive structured events, and stop the monitor when the page or route no longer needs it.

## Import Modes

### ESM

```ts
import FrontGuard, {
  type FrontGuardConfig,
  type FrontGuardInstance,
  type SecurityEvent,
} from 'frontguard-agent';

const agent = FrontGuard.init({
  scriptAllowlist: ['cdn.trusted.com', 'analytics.example.com'],
  onEvent(event) {
    console.warn('[FrontGuard]', event.type, event.severity, event.details);
  },
});
```

### Script Tag

```html
<script src="/frontguard.iife.js"></script>
<script>
  const agent = FrontGuard.init({
    scriptAllowlist: ['cdn.trusted.com'],
    onEvent(event) {
      console.warn('[FrontGuard]', event);
    },
  });
</script>
```

When loaded as an IIFE, the global is `window.FrontGuard`.

## `FrontGuard.init(config?)`

Starts a new monitoring instance.

```ts
const agent = FrontGuard.init(config);
```

Returns a `FrontGuardInstance`.

If `disabled` is true, `init` returns an instance without starting DOM observation. This is useful for local development, test environments, or feature-flagged rollout.

## Config

```ts
interface FrontGuardConfig {
  scriptAllowlist?: string[];
  onEvent?: (event: SecurityEvent) => void;
  disabled?: boolean;
}
```

| Option | Type | Default | Description |
|---|---:|---:|---|
| `scriptAllowlist` | `string[]` | `[]` | Hostname suffixes allowed to load scripts. A value like `trusted.com` matches `trusted.com` and `cdn.trusted.com`. Do not include protocol. |
| `onEvent` | `(event) => void` | `undefined` | Called for every detected event. Use this to log locally, send telemetry, or feed a security UI. |
| `disabled` | `boolean` | `false` | Prevents observation from starting. The returned instance still supports `stop()` and `getEvents()`. |

## Instance

```ts
interface FrontGuardInstance {
  stop(): void;
  getEvents(): readonly SecurityEvent[];
}
```

### `agent.stop()`

Disconnects the internal `MutationObserver`. Existing captured events remain available through `getEvents()`.

Call this during SPA route teardown if a route mounts its own agent instance.

### `agent.getEvents()`

Returns an immutable view of events captured by the instance.

This is primarily useful for demos, tests, and local inspection. Production telemetry should stream events from `onEvent`.

## Event Schema

```ts
interface SecurityEvent {
  type: EventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  url: string;
  details: Record<string, unknown>;
}
```

### Event Types

| Type | Severity | Trigger |
|---|---:|---|
| `dom.script-injected` | `critical` or `low` | A new `<script>` appears after initialization. Allowlisted scripts are `low`; other scripts are `critical`. |
| `dom.iframe-injected` | `high` | A new `<iframe>` appears after initialization. |
| `dom.suspicious-attribute` | `high` | A watched dangerous attribute is added or changed, such as `onerror`, `onclick`, or `srcdoc`. |

## Details Payloads

### `dom.script-injected`

```ts
{
  src: string | null;
  inlinePreview: string | null;
  allowlisted: boolean;
  async: boolean;
  defer: boolean;
}
```

Inline script previews are capped to 200 characters.

### `dom.iframe-injected`

```ts
{
  src: string | null;
  srcdoc: string | null;
}
```

`srcdoc` previews are capped to 200 characters.

### `dom.suspicious-attribute`

```ts
{
  tagName: string;
  attribute: string;
  oldValue: string | null;
  newValue: string | null;
}
```

## Telemetry Examples

### `sendBeacon`

```ts
FrontGuard.init({
  onEvent(event) {
    navigator.sendBeacon('/security/events', JSON.stringify(event));
  },
});
```

### Batched Reporter

```ts
const queue: SecurityEvent[] = [];

FrontGuard.init({
  onEvent(event) {
    queue.push(event);
  },
});

setInterval(() => {
  if (queue.length === 0) return;
  const batch = queue.splice(0, queue.length);
  fetch('/security/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ events: batch }),
    keepalive: true,
  });
}, 5000);
```

## Suite Telemetry Contract

FrontGuard Agent is transport-agnostic by design. In the broader [FrontGuard Suite](FRONTGUARD_SUITE.md), a production ingestion API would receive one or more `SecurityEvent` objects inside an application envelope:

```ts
interface FrontGuardEventEnvelope {
  appId: string;
  environment: 'production' | 'preview' | 'development';
  release?: string;
  sessionId?: string;
  userId?: string;
  events: SecurityEvent[];
}
```

The browser package owns detection. The SaaS layer should own tenant authentication, schema validation, rate limits, durable storage, dashboards, retention, and alerting.

The hosted demo currently uses this contract to POST detections to:

```txt
https://frontguard-nine.vercel.app/api/security-events
```

The matching triage view is:

```txt
https://frontguard-nine.vercel.app/security-events?appId=frontguard-agent-demo
```

## Debug Handle

In browsers, the active instance is exposed as:

```ts
window.__FRONTGUARD__
```

This is intentionally useful for demos and manual QA. Production apps can ignore it.
