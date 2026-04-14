# Incident Response Plan

This document describes how the cheerio maintainers handle security incidents; the same plan applies to other packages maintained as part of cheerio's ecosystem (htmlparser2, css-select et al).
These are good-faith response targets for a volunteer-maintained open source project — they are **not** SLAs.

## Scope

This plan covers:

- Private vulnerability reports received via GitHub Security Advisories
- Security incidents affecting published npm packages (e.g., compromised release, leaked credentials)
- Regressions that re-introduce previously fixed vulnerabilities
- Supply-chain incidents affecting our dependencies or CI/CD pipeline

## Severity Levels

| Severity     | Definition                                                            | Acknowledgment | Update Cadence | Target Fix    |
| ------------ | --------------------------------------------------------------------- | -------------- | -------------- | ------------- |
| **Critical** | Active exploitation, or RCE/supply-chain compromise                   | < 24 hours     | Daily           | < 7 days      |
| **High**     | Easily exploitable DoS, prototype pollution, or XSS enablement        | < 72 hours     | Every 3 days    | < 14 days     |
| **Medium**   | Issues requiring unusual configuration or limited impact              | < 1 week       | Weekly          | Next release  |
| **Low**      | Defense-in-depth improvements, theoretical risks                      | < 2 weeks      | As needed       | Scheduled     |

## Response Process

### 1. Intake & Acknowledgment

- A maintainer receives the report via the [Tidelift security contact](https://tidelift.com/security) or [GitHub private vulnerability reporting](https://github.com/cheeriojs/cheerio/security/advisories).
- Acknowledge receipt to the reporter within the timeline above.
- Create a private fork / security advisory draft if one doesn't already exist.

### 2. Triage

- Confirm the vulnerability is valid and reproducible.
- Assign a severity level using the table above.
- Determine which versions and components are affected.
- Identify the root cause.

### 3. Containment

- If the issue is being actively exploited or affects a published artifact:
  - Consider deprecating affected npm versions.
  - Rotate any compromised secrets or tokens immediately.
  - If CI/CD is compromised, disable affected workflows.
  - Notify known & trusted downstream consumers of cheerio.
  - Post a brief advisory on the cheerio website.

### 4. Remediation

- Develop and test a fix in the private advisory fork.
- Ensure the fix includes a regression test.

### 5. Release & Disclosure

- Merge the fix and publish a patched version to npm.
- Publish the GitHub Security Advisory (this auto-creates a CVE).
- Credit the reporter in the advisory (unless they prefer anonymity).
- Notify users via:
  - GitHub Advisory database (which will trigger Dependabot alerts)
  - A note in the release notes
  - For substantial issues, the cheerio website / blog

### 6. Post-Incident Review

Within **one week** of resolution:

- Document what happened, how it was found, and how it was fixed.
- Identify process improvements (could we have caught this earlier?).
- Update this plan or our threat model if needed.

## Quick-Reference Checklist

```
[ ] Report received and acknowledged
[ ] Severity assigned
[ ] Versions & components identified
[ ] Root cause confirmed
[ ] Fix developed with regression test
[ ] Fix reviewed by second maintainer
[ ] Patched version published to npm
[ ] GitHub Security Advisory published
[ ] Reporter credited
[ ] Post-incident review completed
[ ] This plan / threat model updated if needed
```

---

*Last updated: April 2026*
