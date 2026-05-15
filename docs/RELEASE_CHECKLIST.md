# FrontGuard Agent Release Checklist

Use this checklist before publishing to npm, creating a GitHub release, or sharing FrontGuard Agent as a package-quality portfolio artifact.

## Current Release

- Version: `1.0.0`
- Package name: `frontguard-agent`
- Live demo: https://frontguard-agent.vercel.app
- Release notes: [FrontGuard Agent v1.0.0](releases/frontguard-agent-v1.0.0.md)
- Status: release-ready runtime library milestone; npm publishing remains manual.

## Required Gates

Run locally:

```bash
npm audit --omit=dev --audit-level=high
npm run typecheck
npm run test
npm run build
npm run size
npm run pack:check
```

Expected result:

- Production audit reports zero high vulnerabilities.
- Typecheck passes.
- Runtime detection and public API tests pass.
- Package build emits ESM, IIFE, and TypeScript declarations.
- IIFE bundle stays below 2 KB gzip.
- Package dry run includes `dist`, `docs`, `README.md`, `LICENSE`, `CHANGELOG.md`, and `SECURITY.md`.

## Public Sharing Checklist

- README links to API, compatibility, release checklist, release notes, changelog, and security policy.
- API docs describe config, event schema, lifecycle methods, debug handle, and telemetry examples.
- Compatibility docs describe browser APIs, SSR/client usage, CSP integration, privacy posture, and current detection limits.
- Release notes explain known limits honestly.
- Demo route renders and attack simulation is still representative of shipped behavior.
- No secrets, private tokens, customer data, or unrelated generated files are included in the package.

## npm Publish Checklist

Only publish after the package account state is confirmed:

```bash
npm login
npm whoami
npm run build
npm run size
npm run pack:check
npm publish --access public
```

After publishing:

- Verify the npm package page.
- Install into a clean Vite or Next.js fixture.
- Test ESM import and script-tag/IIFE installation.
- Confirm `frontguard.iife.js` remains under the public 2 KB gzip claim.
- Create a GitHub release linked to the exact published version.

## Next Release Candidates

- `1.1.0`: network monitor for `fetch` and `XMLHttpRequest`.
- `1.2.0`: telemetry reporter with `sendBeacon` batching.
- `1.3.0`: CSP report-only ingestion and dashboard ingestion examples.
