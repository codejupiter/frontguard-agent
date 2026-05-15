# Security Policy

FrontGuard Agent is a runtime detection library for client-side security events. It does not block attacks by itself and does not send telemetry unless the consuming application provides an `onEvent` handler.

## Supported Versions

| Version | Status |
| --- | --- |
| `1.x` | Maintained for portfolio/package readiness |

## Reporting A Vulnerability

Please email security-sensitive reports to info@zoriahcocio.com.

Include:

- A short summary of the issue.
- Affected API, detection path, package export, or demo route.
- Reproduction steps.
- Expected impact and any suggested remediation.

Do not include private access tokens, customer data, or unrelated secrets in the report.

## Security Design Notes

- The agent does not send network requests by default.
- Events stay in memory unless the host app provides telemetry handling.
- Inline script previews and `srcdoc` previews are capped to reduce accidental data capture.
- Trusted and already-flagged DOM nodes are tracked with `WeakSet`.
- The agent complements CSP, SRI, dependency auditing, and server-side controls; it does not replace them.
- Consuming applications are responsible for protecting telemetry endpoints and avoiding sensitive data in event forwarding.
