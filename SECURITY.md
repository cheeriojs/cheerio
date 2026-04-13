# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ Yes             |
| < 1.0   | ❌ No              |

Only the latest release on the `1.x` branch receives security updates. If you are using an older major version, please upgrade.

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

To report a security vulnerability, use
[Tidelift security contact](https://tidelift.com/security). Tidelift will
coordinate the fix and disclosure.

If Tidelift doesn't respond, you can also report vulnerabilities via
[GitHub's private vulnerability reporting](https://github.com/cheeriojs/cheerio/security/advisories/new).
This ensures the report stays confidential while we work on a fix.

### What to Include

When reporting, please provide as much of the following as you can:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept
- The affected version(s) of cheerio
- Any relevant configuration details
- Your suggested severity (Critical / High / Medium / Low)

### What to Expect

1. **Acknowledgment** — We will acknowledge your report within **72 hours**.
2. **Triage** — We will assess severity, impact, and affected versions.
3. **Fix & Release** — We will develop, test, and release a patch.
4. **Disclosure** — We will publish a GitHub Security Advisory with full details, crediting you as the reporter (unless you prefer anonymity).

We ask that you give us reasonable time to address the issue before disclosing it publicly.

## Scope

Cheerio is an HTML/XML parsing and manipulation library for Node.js. Security issues we are particularly interested in include:

- **Denial of service** — crafted input that causes excessive memory or CPU consumption (e.g., ReDoS, quadratic parsing)
- **Prototype pollution** — manipulation of `Object.prototype` through parsed content or API misuse
- **Cross-site scripting (XSS) enablement** — cases where cheerio's output could unexpectedly introduce XSS when rendered in a browser context
- **Supply chain** — compromised dependencies, build pipeline, or release artifacts
- **Information disclosure** — unintentional leaking of data through parsing or serialization behavior

### Out of Scope

- Vulnerabilities in applications *using* cheerio that are caused by their own logic (e.g., not sanitizing cheerio output before rendering)
- Social engineering attacks against maintainers

## Related Documents

- [Incident Response Plan](./INCIDENT_RESPONSE.md)
