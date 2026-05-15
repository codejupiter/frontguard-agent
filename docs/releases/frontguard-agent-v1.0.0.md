# FrontGuard Agent v1.0.0 Release Notes

Release date: 2026-05-15  
Status: Release-ready runtime library milestone  
Live demo: https://frontguard-agent.vercel.app

## Summary

FrontGuard Agent v1.0.0 packages a lightweight browser runtime security monitor for detecting unauthorized client-side activity. It is designed for teams that need visibility into script injection, iframe injection, suspicious DOM attributes, and runtime tampering without adding a heavy client-side dependency.

The project complements the FrontGuard Playground: the playground demonstrates vulnerable patterns, while the agent is the production-style detector that can run inside a page and emit structured security events.

## Detection Scope

Implemented in this release:

- New script elements after initialization.
- New iframe elements after initialization.
- Script and iframe elements nested inside newly inserted containers.
- Suspicious runtime attributes such as `onerror`, `onclick`, `onload`, `onmouseover`, `onfocus`, `onsubmit`, and `srcdoc`.
- Script allowlist handling with lower-severity audit events for trusted hosts.

## Engineering Highlights

- MutationObserver-based DOM monitoring with no polling loop.
- WeakSet tracking for trusted and already-flagged DOM nodes.
- Public API with `init`, `disabled`, `stop`, `getEvents`, and `window.__FRONTGUARD__`.
- Structured event schema with event type, severity, timestamp, URL, and details payloads.
- ESM build for app/package consumers.
- IIFE build exposed as `window.FrontGuard` for script-tag installation.
- TypeScript declarations for the public API.
- Package metadata for exports, types, CDN entrypoints, repository, bugs, homepage, and side-effect safety.
- CI validation for production audit, typecheck, tests, build, gzip size budget, and package dry run.

## Release Evidence

- API docs: [docs/API.md](../API.md)
- Compatibility docs: [docs/COMPATIBILITY.md](../COMPATIBILITY.md)
- Release checklist: [docs/RELEASE_CHECKLIST.md](../RELEASE_CHECKLIST.md)
- Changelog: [CHANGELOG.md](../../CHANGELOG.md)
- Security policy: [SECURITY.md](../../SECURITY.md)
- CI workflow: [.github/workflows/ci.yml](../../.github/workflows/ci.yml)

## Interview Story

This release supports a security/front-end systems conversation:

- Why runtime detection is useful even when CSP and dependency auditing exist.
- How MutationObserver can watch DOM activity without polling.
- Why WeakSet is a good fit for tracking trusted and already-flagged nodes without retaining removed DOM nodes.
- How an allowlist changes severity without hiding useful audit evidence.
- How IIFE and ESM builds serve different adoption paths.
- What remains before a larger product rollout: network monitoring, telemetry batching, CSP report ingestion, dashboard ingestion, and source-map-assisted stack traces.

## Known Limits

- The agent detects but does not block or remove suspicious elements.
- Network monitoring is not implemented yet.
- `document.createElement` monkey-patching is not implemented yet.
- CSP report ingestion is not implemented yet.
- Inline script and `srcdoc` previews are intentionally capped to reduce accidental data capture.
