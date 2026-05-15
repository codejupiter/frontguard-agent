# Browser Compatibility

FrontGuard Agent is designed for modern evergreen browsers and client-rendered applications that can run a small JavaScript monitor after initial page load.

## Supported Runtime Capabilities

The agent depends on these browser APIs:

| Capability | Why it is used |
|---|---|
| `MutationObserver` | Watches DOM additions and attribute changes without polling. |
| `WeakSet` | Tracks trusted and already-flagged elements without retaining removed DOM nodes. |
| `URL` | Parses script origins for allowlist matching. |
| `document.querySelectorAll` | Captures the trusted baseline at startup and scans injected subtrees. |

Browsers missing those APIs are not supported. The library target is modern JavaScript and is not designed for IE11.

## Framework Compatibility

| Environment | Guidance |
|---|---|
| React, Vite, vanilla apps | Initialize after your first-party scripts are loaded. |
| Next.js / SSR apps | Importing the module is safe, but call `FrontGuard.init()` from client-side code. Server-side calls no-op because there is no `document`. |
| SPAs | One app-level instance is usually enough. If a route creates an instance manually, call `agent.stop()` on route teardown. |
| Tag managers | Initialize after trusted tag-manager boot scripts or put trusted script hosts in `scriptAllowlist`. |

## CSP Compatibility

FrontGuard works with strict Content Security Policy setups, but the integration style matters:

- Prefer loading the IIFE from a first-party path that your CSP already allows.
- If initialization is inline, give the inline script the same nonce or hash strategy used by the app.
- CSP may block malicious script execution before or while FrontGuard reports the injected node. That is good: CSP prevents execution, FrontGuard gives you runtime evidence.
- FrontGuard is detection-focused. It does not replace CSP, Subresource Integrity, dependency auditing, or server-side security controls.

## Privacy And Telemetry

The agent does not send network requests by default.

Events stay in memory unless the app passes an `onEvent` callback. This lets teams choose whether to log to the console, send events to an internal endpoint, batch with `sendBeacon`, or discard events after local handling.

To reduce accidental data capture:

- Inline script previews are capped to 200 characters.
- `srcdoc` previews are capped to 200 characters.
- DOM nodes are tracked through `WeakSet`, not retained in arrays.

## Performance Notes

FrontGuard uses one `MutationObserver` on `document.documentElement` with `childList`, `subtree`, and `attributes` enabled.

There is no polling loop. Work happens only when the browser reports a mutation.

For very mutation-heavy applications:

- Keep `onEvent` fast.
- Batch network reporting outside the observer callback.
- Avoid expensive serialization in `onEvent`.
- Use `disabled` behind an environment flag during local development if needed.

## Current Detection Scope

Implemented today:

- New script elements after initialization.
- New iframe elements after initialization.
- Script and iframe elements nested inside newly inserted containers.
- Suspicious runtime attribute changes such as `onerror`, `onclick`, `onload`, `onmouseover`, `onfocus`, `onsubmit`, and `srcdoc`.

Not implemented yet:

- `fetch` / `XMLHttpRequest` network monitoring.
- `document.createElement` monkey-patching.
- Automatic element removal or request blocking.
- CSP report ingestion.

Those items are tracked as roadmap work in the README.
