# Changelog

All notable changes to FrontGuard Agent are documented here.

## 1.0.0 - 2026-05-15

### Added

- Released the first package-ready FrontGuard Agent runtime security library.
- Added DOM monitoring for script injection, iframe injection, suspicious runtime attributes, and nested container injection.
- Added allowlist-aware script severity so trusted script hosts can be surfaced as low-severity audit events.
- Added public ESM and IIFE builds, TypeScript declarations, package exports, CDN entry fields, and side-effect metadata.
- Added lifecycle API support for `init`, `disabled`, `stop`, `getEvents`, and the browser debug handle.
- Added API documentation for config, instance methods, event schemas, details payloads, telemetry examples, and script-tag usage.
- Added compatibility documentation for browser APIs, SSR/client initialization, CSP integration, privacy posture, performance notes, and known limits.
- Added release notes, release checklist, security policy, issue forms, PR template, Dependabot configuration, and package dry-run validation.
- Added CI gates for production audit, typecheck, tests, build, gzip size budget, and package dry run.

### Verified

- Live demo: https://frontguard-agent.vercel.app
- IIFE bundle remains under the 2 KB gzip budget.
- Package dry run verifies `dist`, `docs`, `README.md`, `LICENSE`, `CHANGELOG.md`, and `SECURITY.md`.

### Known Limitations

- Network monitoring for `fetch` and `XMLHttpRequest` is not implemented yet.
- `document.createElement` monkey-patching is not implemented yet.
- The agent detects suspicious client-side activity but does not block or remove elements.
- CSP report ingestion is planned but not implemented yet.
