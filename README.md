# FrontGuard Agent

> Lightweight runtime security agent that monitors web pages for unauthorized DOM modifications, script injection, and suspicious attribute mutations — in real time.

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![Bundle](https://img.shields.io/badge/gzipped-%3C2KB-brightgreen)](#bundle-size)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](#testing)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

**[▶ Live Demo](https://frontguard-agent.vercel.app/)** · **[Tests](#testing)** · **[Architecture](#architecture)**

---

## What it does

FrontGuard Agent drops into any web page as a single `<script>` tag and watches for the things attackers actually do:

- **Script injection** — third-party scripts loaded outside an allowlist (e.g. supply-chain attacks, malicious Chrome extensions, compromised npm packages)
- **Iframe injection** — invisible trackers, clickjacking overlays, phishing frames
- **DOM tampering** — suspicious attribute mutations like `onerror`, `onclick`, `srcdoc` added at runtime
- **Container injection** — scripts hidden inside dynamically inserted DOM subtrees

Every detection produces a structured event: type, severity, timestamp, and details. Events can be streamed to a backend, logged to console, or handled with a custom callback.

This is the same category of tool as Cloudflare Page Shield and Datadog RUM — focused on a single, well-scoped problem: **detecting unauthorized client-side activity.**

## Quick start

```bash
npm install
npm run build
```

Drop the built bundle into any HTML page:

```html
<script src="/dist/frontguard.iife.js"></script>
<script>
  FrontGuard.init({
    scriptAllowlist: ['cdn.trusted.com', 'analytics.example.com'],
    onEvent: (event) => {
      console.warn('[FrontGuard]', event.type, event.severity, event.details);
      // Or: navigator.sendBeacon('/security/events', JSON.stringify(event))
    },
  });
</script>
```

That's it. The agent runs in the background, snapshotting the trusted DOM at startup and flagging anything new.

## Live demo

The `demo/` directory contains an interactive page where you can trigger real attacks (script injection, iframe injection, attribute tampering, nested-container injection) and watch the agent detect each one in real time.

```bash
npm run build
npx serve .
# → open http://localhost:3000/demo/
```

## Architecture

The agent is split into focused modules so each one is small enough to reason about and test independently.

frontguard-agent/
├── src/
│   ├── index.ts          # Public API: FrontGuard.init({ ... })
│   ├── dom-monitor.ts    # MutationObserver-based detection
│   └── types.ts          # Shared types: SecurityEvent, FrontGuardConfig
├── tests/
│   └── dom-monitor.test.ts
└── demo/
└── index.html        # Interactive attack simulator


### How DOM detection works

On `init()`, the agent snapshots every `<script>` and `<iframe>` already on the page into a `WeakSet` — these are considered trusted. After that, a `MutationObserver` watches the entire document subtree for `childList` and `attributes` mutations.

When a new element is added, the agent checks whether it's a script or iframe (or contains one in its subtree) and, if it isn't in the trusted set, emits an event. Once flagged, the element is added to the trusted set so subsequent mutations to the same node don't double-count.

`WeakSet` is deliberate: when a flagged element is removed from the DOM and garbage collected, the agent's reference to it goes away too. No memory leaks, even on long-running pages.

### Event schema

```ts
interface SecurityEvent {
  type:
    | 'dom.script-injected'
    | 'dom.iframe-injected'
    | 'dom.suspicious-attribute'
    | 'dom.unexpected-mutation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  url: string;
  details: Record<string, unknown>;
}
```

### Severity model

- **Critical** — script injection from outside the allowlist (highest impact: arbitrary code execution)
- **High** — iframe injection, suspicious attribute additions (`onerror`, `onclick`, etc.)
- **Low** — script from an allowlisted domain (informational; still surfaced for audit trails)

### Configuration

```ts
FrontGuard.init({
  scriptAllowlist?: string[];   // Domains permitted to load scripts
  onEvent?: (event) => void;    // Custom event handler
  disabled?: boolean;           // Disable in dev
});
```

## Testing

```bash
npm test
```

The test suite covers the core detection paths using `vitest` + `jsdom`:

- ✅ Flags scripts injected after init
- ✅ Flags iframes injected after init
- ✅ Does not flag scripts that existed at init time (baseline trust)
- ✅ Respects the script allowlist (low severity for trusted CDNs)
- ✅ Flags scripts nested inside an injected container

Each test uses `afterEach` to disconnect its `MutationObserver` — without this, observers from previous tests remain alive and cross-contaminate. (Real bug. Real fix. Real lesson.)

## Bundle size

```bash
npm run size
```

The IIFE bundle is under 2KB gzipped at the time of writing, with headroom budgeted for the script and network monitors.

## Roadmap

- [ ] **Script execution monitor** — hook `document.createElement` to catch scripts created via JS
- [ ] **Network monitor** — wrap `fetch` and `XMLHttpRequest` to flag requests to non-allowlisted domains
- [ ] **Telemetry reporter** — batched event delivery via `navigator.sendBeacon` with WebSocket fallback for real-time streaming
- [ ] **Source map for stack traces** on injected script detection
- [ ] **CSP report-only ingestion** — correlate with native browser CSP reports

## Related project

[**FrontGuard Playground**](https://github.com/codejupiter/frontguard) — the educational counterpart to this agent. The playground demonstrates the *vulnerabilities* (XSS, broken auth, missing RBAC, DevTools bypass); this agent is the production tool for *detecting* them in the wild.

## License

MIT — Zoriah Cocio · [zoriahcocio.com](https://zoriahcocio.com) · info@zoriahcocio.com
