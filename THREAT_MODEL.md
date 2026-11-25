# Threat Model

This document defines what cheerio considers a security vulnerability and what falls outside its responsibility. It complements [SECURITY.md](./SECURITY.md) (reporting process & scope) and [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) (how we handle incidents).

## What Cheerio Does

Cheerio parses HTML/XML strings into a DOM tree, lets you query and manipulate that tree with a jQuery-like API, and serializes it back to markup. It runs on Node.js and **never executes scripts, evaluates expressions, or accesses the network** (except the optional `fromURL` helper, which uses `undici`).

## Trust Boundaries

### Untrusted (attacker-controlled)

- **All input markup** — HTML, XML, or any string passed to `load()`, `loadBuffer()`, streaming APIs, or manipulation methods like `.html(content)` and `.append(content)`.
- **CSS selectors from external sources** — selectors derived from user input could trigger pathological backtracking in the selector engine.

### Trusted

- **The JavaScript runtime** — we assume a correct, unpatched Node.js or compatible runtime.
- **Calling application code** — cheerio is a library; the caller is responsible for what it does with cheerio's output (e.g., sanitizing before rendering in a browser).
- **Package integrity** — we assume the installed `cheerio` package and its dependencies have not been tampered with.
- **Underlying parsers** — parse5 and htmlparser2 are part of cheerio's ecosystem and maintained by the same team. Bugs in them are in scope.

## In-Scope Vulnerabilities

These are issues we will treat as security vulnerabilities:

- **Denial of service** — crafted input that causes memory or CPU consumption disproportionate to input size (e.g., ReDoS, exponential entity expansion, quadratic parsing behavior).
- **Prototype pollution** — parsed content or API calls that modify `Object.prototype` or other built-in prototypes.
- **Unexpected code execution** — any path where parsing or serialization leads to `eval`, `Function`, or equivalent execution of attacker-supplied content.
- **XSS enablement** — cases where cheerio's serializer produces output that is materially more dangerous than the input (e.g., attribute injection through incorrect escaping). Note: cheerio is not a sanitizer; see out-of-scope below.
- **Information disclosure** — unintended leaking of data from the runtime environment through parsing or serialization.

## Out-of-Scope (Non-Vulnerabilities)

These are **not** cheerio security issues:

- **Unsafe use of cheerio output** — rendering unsanitized cheerio output in a browser is an application responsibility. Use a dedicated sanitizer (e.g., [sanitize-html](https://www.npmjs.com/package/sanitize-html)) if the input is untrusted.
- **Application-level misuse of API** — for example, using attacker-controlled strings as property names when reading from a cheerio object, or passing unsanitized objects as options. Validating application-level input is the caller's responsibility ([CWE-20](https://cwe.mitre.org/data/definitions/20.html)).
- **Malicious or vulnerable third-party code** — compromised transitive dependencies outside cheerio's ecosystem are supply-chain issues to be reported to the affected package ([CWE-1357](https://cwe.mitre.org/data/definitions/1357.html)).
- **Runtime or platform bugs** — vulnerabilities in Node.js, V8, or the operating system.
- **Resource exhaustion from legitimate large input** — parsing a 500 MB HTML file will use a lot of memory; that is expected behavior, not a vulnerability. A DoS report must demonstrate _asymmetric_ resource consumption relative to input size.
- **Gadget chaining** — using cheerio output as one step in a multi-library exploit chain where cheerio itself behaves correctly.

## Assumptions

1. Cheerio runs in a server-side Node.js environment, not directly in a browser.
2. The caller is responsible for limiting input size if accepting markup from untrusted sources.
3. Cheerio's output is markup, not safe HTML. Applications must sanitize before rendering untrusted content.

## Related Documents

- [Security Policy](./SECURITY.md) — how to report vulnerabilities
- [Incident Response Plan](./INCIDENT_RESPONSE.md) — how we handle reports
